package local

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/fs"
	"github.com/aproton/neutron/pkg/media"
	"github.com/aproton/neutron/pkg/meta"
	"github.com/aproton/neutron/pkg/utils/log"
)

type LocalFileSystemScanner struct {
	home          string
	root          string
	metadataPath  string
	config        *config.LocalFileSystemConfig
	db            *gorm.DB
	version       string
	folderNodeIDs map[string]uint64
	nextNodeID    uint64
}

type ScannerMetadata struct {
	Root      string `json:"root"`
	Timestamp string `json:"timestamp"`
	Version   string `json:"version,omitempty"`
}

func NewLocalFileSystemScanner(config *config.Config, db *gorm.DB) *LocalFileSystemScanner {
	return &LocalFileSystemScanner{
		home:          config.Home,
		root:          config.FileSystem.Local.RootPath,
		metadataPath:  filepath.Join(config.Home, "vars/.metadata_scan_completed"),
		config:        config.FileSystem.Local,
		db:            db,
		folderNodeIDs: map[string]uint64{"/": 0},
		nextNodeID:    1000,
	}
}

func (scanner *LocalFileSystemScanner) GetVersion() string {
	return scanner.version
}

func (scanner *LocalFileSystemScanner) Start(ctx context.Context) error {
	if scanner.config == nil {
		log.Info("Metadata config is nil, skipping initialization")
		return errors.New("invalidate config")
	}

	if err := scanner.db.AutoMigrate(&fs.NodeAttr{}); err != nil {
		return fmt.Errorf("failed to auto migrate NodeAttr: %v", err)
	}

	if err := scanner.db.AutoMigrate(&meta.RepoHistoryItem{}); err != nil {
		return fmt.Errorf("failed to auto migrate RepoHistoryItem: %v", err)
	}

	data, err := os.ReadFile(scanner.metadataPath)
	if err == nil {
		var marker ScannerMetadata
		if err := json.Unmarshal(data, &marker); err != nil {
			return err
		}

		if marker.Root == scanner.root {
			scanner.version = marker.Version
			log.Infof("File metadata scan already completed with version %s, skipping", scanner.version)
			return nil
		}
	}

	scanner.version = uuid.NewString()
	log.Infof("Starting file metadata scan with version %s", scanner.version)

	return scanner.scanFiles(ctx)
}

func (scanner *LocalFileSystemScanner) markScanCompleted() error {
	if scanner.version == "" {
		scanner.version = uuid.NewString()
	}

	markerData := &ScannerMetadata{
		Root:      scanner.config.RootPath,
		Timestamp: time.Now().Format(time.RFC3339),
		Version:   scanner.version,
	}

	data, err := json.Marshal(markerData)
	if err != nil {
		return fmt.Errorf("failed to marshal marker data: %v", err)
	}

	return os.WriteFile(scanner.metadataPath, data, 0644)
}

