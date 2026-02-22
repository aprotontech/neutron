package local

import (
	"errors"
	"os"

	"github.com/aproton/neutron/pkg/fs"
)

type LocalFileIO struct {
	node   *fs.NodeAttr
	handle *os.File
}

func (fio *LocalFileIO) Open(flag int) error {
	var err error

	if fio.handle != nil {
		return errors.New("file is opened")
	}

	fpath := fio.node.SystemExtra
	fio.handle, err = os.Open(fpath)
	return err
}

func (fio *LocalFileIO) Close() error {
	if fio.handle != nil {
		return fio.handle.Close()
	}

	return nil
}

func (fio *LocalFileIO) Read(cnt []byte) (int, error) {
	return fio.handle.Read(cnt)
}

func (fio *LocalFileIO) Write(cnt []byte) (int, error) {
	return fio.handle.Write(cnt)
}
