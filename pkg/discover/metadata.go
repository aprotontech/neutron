package discover

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/utils/log"
)

type MetadataRepository struct {
	home    string
	config  *config.MetadataRepoConfig
	db      *sql.DB
	version string
}

func NewMetadataRepository(config *config.Config) *MetadataRepository {
	return &MetadataRepository{
		home:   config.Home,
		config: config.MetadataRepo,
	}
}

func (mr *MetadataRepository) GetVersion() string {
	return mr.version
}

func (mr *MetadataRepository) Start(ctx context.Context) error {
	if mr.config == nil {
		log.Info("Metadata repository config is nil, skipping initialization")
		return nil
	}

	// 先尝试从标记文件读取 version 字段；如果不存在则生成一个新的 uuid
	if err := mr.loadVersion(); err != nil {
		log.Infof("failed to load version from marker file: %v; will generate one", err)
	}

	// 根据driver类型初始化数据库
	switch mr.config.Driver {
	case "sqlite":
		if err := mr.initSQLiteDatabase(); err != nil {
			return fmt.Errorf("failed to initialize SQLite database: %v", err)
		}
	default:
		return fmt.Errorf("unsupported database driver: %s", mr.config.Driver)
	}

	// 检查是否已经扫描过
	if mr.isScanCompleted() {
		log.Info("File metadata scan already completed, skipping")
		return nil
	}

	// 开始扫描文件
	return mr.scanFiles(ctx)
}

