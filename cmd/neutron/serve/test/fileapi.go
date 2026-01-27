package test

import (
	"os"
	"path"

	"github.com/aproton/neutron/pkg/utils/log"
)

type FileFolderInfo map[string]interface{}

type FileSystemMock struct {
	dcFileMap map[string]string
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
