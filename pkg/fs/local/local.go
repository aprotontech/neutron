package local

import (
	"os"
	"path/filepath"

	"github.com/aproton/neutron/pkg/fs"
	"github.com/aproton/neutron/pkg/utils/log"
)

type LocalFileSystem struct {
	RootFS string
}

func NewLocalFileSystem(rootfs string) fs.FileSystem {
	return &LocalFileSystem{
		RootFS: rootfs,
	}
}

func (lf *LocalFileSystem) List(path string) ([]*fs.NodeAttr, error) {
	es, err := os.ReadDir(filepath.Join(lf.RootFS, path))
	if err != nil {
		return nil, err
	}

	results := []*fs.NodeAttr{}
	for _, e := range es {
		results = append(results, &fs.NodeAttr{
			Name: e.Name(),
			Mode: fs.FromSystemFileMode(fs.LinuxSystem, e.Type()),
		})
	}

	return results, nil
}

func (lf *LocalFileSystem) Open(path string) (fs.FileOperator, error) {
	stat, err := lf.Stat(path)
	if err != nil {
		return nil, err
	}

	ioop := &LocalFileIO{
		node:   stat,
		handle: nil,
	}
	err = ioop.Open(0)
	return ioop, err
}

func (lf *LocalFileSystem) Stat(path string) (*fs.NodeAttr, error) {
	log.Debugf("get local stat of %s", filepath.Join(lf.RootFS, path))
	localFullPath := filepath.Join(lf.RootFS, path)
	fi, err := os.Stat(localFullPath)
	if err != nil {
		return nil, err
	}

	mode := fs.FromSystemFileMode(fs.LinuxSystem, fi.Mode())
	return &fs.NodeAttr{
		Inode:       0,
		Size:        uint64(fi.Size()),
		Atime:       fi.ModTime(),
		Mtime:       fi.ModTime(),
		Ctime:       fi.ModTime(),
		Mode:        mode,
		SystemExtra: localFullPath,
	}, nil

}
