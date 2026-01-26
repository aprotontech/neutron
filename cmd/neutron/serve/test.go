package serve

import (
	"context"
	"net/http"

	"github.com/spf13/cobra"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/cmd/neutron/serve/test"
	"github.com/aproton/neutron/pkg/utils/log"
)

func testWebRTCServer(ctx context.Context) {
	server := test.NewSignalServer()

	go server.StartStunServer(ctx)

	http.HandleFunc("/ws", server.HandleWebSocket)
	log.Infof("static %s", config.GlobalConfig.WebServer.StaticFolder)
	http.Handle("/", http.FileServer(http.Dir(config.GlobalConfig.WebServer.StaticFolder)))

	log.Info("Signal server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func testWebRTCClient(_ context.Context) {
	sender, _ := test.NewSender("ws://localhost:8080/ws")
	//sender, _ := test.NewSender("wss://www.huxiaolong.cn/ws")
	sender.Start()
}

func Test(cmd *cobra.Command, args []string) {
	go testWebRTCClient(cmd.Context())
	testWebRTCServer(cmd.Context())
}
