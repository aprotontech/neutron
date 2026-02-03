package discoversvr

import (
	"fmt"
	"net/http"
	"path"

	"github.com/spf13/cobra"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/discover"
	"github.com/aproton/neutron/pkg/utils/log"
)

func StartDiscover(cmd *cobra.Command, args []string) {
	server := discover.NewDiscoverServer()

	with_prefix := func(url_path string) string {
		return path.Join(config.GlobalConfig.WebServer.Prefix, url_path)
	}

	http.HandleFunc(with_prefix("/ws"), server.HandleWebSocket)
	http.HandleFunc(with_prefix("/api/login"), server.LoginHandler)
	http.HandleFunc(with_prefix("/api/token"), server.CheckTokenHandler)
	http.Handle(with_prefix("/"), http.FileServer(http.Dir(config.GlobalConfig.WebServer.StaticFolder)))

	log.Infof("Discover server starting on :%d", config.GlobalConfig.WebServer.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", config.GlobalConfig.WebServer.Port), nil))
}

func ServeCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "discover",
		Short: "Start Discover Server",
		Run:   StartDiscover,
	}
}
