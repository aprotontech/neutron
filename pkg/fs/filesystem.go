package fs

import "context"

type FileSystem interface {
	Start(ctx context.Context) error
	List(path string) ([]*NodeAttr, error)
	Open(path string) (FileOperator, error)
	Stat(path string) (*NodeAttr, error)
}

type FileSystemBatchOperator interface {
	BatchStat(path []string) ([]*NodeAttr, error)
}
