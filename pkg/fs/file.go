package fs

import (
	"os"
	"time"
)

type OperationSystem uint32

const LinuxSystem OperationSystem = 0x01

type NodeAttr struct {
	Inode       uint64          `gorm:"column:id;primaryKey;autoIncrement"` // inode number
	ParentID    uint64          `gorm:"column:parent_id;omitempty"`         // parent inode number, 0 for root
	Size        uint64          `gorm:"column:size"`                        // size in bytes
	Atime       time.Time       `gorm:"column:atime"`                       // time of last access
	Mtime       time.Time       `gorm:"column:mtime"`                       // time of last modification
	Ctime       time.Time       `gorm:"column:ctime"`                       // time of last inode change
	Mode        NeutronFileMode `gorm:"column:mode"`                        // file mode
	Name        string          `gorm:"column:name"`                        // file name
	SystemExtra string          `gorm:"column:extra"`                       // file extra info for system
}

type FileSystemExtraInfo struct {
	MimeType string         `json:"mimeType,omitempty"`
	Exif     map[string]any `json:"exif,omitempty"`
}

func (n *NodeAttr) SystemFileMode() os.FileMode {
	return n.Mode.ToOSFileMode(LinuxSystem)
}

func (n *NodeAttr) IsDir() bool {
	return n.Mode&ModeDir == ModeDir
}

func (n *NodeAttr) GetSystemExtraInfo() (*FileSystemExtraInfo, error) {
	if n.SystemExtra == "" {
		return nil, nil
	}

	return &FileSystemExtraInfo{}, nil
}

// NodeAttr already defined in file.go
func (NodeAttr) TableName() string {
	return "file_tree_infos"
}