func (scanner *LocalFileSystemScanner) scanFiles(ctx context.Context) error {
	log.Info("Starting file tree scan...")

	// 用于批量处理的缓冲区
	batchSize := 100

	currentBatchNodes := make([]*fs.NodeAttr, 0, batchSize)
	currentBatchRepoItems := make([]*meta.RepoHistoryItem, 0, batchSize)

	// 用于跟踪已处理的项目数量
	processedCount := 0

	err := filepath.Walk(scanner.root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// 检查是否在排除列表中
		relPath, _ := filepath.Rel(scanner.root, path)
		if relPath != "." {
			relPath = "/" + relPath
		} else {
			relPath = "/"
		}

		//log.Infof("Processing path: %s", relPath)

		for _, exclude := range scanner.config.Excludes {
			if strings.Contains(relPath, exclude) {
				if info.IsDir() {
					return filepath.SkipDir
				}
				return nil
			}
		}

		nodeAttr, repoItem, err := scanner.processPath(relPath, info)
		if err != nil {
			return fmt.Errorf("failed to process path %s: %v", path, err)
		}

		processedCount++

		if nodeAttr != nil {
			currentBatchNodes = append(currentBatchNodes, nodeAttr)
		}
		if repoItem != nil {
			currentBatchRepoItems = append(currentBatchRepoItems, repoItem)
		}

		if len(currentBatchNodes) >= batchSize || len(currentBatchRepoItems) >= batchSize {
			if err := scanner.insertBatch(currentBatchNodes, currentBatchRepoItems); err != nil {
				return fmt.Errorf("failed to insert batch: %v", err)
			}
			currentBatchNodes = currentBatchNodes[:0]
			currentBatchRepoItems = currentBatchRepoItems[:0]
		}

		if scanner.config.ScanSpeedQPS > 0 {
			time.Sleep(time.Duration(1000/scanner.config.ScanSpeedQPS) * time.Millisecond)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to walk directory: %v", err)
	}

	if err := scanner.insertBatch(currentBatchNodes, currentBatchRepoItems); err != nil {
		return fmt.Errorf("failed to insert batch: %v", err)
	}

	log.Infof("Completed scan of %d files and directories", processedCount)

	if err := scanner.markScanCompleted(); err != nil {
		return fmt.Errorf("failed to mark scan as completed: %v", err)
	}

	log.Info("File metadata scan completed successfully")
	return nil
}

// processPath 处理单个路径，返回需要插入的 NodeAttr 和 RepoHistoryItem
// 如果不是媒体文件，返回的 RepoHistoryItem 为 nil
func (scanner *LocalFileSystemScanner) processPath(path string, info os.FileInfo) (
	*fs.NodeAttr, *meta.RepoHistoryItem, error) {

	nodeID := scanner.nextNodeID
	scanner.nextNodeID++

	parentNodeID := uint64(0)
	if pid, ok := scanner.folderNodeIDs[filepath.Dir(path)]; ok {
		parentNodeID = pid
	} else {
		log.Warnf("Parent folder not found for path: %s, parent: %s", path, filepath.Dir(path))
		panic("parent folder not found for path: " + path)
	}

	// 检查是否是媒体文件（图片或视频）
	var repoItem *meta.RepoHistoryItem = nil
	var extraInfo *fs.FileSystemExtraInfo = nil

	if !info.IsDir() {
		fileType := media.GetFileMimeType(path)
		if fileType == "image" || fileType == "video" {
			exif, _ := media.GetImageExifData(path)

			exifTime, err := media.GetExifDataTime(exif)
			if err == nil {
				log.Infof("Processing media file: %s, type: %s, exif time: %v", path, fileType, exifTime)
			}

			// 创建额外的系统信息
			extraInfo = &fs.FileSystemExtraInfo{
				MimeType: fileType,
				Exif:     exif,
			}

			// 创建 RepoHistoryItem
			repoItem = &meta.RepoHistoryItem{
				ModTime:    info.ModTime().Unix(),
				ExifTime:   info.ModTime().Unix(),
				Type:       meta.CREATE_FILE,
				FilePath:   path,
				IsValidate: true,
			}
		}
	} else {
		scanner.folderNodeIDs[path] = nodeID
	}

	// 创建 NodeAttr
	nodeAttr := &fs.NodeAttr{
		Inode:    uint64(nodeID),
		ParentID: parentNodeID,
		Size:     uint64(info.Size()),
		Atime:    info.ModTime(),
		Mtime:    info.ModTime(),
		Ctime:    time.Now(),
		Name:     info.Name(),
		Mode:     fs.FromSystemFileMode(fs.LinuxSystem, info.Mode()),
	}

	// 设置额外的系统信息
	if extraInfo != nil {
		if extraJSON, err := json.Marshal(extraInfo); err == nil {
			nodeAttr.SystemExtra = string(extraJSON)
		}
	}

	return nodeAttr, repoItem, nil
}

func (scanner *LocalFileSystemScanner) insertBatch(
	currentBatchNodes []*fs.NodeAttr, currentBatchRepoItems []*meta.RepoHistoryItem) error {
	if scanner.db == nil {
		return fmt.Errorf("database not initialized")
	}

	tx := scanner.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to begin transaction: %v", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		}
	}()

	// 用于跟踪路径到 inode 的映射，用于构建父子关系
	pathToInode := make(map[string]uint64)
	pathToInode["."] = 0 // 根目录的父ID为0

	// 首先处理所有项目，构建 NodeAttr 记录
	for _, item := range currentBatchNodes {
		if err := tx.Save(item).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert NodeAttr for %s: %v", item.Name, err)
		}

	}

	for _, item := range currentBatchRepoItems {
		if err := tx.Save(item).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert RepoHistoryItem for %s: %v", item.FilePath, err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}
