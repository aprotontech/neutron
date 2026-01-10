package fuse

import (
	"context"
	"errors"
	"os"

	"bazil.org/fuse"
	"bazil.org/fuse/fs"

	nfs "github.com/aproton/neutron/pkg/fs"
	"github.com/aproton/neutron/pkg/utils/log"
)

type FuseMount struct {
	fsm        nfs.FileSystem
	conn       *fuse.Conn
	mountPoint string
}

func NewFuseMount(mountPoint string, fsm nfs.FileSystem) *FuseMount {
	return &FuseMount{
		mountPoint: mountPoint,
		fsm:        fsm,
	}
}

func (fm *FuseMount) Run(ctx context.Context) error {
	log.Infof("%s", fm.mountPoint)
	_, err := os.Stat(fm.mountPoint)
	if err != nil {

		if errors.Is(err, os.ErrNotExist) {
			if err := os.MkdirAll(fm.mountPoint, 0755); err != nil {

				return err
			}
		} else {
			return err
		}
	}

	c, err := fuse.Mount(
		fm.mountPoint,
		fuse.FSName("neutron"),
		fuse.Subtype("neutronfs"),
		fuse.DefaultPermissions(),
	)
	if err != nil {
		log.Warnf("failed to mount FUSE filesystem: %s", err.Error())
		return err
	}

	fm.conn = c

	go func() {
		<-ctx.Done()
		fuse.Unmount(fm.mountPoint)
	}()

	log.Infof("mountpoint: %s", fm.mountPoint)
	if err := fs.Serve(c, fm); err != nil {
		log.Infof("failed to serve: %v", err)
	}

	log.Infof("stop mount at %s", fm.mountPoint)

	return nil
}

func (fm *FuseMount) Root() (fs.Node, error) {
	log.Debugf("root called")
	return &Folder{
		Node{
			fs:   fm.fsm,
			path: "/",
		},
	}, nil
}
