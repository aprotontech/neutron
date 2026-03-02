package discover

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"

	"google.golang.org/protobuf/types/known/structpb"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/fs"
	"github.com/aproton/neutron/pkg/media"
	"github.com/aproton/neutron/pkg/meta"
	neutronproto "github.com/aproton/neutron/pkg/proto"
	"github.com/aproton/neutron/pkg/utils"
	"github.com/aproton/neutron/pkg/utils/log"
)

type FileAPI func(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error)

type RPCHandles struct {
	filesystem fs.FileSystem
	repo       *meta.Repository
	apis       map[string]FileAPI
}

func NewRPCHandles(filesystem fs.FileSystem, repo *meta.Repository) *RPCHandles {
	return &RPCHandles{
		filesystem: filesystem,
		repo:       repo,
		apis: map[string]FileAPI{
			"listFiles":            getFileList,
			"prepareFileReceive":   prepareFileReceive,
			"getThumbnail":         getThumbnail,
			"playVideo":            playVideo,
			"getImageRepoPage":     getImageRepoPage,
			"getImageRepoHistory":  getImageRepoHistory,
			"getFileInfo":          getFileInfo,
			"getFileSystemVersion": getFileSystemVersion,
		},
	}
}

func (c *RPCHandles) Process(client *WebRTCRemoteClient, m *neutronproto.RemoteMessage) any {
	var err error
	var response any
	if api, ok := c.apis[m.Type]; ok {
		response, err = api(c, client, m.GetPayload())
		if err != nil {
			log.Warnf("File API %s error: %v", m.Type, err)
			details, _ := structpb.NewStruct(map[string]any{
				"input": m.GetPayload(),
			})
			// Convert error to appropriate response type
			response = &neutronproto.RemoteMessage_Error{
				Error: &neutronproto.ErrorMessage{
					Success: false,
					Error:   err.Error(),
					Details: details,
				},
			}
		}

	} else {
		response = &neutronproto.ErrorMessage{
			Error: "unknown api " + m.Type,
		}
	}

	return response
}

func getFileList(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error) {
	if v, ok := req.(*neutronproto.RemoteMessage_ListFilesRequest); !ok || v == nil {
		return nil, errors.New("invalidate input params")
	}
	realReq := req.(*neutronproto.RemoteMessage_ListFilesRequest).ListFilesRequest
	folder := realReq.GetPath()

	fs, err := c.filesystem.List(folder)
	if err != nil {
		return nil, err
	}

	files := make([]*neutronproto.FileInformation, 0, len(fs))
	for _, info := range fs {
		exifData := make(map[string]*structpb.Value)
		// 如果有 EXIF 数据，可以在这里添加

		fileInfo := &neutronproto.FileInformation{
			Name:     info.Name,
			IsDir:    info.IsDir(),
			Size:     int64(info.Size),
			Mtime:    info.Mtime.Unix(),
			MimeType: "",
			ExifData: exifData,
		}
		files = append(files, fileInfo)
	}

	return &neutronproto.RemoteMessage_ListFilesResponse{
		ListFilesResponse: &neutronproto.ListFilesResponse{
			Files: files,
		},
	}, nil
}

func getFileInfo(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error) {
	if v, ok := req.(*neutronproto.RemoteMessage_GetFileInfoRequest); !ok || v == nil {
		return nil, errors.New("invalidate input params")
	}

	realReq := req.(*neutronproto.RemoteMessage_GetFileInfoRequest).GetFileInfoRequest
	fpath := realReq.GetPath()

	info, err := c.filesystem.Stat(fpath)
	if err != nil {
		return nil, err
	}

	extraInfo, err := info.GetSystemExtraInfo()
	if err != nil || extraInfo == nil {
		extraInfo = &fs.FileSystemExtraInfo{}
	}

	// 转换 EXIF 数据
	exifData := make(map[string]*structpb.Value)
	if extraInfo.Exif != nil {
		for k, v := range extraInfo.Exif {
			// 这里需要根据实际类型转换，简化处理
			if strVal, ok := v.(string); ok {
				exifData[k], _ = structpb.NewValue(strVal)
			} else if numVal, ok := v.(float64); ok {
				exifData[k], _ = structpb.NewValue(numVal)
			} else if boolVal, ok := v.(bool); ok {
				exifData[k], _ = structpb.NewValue(boolVal)
			}
		}
	}

	return &neutronproto.RemoteMessage_FileInformation{
		FileInformation: &neutronproto.FileInformation{
			Name:     info.Name,
			IsDir:    info.IsDir(),
			Size:     int64(info.Size),
			Mtime:    info.Mtime.Unix(),
			MimeType: extraInfo.MimeType,
			ExifData: exifData,
		},
	}, nil
}

