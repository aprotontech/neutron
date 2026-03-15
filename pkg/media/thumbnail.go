package media

import (
	"fmt"
	"image"
	"image/jpeg"
	"os"
	"path/filepath"
	"strings"

	"github.com/adrium/goheif"
	"github.com/disintegration/imaging"
	ffmpeg "github.com/u2takey/ffmpeg-go"
	"golang.org/x/image/draw"

	"github.com/aproton/neutron/pkg/utils/log"
)

func ImageThumbnail(inputImage string, outputThumbnail string, size int) error {
	// 使用 imaging 生成图片缩略图
	file, err := os.Open(inputImage)
	if err != nil {
		return err
	}
	defer file.Close()

	img, err := imaging.Decode(file, imaging.AutoOrientation(true))
	if err != nil {
		log.Warnf("Decode as image failed %v", err)
		return err
	}

	thumb := imaging.Thumbnail(img, int(size), int(size), imaging.Lanczos)
	if err := imaging.Save(thumb, outputThumbnail, imaging.JPEGQuality(85)); err != nil {
		log.Warnf("Failed to save thumbnail %s: %v", outputThumbnail, err)
		return err
	}

	return nil
}

func HeicThumbnail(inputImage string, outputThumbnail string, size int) error {
	input, err := os.Open("input.heic")
	if err != nil {
		return err
	}
	defer input.Close()

	img, err := goheif.Decode(input)
	if err != nil {
		return err
	}

	thumbnail := image.NewRGBA(image.Rect(0, 0, size, size))
	draw.BiLinear.Scale(thumbnail, thumbnail.Bounds(), img, img.Bounds(), draw.Over, nil)

	// 保存为 JPEG
	output, err := os.Create(outputThumbnail)
	if err != nil {
		return err
	}
	defer output.Close()

	return jpeg.Encode(output, thumbnail, &jpeg.Options{Quality: 85})
}

func VideoThumbnail(inputVideo string, outputThumbnail string, size int) error {
	vf := fmt.Sprintf("scale=iw*min(%d/iw\\,%d/ih):ih*min(%d/iw\\,%d/ih),pad=%d:%d:(%d-iw)/2:(%d-ih)/2",
		size, size, size, size, size, size, size, size)

	// 使用 ffmpeg 从视频中提取第1秒的帧作为缩略图
	err := ffmpeg.Input(inputVideo).
		Filter("select", ffmpeg.Args{"gte(n,30)"}). // 选择第30帧（假设30fps，即第1秒）
		Output(outputThumbnail, ffmpeg.KwArgs{
			"vframes": 1,
			"s":       fmt.Sprintf("%dx%d", size, size),
			"vf":      vf,
			"q:v":     2,
		}).
		OverWriteOutput().
		Run()

	if err != nil {
		// 如果第1秒失败，尝试从视频开头提取
		err = ffmpeg.Input(inputVideo).
			Output(outputThumbnail, ffmpeg.KwArgs{
				"vframes": 1,
				"s":       fmt.Sprintf("%dx%d", size, size),
				"vf":      vf,
				"ss":      "00:00:01",
				"q:v":     2,
			}).
			OverWriteOutput().
			Run()
	}

	return err

}

func Thumbnail(intputFile string, outputThumbnail string, size int) error {
	// 检测文件类型
	ext := strings.ToLower(filepath.Ext(intputFile))
	isVideoFile := false
	videoExts := []string{".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv", ".webm", ".m4v", ".mpg", ".mpeg"}
	for _, vidExt := range videoExts {
		if ext == vidExt {
			isVideoFile = true
			break
		}
	}

	if isVideoFile {
		return VideoThumbnail(intputFile, outputThumbnail, size)
	}

	// if ext == ".heic" {
	// 	return HeicThumbnail(intputFile, outputThumbnail, size)
	// }

	return ImageThumbnail(intputFile, outputThumbnail, size)
}
