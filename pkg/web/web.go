package web

import (
	"fmt"
	"net/http"

	"github.com/aproton/neutron/pkg/utils/log"
)

type WebServerConfig struct {
	Port         int    `yaml:"port"`
	Prefix       string `yaml:"prefix"`
	StaticFolder string `yaml:"html"`
}

type Handle func(http.ResponseWriter, *http.Request)

func StartWebServer(config *WebServerConfig, handles map[string]Handle) error {
	mux := http.NewServeMux()
	for path, handle := range handles {
		mux.HandleFunc(path, handle)
	}

	fs := http.FileServer(http.Dir(config.StaticFolder))
	mux.Handle(config.Prefix, http.StripPrefix("/static/", fs))

	log.Infof("Server starting on :%d", config.Port)
	return http.ListenAndServe(fmt.Sprintf(":%d", config.Port), mux)
}
