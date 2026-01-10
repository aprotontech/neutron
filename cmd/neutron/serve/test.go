package serve

import (
	"context"
	"net/http"
	"path"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/spf13/cobra"

	"github.com/aproton/neutron/cmd/neutron/config"
	baidudisk "github.com/aproton/neutron/pkg/storage/baidu_disk"
	"github.com/aproton/neutron/pkg/utils/log"
	"github.com/aproton/neutron/pkg/web"
)

func testBaiduSDK(ctx context.Context) {
	baiduConfig := map[string]string{}
	for _, cfg := range config.GlobalConfig.Storage {
		if cfg.Backend == "baidu_disk" {
			baiduConfig = cfg.Config
			break
		}
	}

	baidu := baidudisk.NewBaiduDisk(baidudisk.Config{
		AppID:       baiduConfig["AppID"],
		AppKey:      baiduConfig["AppKey"],
		SecretKey:   baiduConfig["SecretKey"],
		SignKey:     baiduConfig["SignKey"],
		PrefixPath:  baiduConfig["PrefixPath"],
		RedirectUri: baiduConfig["RedirectUri"],
		CachePath:   path.Join(config.GlobalConfig.Home, "cache", "baidu"),
	})

	go func() {
		err := baidu.Open(ctx)
		if err != nil {
			log.Warn(err)
		}

		// buf := make([]byte, 1024)
		// if c, err := baidu.Read(
		// 	cmd.Context(), "/neutron/sha256sum-amd64.txt", 0, buf); err == nil || errors.Is(err, io.EOF) {
		// 	log.Infof("content=%s", string(buf[0:c]))
		// } else {
		// 	log.Warnf("%s", err.Error())
		// }

		// cnt, err := os.ReadFile("./README.md")
		// if err == nil {
		// 	log.Infof("try to upload content")
		// 	c, err := baidu.Write(cmd.Context(), "/neutron/README.md", 0, cnt)
		// 	log.Infof("upload result: %d, %v", c, err)
		// }

		err = baidu.Remove(ctx, "/neutron/README.md")
		log.Infof("delete result: %v", err)

	}()

	handles := baidu.GetWebHandles()

	_ = web.StartWebServer(config.GlobalConfig.WebServer, handles)

}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type SignalServer struct {
	clients map[*websocket.Conn]bool
	mutex   sync.RWMutex
}

type SignalMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func NewSignalServer() *SignalServer {
	return &SignalServer{
		clients: make(map[*websocket.Conn]bool),
	}
}

func (s *SignalServer) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Infof("Upgrade error:", err)
		return
	}
	defer conn.Close()

	s.mutex.Lock()
	s.clients[conn] = true
	s.mutex.Unlock()

	log.Info("New client connected")

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			s.removeClient(conn)
			break
		}

		s.broadcast(conn, msg)
	}
}

func (s *SignalServer) broadcast(sender *websocket.Conn, msg []byte) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	for client := range s.clients {
		if client != sender {
			if err := client.WriteMessage(websocket.TextMessage, msg); err != nil {
				s.removeClient(client)
			}
		}
	}
}

func (s *SignalServer) removeClient(conn *websocket.Conn) {
	s.mutex.Lock()
	delete(s.clients, conn)
	s.mutex.Unlock()
	conn.Close()
}

func testWebRTCServer(_ context.Context) {
	server := NewSignalServer()

	http.HandleFunc("/ws", server.handleWebSocket)
	http.Handle("/", http.FileServer(http.Dir("./static")))

	log.Info("Signal server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func Test(cmd *cobra.Command, args []string) {
	testWebRTCServer(cmd.Context())
}
