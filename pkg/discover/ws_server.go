package discover

import (
	"container/list"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/patrickmn/go-cache"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	protobuf "google.golang.org/protobuf/proto"

	"github.com/aproton/neutron/cmd/neutron/config"
	neutronproto "github.com/aproton/neutron/pkg/proto"
	"github.com/aproton/neutron/pkg/utils/log"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type WebSocketClient struct {
	clientID string

	wsConn *websocket.Conn
	user   *WebSocketUser
	offset *list.Element

	storageServerID string
}

type WebSocketUser struct {
	userID  string
	clients *list.List
}

type DiscoverServer struct {
	mutex sync.RWMutex

	config *config.Config

	clients map[string]*WebSocketClient
	users   map[string]*WebSocketUser

	responseChannels map[string]chan *neutronproto.RemoteMessage

	// key: token,  value: *neutronproto.LoginRequest
	tokenCaches *cache.Cache
}

func NewDiscoverServer(config *config.Config) *DiscoverServer {

	return &DiscoverServer{
		config:           config,
		clients:          make(map[string]*WebSocketClient),
		users:            make(map[string]*WebSocketUser),
		tokenCaches:      cache.New(24*time.Hour, time.Hour),
		responseChannels: make(map[string]chan *neutronproto.RemoteMessage),
	}
}

func (s *DiscoverServer) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	tokenStr := r.URL.Query().Get("token")
	if tokenStr == "" {
		tokenStr = r.Header.Get("Authorization")
	}
	tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")

	if tokenStr == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	loginData, ok := s.tokenCaches.Get(tokenStr)
	if !ok {
		validateFailed := false
		cnt, err := base64.StdEncoding.DecodeString(tokenStr)
		if err != nil {
			log.Debugf("decode input token failed", err.Error())
			validateFailed = true
		} else {
			var loginInfo neutronproto.LoginRequest
			if err := protobuf.Unmarshal(cnt, &loginInfo); err != nil {
				validateFailed = true
			} else {
				ok, err := CheckPassword(loginInfo.Username, loginInfo.Password)
				if err != nil || !ok {
					log.Warnf("Login failed for user %s: %v", loginInfo.Username, err)
					validateFailed = true
				} else {
					loginData = &loginInfo
				}
			}
		}

		if validateFailed {
			http.Error(w, "Invalid Token", http.StatusUnauthorized)
			return
		}

	}

	s.doWebSocketTraffic(loginData.(*neutronproto.LoginRequest), w, r)

}

func (s *DiscoverServer) doWebSocketTraffic(userData *neutronproto.LoginRequest, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Warnf("Upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Infof("New client %s, user %s connected", userData.ClientId, userData.Username)

	client, err := s.regist(conn, userData)
	if err != nil {
		log.Warnf("Can't regist %s, err=%v", userData.Username, err)
		return
	}

	for {
		signal, err := s.readMessage(conn)
		if err != nil {
			log.Warnf("read message failed %v", err)
			break
		}

		if signal.Source != client.clientID {
			log.Warnf("received invalidate source, current %s, expect %s", signal.Source, client.clientID)
			break
		}

		if signal.Type == "callAck" {
			if err := s.callAck(signal); err != nil {
				log.Warnf("callack failed %v", err)
			}
		} else {
			// Marshal the message as protobuf binary for forwarding
			msgBytes, err := protobuf.Marshal(signal)
			if err != nil {
				log.Warnf("protobuf marshal message for forwarding failed %v", err)
			} else if err := s.forward(signal.Destination, msgBytes); err != nil {
				log.Warnf("forward failed %v", err)
			}
		}
	}

	if client != nil {
		log.Infof("client %s disconnect", client.clientID)
		s.mutex.Lock()
		defer s.mutex.Unlock()

		if client.user != nil && client.offset != nil {
			client.user.clients.Remove(client.offset)
			log.Infof("remove client(%s) from user(%s)", client.clientID, client.user.userID)
			if client.user.clients.Len() == 0 {
				delete(s.users, client.user.userID)
				log.Infof("remove user %s", client.user.userID)
			}
			client.user = nil
		}

		if c, ok := s.clients[client.clientID]; ok && c == client {
			delete(s.clients, client.clientID)
			log.Infof("clean up client %s", client.clientID)
		}
	}
}

func (s *DiscoverServer) readMessage(conn *websocket.Conn) (*neutronproto.RemoteMessage, error) {
	messageType, msg, err := conn.ReadMessage()
	if err != nil {
		return nil, err
	}

	var signal neutronproto.RemoteMessage

	// 根据消息类型进行解析
	if messageType == websocket.BinaryMessage {
		// 二进制消息：protobuf格式
		if err := protobuf.Unmarshal(msg, &signal); err != nil {
			return nil, fmt.Errorf("protobuf unmarshal error: %v", err)
		}
	} else if messageType == websocket.TextMessage {
		// 文本消息：JSON格式（向后兼容）
		if err := protojson.Unmarshal(msg, &signal); err != nil {
			return nil, fmt.Errorf("JSON unmarshal error: %v", err)
		}
	} else {
		return nil, fmt.Errorf("unsupported message type: %d", messageType)
	}

	return &signal, nil
}

func (s *DiscoverServer) regist(conn *websocket.Conn, loginData *neutronproto.LoginRequest) (*WebSocketClient, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if client, ok := s.clients[loginData.ClientId]; ok {
		if client.wsConn != nil {
			log.Infof("client %s original connection is not null, so close it", client.clientID)
			if err := client.wsConn.Close(); err != nil {
				log.Warnf("close connection failed %v", err)
			}
			client.wsConn = nil
		}
	}

	if _, ok := s.users[loginData.Username]; !ok {
		s.users[loginData.Username] = &WebSocketUser{
			userID:  loginData.Username,
			clients: list.New(),
		}
	}

	client := &WebSocketClient{
		clientID:        loginData.ClientId,
		storageServerID: loginData.StorageServerId,
		wsConn:          conn,
		offset:          nil,
		user:            s.users[loginData.Username],
	}

	s.clients[loginData.ClientId] = client
	client.offset = s.users[loginData.Username].clients.PushBack(client)
	return client, nil
}

func (s *DiscoverServer) forward(destination string, data []byte) error {
	conn, err := s.getClientConnection(destination)
	if err != nil {
		return fmt.Errorf("client %s not found", destination)
	}

	// 发送二进制消息（protobuf格式）
	if err := conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
		return fmt.Errorf("write error: %v", err)
	}

	return nil
}

