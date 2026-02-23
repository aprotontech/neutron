package meta

import (
	"encoding/xml"
	"errors"
	"fmt"
	"os"

	"github.com/avast/apkparser"
)

// VersionExtractor 用于提取APK版本信息
type versionExtractor struct {
	VersionName string
	VersionCode string
	inManifest  bool
	currentElem string
}

func (v *versionExtractor) EncodeToken(t xml.Token) error {
	switch token := t.(type) {
	case xml.StartElement:
		v.currentElem = token.Name.Local
		if token.Name.Local == "manifest" {
			v.inManifest = true
			// 从manifest属性中获取版本信息
			for _, attr := range token.Attr {
				if attr.Name.Local == "versionName" || attr.Name.Local == "android:versionName" {
					v.VersionName = attr.Value
				}
				if attr.Name.Local == "versionCode" || attr.Name.Local == "android:versionCode" {
					v.VersionCode = attr.Value
				}
			}
		}
	case xml.EndElement:
		v.currentElem = ""
		if token.Name.Local == "manifest" {
			v.inManifest = false
		}
	case xml.CharData:
		// 可以处理文本内容，但版本信息通常在属性中
	}
	return nil
}

func (v *versionExtractor) Flush() error {
	return nil
}

// GetApkVersion 根据输入的Android APK文件路径，读取对应的版本号
func GetApkVersion(path string) (string, error) {
	// 检查文件是否存在
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "", fmt.Errorf("APK文件不存在: %s", path)
	}

	// 创建版本提取器
	extractor := &versionExtractor{}

	// 解析APK文件
	zipErr, _, manifestErr := apkparser.ParseApk(path, extractor)

	// 检查是否有致命错误
	if zipErr != nil {
		return "", fmt.Errorf("无法打开APK文件: %v", zipErr)
	}

	// manifestErr可能不是致命错误，但版本信息可能无法获取
	if manifestErr != nil {
		return "", fmt.Errorf("无法解析AndroidManifest.xml: %v", manifestErr)
	}

	// 检查是否找到版本号
	if extractor.VersionName == "" {
		return "", errors.New("未找到版本号信息")
	}

	return extractor.VersionName, nil
}

// GetApkVersionWithCode 获取APK版本名称和版本代码
func GetApkVersionWithCode(path string) (versionName, versionCode string, err error) {
	// 检查文件是否存在
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "", "", fmt.Errorf("APK文件不存在: %s", path)
	}

	// 创建版本提取器
	extractor := &versionExtractor{}

	// 解析APK文件
	zipErr, _, manifestErr := apkparser.ParseApk(path, extractor)

	// 检查是否有致命错误
	if zipErr != nil {
		return "", "", fmt.Errorf("无法打开APK文件: %v", zipErr)
	}

	// manifestErr可能不是致命错误，但版本信息可能无法获取
	if manifestErr != nil {
		return "", "", fmt.Errorf("无法解析AndroidManifest.xml: %v", manifestErr)
	}
	return extractor.VersionName, extractor.VersionCode, nil
}
