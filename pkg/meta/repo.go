package meta

import "gorm.io/gorm"

type Repo struct {
	db *gorm.DB
}

type RepoHistoryItem struct {
	ID       int64
	Time     int64
	Type     uint8
	FilePath string
}

const CREATE_FILE = 1
const DELETE_FILE = 2
const MODIFY_FILE = 3

func NewRepo() *Repo {
	return &Repo{}
}

func (r *Repo) GetHistory(filePath string, limit int) ([]RepoHistoryItem, error) {
	return nil, nil
}
