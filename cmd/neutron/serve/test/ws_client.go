package test

import (
	"encoding/json"
	"os"
	"sync"

	"github.com/gorilla/websocket"
	webrtc "github.com/pion/webrtc/v4"

	"github.com/aproton/neutron/pkg/utils/log"
)

type FileAPI func(dcm *FileSystemMock, req any) (any, error)

type Sender struct {
	conn *websocket.Conn

	mutex sync.RWMutex

	remoteClients map[string]*webrtc.PeerConnection

	api *webrtc.API

	fileAPIS map[string]FileAPI

	dcm *FileSystemMock

	combineAnswerCandidates bool
}

func NewSender(wsURL string) (*Sender, error) {
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		return nil, err
	}

	settingEngine := webrtc.SettingEngine{}

	return &Sender{
		conn:                    conn,
		remoteClients:           map[string]*webrtc.PeerConnection{},
		api:                     webrtc.NewAPI(webrtc.WithSettingEngine(settingEngine)),
		combineAnswerCandidates: true,
		fileAPIS: map[string]FileAPI{
			"listFiles":          getFileList,
			"prepareFileReceive": prepareFileReceive,
		},
		dcm: &FileSystemMock{
			dcFileMap: map[string]string{},
		},
	}, nil
}

func (s *Sender) Start() {
	regist_msg := SignalMessage{
		Type:         "regist",
		Source:       "file-server",
		Destionation: "discover",
		Data:         "",
	}

	data, err := json.Marshal(regist_msg)
	if err != nil {
		log.Warnf("Marshal regist message error:", err)
		return
	}

	if err := s.conn.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Warnf("Write regist message error:", err)
		return
	}

	for {
		_, msg, err := s.conn.ReadMessage()
		if err != nil {
			log.Warnf("Read error:", err)
			return
		}

		log.Infof("Received message: %s", string(msg))

		var signal SignalMessage
		if err := json.Unmarshal(msg, &signal); err != nil {
			log.Warnf("Unmarshal error:", err)
			continue
		}

		switch signal.Type {
		case "offer":
			sdp := signal.GetContent("sdp")
			if err := s.setupRemoteConnection(signal.Source, sdp.(string)); err != nil {
				log.Warnf("Setup remote connection error:", err)
			}

		case "candidate":
			cand := signal.GetContent("candidate")
			candidate := webrtc.ICECandidateInit{
				Candidate: cand.(string),
			}

			if pc, exists := s.remoteClients[signal.Source]; exists {
				if err := pc.AddICECandidate(candidate); err != nil {
					log.Warnf("AddICECandidate error: %v", err)
				}
			}
		}
	}
}

func (s *Sender) setupRemoteConnection(source string, sdp string) error {
	log.Infof("Setting up remote connection for source: %s", source)
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{URLs: []string{"stun:stun.l.google.com:19302"}},
		},
	}

	peerConnection, err := webrtc.NewPeerConnection(config)
	if err != nil {
		return err
	}

	s.mutex.Lock()
	s.remoteClients[source] = peerConnection
	s.mutex.Unlock()

	peerConnection.OnConnectionStateChange(func(pcs webrtc.PeerConnectionState) {
		log.Infof("Connect status changed to %v", pcs)
	})
	peerConnection.OnICEConnectionStateChange(func(is webrtc.ICEConnectionState) {
		log.Infof("ICE Connect status changed to %v", is)
	})

	peerConnection.OnDataChannel(func(dataChannel *webrtc.DataChannel) {
		log.Infof("New DataChannel %s %d", dataChannel.Label(), dataChannel.ID())

		dataChannel.OnOpen(func() {
			log.Infof("Data channel '%s' open", dataChannel.Label())
			if fpath, ok := s.dcm.dcFileMap[dataChannel.Label()]; ok {
				data, err := os.ReadFile(fpath)
				if err != nil {
					log.Warnf("Read file %s error: %v", fpath, err)
					dataChannel.Close()
				} else {
					chunkSize := 16 * 1000
					for len(data) > 0 {
						sendSize := chunkSize
						if len(data) < chunkSize {
							sendSize = len(data)
						}

						chunk := data[:sendSize]
						data = data[sendSize:]

						if err := dataChannel.Send(chunk); err != nil {
							log.Warnf("Send file %s data error: %v", fpath, err)
							dataChannel.Close()
						}
					}
				}
				log.Infof("Sent file %s data on data channel %s, size=%d", fpath, dataChannel.Label(), len(data))
			}
		})

		dataChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
			log.Infof("Received: %s", string(msg.Data))

			if dataChannel.Label() == "rpc" {
				m := SignalMessage{}
				if err := json.Unmarshal(msg.Data, &m); err != nil {
					log.Warnf("Unmarshal data channel message error: %v", err)
					return
				}

				var response any
				if api, ok := s.fileAPIS[m.Type]; ok {
					response, err = api(s.dcm, m.Data)
					if err != nil {
						log.Warnf("File API %s error: %v", m.Type, err)
						if response != nil {
							response = map[string]interface{}{
								"error": err.Error(),
							}
						}
					}
				} else {
					response = map[string]interface{}{
						"error": "unknown api " + m.Type,
					}
				}

				res, err := json.Marshal(&SignalMessage{
					Type:         "@response",
					Source:       "file-server",
					ID:           m.ID,
					Destionation: source,
					Data:         response,
				})

				if err != nil {
					log.Warnf("Marshal file list message error: %v", err)
					return
				}
				if err := dataChannel.SendText(string(res)); err != nil {
					log.Warnf("Send file list message error: %v", err)
				}
				log.Debugf("send msg done %v", response)
			}
		})
	})

	offer := webrtc.SessionDescription{
		Type: webrtc.SDPTypeOffer,
		SDP:  sdp,
	}
	if err := peerConnection.SetRemoteDescription(offer); err != nil {
		log.Warnf("SetRemoteDescription error: %v", err)
	}

	log.Infof("remote has been set %v", peerConnection.RemoteDescription() != nil)

	peerConnection.OnICECandidate(func(candidate *webrtc.ICECandidate) {
		if candidate != nil && !s.combineAnswerCandidates {
			log.Infof("OnICECandidate %v", candidate)
			if err := s.conn.WriteJSON(&SignalMessage{
				Type:         "candidate",
				Source:       "file-server",
				Destionation: source,
				Data:         candidate,
			}); err != nil {
				log.Warnf("Write answer error: %v", err)
			}
		}
	})

	awswer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		log.Fatal(err)
	}

	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

	err = peerConnection.SetLocalDescription(awswer)
	if err != nil {
		log.Fatal(err)
	}

	if s.combineAnswerCandidates {
		<-gatherComplete

		if err := s.conn.WriteJSON(&SignalMessage{
			Type:         "answer+candidates",
			Source:       "file-server",
			Destionation: source,
			Data:         peerConnection.LocalDescription(),
		}); err != nil {
			log.Warnf("Write answer error: %v", err)
		}
	} else {
		if err := s.conn.WriteJSON(&SignalMessage{
			Type:         "answer",
			Source:       "file-server",
			Destionation: source,
			Data: map[string]string{
				"sdp": peerConnection.LocalDescription().SDP,
			},
		}); err != nil {
			log.Warnf("Write answer error: %v", err)
		}
	}

	return nil
}
