package test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"

	"github.com/aproton/neutron/pkg/utils/log"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type SignalServer struct {
	clients map[string]*websocket.Conn
	mutex   sync.RWMutex
}

type SignalMessage struct {
	Type         string      `json:"type"`
	Source       string      `json:"source"`
	Destionation string      `json:"destination"`
	ID           string      `json:"id,omitempty"`
	Data         interface{} `json:"data"`
}

func (m *SignalMessage) GetContent(key string) interface{} {
	if content, ok := m.Data.(map[string]interface{})[key]; ok {
		return content
	}

	panic("key not found")
}

func NewSignalServer() *SignalServer {
	return &SignalServer{
		clients: make(map[string]*websocket.Conn),
	}
}

func (s *SignalServer) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Infof("Upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Info("New client connected")

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			s.removeClient(conn)
			break
		}

		var signal SignalMessage
		if err := json.Unmarshal(msg, &signal); err != nil {
			log.Warnf("Unmarshal error:", err)
			continue
		}

		switch signal.Type {
		case "regist":
			s.mutex.Lock()
			s.clients[signal.Source] = conn
			s.mutex.Unlock()
			log.Infof("Client %s regist", signal.Source)
		default:
			s.forward(conn, signal.Destionation, msg)
		}
	}
}

func (s *SignalServer) forward(sender *websocket.Conn, destionation string, data []byte) {
	client, err := s.getClient(destionation)
	if err != nil {
		log.Warnf("Client %s not found", destionation)
		return
	}

	if err := client.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Warnf("write error: %v", err)
	}
}

func (s *SignalServer) getClient(id string) (*websocket.Conn, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	conn, exists := s.clients[id]
	if !exists {
		return nil, errors.New("not found")
	}
	return conn, nil
}

func (s *SignalServer) removeClient(conn *websocket.Conn) {
	s.mutex.Lock()
	for key, c := range s.clients {
		if c == conn {
			delete(s.clients, key)
			break
		}
	}
	s.mutex.Unlock()
	conn.Close()
}

func (s *SignalServer) StartStunServer(ctx context.Context) {

}
