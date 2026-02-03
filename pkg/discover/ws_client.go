package discover

import (
	"context"
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	webrtc "github.com/pion/webrtc/v4"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/utils/log"
)

type FileAPI func(dcm *FileSystemMock, req any) (any, error)

type RemoteStorageServer struct {
	conn *websocket.Conn

	mutex sync.RWMutex

	config *config.Config

	remoteClients map[string]*webrtc.PeerConnection

	api *webrtc.API

	fileAPIS map[string]FileAPI

	dcm *FileSystemMock

	combineAnswerCandidates bool
}

func NewRemoteStorageServer(config *config.Config) *RemoteStorageServer {
	if config == nil || config.DiscoverClient == nil || config.Users == nil {
		panic("invalidate config")
	}

	return &RemoteStorageServer{
		config:                  config,
		conn:                    nil,
		remoteClients:           map[string]*webrtc.PeerConnection{},
		api:                     nil,
		combineAnswerCandidates: true,
		fileAPIS: map[string]FileAPI{
			"listFiles":          getFileList,
			"prepareFileReceive": prepareFileReceive,
			"getThumbnail":       getThumbnail,
			"playVideo":          playVideo,
		},
		dcm: &FileSystemMock{
			dcFileMap: map[string]string{},
		},
	}
}

func (s *RemoteStorageServer) Start(ctx context.Context) error {

	settingEngine := webrtc.SettingEngine{}
	s.api = webrtc.NewAPI(webrtc.WithSettingEngine(settingEngine))

	cnt, _ := json.Marshal(&LoginRequest{
		ClientID:        s.config.DiscoverClient.StorageServerID,
		Username:        s.config.DiscoverClient.StorageServerID,
		Password:        s.config.DiscoverClient.Password,
		StorageServerID: s.config.DiscoverClient.StorageServerID,
	})

	conn, _, err := websocket.DefaultDialer.Dial(s.config.DiscoverClient.WebSocketURL, http.Header{
		"Authorization": []string{"Bearer " + base64.StdEncoding.EncodeToString(cnt)},
	})
	if err != nil {
		return err
	}

	log.Infof("connected to remote host: %s", s.config.DiscoverClient.WebSocketURL)

	s.conn = conn

	go func() {
		<-ctx.Done()
		s.conn.Close()
	}()

	for {

		_, msg, err := s.conn.ReadMessage()
		if err != nil {
			log.Warnf("Read error:", err)
			return err
		}

		log.Infof("Received message: %s", string(msg))

		var signal RemoteMessage
		if err := json.Unmarshal(msg, &signal); err != nil {
			log.Warnf("Unmarshal error:", err)
			continue
		}

		switch signal.Type {
		case "authorizen":
			loginInfo, err := signal.GetLoginRequest()
			if err == nil {
				ok, err := CheckPassword(loginInfo.Username, loginInfo.Password)
				if ok || err != nil {
					token := md5.Sum([]byte(uuid.NewString()))
					data, err := json.Marshal(&RemoteMessage{
						Type:         "callAck",
						Source:       s.config.DiscoverClient.StorageServerID,
						Destionation: signal.Source,
						ID:           signal.ID,
						Data: &LoginResponse{
							Success: true,
							Message: "success",
							Token:   hex.EncodeToString(token[:]),
						},
					})
					if err == nil {
						if err := s.conn.WriteMessage(websocket.TextMessage, data); err != nil {
							log.Warnf("Write regist message error: %v", err)
							return err
						}
					} else {
						log.Warnf("Marshal regist message error: %v", err)
					}
				} else {
					log.Warnf("check login data error: %v", err)
				}

			} else {
				log.Warnf("GetLoginRequest failed:  %v", err)
			}

		case "offer":
			offer, err := signal.GetWebRTCOfferContent()
			if err != nil {
				log.Warnf("Get remote offer error:", err)
			} else if err := s.setupRemoteConnection(signal.Source, offer.SDP); err != nil {
				log.Warnf("Setup remote connection error:", err)
			}

		case "candidate":
			cand, err := signal.GetWebRTCCandidateContent()
			if err != nil {
				log.Warnf("Get remote offer error:", err)
			} else {
				candidate := webrtc.ICECandidateInit{
					Candidate: cand.Candidate,
				}

				if pc, exists := s.remoteClients[signal.Source]; exists {
					if err := pc.AddICECandidate(candidate); err != nil {
						log.Warnf("AddICECandidate error: %v", err)
					}
				}
			}
		}
	}
}

func (s *RemoteStorageServer) setupRemoteConnection(source string, sdp string) error {
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
		if pcs == webrtc.PeerConnectionStateConnected {
			s.dcm.peerConnection = peerConnection
		}
	})
	peerConnection.OnICEConnectionStateChange(func(is webrtc.ICEConnectionState) {
		log.Infof("ICE Connect status changed to %v", is)
	})

	peerConnection.OnDataChannel(func(dataChannel *webrtc.DataChannel) {
		log.Infof("New DataChannel %s %d", dataChannel.Label(), dataChannel.ID())

		if dataChannel.Label() == "thumbnail" {
			s.dcm.thumbnailDC = dataChannel
		}

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
				m := RemoteMessage{}
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

				res, err := json.Marshal(&RemoteMessage{
					Type:         "@response",
					Source:       s.config.DiscoverClient.StorageServerID,
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

		dataChannel.OnClose(func() {
			log.Infof("DataChannel %s closed", dataChannel.Label())
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
			if err := s.conn.WriteJSON(&RemoteMessage{
				Type:         "candidate",
				Source:       s.config.DiscoverClient.StorageServerID,
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

		if err := s.conn.WriteJSON(&RemoteMessage{
			Type:         "answer+candidates",
			Source:       s.config.DiscoverClient.StorageServerID,
			Destionation: source,
			Data:         peerConnection.LocalDescription(),
		}); err != nil {
			log.Warnf("Write answer error: %v", err)
		}
	} else {
		if err := s.conn.WriteJSON(&RemoteMessage{
			Type:         "answer",
			Source:       s.config.DiscoverClient.StorageServerID,
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
