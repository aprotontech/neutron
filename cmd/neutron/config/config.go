package config

import "github.com/aproton/neutron/pkg/web"

type Config struct {
	Home           string                `yaml:"home"`
	Fuse           *FuseMountConfig      `yaml:"fuse"`
	Storage        []StorageConfig       `yaml:"storage"`
	Cache          *CacheConfig          `yaml:"cache"`
	WebServer      *web.WebServerConfig  `yaml:"web"`
	Users          *UserConfig           `yaml:"users"`
	DiscoverClient *DiscoverClientConfig `yaml:"discoverClient"`
}

type FuseMountConfig struct {
	MountPoint string `yaml:"mountPoint"`
}

type StorageConfig struct {
	Name    string            `yaml:"name"`
	Backend string            `yaml:"backend"`
	Config  map[string]string `yaml:"config"`
}

type UserConfig struct {
	PasswordsFile string `yaml:"passwordsFile"`
}

type CacheConfig struct {
	Enabled        bool   `yaml:"enabled"`
	CacheDir       string `yaml:"cacheDir"`
	MaxSizeMB      int64  `yaml:"maxSizeMB"`
	EvictionPolicy string `yaml:"evictionPolicy"`
}

type DiscoverClientConfig struct {
	WebSocketURL    string `yaml:"websocketURL"`
	StorageServerID string `yaml:"storageServerID"`
	Password        string `yaml:"password"`
}

var GlobalConfig *Config
