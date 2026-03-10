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
	"github.com/aproton/neutron/pkg/utils"
	"github.com/aproton/neutron/pkg/utils/log"
)

type LocalFileSystemScanner struct {
	home           string
	root           string
	metadataPath   string
	config         *config.LocalFileSystemConfig
	db             *gorm.DB
	programVersion string
	scanVersion    string
	folderNodeIDs  map[string]uint64
	nextNodeID     uint64

	thumbnailCachePath string

	workerCount int
	batchSize   int
}

type ScannerMetadata struct {
	Root           string `json:"root"`
	Timestamp      string `json:"timestamp"`
	ProgramVersion string `json:"programVersion,omitempty"`
	Version        string `json:"version,omitempty"`
}

// scannerDataItem 用于在 channel 中传递的数据项
type scannerDataItem struct {
	localPath    string
	relativePath string
	nodeAttr     *fs.NodeAttr
	repoItem     *meta.RepoHistoryItem
}

func NewLocalFileSystemScanner(config *config.Config, db *gorm.DB) *LocalFileSystemScanner {
	return &LocalFileSystemScanner{
		home:               config.Home,
		root:               config.FileSystem.Local.RootPath,
		metadataPath:       filepath.Join(config.Home, "vars/.metadata_scan_completed"),
		config:             config.FileSystem.Local,
		db:                 db,
		folderNodeIDs:      map[string]uint64{"/": 0},
		programVersion:     "v0.2",
		nextNodeID:         1000,
		thumbnailCachePath: config.Cache.CacheDir,

		// 并发处理相关字段初始化
		workerCount: 4,   // 默认4个 worker
		batchSize:   100, // 默认批量大小
	}
}

func (scanner *LocalFileSystemScanner) GetVersion() string {
	return scanner.programVersion + "." + scanner.scanVersion
}

func (scanner *LocalFileSystemScanner) Start(ctx context.Context) error {
	if scanner.config == nil {
		log.Info("Metadata config is nil, skipping initialization")
		return errors.New("invalid config")
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
			log.Warnf("unmarsk %s failed with err: %s", scanner.metadataPath, err.Error())
			return err
		}

		if marker.ProgramVersion == scanner.programVersion && marker.Root == scanner.root {
			scanner.scanVersion = marker.Version
			log.Infof("File metadata scan already completed with version %s, skipping", scanner.scanVersion)
			return nil

		}
	}

	if err := scanner.db.Where("1 = 1").Delete(&fs.NodeAttr{}).Error; err != nil {
		log.Warnf("delete %s failed %s", fs.NodeAttr{}.TableName(), err.Error())
		return err
	}
	if err := scanner.db.Where("1 = 1").Delete(&meta.RepoHistoryItem{}).Error; err != nil {
		log.Warnf("delete %s failed %s", meta.RepoHistoryItem{}.TableName(), err.Error())
		return err
	}

	scanner.scanVersion = uuid.NewString()
	log.Infof("Starting file metadata scan with version %s", scanner.scanVersion)

	return scanner.scanFiles(ctx)
}

func (scanner *LocalFileSystemScanner) markScanCompleted() error {
	if scanner.scanVersion == "" {
		scanner.scanVersion = uuid.NewString()
	}

	markerData := &ScannerMetadata{
		Root:           scanner.config.RootPath,
		Timestamp:      time.Now().Format(time.RFC3339),
		ProgramVersion: scanner.programVersion,
		Version:        scanner.scanVersion,
	}

	data, err := json.Marshal(markerData)
	if err != nil {
		return fmt.Errorf("failed to marshal marker data: %v", err)
	}

	return os.WriteFile(scanner.metadataPath, data, 0644)
}

func (scanner *LocalFileSystemScanner) scanFiles(ctx context.Context) error {
	log.Info("Starting file tree scan...")

	// 初始化 channel 和 worker
	processFileChan := make(chan *scannerDataItem, scanner.batchSize)
	dbChan := make(chan *scannerDataItem, scanner.batchSize)

	defer close(processFileChan)
	defer close(dbChan)

	totalNodeCount := -1

	childCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	go func() {
		if count, err := scanner.walkWorker(childCtx, processFileChan); err != nil {
			cancel()
		} else {
			totalNodeCount = count
		}
	}()

	for range scanner.workerCount {
		go func() {
			scanner.processFileWorker(childCtx, processFileChan, dbChan)
		}()
	}

	nodeBatch := make([]*fs.NodeAttr, 0, scanner.batchSize)
	repoBatch := make([]*meta.RepoHistoryItem, 0, scanner.batchSize)

	totalInsertCount := 0
	for totalNodeCount < 0 || totalInsertCount < totalNodeCount {
		select {
		case <-childCtx.Done():
			return errors.New("context finished")
		case data := <-dbChan:
			if data.nodeAttr != nil {
				nodeBatch = append(nodeBatch, data.nodeAttr)
			}
			if data.repoItem != nil {
				repoBatch = append(repoBatch, data.repoItem)
			}

			totalInsertCount++

			toInsert := len(nodeBatch) >= scanner.batchSize || len(repoBatch) >= scanner.batchSize
			toInsert = toInsert || (totalNodeCount >= 0 && totalInsertCount >= totalNodeCount)

			if toInsert {
				if err := scanner.insertBatch(nodeBatch, repoBatch); err != nil {
					return err
				}
				nodeBatch = nodeBatch[:0]
				repoBatch = repoBatch[:0]
			}
		}
	}

	if err := scanner.markScanCompleted(); err != nil {
		return fmt.Errorf("failed to mark scan as completed: %v", err)
	}

	log.Infof("Completed scan of %d files and directories", totalNodeCount)
	return nil
}

