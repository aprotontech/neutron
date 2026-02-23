package meta

import (
	"context"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

const CREATE_FILE = 1
const DELETE_FILE = 2
const MODIFY_FILE = 3

type RepoHistoryItem struct {
	ID       int64  `gorm:"column:id;primaryKey;autoIncrement"`
	IsValidate bool 	`gorm:"column:is_valid"`
	Time     int64  `gorm:"column:time;index"`
	Type     uint8  `gorm:"column:type"`
	FilePath string `gorm:"column:file_path;index"`
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

	r.Update()

	<-ctx.Done()

	return nil
}

func (r *Repository) GetHistory(offset, limit int64) ([]RepoHistoryItem, error) {
	if r.db == nil {
		return nil, gorm.ErrInvalidDB
	}

	var items []RepoHistoryItem
	err := r.db.Where("is_valid = ?", true).Order("time DESC")
		.Offset(int(offset)).Limit(int(limit)).Find(&items).Error
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