func (s *DiscoverServer) getClientConnection(id string) (*websocket.Conn, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	if client, ok := s.clients[id]; ok && client != nil {
		return client.wsConn, nil
	}

	user, exists := s.users[id]
	if !exists {
		return nil, errors.New("not found")
	}

	if user.clients.Front() == nil {
		return nil, errors.New("not found client")
	}

	client := user.clients.Front().Value.(*WebSocketClient)
	return client.wsConn, nil

}

func (s *DiscoverServer) LoginHandler(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Warnf("read request body failed %v", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	var loginInfo neutronproto.LoginRequest
	if err := proto.Unmarshal(body, &loginInfo); err != nil {
		log.Warnf("decode login request failed %v", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Send to StorageServer to check user/passwd
	// Create LoginRequest payload
	loginReq := &neutronproto.LoginRequest{
		ClientId:        loginInfo.ClientId,
		Username:        loginInfo.Username,
		Password:        loginInfo.Password,
		StorageServerId: loginInfo.StorageServerId,
	}

	// Create RemoteMessage with LoginRequest as payload
	remoteMsg := &neutronproto.RemoteMessage{
		Type:        "authorizen",
		Source:      "discover",
		Destination: loginInfo.StorageServerId,
		Id:          uuid.NewString(),
	}
	// Set LoginRequest as payload
	remoteMsg.Payload = &neutronproto.RemoteMessage_LoginRequest{
		LoginRequest: loginReq,
	}

	result, err := s.callClient(loginInfo.StorageServerId, remoteMsg, 5*time.Second)
	if err != nil {
		log.Warnf("call login user %s: %v", loginInfo.Username, err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract login response from payload
	// First check for error message
	if errorMsg := result.GetError(); errorMsg != nil {
		log.Warnf("login failed: %s", errorMsg.Error)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Then check for LoginResponse
	loginResponse := result.GetLoginResponse()
	if loginResponse == nil {
		log.Warnf("login response payload is empty or not a LoginResponse")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if token is present
	if loginResponse.Token == "" {
		log.Warnf("login response token is empty")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	s.tokenCaches.Set(loginResponse.Token, &loginInfo, 0)

	w.Header().Set("Content-Type", "application/x-protobuf")
	cnt, _ := proto.Marshal(loginResponse)
	if _, err := w.Write(cnt); err != nil {
		log.Warnf("Error writing response: %v", err)
	}
}

func (s *DiscoverServer) callClient(userId string, msg *neutronproto.RemoteMessage,
	timeout time.Duration) (*neutronproto.RemoteMessage, error) {
	ch := make(chan *neutronproto.RemoteMessage, 1)

	content, err := protobuf.Marshal(msg)
	if err != nil {
		return nil, errors.New("protobuf encode message failed")
	}

	_ = s.registCallback(msg.Id, &ch)
	defer s.registCallback(msg.Id, nil)

	if err := s.forward(userId, content); err != nil {
		return nil, fmt.Errorf("send authorizen message failed %v", err)
	}

	select {
	case res := <-ch:
		return res, nil
	case <-time.After(timeout):
		return nil, errors.New("timeout")
	}
}

func (s *DiscoverServer) callAck(msg *neutronproto.RemoteMessage) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	ch, ok := s.responseChannels[msg.Id]
	if !ok {
		return fmt.Errorf("not found ack channel for id %s", msg.Id)
	}

	ch <- msg
	return nil
}

func (s *DiscoverServer) registCallback(callID string, ch *chan *neutronproto.RemoteMessage) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if ch == nil {
		delete(s.responseChannels, callID)
	} else {
		s.responseChannels[callID] = *ch
	}
	return nil
}

func (s *DiscoverServer) CheckTokenHandler(w http.ResponseWriter, r *http.Request) {
	tokenStr := r.Header.Get("Authorization")
	tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
	if tokenStr == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if loginData, ok := s.tokenCaches.Get(tokenStr); !ok || loginData == nil {
		http.Error(w, "Invalid Token", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte(`{"token":"` + tokenStr + `"}`)); err != nil {
		log.Warnf("Error writing response: %v", err)
	}
}
