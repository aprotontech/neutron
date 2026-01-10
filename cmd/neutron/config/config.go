package config

import "github.com/aproton/neutron/pkg/web"

type Config struct {
	Home      string               `yaml:"home"`
	Fuse      *FuseMountConfig     `yaml:"fuse"`
	Storage   []StorageConfig      `yaml:"storage"`
	WebServer *web.WebServerConfig `yaml:"web"`
}

type FuseMountConfig struct {
	MountPoint string `yaml:"mountPoint"`
}

type StorageConfig struct {
	Name    string            `yaml:"name"`
	Backend string            `yaml:"backend"`
	Config  map[string]string `yaml:"config"`
}

var GlobalConfig *Config
