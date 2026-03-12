package fs

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/patrickmn/go-cache"
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

func NewFileSystemDatabase(cfg *config.Config, db *gorm.DB) *FileSystemDatabase {
	return &FileSystemDatabase{
		config:      cfg,
		db:          db,
		version:     "0.1",
		rootNode:    nil,
		cachedNodes: cache.New(5*time.Minute, 10*time.Minute),
	}
}

func (fsdb *FileSystemDatabase) Start(ctx context.Context) error {
	// ensure table exists
	if err := fsdb.db.AutoMigrate(&NodeAttr{}); err != nil {
		return fmt.Errorf("failed to auto migrate NodeAttr: %v", err)
	}

	<-ctx.Done()

	return nil
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

func (fsdb *FileSystemDatabase) BatchStat(paths []string) ([]*NodeAttr, error) {
	if len(paths) == 0 {
		return []*NodeAttr{}, nil
	}

	// 获取根节点
	rootNode, err := fsdb.getRootNode()
	if err != nil {
		return nil, err
	}

	// 结果切片
	results := make([]*NodeAttr, len(paths))

	// 用于跟踪已经查询过的路径，避免重复查询
	queriedPaths := make(map[string]*NodeAttr)

	for i, path := range paths {
		if !strings.HasPrefix(path, "/") {
			return nil, fmt.Errorf("invalid path: %s", path)
		}

		cleanPath := filepath.Clean(path)

		// 检查根路径
		if cleanPath == "/" {
			results[i] = rootNode
			queriedPaths[cleanPath] = rootNode
			continue
		}

		// 检查缓存
		cacheKey := strings.TrimSuffix(cleanPath, "/")
		if cached, found := fsdb.cachedNodes.Get(cacheKey); found {
			results[i] = cached.(*NodeAttr)
			queriedPaths[cleanPath] = cached.(*NodeAttr)
			continue
		}

		// 检查是否已经查询过这个路径
		if node, exists := queriedPaths[cleanPath]; exists {
			results[i] = node
			continue
		}

		// 需要查询这个路径
		node, err := fsdb.Stat(cleanPath)
		if err != nil {
			if err == os.ErrNotExist {
				results[i] = nil
				queriedPaths[cleanPath] = nil
			} else {
				// 其他错误，返回错误
				return nil, err
			}
		} else {
			results[i] = node
			queriedPaths[cleanPath] = node
			// 更新缓存
			fsdb.cachedNodes.Set(cacheKey, node, cache.DefaultExpiration)
		}
	}

	return results, nil
}
