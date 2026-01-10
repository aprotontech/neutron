package serve

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/fs/local"
	"github.com/aproton/neutron/pkg/portal/fuse"
	"github.com/aproton/neutron/pkg/utils/log"
)

func setupSignalHandler(cancel context.CancelFunc) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Infof("stoping...")

		cancel()
	}()
}

func StartServer(cmd *cobra.Command, args []string) {

	testfs := local.NewLocalFileSystem(".var/test-localfs")

	if config.GlobalConfig.Fuse != nil {
		fuseConfig := config.GlobalConfig.Fuse
		if fuseConfig.MountPoint == "" {
			log.PrintToConsole("input mount point is null")
		}
		fuse := fuse.NewFuseMount(fuseConfig.MountPoint, testfs)

		ctx, cancel := context.WithCancel(cmd.Context())
		setupSignalHandler(cancel)

		if err := fuse.Run(ctx); err != nil {
			log.PrintToConsole("fuse run failed with %s", err.Error())
		}
	}

}
