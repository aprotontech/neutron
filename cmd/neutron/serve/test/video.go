package test

import (
	"encoding/json"
	"io"
	"os"
	"time"

	webrtc "github.com/pion/webrtc/v4"
	"github.com/pion/webrtc/v4/pkg/media"
	"github.com/pion/webrtc/v4/pkg/media/h264reader"

	"github.com/aproton/neutron/pkg/utils/log"
)

type VideoStreamer struct {
	videoFile string
	fileInfo  os.FileInfo
	file      *os.File
}

func NewVideoStreamer(videoFile string) (*VideoStreamer, error) {
	fileInfo, err := os.Stat(videoFile)
	if err != nil {
		return nil, err
	}

	file, err := os.Open(videoFile)
	if err != nil {
		return nil, err
	}

	return &VideoStreamer{
		videoFile: videoFile,
		fileInfo:  fileInfo,
		file:      file,
	}, nil
}

func (vs *VideoStreamer) SetupVideoTrack(peerConnection *webrtc.PeerConnection) {
	videoTrack, err := webrtc.NewTrackLocalStaticSample(
		webrtc.RTPCodecCapability{MimeType: webrtc.MimeTypeH264},
		"video",
		"pion",
	)
	if err != nil {
		log.Warnf("NewTrackLocalStaticSample failed %v", err)
		return
	}

	_, err = peerConnection.AddTrack(videoTrack)
	if err != nil {
		log.Warnf("AddTrack failed %v", err)
		return
	}

	log.Infof("add track finished")

	go func() {
		// 打开视频文件（H264格式）
		file, err := os.Open("test.h264")
		if err != nil {
			panic(err)
		}
		defer file.Close()
		log.Infof("before send file content")

		// 创建H264阅读器
		h264, err := h264reader.NewReader(file)
		if err != nil {
			panic(err)
		}

		// 设置帧率（30fps）
		ticker := time.NewTicker(time.Second / 30)
		defer ticker.Stop()

		for range ticker.C {

			nal, err := h264.NextNAL()
			if err == io.EOF {
				log.Infof("finished send")
				break
			}

			if err != nil {
				log.Infof("other error %v", err)
				return
			}

			// 发送NAL单元
			if err := videoTrack.WriteSample(media.Sample{
				Data:     nal.Data,
				Duration: time.Second / 30,
			}); err != nil {
				log.Infof("send error %v", err)
				return
			}
		}

	}()

}

func (vs *VideoStreamer) SetupVideoDataChannel(peerConnection *webrtc.PeerConnection) {
	// 立即创建控制通道

	controlChannel, err := peerConnection.CreateDataChannel("control", nil)
	if err != nil {
		log.Infof("创建控制通道失败: %v", err)
	} else {
		controlChannel.OnOpen(func() {
			log.Infof("控制通道已打开")
		})

		controlChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
			log.Infof("收到控制消息: %s", string(msg.Data))

			var cmd map[string]interface{}
			if err := json.Unmarshal(msg.Data, &cmd); err != nil {
				log.Infof("解析控制消息失败: %v", err)
				return
			}

			if cmdType, ok := cmd["type"].(string); ok {
				switch cmdType {
				case "seek":
					if time, ok := cmd["time"].(float64); ok {
						log.Infof("收到跳转请求: %f秒", time)
						// 这里处理跳转逻辑
					}
				case "requestData":
					log.Infof("收到数据请求")
					// 开始发送视频数据
				}
			}
		})
	}

	// 立即创建视频数据通道
	orderd := false
	maxre := uint16(0)
	videoDataChannel, err := peerConnection.CreateDataChannel("videoData", &webrtc.DataChannelInit{
		Ordered:        &orderd,
		MaxRetransmits: &maxre,
	})
	if err != nil {
		log.Infof("创建视频数据通道失败: %v", err)
	} else {
		videoDataChannel.OnOpen(func() {
			log.Infof("视频数据通道已打开，开始发送视频数据")
			go vs.startSendingVideoData(videoDataChannel)
		})

		videoDataChannel.OnClose(func() {
			log.Infof("视频数据通道已关闭")
		})
	}
}

func (vs *VideoStreamer) startSendingVideoData(dc *webrtc.DataChannel) {
	log.Infof("开始发送视频数据，文件大小: %d bytes", vs.fileInfo.Size())
	time.Sleep(time.Second)

	// 首先读取文件头，确定是否是MP4文件
	header := make([]byte, 8)
	n, err := vs.file.ReadAt(header, 0)
	if err != nil || n < 8 {
		log.Infof("读取文件头失败: %v", err)
		return
	}

	// 检查是否是MP4文件（ftyp盒子）
	boxSize := uint32(header[0])<<24 | uint32(header[1])<<16 | uint32(header[2])<<8 | uint32(header[3])
	boxType := string(header[4:8])

	log.Infof("文件头: 盒子大小=%d, 类型=%s", boxSize, boxType)

	if boxType != "ftyp" {
		log.Infof("警告: 文件可能不是标准MP4格式，盒子类型: %s", boxType)
	}

	// 使用较小的块大小发送，避免缓冲区溢出
	chunkSize := 32 * 1024 // 32KB
	buffer := make([]byte, chunkSize)
	position := int64(0)
	chunkCount := 0

	for {
		if dc.ReadyState() != webrtc.DataChannelStateOpen {
			log.Infof("数据通道已关闭，停止发送")
			break
		}

		// 读取视频文件块
		n, err := vs.file.ReadAt(buffer, position)
		if err != nil && err.Error() != "EOF" {
			log.Infof("读取视频文件失败: %v", err)
			break
		}

		if n == 0 {
			log.Infof("视频文件发送完成")
			break
		}

		// 创建数据包：8字节位置信息 + 视频数据
		packet := make([]byte, 8+n)

		// 写入位置信息（小端序）
		packet[0] = byte(position)
		packet[1] = byte(position >> 8)
		packet[2] = byte(position >> 16)
		packet[3] = byte(position >> 24)
		packet[4] = byte(position >> 32)
		packet[5] = byte(position >> 40)
		packet[6] = byte(position >> 48)
		packet[7] = byte(position >> 56)

		copy(packet[8:], buffer[:n])

		// 发送数据
		if err := dc.Send(packet); err != nil {
			log.Infof("发送视频数据失败: %v", err)
			break
		}

		position += int64(n)
		chunkCount++

		if chunkCount%10 == 0 {
			log.Infof("已发送 %d 个数据块，进度: %.1f%%", chunkCount, float64(position)*100/float64(vs.fileInfo.Size()))
			// 稍微延迟以避免发送过快
			time.Sleep(time.Millisecond * 50)
		}
	}

	log.Infof("视频数据发送完成，总共发送 %d 个数据块", chunkCount)
}