func (mr *MetadataRepository) ListFiles(types []string, offset int, count int) ([]FileFolderInfo, int, error) {
	if mr.db == nil {
		return nil, 0, fmt.Errorf("database not initialized")
	}

	// 先查询总数
	countQuery := "SELECT COUNT(*) FROM file_metadata_records"
	var countArgs []interface{}

	if len(types) > 0 {
		placeholders := make([]string, len(types))
		for i, t := range types {
			placeholders[i] = "?"
			countArgs = append(countArgs, t)
		}
		countQuery += " WHERE filetype IN (" + strings.Join(placeholders, ",") + ")"
	}

	var totalCount int
	err := mr.db.QueryRow(countQuery, countArgs...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query total count: %v", err)
	}

	// 构建分页查询
	query := "SELECT filepath, filetype, updated_at FROM file_metadata_records"
	var args []interface{}

	if len(types) > 0 {
		placeholders := make([]string, len(types))
		for i, t := range types {
			placeholders[i] = "?"
			args = append(args, t)
		}
		query += " WHERE filetype IN (" + strings.Join(placeholders, ",") + ")"
	}

	query += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"
	args = append(args, count, offset)

	rows, err := mr.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query files: %v", err)
	}
	defer rows.Close()

	var files []FileFolderInfo
	for rows.Next() {
		var filepath, filetype string
		var updatedAt int64

		if err := rows.Scan(&filepath, &filetype, &updatedAt); err != nil {
			return nil, 0, fmt.Errorf("failed to scan row: %v", err)
		}

		files = append(files, FileFolderInfo{
			"path":       filepath,
			"type":       filetype,
			"updated_at": updatedAt,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating rows: %v", err)
	}

	return files, totalCount, nil
}

func (mr *MetadataRepository) initSQLiteDatabase() error {
	if mr.config.Sqlite == "" {
		return fmt.Errorf("sqlite path is not configured")
	}

	// 确保数据库目录存在
	dbDir := filepath.Dir(mr.config.Sqlite)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return fmt.Errorf("failed to create database directory: %v", err)
	}

	// 打开数据库连接
	db, err := sql.Open("sqlite3", mr.config.Sqlite)
	if err != nil {
		return fmt.Errorf("failed to open SQLite database: %v", err)
	}
	mr.db = db

	// 创建表
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS file_metadata_records (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		filepath TEXT NOT NULL,
		filetype TEXT NOT NULL,
		fileinfo TEXT DEFAULT '',
		extinfo TEXT DEFAULT '',
		updated_at INTEGER NOT NULL,
		UNIQUE(filepath)
	);
	CREATE INDEX IF NOT EXISTS idx_filetype ON file_metadata_records(filetype);
	CREATE INDEX IF NOT EXISTS idx_updated_at ON file_metadata_records(updated_at);
	`

	_, err = mr.db.Exec(createTableSQL)
	if err != nil {
		return fmt.Errorf("failed to create table: %v", err)
	}

	log.Infof("SQLite database initialized at: %s", mr.config.Sqlite)
	return nil
}

func (mr *MetadataRepository) isScanCompleted() bool {
	markerFile := filepath.Join(filepath.Dir(mr.config.Sqlite), ".metadata_scan_completed")

	// 检查标记文件是否存在
	data, err := os.ReadFile(markerFile)
	if err != nil {
		return false
	}

	// 解析标记文件内容
	var marker struct {
		Home      string `json:"home"`
		Timestamp string `json:"timestamp"`
		Version   string `json:"version,omitempty"`
	}

	if err := json.Unmarshal(data, &marker); err != nil {
		// 如果是旧格式，重新扫描
		return false
	}

	// 如果存在 version 字段，保存到内存中
	if marker.Version != "" {
		mr.version = marker.Version
	}

	// 检查 Home 目录是否匹配
	return marker.Home == mr.home
}

func (mr *MetadataRepository) markScanCompleted() error {
	markerFile := filepath.Join(filepath.Dir(mr.config.Sqlite), ".metadata_scan_completed")

	// 获取规范化的 Home 目录路径（处理符号链接）
	homePath, err := filepath.EvalSymlinks(mr.home)
	if err != nil {
		// 如果无法解析符号链接，使用原始路径
		homePath = mr.home
	}

	// 确保 version 可用
	if mr.version == "" {
		mr.version = uuid.NewString()
	}

	// 创建包含 Home 目录、时间和 version 的标记数据
	markerData := struct {
		Home      string `json:"home"`
		Timestamp string `json:"timestamp"`
		Version   string `json:"version"`
	}{
		Home:      homePath,
		Timestamp: time.Now().Format(time.RFC3339),
		Version:   mr.version,
	}

	data, err := json.Marshal(markerData)
	if err != nil {
		return fmt.Errorf("failed to marshal marker data: %v", err)
	}

	return os.WriteFile(markerFile, data, 0644)
}

func (mr *MetadataRepository) scanFiles(ctx context.Context) error {
	log.Info("Starting file metadata scan...")

	// 收集需要扫描的文件
	var filesToScan []string
	err := filepath.Walk(mr.home, func(path string, info os.FileInfo, err error) error {
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
			relPath, _ := filepath.Rel(mr.home, path)
			for _, exclude := range mr.config.Excludes {
				if strings.Contains(relPath, exclude) {
					return filepath.SkipDir
				}
			}
			return nil
		}

		// 检查文件是否在排除列表中
		relPath, _ := filepath.Rel(mr.home, path)
		for _, exclude := range mr.config.Excludes {
			if strings.Contains(relPath, exclude) {
				return nil
			}
		}

		// 只处理图片和视频文件
		fileType := mr.getFileType(path)
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
		if err := mr.insertBatch(batch); err != nil {
			return fmt.Errorf("failed to insert batch %d-%d: %v", i, end, err)
		}

		log.Infof("Processed %d/%d files", end, len(filesToScan))

		// 控制扫描速度
		if mr.config.ScanSpeedQPS > 0 {
			time.Sleep(time.Duration(1000/mr.config.ScanSpeedQPS) * time.Millisecond)
		}
	}

	// 标记扫描完成
	if err := mr.markScanCompleted(); err != nil {
		return fmt.Errorf("failed to mark scan as completed: %v", err)
	}

	log.Info("File metadata scan completed successfully")
	return nil
}

// loadVersion tries to read the version field from the marker file. If the file
// doesn't exist or doesn't contain a version, a new UUID is generated and set.
func (mr *MetadataRepository) loadVersion() error {
	markerFile := filepath.Join(filepath.Dir(mr.config.Sqlite), ".metadata_scan_completed")

	data, err := os.ReadFile(markerFile)
	if err != nil {
		if os.IsNotExist(err) {
			mr.version = uuid.NewString()
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
		mr.version = marker.Version
	} else {
		mr.version = uuid.NewString()
	}

	return nil
}

func (mr *MetadataRepository) getFileType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))

	// 图片文件扩展名
	imageExts := []string{".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".tif"}
	for _, imgExt := range imageExts {
		if ext == imgExt {
			return "image"
		}
	}

	// 视频文件扩展名
	videoExts := []string{".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv", ".webm", ".m4v", ".mpg", ".mpeg"}
	for _, vidExt := range videoExts {
		if ext == vidExt {
			return "video"
		}
	}

	// 文本文件扩展名
	textExts := []string{".txt", ".md", ".json", ".xml", ".yaml", ".yml", ".ini", ".cfg", ".conf"}
	for _, txtExt := range textExts {
		if ext == txtExt {
			return "plain"
		}
	}

	return "binary"
}

func (mr *MetadataRepository) insertBatch(filePaths []string) error {
	if mr.db == nil {
		return fmt.Errorf("database not initialized")
	}

	tx, err := mr.db.Begin()
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
		fileType := mr.getFileType(filePath)
		relPath, _ := filepath.Rel(mr.home, filePath)

		_, err := stmt.Exec(relPath, fileType, "", "", now)
		if err != nil {
			return fmt.Errorf("failed to insert record for %s: %v", filePath, err)
		}
	}

	return tx.Commit()
}
