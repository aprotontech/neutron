package config

import "github.com/aproton/neutron/pkg/web"

type Config struct {
	Home           string                `yaml:"home"`
	Driver         *DriverConfig         `yaml:"driver"`
	Fuse           *FuseMountConfig      `yaml:"fuse"`
	Storage        []StorageConfig       `yaml:"storage"`
	FileSystem     *FileSystemConfig     `yaml:"filesystem"`
	Cache          *CacheConfig          `yaml:"cache"`
	WebServer      *web.WebServerConfig  `yaml:"web"`
	Users          *UserConfig           `yaml:"users"`
	Tools          *ToolsConfig          `yaml:"tools"`
	DiscoverClient *DiscoverClientConfig `yaml:"discoverClient"`
}

type FuseMountConfig struct {
	MountPoint string `yaml:"mountPoint"`
}

type DriverConfig struct {
	BackendType string `yaml:"type"`
	Sqlite      string `yaml:"sqlite"`
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

type FfmpegConfig struct {
	Mode  string `yaml:"mode"`  // binary/docker
	Image string `yaml:"image"` //docker-image, validate when `mode` == "docker"
	Path  string `yaml:"path"`  // binary path
}

type ToolsConfig struct {
	Ffmpeg *FfmpegConfig `yaml:"ffmpeg"`
}

type FileSystemConfig struct {
	Local *LocalFileSystemConfig `yaml:"local"`
}

type LocalFileSystemConfig struct {
	RootPath             string   `yaml:"root"`
	ScanSpeedQPS         int      `yaml:"qps"`
	Excludes             []string `yaml:"excludes"`
	DefaultThumbnailSize int      `yaml:"thumbnailSize"`
}

var GlobalConfig *Config