func prepareFileReceive(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error) {
	if v, ok := req.(*neutronproto.RemoteMessage_PrepareFileReceiveRequest); !ok || v == nil {
		return nil, errors.New("invalidate input params")
	}

	realReq := req.(*neutronproto.RemoteMessage_PrepareFileReceiveRequest).PrepareFileReceiveRequest
	filePath := realReq.GetPath()
	dcName := realReq.GetLabel()
	offset := realReq.GetOffset()
	size := realReq.GetSize()

	abspath := path.Join(config.GlobalConfig.FileSystem.Local.RootPath, filePath)

	log.Infof("Prepared file receive: %s, offset=%d,size=%d. on data channel %s",
		filePath, offset, size, dcName)

	fi, err := os.Stat(abspath)
	if err != nil {
		return nil, err
	}

	if offset < 0 {
		return nil, fmt.Errorf("offset must be non-negative")
	}

	if offset > fi.Size() {
		return nil, fmt.Errorf("offset exceeds file size")
	}

	if size == -1 || offset+size > fi.Size() {
		size = fi.Size() - offset
	}

	client.dcFileMap[dcName] = NewWebRTCFileSender(abspath, offset, size)

	return &neutronproto.RemoteMessage_PrepareFileReceiveResponse{
		PrepareFileReceiveResponse: &neutronproto.PrepareFileReceiveResponse{
			Size: size,
		},
	}, nil
}

func getThumbnail(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error) {
	if v, ok := req.(*neutronproto.RemoteMessage_GetThumbnailRequest); !ok || v == nil {
		return nil, errors.New("invalidate input params")
	}

	realReq := req.(*neutronproto.RemoteMessage_GetThumbnailRequest).GetThumbnailRequest
	filePath := realReq.GetPath()
	size := realReq.GetSize()

	// 如果 size 为 0，使用默认值 200
	if size == 0 {
		size = 200
	}

	if config.GlobalConfig.Cache.CacheDir == "" {
		log.Warnf("Cache directory not configured")
		return nil, os.ErrInvalid
	}

	info, err := c.filesystem.Stat(filePath)
	if err != nil {
		return nil, err
	}

	extraInfo, err := info.GetSystemExtraInfo()
	if err != nil || extraInfo == nil {
		extraInfo = &fs.FileSystemExtraInfo{}
	}

	srcPath := path.Join(config.GlobalConfig.FileSystem.Local.RootPath, filePath)

	var cachePath string
	if cpath, ok := extraInfo.Thumbnails[int(size)]; ok {
		cachePath = path.Join(config.GlobalConfig.Cache.CacheDir, cpath)
	} else {

		if _, err := os.Stat(srcPath); err != nil {
			log.Warnf("File %s not found for thumbnail: %v", filePath, err)
			return nil, err
		}

		// Use SHA1 of the original path as the cache filename
		folder, name, _ := utils.HashToPath([]any{filePath, size}, 2, 2)
		cacheDir := filepath.Join(config.GlobalConfig.Cache.CacheDir, folder)

		if err := os.MkdirAll(cacheDir, 0755); err != nil {
			return nil, err
		}

		cachePath = path.Join(cacheDir, name+".jpg")
	}

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

	return &neutronproto.RemoteMessage_GetThumbnailResponse{
		GetThumbnailResponse: &neutronproto.GetThumbnailResponse{
			Id: hex.EncodeToString(id),
		},
	}, nil
}

