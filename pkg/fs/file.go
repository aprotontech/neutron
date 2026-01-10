package fs

import (
	"os"
	"time"
)

type OperationSystem uint32

const LinuxSystem OperationSystem = 0x01

type NodeAttr struct {
	Inode       uint64          // inode number
	Size        uint64          // size in bytes
	Atime       time.Time       // time of last access
	Mtime       time.Time       // time of last modification
	Ctime       time.Time       // time of last inode change
	Mode        NeutronFileMode // file mode
	SystemExtra any
	Name        string // file name
}

func (n *NodeAttr) SystemFileMode() os.FileMode {
	return n.Mode.ToOSFileMode(LinuxSystem)
}

func (n *NodeAttr) IsDir() bool {
	return n.Mode&ModeDir == ModeDir
}
