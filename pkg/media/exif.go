package media

import (
	"fmt"
	"math/big"
	"os"
	"time"

	exiftool "github.com/barasher/go-exiftool"
	"github.com/rwcarlsen/goexif/exif"
	"github.com/rwcarlsen/goexif/mknote"
	"github.com/rwcarlsen/goexif/tiff"

	"github.com/aproton/neutron/pkg/utils/log"
)

type ExifData map[string]interface{}

func (ed ExifData) Walk(name exif.FieldName, tag *tiff.Tag) error {
	fieldName := string(name)

	var value interface{}

	switch tag.Format() {
	case tiff.RatVal:
		// 有理数处理
		if tag.Count == 1 {
			if rat, err := tag.Rat(0); err == nil {
				num := rat.Num()
				den := rat.Denom()
				numFloat := new(big.Float).SetInt(num)
				denFloat := new(big.Float).SetInt(den)
				value, _ = new(big.Float).Quo(numFloat, denFloat).Float64()
			}
		} else {
			rats := make([]float64, tag.Count)
			for i := 0; i < int(tag.Count); i++ {
				if rat, err := tag.Rat(i); err == nil {
					num := rat.Num()
					den := rat.Denom()
					numFloat := new(big.Float).SetInt(num)
					denFloat := new(big.Float).SetInt(den)
					rats[i], _ = new(big.Float).Quo(numFloat, denFloat).Float64()
				}
			}
			value = rats
		}

	case tiff.IntVal:
		if tag.Count == 1 {
			value, _ = tag.Int(0)
		} else {
			ints := make([]int64, tag.Count)
			for i := 0; i < int(tag.Count); i++ {
				ints[i], _ = tag.Int64(i)
			}
			value = ints
		}

	case tiff.FloatVal:
		if tag.Count == 1 {
			value, _ = tag.Float(0)
		} else {
			floats := make([]float64, tag.Count)
			for i := 0; i < int(tag.Count); i++ {
				floats[i], _ = tag.Float(i)
			}
			value = floats
		}

	default:
		value = tag.String()
	}

	ed[fieldName] = value
	return nil
}

func GetImageExifData(imagePath string) (map[string]interface{}, error) {
	result := make(ExifData)

	fileInfo, err := os.Stat(imagePath)
	if err == nil {
		result["FileName"] = fileInfo.Name()
		result["FileSize"] = fileInfo.Size()
		result["FileModTime"] = fileInfo.ModTime().Format(time.RFC3339)
	}

	file, err := os.Open(imagePath)
	if err != nil {
		return nil, fmt.Errorf("open file failed: %v", err)
	}
	defer file.Close()

	exif.RegisterParsers(mknote.All...)

	x, err := exif.Decode(file)
	if err != nil {
		//result["Error"] = fmt.Sprintf("解码EXIF失败: %v", err)
		log.Warnf("decode exif info failed: %v", err)
		return nil, err
	}

	err = x.Walk(result)

	if err != nil {
		return nil, fmt.Errorf("exif walk failed: %v", err)
	}

	if lat, long, err := x.LatLong(); err == nil {
		result["GPSLatitude"] = lat
		result["GPSLongitude"] = long
	}

	if tm, err := x.DateTime(); err == nil {
		result["ParsedDateTime"] = tm.Format(time.RFC3339)
	}

	return result, nil
}

func GetExifDataTime(exifData map[string]interface{}) (time.Time, error) {
	timeKeys := []string{"ParsedDateTime", "DateTimeOriginal", "DateTimeDigitized", "DateTime",
		"CreationDate", "CreateDate"}
	for _, key := range timeKeys {
		if dateTimeStr, ok := exifData[key].(string); ok && dateTimeStr != "" {
			if tm, err := time.Parse(time.RFC3339, dateTimeStr); err == nil {
				return tm, nil
			}
		}
	}

	return time.Time{}, fmt.Errorf("Not found valid time in EXIF data")
}

func GetVideoExifData(videoPath string) (map[string]interface{}, error) {
	et, err := exiftool.NewExiftool()
	if err != nil {
		log.Warnf("init exif tool: %v", err)
	}
	defer et.Close()

	fileInfos := et.ExtractMetadata(videoPath)

	results := make(map[string]interface{})
	for _, fileInfo := range fileInfos {
		if fileInfo.Err != nil {
			log.Warnf("process %s error: %v", fileInfo.File, fileInfo.Err)
			continue
		}
		for k, v := range fileInfo.Fields {
			results[k] = v
		}
	}

	skipKeys := []string{"SourceFile", "Directory", "Warning"}
	for _, key := range skipKeys {
		delete(results, key)
	}

	return results, nil
}

func GetExifData(filePath string) (map[string]interface{}, error) {
	info, err := GetImageExifData(filePath)
	if err != nil {
		info, err = GetVideoExifData(filePath)
	}

	return info, err
}
