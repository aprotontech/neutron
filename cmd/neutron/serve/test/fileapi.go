package test

import (
	"crypto/rand"
	"crypto/sha1"
	"encoding/hex"
	"os"
	"path"

	"github.com/disintegration/imaging"
	webrtc "github.com/pion/webrtc/v4"

	"github.com/aproton/neutron/pkg/utils/log"
)

type FileFolderInfo map[string]interface{}

type FileSystemMock struct {
	dcFileMap map[string]string

	thumbnailDC *webrtc.DataChannel
}

func getFileList(fsm *FileSystemMock, req any) (any, error) {
	folder, ok := req.(map[string]interface{})["path"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	fs, err := os.ReadDir(path.Join("/mnt/data/storage/", folder))
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

	fsm.dcFileMap[dcName] = path.Join("/mnt/data/storage/", filePath)
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

	// Use SHA1 of the original path as the cache filename
	h := sha1.Sum([]byte(filePath))
	hashStr := hex.EncodeToString(h[:])
	cacheDir := "/tmp/thumbnails"
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return nil, err
	}
	cachePath := path.Join(cacheDir, hashStr+".jpg")

	// If not cached, generate thumbnail using imaging
	if _, err := os.Stat(cachePath); err != nil {
		srcPath := path.Join("/mnt/data/storage/", filePath)
		img, err := imaging.Open(srcPath)
		if err != nil {
			return nil, err
		}

		thumb := imaging.Thumbnail(img, 200, 200, imaging.Lanczos)
		if err := imaging.Save(thumb, cachePath, imaging.JPEGQuality(85)); err != nil {
			return nil, err
		}
	}

	data, err := os.ReadFile(cachePath)
	if err != nil {
		return nil, err
	}

	// Generate 16-byte ID
	id := make([]byte, 16)
	if _, err := rand.Read(id); err != nil {
		return nil, err
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

	return map[string]any{"id": hex.EncodeToString(id)}, nil
}
