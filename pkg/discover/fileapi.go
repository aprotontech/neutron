package discover

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"os"
	"path"
	"strconv"

	"github.com/disintegration/imaging"
	webrtc "github.com/pion/webrtc/v4"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/utils/log"
)

type FileFolderInfo map[string]interface{}

type FileSystemMock struct {
	dcFileMap map[string]string

	thumbnailDC    *webrtc.DataChannel
	peerConnection *webrtc.PeerConnection
}

func getFileList(fsm *FileSystemMock, req any) (any, error) {
	folder, ok := req.(map[string]interface{})["path"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	fs, err := os.ReadDir(path.Join(config.GlobalConfig.Home, folder))
	if err != nil {
		return nil, err
	}

	result := make([]FileFolderInfo, 0, len(fs))
	for _, f := range fs {
		info, err := f.Info()
		if err != nil {
			return nil, err
		}

		item := FileFolderInfo{
			"name":    info.Name(),
			"isDir":   info.IsDir(),
			"size":    info.Size(),
			"modTime": info.ModTime().Format("2006-01-02 15:04:05"),
			"path":    path.Join(folder, info.Name()),
		}
		result = append(result, item)
	}

	return result, nil
}

func prepareFileReceive(fsm *FileSystemMock, req any) (any, error) {
	filePath, ok := req.(map[string]interface{})["path"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	dcName, ok := req.(map[string]interface{})["label"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	fsm.dcFileMap[dcName] = path.Join(config.GlobalConfig.Home, filePath)
	log.Infof("Prepared file receive: %s on data channel %s", filePath, dcName)

	fi, err := os.Stat(fsm.dcFileMap[dcName])
	if err != nil {
		return nil, err
	}

	data := map[string]any{
		"size": fi.Size(),
	}
	return data, nil
}

func getThumbnail(fsm *FileSystemMock, req any) (any, error) {
	filePath, ok := req.(map[string]interface{})["path"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	size, ok := req.(map[string]interface{})["size"].(int)
	if !ok {
		size = 200
	}

	srcPath := path.Join(config.GlobalConfig.Home, filePath)

	if _, err := os.Stat(srcPath); err != nil {
		log.Warnf("File %s not found for thumbnail: %v", filePath, err)
		return nil, err
	}

	// Use SHA1 of the original path as the cache filename
	h := md5.Sum([]byte(filePath + ":" + strconv.Itoa(size)))
	hashStr := hex.EncodeToString(h[:])
	cacheDir := config.GlobalConfig.Cache.CacheDir
	if cacheDir == "" {
		log.Warnf("Cache directory not configured")
		return nil, os.ErrInvalid
	}

	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return nil, err
	}
	cachePath := path.Join(cacheDir, hashStr+".jpg")

	// Generate 16-byte ID
	id := make([]byte, 16)
	if _, err := rand.Read(id); err != nil {
		return nil, err
	}

	go func() {
		// If not cached, generate thumbnail using imaging
		if _, err := os.Stat(cachePath); err != nil {
			img, err := imaging.Open(srcPath)
			if err != nil {
				log.Warnf("Open image %s error: %v", srcPath, err)
			}

			thumb := imaging.Thumbnail(img, size, size, imaging.Lanczos)
			if err := imaging.Save(thumb, cachePath, imaging.JPEGQuality(85)); err != nil {
				log.Warnf("Failed to save thumbnail %s: %v", cachePath, err)
				return
			}
		}

		data, err := os.ReadFile(cachePath)
		if err != nil {
			return
		}

		// Packet: first 16 bytes = raw id, remainder = thumbnail bytes
		packet := append(id, data...)

		if fsm.thumbnailDC == nil {
			log.Warnf("thumbnail data channel not available, id=%s", hex.EncodeToString(id))
		} else {
			if err := fsm.thumbnailDC.Send(packet); err != nil {
				log.Warnf("failed to send thumbnail on datachannel: %v", err)
			} else {
				log.Infof("sent thumbnail %s on data channel, size=%d", cachePath, len(packet))
			}
		}
	}()

	return map[string]any{"id": hex.EncodeToString(id)}, nil
}

func playVideo(fsm *FileSystemMock, req any) (any, error) {
	vs, err := NewVideoStreamer("./test.mp4")
	if err != nil {
		return nil, err
	}

	if fsm.peerConnection == nil {
		return nil, errors.New("peerConnection is null")
	}

	vs.SetupVideoDataChannel(fsm.peerConnection)

	videoInfo := map[string]interface{}{
		"type":     "videoInfo",
		"duration": 600.0, // 示例时长，实际应该解析视频文件
		"fileSize": vs.fileInfo.Size(),
		"fileName": vs.fileInfo.Name(),
		"ready":    true,
	}
	return videoInfo, nil
}