func (scanner *LocalFileSystemScanner) walkWorker(ctx context.Context,
	processFileChan chan<- *scannerDataItem) (int, error) {
	processCount := 0
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

		for _, exclude := range scanner.config.Excludes {
			if strings.Contains(relPath, exclude) {
				if info.IsDir() {
					return filepath.SkipDir
				}
				return nil
			}
		}

		nodeAttr, err := scanner.initNode(relPath, info)
		if err != nil {
			return fmt.Errorf("failed to process path %s: %v", path, err)
		}

		// 将数据发送到 channel
		data := &scannerDataItem{
			localPath:    path,
			relativePath: relPath,
			nodeAttr:     nodeAttr,
			repoItem:     nil,
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case processFileChan <- data:
			processCount++
		}

		return nil
	})

	return processCount, err
}

// processPath 处理单个路径，返回需要插入的 NodeAttr 和 RepoHistoryItem
// 如果不是媒体文件，返回的 RepoHistoryItem 为 nil
func (scanner *LocalFileSystemScanner) initNode(path string, info os.FileInfo) (*fs.NodeAttr, error) {
	nodeID := scanner.nextNodeID
	scanner.nextNodeID++

	parentNodeID := uint64(0)
	if pid, ok := scanner.folderNodeIDs[filepath.Dir(path)]; ok {
		parentNodeID = pid
	} else {
		log.Warnf("Parent folder not found for path: %s, parent: %s", path, filepath.Dir(path))
		return nil, fmt.Errorf("parent folder not found for path: %s", path)
	}

	if info.IsDir() {
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

	return nodeAttr, nil
}

func (scanner *LocalFileSystemScanner) processFileWorker(ctx context.Context,
	inputChan <-chan *scannerDataItem, dbChan chan<- *scannerDataItem) {
	for {
		select {
		case <-ctx.Done():
			return
		case data := <-inputChan:
			if !data.nodeAttr.IsDir() {
				data.repoItem = scanner.processFile(data.localPath, data.relativePath, data.nodeAttr)
			}

			dbChan <- data
		}
	}
}

func (scanner *LocalFileSystemScanner) processFile(localPath string,
	relativePath string, node *fs.NodeAttr) *meta.RepoHistoryItem {
	fileType := media.GetFileMimeType(localPath)

	if fileType != "image" && fileType != "video" {
		return nil
	}

	exif, _ := media.GetExifData(localPath)

	exifTime, err := media.GetExifDataTime(exif)
	if err == nil {
		log.Debug("Processing media file: %s, type: %s, exif time: %v", localPath, fileType, exifTime)
	} else {
		exifTime = node.Mtime
	}

	fileHash, err := utils.HashFile(localPath)
	if err != nil {
		log.Warnf("calc hash of file %s failed %s", localPath, err.Error())
	}

	var thumbnails map[int]string
	if scanner.config.DefaultThumbnailSize > 0 {
		defaultThumbnailSize := scanner.config.DefaultThumbnailSize
		if fileHash != "" && scanner.thumbnailCachePath != "" {
			folder, name, _ := utils.HashToPath([]any{fileHash, defaultThumbnailSize}, 2, 2)

			cacheDir := filepath.Join(scanner.thumbnailCachePath, folder)
			if err := os.MkdirAll(cacheDir, 0755); err != nil {
				log.Warnf("mkdir cache dir %s failed %s", cacheDir, err.Error())
			} else {
				cachePath := filepath.Join(cacheDir, name+".jpg")
				if err := media.Thumbnail(localPath, cachePath, defaultThumbnailSize); err != nil {
					log.Warnf("thumbnail %s faild %s", localPath, err.Error())
				} else {
					thumbnails = map[int]string{
						defaultThumbnailSize: filepath.Join(folder, name+".jpg"),
					}
				}
			}
		}
	}

	extraInfo := &fs.FileSystemExtraInfo{
		MimeType:   fileType,
		Exif:       exif,
		Hash:       fileHash,
		Thumbnails: thumbnails,
	}

	if extraJSON, err := json.Marshal(extraInfo); err == nil {
		node.SystemExtra = string(extraJSON)
	}

	repoItem := &meta.RepoHistoryItem{
		ModTime:    node.Mtime.Unix(),
		ExifTime:   exifTime.Unix(),
		Type:       meta.CREATE_FILE,
		FilePath:   relativePath,
		IsValidate: true,
	}

	return repoItem
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
