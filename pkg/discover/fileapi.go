package discover

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"os"
	"path"
	"strconv"

	webrtc "github.com/pion/webrtc/v4"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/media"
	"github.com/aproton/neutron/pkg/utils/log"
)

type FileFolderInfo map[string]interface{}

type FileDataChannelInfo struct {
	path   string
	offset int64
	size   int64
}

type WebRTCRemoteClient struct {
	peerConnection *webrtc.PeerConnection
	thumbnailDC    *webrtc.DataChannel
	dcFileMap      map[string]*FileDataChannelInfo
}

func NewWebRTCRemoteClient(peerConnection *webrtc.PeerConnection) *WebRTCRemoteClient {
	return &WebRTCRemoteClient{
		peerConnection: peerConnection,
		dcFileMap:      make(map[string]*FileDataChannelInfo),
	}
}

// getInt64FromMap 从map中提取int64值，支持int、int64和float64类型
func getInt64FromMap(m map[string]interface{}, key string, defaultValue interface{}) (int64, error) {
	val, ok := m[key]
	if !ok || val == nil {
		if defaultValue != nil {
			return int64(defaultValue.(int)), nil
		}
		return 0, os.ErrInvalid
	}

	switch v := val.(type) {
	case int:
		return int64(v), nil
	case int64:
		return v, nil
	case float64:
		return int64(v), nil
	default:
		log.Warnf("%s is invalid type: %T", key, v)
		return 0, os.ErrInvalid
	}
}

