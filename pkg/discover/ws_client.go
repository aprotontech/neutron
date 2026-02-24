package discover

import (
	"context"
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	webrtc "github.com/pion/webrtc/v4"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	structpb "google.golang.org/protobuf/types/known/structpb"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/pkg/fs"
	"github.com/aproton/neutron/pkg/local"
	"github.com/aproton/neutron/pkg/meta"
	neutronproto "github.com/aproton/neutron/pkg/proto"
	"github.com/aproton/neutron/pkg/utils/log"
)

type FileAPI func(dcm *RemoteStorageServer, client *WebRTCRemoteClient, req any) (any, error)

type RemoteStorageServer struct {
	conn *websocket.Conn

	mutex sync.RWMutex

	config *config.Config

	remoteClients map[string]*WebRTCRemoteClient

	api *webrtc.API

	fileAPIS map[string]FileAPI

	db *gorm.DB

	filesystem fs.FileSystem
	repo       *meta.Repository

	version string

	combineAnswerCandidates bool
}

func NewRemoteStorageServer(config *config.Config) *RemoteStorageServer {
	if config == nil || config.DiscoverClient == nil || config.Users == nil {
		panic("invalidate config")
	}

	if config.Driver.BackendType != "sqlite" {
		panic("unsupported database driver: " + config.Driver.BackendType)
	}

	if err := os.MkdirAll(config.Cache.CacheDir, 0755); err != nil {
		panic(err)
	}
	if err := os.MkdirAll(filepath.Dir(config.Driver.Sqlite), 0755); err != nil {
		panic(err)
	}

	gdb, err := gorm.Open(sqlite.Open(config.Driver.Sqlite), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	return &RemoteStorageServer{
		config:                  config,
		conn:                    nil,
		remoteClients:           map[string]*WebRTCRemoteClient{},
		api:                     nil,
		combineAnswerCandidates: true,
		db:                      gdb,
		fileAPIS: map[string]FileAPI{
			"listFiles":            getFileList,
			"prepareFileReceive":   prepareFileReceive,
			"getThumbnail":         getThumbnail,
			"playVideo":            playVideo,
			"getImageRepoHistory":  getImageRepoHistory,
			"getFileInfo":          getFileInfo,
			"getFileSystemVersion": getFileSystemVersion,
		},
		filesystem: fs.NewFileSystemDatabase(config, gdb),
		repo:       meta.NewRepo(gdb),
	}
}

func (s *RemoteStorageServer) Start(ctx context.Context) error {
	scanner := local.NewLocalFileSystemScanner(s.config, s.db)
	if err := scanner.Start(ctx); err != nil {
		log.Warnf("start local file system scanner error: %v", err)
		return err
	}

	s.version = scanner.GetVersion()

	if s.filesystem != nil {
		go s.filesystem.Start(ctx)
	}

	if s.repo != nil {
		go s.repo.Start(ctx)
	}

	settingEngine := webrtc.SettingEngine{}
	s.api = webrtc.NewAPI(webrtc.WithSettingEngine(settingEngine))

	// Create login request using protobuf
	loginReq := &neutronproto.LoginRequest{
		ClientId:        s.config.DiscoverClient.StorageServerID,
		Username:        s.config.DiscoverClient.StorageServerID,
		Password:        s.config.DiscoverClient.Password,
		StorageServerId: s.config.DiscoverClient.StorageServerID,
	}

	loginReqBytes, _ := proto.Marshal(loginReq)
	conn, _, err := websocket.DefaultDialer.Dial(s.config.DiscoverClient.WebSocketURL, http.Header{
		"Authorization": []string{"Bearer " + base64.StdEncoding.EncodeToString(loginReqBytes)},
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

		messageType, msg, err := s.conn.ReadMessage()
		if err != nil {
			log.Warnf("Read error:", err)
			return err
		}

		log.Debugf("Received message type: %d, length: %d", messageType, len(msg))

		var signal neutronproto.RemoteMessage

		// 根据消息类型进行解析
		if messageType == websocket.BinaryMessage {
			// 二进制消息：protobuf格式
			if err := proto.Unmarshal(msg, &signal); err != nil {
				log.Warnf("protobuf unmarshal error:", err)
				continue
			}
		} else if messageType == websocket.TextMessage {
			// 文本消息：JSON格式（向后兼容）
			if err := protojson.Unmarshal(msg, &signal); err != nil {
				log.Warnf("JSON unmarshal error:", err)
				continue
			}
		} else {
			log.Warnf("unsupported message type: %d", messageType)
			continue
		}

		log.Infof("Received signal: type=%s, source=%s, id=%s", signal.Type, signal.Source, signal.Id)

		switch signal.Type {
		case "authorizen":
			// Extract login request from payload
			loginReq := signal.GetLoginRequest()
			if loginReq == nil {
				log.Warnf("authorizen payload is empty or not a LoginRequest")
				continue
			}

			username := loginReq.GetUsername()
			password := loginReq.GetPassword()

			if username != "" && password != "" {
				ok, err := CheckPassword(username, password)
				if ok || err != nil {
					token := md5.Sum([]byte(uuid.NewString()))

					// Create LoginResponse payload
					loginResp := &neutronproto.LoginResponse{
						Token: hex.EncodeToString(token[:]),
					}

					responseMsg := &neutronproto.RemoteMessage{
						Type:        "callAck",
						Source:      s.config.DiscoverClient.StorageServerID,
						Destination: signal.Source,
						Id:          signal.Id,
					}
					// Set LoginResponse as payload
					responseMsg.Payload = &neutronproto.RemoteMessage_LoginResponse{
						LoginResponse: loginResp,
					}

					data, err := proto.Marshal(responseMsg)
					if err == nil {
						if err := s.conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
							log.Warnf("Write regist message error: %v", err)
							return err
						}
					} else {
						log.Warnf("protobuf marshal regist message error: %v", err)
					}
				} else {
					log.Warnf("check login data error: %v", err)
				}
			}

		case "offer":
			// Extract offer SDP from payload
			offerContent := signal.GetWebrtcOfferContent()
			if offerContent == nil {
				log.Warnf("offer payload is empty or not a WebRTCOfferContent")
				continue
			}

			if offerContent.Sdp != "" {
				if err := s.setupRemoteConnection(signal.Source, offerContent.Sdp); err != nil {
					log.Warnf("Setup remote connection error: %v", err)
				}
			} else {
				log.Warnf("Get remote offer error: sdp empty")
			}

		case "candidate":
			// Extract candidate from payload
			candidateContent := signal.GetWebrtcCandidateContent()
			if candidateContent == nil {
				log.Warnf("candidate payload is empty or not a WebRTCCandidateContent")
				continue
			}

			if candidateContent.Candidate != "" {
				candidate := webrtc.ICECandidateInit{
					Candidate: candidateContent.Candidate,
				}

				if pc, exists := s.remoteClients[signal.Source]; exists {
					if err := pc.peerConnection.AddICECandidate(candidate); err != nil {
						log.Warnf("AddICECandidate error: %v", err)
					}
				}
			} else {
				log.Warnf("Get remote candidate error: candidate empty")
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

	remoteClient := NewWebRTCRemoteClient(peerConnection)

	s.mutex.Lock()
	s.remoteClients[source] = remoteClient
	s.mutex.Unlock()

	peerConnection.OnConnectionStateChange(func(pcs webrtc.PeerConnectionState) {
		log.Infof("Connect status changed to %v", pcs)
	})
	peerConnection.OnICEConnectionStateChange(func(is webrtc.ICEConnectionState) {
		log.Infof("ICE Connect status changed to %v", is)
	})

	peerConnection.OnDataChannel(func(dataChannel *webrtc.DataChannel) {
		log.Infof("New DataChannel %s %d", dataChannel.Label(), dataChannel.ID())

		if dataChannel.Label() == "thumbnail" {
			remoteClient.thumbnailDC = dataChannel
		}

		dataChannel.OnOpen(func() {
			log.Infof("Data channel '%s' open", dataChannel.Label())
			if dcInfo, ok := remoteClient.dcFileMap[dataChannel.Label()]; ok {
				// 打开文件
				file, err := os.Open(dcInfo.path)
				if err != nil {
					log.Warnf("Open file %s error: %v", dcInfo.path, err)
					dataChannel.Close()
					return
				}
				defer file.Close()

				// 如果指定了偏移量，则定位到指定位置
				if dcInfo.offset > 0 {
					_, err = file.Seek(dcInfo.offset, 0)
					if err != nil {
						log.Warnf("Seek file %s to offset %d error: %v", dcInfo.path, dcInfo.offset, err)
						dataChannel.Close()
						return
					}
				}

				// 计算需要读取的数据大小
				var totalSize int64
				if dcInfo.size > 0 {
					totalSize = dcInfo.size
				}

				chunkSize := 16 * 1024 // 16KB 块大小
				remaining := totalSize
				buffer := make([]byte, chunkSize)

				for {
					// 计算本次读取的大小
					readSize := chunkSize
					if remaining > 0 && remaining < int64(chunkSize) {
						readSize = int(remaining)
					}

					// 读取数据
					n, err := file.Read(buffer[:readSize])
					if err != nil && err != io.EOF {
						log.Warnf("Read file %s error: %v", dcInfo.path, err)
						dataChannel.Close()
						return
					}

					if n == 0 {
						break // 文件结束
					}

					// 发送数据块
					if err := dataChannel.Send(buffer[:n]); err != nil {
						log.Warnf("Send file %s data error: %v", dcInfo.path, err)
						dataChannel.Close()
						return
					}

					if remaining > 0 {
						remaining -= int64(n)
					}
				}

				log.Infof("Sent file %s data on data channel %s, offset=%d, size=%d",
					dcInfo.path, dataChannel.Label(), dcInfo.offset, totalSize)
			}
		})

		dataChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
			if dataChannel.Label() == "rpc" {
				var m neutronproto.RemoteMessage
				// WebRTC数据通道使用protobuf二进制格式
				if err := proto.Unmarshal(msg.Data, &m); err != nil {
					log.Warnf("protobuf unmarshal data channel message error: %v", err)
					return
				}

				log.Infof("Received RPC message: type=%s, source=%s, id=%s, payload=%v",
					m.Type, m.Source, m.Id, m.Payload)

				var response any
				if api, ok := s.fileAPIS[m.Type]; ok {
					response, err = api(s, remoteClient, m.GetPayload())
					if err != nil {
						log.Warnf("File API %s error: %v", m.Type, err)
						// Convert error to appropriate response type
						response = &neutronproto.ErrorMessage{
							Success: false,
							Error:   err.Error(),
						}
					}

				} else {
					response = &neutronproto.ErrorMessage{
						Error: "unknown api " + m.Type,
					}
				}

				// Create response message
				resMsg := s.createResponseMessage(response, m.Id, source)

				res, err := proto.Marshal(resMsg)
				if err != nil {
					log.Warnf("protobuf marshal file list message error: %v", err)
					return
				}
				if err := dataChannel.Send(res); err != nil {
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

			// Create candidate payload using WebRTCCandidateContent
			candidateContent := &neutronproto.WebRTCCandidateContent{
				Candidate: candidate.ToJSON().Candidate,
			}

			candidateMsg := &neutronproto.RemoteMessage{
				Type:        "candidate",
				Source:      s.config.DiscoverClient.StorageServerID,
				Destination: source,
			}
			// Set WebRTCCandidateContent as payload
			candidateMsg.Payload = &neutronproto.RemoteMessage_WebrtcCandidateContent{
				WebrtcCandidateContent: candidateContent,
			}

			data, err := proto.Marshal(candidateMsg)
			if err != nil {
				log.Warnf("protobuf marshal candidate message error: %v", err)
			} else if err := s.conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
				log.Warnf("Write candidate error: %v", err)
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

		// Create answer+candidates payload using WebRTCAnswerCandidatesContent
		answerCandidatesContent := &neutronproto.WebRTCAnswerCandidatesContent{
			Sdp:  peerConnection.LocalDescription().SDP,
			Type: peerConnection.LocalDescription().Type.String(),
		}

		answerMsg := &neutronproto.RemoteMessage{
			Type:        "answer+candidates",
			Source:      s.config.DiscoverClient.StorageServerID,
			Destination: source,
		}
		// Set WebRTCAnswerCandidatesContent as payload
		answerMsg.Payload = &neutronproto.RemoteMessage_WebrtcAnswerCandidatesContent{
			WebrtcAnswerCandidatesContent: answerCandidatesContent,
		}

		data, err := proto.Marshal(answerMsg)
		if err != nil {
			log.Warnf("protobuf marshal answer message error: %v", err)
		} else if err := s.conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
			log.Warnf("Write answer error: %v", err)
		}
	} else {
		// Create answer payload using WebRTCAnswerContent
		answerContent := &neutronproto.WebRTCAnswerContent{
			Sdp: peerConnection.LocalDescription().SDP,
		}

		answerMsg := &neutronproto.RemoteMessage{
			Type:        "answer",
			Source:      s.config.DiscoverClient.StorageServerID,
			Destination: source,
		}
		// Set WebRTCAnswerContent as payload
		answerMsg.Payload = &neutronproto.RemoteMessage_WebrtcAnswerContent{
			WebrtcAnswerContent: answerContent,
		}

		data, err := proto.Marshal(answerMsg)
		if err != nil {
			log.Warnf("protobuf marshal answer message error: %v", err)
		} else if err := s.conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
			log.Warnf("Write answer error: %v", err)
		}
	}

	return nil
}

// createResponseMessage creates a RemoteMessage with appropriate payload based on response type
func (s *RemoteStorageServer) createResponseMessage(
	response any, id string, source string) *neutronproto.RemoteMessage {
	resMsg := &neutronproto.RemoteMessage{
		Type:        "@response",
		Source:      s.config.DiscoverClient.StorageServerID,
		Id:          id,
		Destination: source,
	}

	if err := neutronproto.SetRemoteMessagePayload(resMsg, response); err != nil {
		log.Warnf("SetRemoteMessagePayload error: %v", err)
		// Fallback to generic error response if payload setting fails
		log.Warnf("failed to set response payload: %v", err)
		resMsg.Payload = &neutronproto.RemoteMessage_Error{
			Error: &neutronproto.ErrorMessage{
				Success: false,
				Error:   fmt.Sprintf("failed to set response payload: %v", err),
				Details: &structpb.Struct{
					Fields: map[string]*structpb.Value{
						"original_response": structpb.NewStringValue(fmt.Sprintf("%v", response)),
					},
				},
			},
		}
	}

	return resMsg
}
