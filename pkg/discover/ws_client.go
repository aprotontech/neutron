package discover

import (
	"context"
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"fmt"
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

	return remoteClient.Start(nil, source, sdp)
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