func getFileList(fsm *RemoteStorageServer, client *WebRTCRemoteClient, req any) (any, error) {
	folder, ok := req.(map[string]interface{})["path"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	fs, err := fsm.filesystem.List(folder)
	if err != nil {
		return nil, err
	}

	result := make([]FileFolderInfo, 0, len(fs))
	for _, info := range fs {

		item := FileFolderInfo{
			"name":     info.Name,
			"isDir":    info.IsDir(),
			"size":     info.Size,
			"modTime":  info.Mtime.Format("2006-01-02 15:04:05"),
			"path":     path.Join(folder, info.Name),
			"mimeType": "",
		}
		result = append(result, item)
	}

	return result, nil
}

func getFileInfo(fsm *RemoteStorageServer, client *WebRTCRemoteClient, req any) (any, error) {
	fpath, ok := req.(map[string]interface{})["path"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	info, err := os.Stat(path.Join(config.GlobalConfig.Home, fpath))

	if err != nil {
		return nil, err
	}

	exif, _ := media.GetImageExifData(path.Join(config.GlobalConfig.Home, fpath))

	result := FileFolderInfo{
		"name":     info.Name(),
		"isDir":    info.IsDir(),
		"size":     info.Size(),
		"modTime":  info.ModTime().Format("2006-01-02 15:04:05"),
		"path":     fpath,
		"mimeType": "",
		"exif":     exif,
	}

	return result, nil
}

func prepareFileReceive(fsm *RemoteStorageServer, client *WebRTCRemoteClient, req any) (any, error) {
	reqMap, ok := req.(map[string]interface{})
	if !ok {
		return nil, os.ErrInvalid
	}

	filePath, ok := reqMap["path"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	dcName, ok := reqMap["label"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	// 使用通用函数提取offset（必需参数）
	offset, err := getInt64FromMap(reqMap, "offset", nil)
	if err != nil {
		return nil, err
	}

	// 使用通用函数提取size（可选参数，默认值-1）
	size, err := getInt64FromMap(reqMap, "size", -1)
	if err != nil {
		return nil, err
	}

	abspath := path.Join(config.GlobalConfig.FileSystem.Local.RootPath, filePath)

	log.Infof("Prepared file receive: %s on data channel %s", filePath, dcName)

	fi, err := os.Stat(abspath)
	if err != nil {
		return nil, err
	}

	if offset < 0 {
		return nil, os.ErrInvalid
	}

	if offset > fi.Size() {
		return nil, errors.New("offset max than file size")
	}

	if size == -1 || offset+size > fi.Size() {
		size = fi.Size() - offset
	}

	client.dcFileMap[dcName] = &FileDataChannelInfo{
		path:   abspath,
		offset: offset,
		size:   size,
	}

	data := map[string]any{
		"size": size,
	}
	return data, nil
}

func getThumbnail(fsm *RemoteStorageServer, client *WebRTCRemoteClient, req any) (any, error) {
	reqMap, ok := req.(map[string]interface{})
	if !ok {
		return nil, os.ErrInvalid
	}

	filePath, ok := reqMap["path"].(string)
	if !ok {
		return nil, os.ErrInvalid
	}

	// 使用通用函数提取size（可选参数，默认值200）
	size, err := getInt64FromMap(reqMap, "size", 200)
	if err != nil {
		// 即使类型无效，我们也使用默认值继续执行
		size = 200
	}

	srcPath := path.Join(config.GlobalConfig.FileSystem.Local.RootPath, filePath)

	if _, err := os.Stat(srcPath); err != nil {
		log.Warnf("File %s not found for thumbnail: %v", filePath, err)
		return nil, err
	}

	// Use SHA1 of the original path as the cache filename
	h := md5.Sum([]byte(filePath + ":" + strconv.Itoa(int(size))))
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
		// If not cached, generate thumbnail
		if _, err := os.Stat(cachePath); err != nil {
			if err := media.Thumbnail(srcPath, cachePath, int(size)); err != nil {
				log.Warnf("generate thumbnail failed: %v", err)
				return
			}
		}

		data, err := os.ReadFile(cachePath)
		if err != nil {
			log.Warnf("not found thumbnail cache path %s", cachePath)
			return
		}

		// Packet: first 16 bytes = raw id, remainder = thumbnail bytes
		packet := append(id, data...)

		if client.thumbnailDC == nil {
			log.Warnf("thumbnail data channel not available, id=%s", hex.EncodeToString(id))
		} else {
			if err := client.thumbnailDC.Send(packet); err != nil {
				log.Warnf("failed to send thumbnail on datachannel: %v", err)
			} else {
				log.Infof("sent thumbnail %s on data channel, size=%d", cachePath, len(packet))
			}
		}
	}()

	return map[string]any{"id": hex.EncodeToString(id)}, nil
}

func getFileSystemVersion(fsm *RemoteStorageServer, client *WebRTCRemoteClient, req any) (any, error) {
	return map[string]any{
		"version": "1.0",
	}, nil
}

func getImageRepoHistory(fsm *RemoteStorageServer, client *WebRTCRemoteClient, req any) (any, error) {
	info := req.(map[string]interface{})
	_types, ok := info["types"].([]interface{})
	if !ok {
		log.Warnf("get types failed")
		return nil, os.ErrInvalid
	}

	types := make([]string, len(_types))
	for i, v := range _types {
		types[i] = v.(string)
	}

	lastID, err := getInt64FromMap(info, "lastId", 0)
	if err != nil {
		lastID = -1
	}

	// 使用通用函数提取count（可选参数，默认值100）
	count, err := getInt64FromMap(info, "count", 100)
	if err != nil {
		// 即使类型无效，我们也使用默认值继续执行
		count = 100
	}

	log.Infof("Fetching image repo history... types=%v, lastID=%d, count=%d", types, lastID, count)

	imgs, total, err := fsm.repo.GetHistory(lastID, count)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"version": "1.0",
		"items":   imgs,
		"total":   total,
	}, nil
}

func playVideo(fsm *RemoteStorageServer, client *WebRTCRemoteClient, req any) (any, error) {
	return nil, errors.New("not implemented")
	// vs, err := NewVideoStreamer("./test.mp4")
	// if err != nil {
	// 	return nil, err
	// }

	// if fsm.peerConnection == nil {
	// 	return nil, errors.New("peerConnection is null")
	// }

	// vs.SetupVideoDataChannel(fsm.peerConnection)

	// videoInfo := map[string]interface{}{
	// 	"type":     "videoInfo",
	// 	"duration": 600.0, // 示例时长，实际应该解析视频文件
	// 	"fileSize": vs.fileInfo.Size(),
	// 	"fileName": vs.fileInfo.Name(),
	// 	"ready":    true,
	// }
	// return videoInfo, nil
}
