package media

import (
	"path/filepath"
	"strings"
)

func GetFileMimeType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))

	// 图片文件扩展名
	imageExts := []string{".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".tif", ".heic"}
	for _, imgExt := range imageExts {
		if ext == imgExt {
			return "image"
		}
	}

	// 视频文件扩展名
	videoExts := []string{".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv", ".webm", ".m4v", ".mpg", ".mpeg"}
	for _, vidExt := range videoExts {
		if ext == vidExt {
			return "video"
		}
	}

	// 文本文件扩展名
	textExts := []string{".txt", ".md", ".json", ".xml", ".yaml", ".yml", ".ini", ".cfg", ".conf"}
	for _, txtExt := range textExts {
		if ext == txtExt {
			return "plain"
		}
	}

	return "binary"
}
