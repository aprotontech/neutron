package fs

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
	"github.com/aproton/neutron/pkg/media"
	"github.com/aproton/neutron/pkg/utils/log"
)

type LocalFileSystemScanner struct {
	home         string
	metadataPath string
	config       *config.LocalFileSystemConfig
	db           *gorm.DB
	version      string
}

type ScannerMetadata struct {
	Home      string `json:"home"`
	Timestamp string `json:"timestamp"`
	Version   string `json:"version,omitempty"`
}

func NewLocalFileSystemScanner(config *config.Config, db *gorm.DB) *LocalFileSystemScanner {
	return &LocalFileSystemScanner{
		home:         config.Home,
		metadataPath: filepath.Join(config.Home, "vars/.metadata_scan_completed"),
		config:       config.FileSystem.Local,
		db:           db,
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

	// 先尝试从标记文件读取 version 字段；如果不存在则生成一个新的 uuid
	if err := scanner.loadVersion(); err != nil {
		log.Infof("failed to load version from marker file: %v; will generate one", err)
	}

	// 检查是否已经扫描过
	if scanner.isScanCompleted() {
		log.Info("File metadata scan already completed, skipping")
		return nil
	}

	// 开始扫描文件
	return scanner.scanFiles(ctx)
}

func (scanner *LocalFileSystemScanner) isScanCompleted() bool {
	data, err := os.ReadFile(scanner.metadataPath)
	if err != nil {
		return false
	}

	var marker ScannerMetadata
	if err := json.Unmarshal(data, &marker); err != nil {
		return false
	}

	if marker.Version != "" {
		scanner.version = marker.Version
	}

	return marker.Home == scanner.config.RootPath
}

func (scanner *LocalFileSystemScanner) markScanCompleted() error {
	if scanner.version == "" {
		scanner.version = uuid.NewString()
	}

	markerData := &ScannerMetadata{
		Home:      scanner.config.RootPath,
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
	log.Info("Starting file metadata scan...")

	// 收集需要扫描的文件
	var filesToScan []string
	err := filepath.Walk(scanner.home, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// 检查上下文是否已取消
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// 跳过目录
		if info.IsDir() {
			// 检查是否在排除列表中
			relPath, _ := filepath.Rel(scanner.home, path)
			for _, exclude := range scanner.config.Excludes {
				if strings.Contains(relPath, exclude) {
					return filepath.SkipDir
				}
			}
			return nil
		}

		// 检查文件是否在排除列表中
		relPath, _ := filepath.Rel(scanner.home, path)
		for _, exclude := range scanner.config.Excludes {
			if strings.Contains(relPath, exclude) {
				return nil
			}
		}

		// 只处理图片和视频文件
		fileType := media.GetFileMimeType(path)
		if fileType == "image" || fileType == "video" {
			filesToScan = append(filesToScan, path)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to walk directory: %v", err)
	}

	log.Infof("Found %d image/video files to scan", len(filesToScan))

	// 批量插入文件元数据
	batchSize := 1000
	for i := 0; i < len(filesToScan); i += batchSize {
		// 检查上下文是否已取消
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		end := i + batchSize
		if end > len(filesToScan) {
			end = len(filesToScan)
		}

		batch := filesToScan[i:end]
		if err := scanner.insertBatch(batch); err != nil {
			return fmt.Errorf("failed to insert batch %d-%d: %v", i, end, err)
		}

		log.Infof("Processed %d/%d files", end, len(filesToScan))

		// 控制扫描速度
		if scanner.config.ScanSpeedQPS > 0 {
			time.Sleep(time.Duration(1000/scanner.config.ScanSpeedQPS) * time.Millisecond)
		}
	}

	// 标记扫描完成
	if err := scanner.markScanCompleted(); err != nil {
		return fmt.Errorf("failed to mark scan as completed: %v", err)
	}

	log.Info("File metadata scan completed successfully")
	return nil
}

// loadVersion tries to read the version field from the marker file. If the file
// doesn't exist or doesn't contain a version, a new UUID is generated and set.
func (scanner *LocalFileSystemScanner) loadVersion() error {
	markerFile := filepath.Join(scanner.home, "vars/.metadata_scan_completed")

	data, err := os.ReadFile(markerFile)
	if err != nil {
		if os.IsNotExist(err) {
			scanner.version = uuid.NewString()
			return nil
		}
		return err
	}

	var marker struct {
		Version string `json:"version,omitempty"`
	}

	if err := json.Unmarshal(data, &marker); err != nil {
		return err
	}

	if marker.Version != "" {
		scanner.version = marker.Version
	} else {
		scanner.version = uuid.NewString()
	}

	return nil
}

func (scanner *LocalFileSystemScanner) insertBatch(filePaths []string) error {
	if scanner.db == nil {
		return fmt.Errorf("database not initialized")
	}

	tx, err := scanner.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT OR REPLACE INTO file_metadata_records 
		(filepath, filetype, fileinfo, extinfo, updated_at) 
		VALUES (?, ?, ?, ?, ?)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %v", err)
	}
	defer stmt.Close()

	now := time.Now().Unix()
	for _, filePath := range filePaths {
		fileType := media.GetFileMimeType(filePath)
		relPath, _ := filepath.Rel(scanner.home, filePath)

		_, err := stmt.Exec(relPath, fileType, "", "", now)
		if err != nil {
			return fmt.Errorf("failed to insert record for %s: %v", filePath, err)
		}
	}

	return tx.Commit()
}
