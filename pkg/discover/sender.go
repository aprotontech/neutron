package discover

import (
	"context"
	"errors"
	"io"
	"os"
	"time"

	webrtc "github.com/pion/webrtc/v4"

	"github.com/aproton/neutron/pkg/utils/log"
)

type WebRTCFileSender struct {
	bufferedAmountLowThreshold uint64

	path   string
	offset int64
	size   int64
}

func NewWebRTCFileSender(path string, offset, size int64) *WebRTCFileSender {
	return &WebRTCFileSender{
		path:                       path,
		offset:                     offset,
		size:                       size,
		bufferedAmountLowThreshold: 64 * 1024,
	}
}

func (s *WebRTCFileSender) Send(dataChannel *webrtc.DataChannel) error {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	file, err := os.Open(s.path)
	if err != nil {
		log.Warnf("Open file %s error: %v", s.path, err)
		return errors.New("open file failed")
	}
	defer file.Close()

	if s.offset > 0 {
		_, err = file.Seek(s.offset, 0)
		if err != nil {
			log.Warnf("Seek file %s to offset %d error: %v", s.path, s.offset, err)
			return errors.New("seek file failed")
		}
	}

	var totalSize int64
	if s.size > 0 {
		totalSize = s.size
	} else {
		fileInfo, err := file.Stat()
		if err != nil {
			log.Warnf("Get file %s stat error: %v", s.path, err)
			return errors.New("get file stat failed")
		}
		totalSize = fileInfo.Size() - s.offset
	}

	dataChannel.SetBufferedAmountLowThreshold(s.bufferedAmountLowThreshold)

	sendChan := make(chan bool, 1)

	dataChannel.OnBufferedAmountLow(func() {
		select {
		case sendChan <- true:
		default:
		}
	})

	chunkSize := 16 * 1024
	remaining := totalSize
	buffer := make([]byte, chunkSize)
	sentBytes := int64(0)

	sendChan <- true

	for {
		select {
		case <-ctx.Done():
			return errors.New("send timeout or cancelled")

		case <-sendChan:
			for {
				if dataChannel.BufferedAmount() > s.bufferedAmountLowThreshold*2 {
					break
				}
				readSize := chunkSize
				if remaining > 0 && remaining < int64(chunkSize) {
					readSize = int(remaining)
				}

				n, err := file.Read(buffer[:readSize])
				if err != nil && err != io.EOF {
					log.Warnf("Read file %s error: %v", s.path, err)
					return err
				}

				if n == 0 {
					log.Infof("Sent file %s data on data channel %s, offset=%d, size=%d, sent=%d",
						s.path, dataChannel.Label(), s.offset, totalSize, sentBytes)
					return nil
				}

				if err := dataChannel.Send(buffer[:n]); err != nil {
					log.Warnf("Send file %s data on data channel %s, error: %v",
						s.path, dataChannel.Label(), err)
					return err
				}

				sentBytes += int64(n)
				if remaining > 0 {
					remaining -= int64(n)
					if remaining <= 0 {
						log.Infof("Sent file %s data on data channel %s, offset=%d, size=%d, sent=%d",
							s.path, dataChannel.Label(), s.offset, totalSize, sentBytes)
						return nil
					}
				}

				if dataChannel.BufferedAmount() > s.bufferedAmountLowThreshold {
					break
				}
			}
		}
	}
}
