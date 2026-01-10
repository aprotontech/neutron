package fuse

import (
	"context"
	"path/filepath"

	"bazil.org/fuse"
	bfs "bazil.org/fuse/fs"

	"github.com/aproton/neutron/pkg/utils/log"
)

type Folder struct {
	Node
}

func (n *Folder) Lookup(ctx context.Context, name string) (bfs.Node, error) {
	log.Debugf("Lookup called for: %s", filepath.Join(n.path, name))
	fullPath := filepath.Join(n.path, name)
	s, err := n.fs.Stat(fullPath)
	if err != nil {
		return nil, err
	}

	if s.IsDir() {
		return &Folder{
			Node: Node{
				fs:   n.fs,
				path: fullPath,
			},
		}, nil
	}
	return &File{
		Node: Node{
			fs:   n.fs,
			path: fullPath,
		}}, nil
}

func (n *Folder) ReadDirAll(ctx context.Context) ([]fuse.Dirent, error) {
	log.Debugf("get list of %s", n.path)
	clist, err := n.fs.List(n.path)
	if err != nil {
		return nil, err
	}

	results := []fuse.Dirent{}
	for _, c := range clist {
		dt := fuse.DT_File
		if c.IsDir() {
			dt = fuse.DT_Dir
		}

		results = append(results, fuse.Dirent{
			Name: c.Name,
			Type: dt,
		})
	}
	return results, nil
}
