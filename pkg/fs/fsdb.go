package fs

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/patrickmn/go-cache"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/utils/log"
)

type FileSystemDatabase struct {
	config      *config.Config
	db          *gorm.DB
	version     string
	rootNode    *NodeAttr
	cachedNodes *cache.Cache // cache for NodeAttr, key is path, value is *NodeAttr
}

func NewFileSystemDatabase(cfg *config.Config) *FileSystemDatabase {
	if cfg.FileSystem.Driver != "sqlite" {
		panic("unsupported database driver: " + cfg.FileSystem.Driver)
	}
	gdb, err := gorm.Open(sqlite.Open(cfg.FileSystem.Sqlite), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	// ensure table exists
	if err := gdb.AutoMigrate(&NodeAttr{}); err != nil {
		panic(err)
	}

	return &FileSystemDatabase{
		config:      cfg,
		db:          gdb,
		version:     "0.1",
		rootNode:    nil,
		cachedNodes: cache.New(5*time.Minute, 10*time.Minute),
	}
}

func (fsdb *FileSystemDatabase) List(path string) ([]*NodeAttr, error) {
	parentNode, err := fsdb.Stat(path)
	if err != nil {
		return nil, err
	}
	var rows []NodeAttr
	if err := fsdb.db.Where("parent_id = ?", parentNode.Inode).Find(&rows).Error; err != nil {
		return nil, err
	}
	var result []*NodeAttr
	for _, r := range rows {
		result = append(result, &r)
	}
	return result, nil
}

func (fsdb *FileSystemDatabase) Open(path string) (FileOperator, error) {
	return nil, nil
}

func (fsdb *FileSystemDatabase) Stat(path string) (*NodeAttr, error) {
	if !strings.HasPrefix(path, "/") {
		return nil, fmt.Errorf("invalid path: %s", path)
	}

	path = filepath.Clean(path)

	rootNode, err := fsdb.getRootNode()
	if err != nil {
		return nil, err
	}

	if path == "/" {
		return rootNode, nil
	}

	var cachedNode *NodeAttr
	cachedPath := strings.TrimSuffix(path, "/")
	pathList := []string{}
	for cachedPath != "" {
		if cached, found := fsdb.cachedNodes.Get(cachedPath); found {
			cachedNode = cached.(*NodeAttr)
			break
		}

		if cachedPath == "/" {
			cachedNode = rootNode
			break
		}

		lastIndex := strings.LastIndex(cachedPath, "/")
		if lastIndex == -1 { // should not happen since path starts with "/"
			return nil, fmt.Errorf("invalid path: %s", path)
		}

		pathList = append(pathList, cachedPath[lastIndex+1:])
		cachedPath = cachedPath[:lastIndex]
	}

	if cachedNode == nil {
		cachedNode = rootNode
		cachedPath = "/"
	}

	for i := len(pathList) - 1; i >= 0; i-- {
		r := &NodeAttr{}
		if err := fsdb.db.Where("parent_id = ? AND name = ?",
			cachedNode.Inode, pathList[i]).First(r).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return nil, os.ErrNotExist
			}
			log.Warnf("stat path %s failed: %v", path, err)
			return nil, err
		}

		if cachedPath != "/" {
			cachedPath = cachedPath + "/" + pathList[i]
		} else {
			cachedPath = cachedPath + pathList[i]
		}

		fsdb.cachedNodes.Set(cachedPath, r, cache.DefaultExpiration)
		cachedNode = r
	}

	return cachedNode, nil
}

func (fsdb *FileSystemDatabase) getRootNode() (*NodeAttr, error) {
	if fsdb.rootNode != nil {
		return fsdb.rootNode, nil
	}

	var r NodeAttr
	if err := fsdb.db.Where("parent_id = ?", 0).First(&r).Error; err != nil {
		return nil, err
	}
	fsdb.rootNode = &r
	return fsdb.rootNode, nil
}
