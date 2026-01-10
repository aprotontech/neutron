package remote

import (
	"errors"

	"github.com/aproton/neutron/pkg/fs"
	"github.com/aproton/neutron/pkg/storage"
)

type TreeNode struct {
	Path       string
	NodeId     int64
	Permission int

	Children map[string]*TreeNode
}

type RemoteFile struct {
	TreeNode
	Content []FileContentSlice
}

type RemoteFolder struct {
	TreeNode
}

type RemoteFileSystem struct {
	history *Histroy
	blocks  map[string]*Block
	root    *TreeNode

	backends []storage.Storage

	cacheFiles   map[string]*RemoteFile
	cacheFolders map[string]*RemoteFolder
}

func NewRemoteFileSystem(rootfs string) fs.FileSystem {
	return &RemoteFileSystem{}
}

func (rf *RemoteFileSystem) List(path string) ([]*fs.NodeAttr, error) {
	return nil, errors.New("not implements")
}

func (rf *RemoteFileSystem) Open(path string) (fs.FileOperator, error) {
	return nil, errors.New("not implements")
}

func (rf *RemoteFileSystem) Stat(path string) (*fs.NodeAttr, error) {
	return nil, errors.New("not implements")
}
