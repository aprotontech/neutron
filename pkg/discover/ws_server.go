package discover

import (
	"container/list"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/patrickmn/go-cache"

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

	clients map[string]*WebSocketClient
	users   map[string]*WebSocketUser

	responseChannels map[string]chan *RemoteMessage

	// key: token,  value: *LoginRequest
	tokenCaches *cache.Cache
}

func NewDiscoverServer() *DiscoverServer {

	return &DiscoverServer{
		clients:          make(map[string]*WebSocketClient),
		users:            make(map[string]*WebSocketUser),
		tokenCaches:      cache.New(24*time.Hour, time.Hour),
		responseChannels: make(map[string]chan *RemoteMessage),
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
			var loginInfo LoginRequest
			if err := json.Unmarshal(cnt, &loginInfo); err != nil {
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

	s.doWebSocketTraffic(loginData.(*LoginRequest), w, r)

}

func (s *DiscoverServer) doWebSocketTraffic(userData *LoginRequest, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Warnf("Upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Infof("New client %s, user %s connected", userData.ClientID, userData.Username)

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
			log.Warnf("received invalidate source")
			break
		}

		if signal.Type == "callAck" {
			if err := s.callAck(signal); err != nil {
				log.Warnf("callack failed %v", err)
			}
		} else if err := s.forward(signal.Destionation, signal.msgBytes); err != nil {
			log.Warnf("forward failed %v", err)
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

func (s *DiscoverServer) readMessage(conn *websocket.Conn) (*RemoteMessage, error) {
	_, msg, err := conn.ReadMessage()
	if err != nil {
		return nil, err
	}

	var signal RemoteMessage
	if err := json.Unmarshal(msg, &signal); err != nil {
		return nil, fmt.Errorf("Unmarshal error: %v", err)
	}

	signal.msgBytes = msg

	return &signal, nil
}

func (s *DiscoverServer) regist(conn *websocket.Conn, loginData *LoginRequest) (*WebSocketClient, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if client, ok := s.clients[loginData.ClientID]; ok {
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
		clientID:        loginData.ClientID,
		storageServerID: loginData.StorageServerID,
		wsConn:          conn,
		offset:          nil,
		user:            s.users[loginData.Username],
	}

	s.clients[loginData.ClientID] = client
	client.offset = s.users[loginData.Username].clients.PushBack(client)
	return client, nil
}

func (s *DiscoverServer) forward(destionation string, data []byte) error {
	conn, err := s.getClientConnection(destionation)
	if err != nil {
		return fmt.Errorf("client %s not found", destionation)
	}

	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
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
	var loginInfo LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginInfo); err != nil {
		log.Warnf("decode login request failed %v", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Send to StorageServer to check user/passwd
	result, err := s.callClient(loginInfo.StorageServerID, &RemoteMessage{
		Type:         "authorizen",
		Source:       "discover",
		Destionation: loginInfo.StorageServerID,
		ID:           uuid.NewString(),
		Data:         &loginInfo,
	}, 5*time.Second)
	if err != nil {
		log.Warnf("call login user %s: %v", loginInfo.Username, err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	loginResponse, err := result.GetLoginResponse()
	if err != nil {
		log.Warnf("get login response data failed %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if !loginResponse.Success {
		log.Warnf("login failed %s", loginResponse.Message)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	s.tokenCaches.Set(loginResponse.Token, &loginInfo, 0)

	// claims := jwt.MapClaims{
	// 	"userID":   "kog",
	// 	"username": "test-username",
	// }

	// token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// tokenString, err := token.SignedString([]byte("your-secret-key"))
	// if err != nil {
	// 	http.Error(w, "Could not generate token", http.StatusInternalServerError)
	// 	return
	// }

	w.Header().Set("Content-Type", "application/json")
	cnt, _ := json.Marshal(loginResponse)
	if _, err := w.Write(cnt); err != nil {
		log.Warnf("Error writing response: %v", err)
	}
}

func (s *DiscoverServer) callClient(userId string, msg *RemoteMessage, timeout time.Duration) (*RemoteMessage, error) {
	ch := make(chan *RemoteMessage, 1)

	content, err := json.Marshal(msg)
	if err != nil {
		return nil, errors.New("encode message failed")
	}

	_ = s.registCallback(msg.ID, &ch)
	defer s.registCallback(msg.ID, nil)

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

func (s *DiscoverServer) callAck(msg *RemoteMessage) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	ch, ok := s.responseChannels[msg.ID]
	if !ok {
		return fmt.Errorf("not found ack channel for id %s", msg.ID)
	}

	ch <- msg
	return nil
}

func (s *DiscoverServer) registCallback(callID string, ch *chan *RemoteMessage) error {
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

	if _, ok := s.tokenCaches.Get(tokenStr); !ok {
		http.Error(w, "Invalid Token", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte(`{"token":"` + tokenStr + `"}`)); err != nil {
		log.Warnf("Error writing response: %v", err)
	}
}
