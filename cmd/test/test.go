package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pion/logging"
	"github.com/pion/webrtc/v4"
	"github.com/pion/webrtc/v4/pkg/media"
	"github.com/pion/webrtc/v4/pkg/media/h264reader"
)

const (
	videoFileName     = "video.h264"
	h264FrameDuration = time.Millisecond * 33
	port              = 8081
)

type Request struct {
	Request string `json:"request"`
}

func printLog(message string) {
	now := time.Now()
	timestamp := now.Format("15:04:05.000")
	fmt.Printf("[%s] %s\n", timestamp, message)
}

type customLogger struct {
	subsystem string
}

func (c customLogger) log(level, msg string) {
	printLog(fmt.Sprintf("[%s]<%s>%s", c.subsystem, level, msg))
}
func (c customLogger) logf(level, format string, args ...any) {
	c.log(level, fmt.Sprintf(format, args...))
}

func (c customLogger) Trace(msg string)                  { c.log("trace", msg) }
func (c customLogger) Tracef(format string, args ...any) { c.logf("trace", format, args...) }
func (c customLogger) Debug(msg string)                  { c.log("debug", msg) }
func (c customLogger) Debugf(format string, args ...any) { c.logf("debug", format, args...) }
func (c customLogger) Info(msg string)                   { c.log("info", msg) }
func (c customLogger) Infof(format string, args ...any)  { c.logf("info", format, args...) }
func (c customLogger) Warn(msg string)                   { c.log("warn", msg) }
func (c customLogger) Warnf(format string, args ...any)  { c.logf("warn", format, args...) }
func (c customLogger) Error(msg string)                  { c.log("error", msg) }
func (c customLogger) Errorf(format string, args ...any) { c.logf("error", format, args...) }

type customLoggerFactory struct{}

func (c customLoggerFactory) NewLogger(subsystem string) logging.LeveledLogger {
	return customLogger{subsystem: subsystem}
}

func must(err error) {
	if err != nil {
		panic(err)
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("Upgrade error:%v\n", err)
		return
	}
	defer conn.Close()

	var wsMutex sync.Mutex

	m := &webrtc.MediaEngine{}

	err = m.RegisterCodec(webrtc.RTPCodecParameters{
		RTPCodecCapability: webrtc.RTPCodecCapability{
			MimeType:     webrtc.MimeTypeH264,
			ClockRate:    90000,
			Channels:     0,
			SDPFmtpLine:  "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f",
			RTCPFeedback: nil},
		PayloadType: 96,
	}, webrtc.RTPCodecTypeVideo)
	must(err)

	s := webrtc.SettingEngine{
		LoggerFactory: customLoggerFactory{},
	}
	s.SetIncludeLoopbackCandidate(true)
	peerConnection, err := webrtc.NewAPI(
		webrtc.WithMediaEngine(m),
		webrtc.WithSettingEngine(s),
	).NewPeerConnection(webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	})
	must(err)

	iceConnectedCtx, iceConnectedCtxCancel := context.WithCancel(context.Background())

	{
		videoTrack, err := webrtc.NewTrackLocalStaticSample(
			webrtc.RTPCodecCapability{MimeType: webrtc.MimeTypeH264}, "video", "pion")
		must(err)
		_, err = peerConnection.AddTrack(videoTrack)
		must(err)

		go func() {
			file, err := os.Open(videoFileName)
			must(err)
			h264, err := h264reader.NewReader(file)
			must(err)

			printLog("Waiting connection")

			<-iceConnectedCtx.Done()
			printLog("Start streaming")

			ticker := time.NewTicker(h264FrameDuration)
			for ; true; <-ticker.C {
				nal, h264Err := h264.NextNAL()
				if errors.Is(h264Err, io.EOF) {
					printLog("All video frames parsed and sent")
					os.Exit(0)
				}
				must(err)
				err = videoTrack.WriteSample(media.Sample{Data: nal.Data, Duration: h264FrameDuration})
				must(err)
			}
		}()
	}

	peerConnection.OnICECandidate(func(candidate *webrtc.ICECandidate) {
		if candidate == nil {
			return
		}
		printLog(fmt.Sprintf("\n\nLocal ICE candidate:\n%v\n\n", candidate))

		wsMutex.Lock()
		err = conn.WriteJSON(candidate.ToJSON())
		wsMutex.Unlock()
		must(err)
	})

	var iceStartTime time.Time

	peerConnection.OnICEConnectionStateChange(func(connectionState webrtc.ICEConnectionState) {
		switch connectionState {
		case webrtc.ICEConnectionStateChecking:
			iceStartTime = time.Now()
		case webrtc.ICEConnectionStateConnected:
			printLog(fmt.Sprintf("ICE connection time=%s", time.Since(iceStartTime)))
		}
	})
	peerConnection.OnConnectionStateChange(func(connectionState webrtc.PeerConnectionState) {
		if connectionState == webrtc.PeerConnectionStateConnected {
			iceConnectedCtxCancel()
		}
	})

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			printLog(fmt.Sprintf("Read error:%v", err))
			break
		}
		var (
			candidate webrtc.ICECandidateInit
			sdp       webrtc.SessionDescription
			request   Request
		)

		switch {
		case json.Unmarshal(message, &sdp) == nil && sdp.SDP != "":
			printLog(fmt.Sprintf("Remote SDP(%s):\n%s", sdp.Type, sdp.SDP))
			err = peerConnection.SetRemoteDescription(sdp)
			must(err)

			if sdp.Type == webrtc.SDPTypeOffer {
				answer, err := peerConnection.CreateAnswer(nil)
				must(err)
				err = peerConnection.SetLocalDescription(answer)
				must(err)
				printLog(fmt.Sprintf("Local SDP(%s):\n%s\n", answer.Type, answer.SDP))

				wsMutex.Lock()
				err = conn.WriteJSON(answer)
				wsMutex.Unlock()
				must(err)
			}
		case json.Unmarshal(message, &candidate) == nil && candidate.Candidate != "":
			printLog(fmt.Sprintf("\n\nRemote ICE candidate:\n%v\n\n", candidate))
			err = peerConnection.AddICECandidate(candidate)
			must(err)
		case json.Unmarshal(message, &request) == nil && request.Request != "":
			if request.Request == "offer" {
				offer, err := peerConnection.CreateOffer(nil)
				must(err)
				err = peerConnection.SetLocalDescription(offer)
				must(err)
				printLog(fmt.Sprintf("Local SDP(%s):\n%s\n", offer.Type, offer.SDP))

				wsMutex.Lock()
				err = conn.WriteJSON(offer)
				wsMutex.Unlock()
				must(err)
			}
		default:
			printLog(fmt.Sprintf("Unknown message %s", message))
		}
	}
}

func main() {
	if _, err := os.Stat(videoFileName); err != nil {
		panic("Missing video file: " + videoFileName)
	}

	http.Handle("/", http.FileServer(http.Dir(".")))
	http.HandleFunc("/websocket", wsHandler)

	printLog(fmt.Sprintf("Open http://localhost:%d to access this demo", port))
	panic(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
