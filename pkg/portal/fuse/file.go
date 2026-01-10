package fuse

import (
	"context"

	"bazil.org/fuse"
	fusefs "bazil.org/fuse/fs"

	"github.com/aproton/neutron/pkg/fs"
	"github.com/aproton/neutron/pkg/utils/log"
)

type Node struct {
	fs   fs.FileSystem
	path string
}

type File struct {
	Node
}

type FileIOWrap struct {
	operator fs.FileOperator
}

func (n *Node) Attr(ctx context.Context, attr *fuse.Attr) error {
	log.Debugf("try to get attr of %s", n.path)
	stat, err := n.fs.Stat(n.path)
	if err != nil {
		return err
	}

	attr.Inode = stat.Inode
	attr.Atime = stat.Atime
	attr.Ctime = stat.Ctime
	attr.Mtime = stat.Mtime
	attr.Mode = stat.SystemFileMode()
	attr.Size = stat.Size
	return nil
}

func (f *File) Open(ctx context.Context, req *fuse.OpenRequest, resp *fuse.OpenResponse) (fusefs.Handle, error) {
	log.Debugf("File.Open() called: %s (flags: %v)", f.path, req.Flags)
	op, err := f.fs.Open(f.path)
	if err != nil {
		return nil, err
	}

	log.Debugf("open(%p), path(%s)", op, f.path)
	return &FileIOWrap{operator: op}, nil
}

func (f *FileIOWrap) Read(ctx context.Context, req *fuse.ReadRequest, resp *fuse.ReadResponse) error {
	log.Debugf("read(%p): (offset: %d, size: %d)", f.operator, req.Offset, req.Size)

	content := make([]byte, req.Size)

	len, err := f.operator.Read(content)

	resp.Data = content[:len]

	return err
}

func (f *FileIOWrap) Release(ctx context.Context, req *fuse.ReleaseRequest) error {
	log.Debugf("close %p", f.operator)
	return f.operator.Close()
}