func getFileSystemVersion(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error) {
	if v, ok := req.(*neutronproto.RemoteMessage_GetFileSystemVersionRequest); !ok || v == nil {
		return nil, errors.New("invalidate input params")
	}

	realReq := req.(*neutronproto.RemoteMessage_GetFileSystemVersionRequest).GetFileSystemVersionRequest
	_ = realReq // 不使用，但保持一致性
	return &neutronproto.GetFileSystemVersionResponse{
		Version: "",
	}, nil
}

func getImageRepoPage(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error) {
	if v, ok := req.(*neutronproto.RemoteMessage_ImageRepoPageRequest); !ok || v == nil {
		return nil, errors.New("invalidate input params")
	}

	realReq := req.(*neutronproto.RemoteMessage_ImageRepoPageRequest).ImageRepoPageRequest
	types := realReq.GetTypes()
	offset := int(realReq.GetOffset())
	count := int(realReq.GetCount())
	order := realReq.GetOrder()

	log.Infof("Fetching image repo page... types=%v, offset=%d, count=%d, order=%s", types, offset, count, order)

	// 获取总记录数
	totalCount, _, err := c.repo.GetHistorySummary()
	if err != nil {
		return nil, err
	}

	// 获取分页数据
	imgs, err := c.repo.GetHistoryPage(offset, count, order)
	if err != nil {
		return nil, err
	}

	// 转换 ImageRepoHistoryItem
	items := make([]*neutronproto.ImageRepoHistoryItem, 0, len(imgs))
	for _, img := range imgs {
		item := &neutronproto.ImageRepoHistoryItem{
			Id:       img.ID,
			Path:     img.FilePath, // 使用 FilePath 作为 Path
			Type:     int32(img.Type),
			Etime:    img.ExifTime, // ExifTime 是 int64 时间戳
			Mtime:    img.ModTime,  // ModTime 是 int64 时间戳
			FilePath: img.FilePath,
		}
		items = append(items, item)
	}

	return &neutronproto.RemoteMessage_ImageRepoPageResponse{
		ImageRepoPageResponse: &neutronproto.ImageRepoPageResponse{
			Total: int32(totalCount),
			Items: items,
		},
	}, nil
}

func getImageRepoHistory(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error) {
	if v, ok := req.(*neutronproto.RemoteMessage_ImageRepoHistoryRequest); !ok || v == nil {
		return nil, errors.New("invalidate input params")
	}

	realReq := req.(*neutronproto.RemoteMessage_ImageRepoHistoryRequest).ImageRepoHistoryRequest
	types := realReq.GetTypes()
	lastID := realReq.GetLastId()
	count := int64(realReq.GetCount())

	log.Infof("Fetching image repo history... types=%v, lastID=%d, count=%d", types, lastID, count)

	totalCount, maxId, err := c.repo.GetHistorySummary()
	if err != nil {
		return nil, err
	}

	imgs, err := c.repo.GetHistory(lastID, count)
	if err != nil {
		return nil, err
	}

	// 转换 ImageRepoHistoryItem
	items := make([]*neutronproto.ImageRepoHistoryItem, 0, len(imgs))
	for _, img := range imgs {
		item := &neutronproto.ImageRepoHistoryItem{
			Id:       img.ID,
			Path:     img.FilePath, // 使用 FilePath 作为 Path
			Type:     int32(img.Type),
			Etime:    img.ExifTime, // ExifTime 是 int64 时间戳
			Mtime:    img.ModTime,  // ModTime 是 int64 时间戳
			FilePath: img.FilePath,
		}
		items = append(items, item)
	}

	return &neutronproto.RemoteMessage_ImageRepoHistoryResponse{
		ImageRepoHistoryResponse: &neutronproto.ImageRepoHistoryResponse{
			Total:   int32(totalCount),
			MaxId:   maxId,
			Version: "1.0",
			Items:   items,
		},
	}, nil
}

func playVideo(c *RPCHandles, client *WebRTCRemoteClient, req any) (any, error) {
	if v, ok := req.(*neutronproto.RemoteMessage_PlayVideoRequest); !ok || v == nil {
		return nil, errors.New("invalidate input params")
	}

	realReq := req.(*neutronproto.RemoteMessage_PlayVideoRequest).PlayVideoRequest
	_ = realReq // 不使用，但保持一致性

	// 返回未实现错误
	return nil, fmt.Errorf("not implemented")
}
