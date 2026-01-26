package test

import (
	"context"
	"path"

	"github.com/aproton/neutron/cmd/neutron/config"
	baidudisk "github.com/aproton/neutron/pkg/storage/baidu_disk"
	"github.com/aproton/neutron/pkg/utils/log"
	"github.com/aproton/neutron/pkg/web"
)

func testBaiduSDK(ctx context.Context) {
	baiduConfig := map[string]string{}
	for _, cfg := range config.GlobalConfig.Storage {
		if cfg.Backend == "baidu_disk" {
			baiduConfig = cfg.Config
			break
		}
	}

	baidu := baidudisk.NewBaiduDisk(baidudisk.Config{
		AppID:       baiduConfig["AppID"],
		AppKey:      baiduConfig["AppKey"],
		SecretKey:   baiduConfig["SecretKey"],
		SignKey:     baiduConfig["SignKey"],
		PrefixPath:  baiduConfig["PrefixPath"],
		RedirectUri: baiduConfig["RedirectUri"],
		CachePath:   path.Join(config.GlobalConfig.Home, "cache", "baidu"),
	})

	go func() {
		err := baidu.Open(ctx)
		if err != nil {
			log.Warn(err)
		}

		// buf := make([]byte, 1024)
		// if c, err := baidu.Read(
		// 	cmd.Context(), "/neutron/sha256sum-amd64.txt", 0, buf); err == nil || errors.Is(err, io.EOF) {
		// 	log.Infof("content=%s", string(buf[0:c]))
		// } else {
		// 	log.Warnf("%s", err.Error())
		// }

		// cnt, err := os.ReadFile("./README.md")
		// if err == nil {
		// 	log.Infof("try to upload content")
		// 	c, err := baidu.Write(cmd.Context(), "/neutron/README.md", 0, cnt)
		// 	log.Infof("upload result: %d, %v", c, err)
		// }

		err = baidu.Remove(ctx, "/neutron/README.md")
		log.Infof("delete result: %v", err)

	}()

	handles := baidu.GetWebHandles()

	_ = web.StartWebServer(config.GlobalConfig.WebServer, handles)

}
