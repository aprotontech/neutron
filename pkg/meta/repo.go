package meta

import (
	"context"

	"gorm.io/gorm"

	"github.com/aproton/neutron/pkg/utils/log"
)

type Repository struct {
	db         *gorm.DB
	maxItemID  int64
	totalCount int64
}

const CREATE_FILE = 1
const DELETE_FILE = 2
const MODIFY_FILE = 3

type RepoHistoryItem struct {
	ID         int64  `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	IsValidate bool   `gorm:"column:is_valid" json:"is_valid"`
	ExifTime   int64  `gorm:"column:etime;index" json:"etime"`
	ModTime    int64  `gorm:"column:mtime;index" json:"mtime"`
	Type       uint8  `gorm:"column:type" json:"type"`
	FilePath   string `gorm:"column:file_path;index" json:"file_path"`
}

func (RepoHistoryItem) TableName() string {
	return "repo_history"
}

func NewRepo(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Start(ctx context.Context) error {
	if r.db == nil {
		return gorm.ErrInvalidDB
	}

	if err := r.db.AutoMigrate(&RepoHistoryItem{}); err != nil {
		return err
	}

	if err := r.Update(); err != nil {
		log.Warnf("Failed to update repository: %v", err)
	}

	count := int64(0)
	if r.db.Table("repo_history").Where("is_valid = ?", true).Count(&count).Error == nil {
		r.totalCount = count
	}

	maxIdRecord := &RepoHistoryItem{}
	if r.db.Table("repo_history").Where("is_valid = ?", true).Order("id DESC").First(&maxIdRecord).Error == nil {
		r.maxItemID = maxIdRecord.ID
	}

	log.Infof("Repository started and updated with %d history items, maxID %d", r.totalCount, r.maxItemID)

	<-ctx.Done()

	return nil
}

// totalCount, maxId
func (r *Repository) GetHistorySummary() (int64, int64, error) {
	return r.totalCount, r.maxItemID, nil
}

func (r *Repository) GetHistory(lastID, limit int64) ([]RepoHistoryItem, error) {
	if r.db == nil {
		return nil, gorm.ErrInvalidDB
	}

	// 构建查询
	query := r.db.Where("is_valid = ?", true)

	// 如果 lastID > 0，则查询 ID 小于 lastID 的记录（用于分页）
	if lastID >= 0 {
		query = query.Where("id > ?", lastID)
	}

	// 获取分页数据
	var items []RepoHistoryItem
	err := query.Limit(int(limit)).Order("id").Find(&items).Error

	if err != nil {
		return nil, err
	}

	return items, nil
}

func (r *Repository) GetHistoryPage(offset, limit int, order string) ([]RepoHistoryItem, error) {
	if r.db == nil {
		return nil, gorm.ErrInvalidDB
	}

	// 构建查询
	query := r.db.Where("is_valid = ?", true)

	switch order {
	case "etime":
		query = query.Order("etime DESC, id DESC")
	case "etime-asc":
		query = query.Order("etime ASC, id ASC")
	case "mtime":
		query = query.Order("mtime DESC, id DESC")
	case "mtime-asc":
		query = query.Order("mtime ASC, id ASC")
	default:
		query = query.Order("id DESC")
	}

	// 应用分页
	query = query.Offset(offset).Limit(limit)

	// 获取分页数据
	var items []RepoHistoryItem
	err := query.Find(&items).Error

	if err != nil {
		return nil, err
	}

	return items, nil
}

func (r *Repository) Update() error {
	err := r.db.Exec(`
		UPDATE repo_history 
		SET is_valid = false 
		WHERE is_valid = true 
		AND id NOT IN (
			SELECT MAX(id) 
			FROM repo_history 
			WHERE is_valid = true 
			GROUP BY file_path
		)
	`).Error

	if err != nil {
		return err
	}

	return nil
}
