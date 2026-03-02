package discover

import (
	"context"

	"github.com/gorilla/websocket"
	webrtc "github.com/pion/webrtc/v4"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/structpb"

	neutronproto "github.com/aproton/neutron/pkg/proto"
	"github.com/aproton/neutron/pkg/utils/log"
)

type WebRTCRemoteClient struct {
	peerConnection  *webrtc.PeerConnection
	thumbnailDC     *webrtc.DataChannel
	dcFileMap       map[string]*WebRTCFileSender
	storageServerID string
}

func NewWebRTCRemoteClient(peerConnection *webrtc.PeerConnection) *WebRTCRemoteClient {
	return &WebRTCRemoteClient{
		peerConnection: peerConnection,
		dcFileMap:      make(map[string]*WebRTCFileSender),
	}
}

func (c *WebRTCRemoteClient) Start(ctx context.Context, source string, sdp string) error {
	peerConnection := c.peerConnection

	peerConnection.OnConnectionStateChange(func(pcs webrtc.PeerConnectionState) {
		log.Infof("Connect status changed to %v", pcs)
	})
	peerConnection.OnICEConnectionStateChange(func(is webrtc.ICEConnectionState) {
		log.Infof("ICE Connect status changed to %v", is)
	})

	peerConnection.OnDataChannel(func(dataChannel *webrtc.DataChannel) {
		log.Infof("New DataChannel %s %d", dataChannel.Label(), dataChannel.ID())

		if dataChannel.Label() == "thumbnail" {
			c.thumbnailDC = dataChannel
		}

		dataChannel.OnOpen(func() {
			log.Infof("Data channel '%s' open", dataChannel.Label())
			if sender, ok := c.dcFileMap[dataChannel.Label()]; ok {
				if err := sender.Send(dataChannel); err != nil {
					log.Warnf("datachannel send file failed %s", err.Error())
					dataChannel.Close()
				}
				delete(c.dcFileMap, dataChannel.Label())
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

				log.Infof("RpcRequest[%s] type=%s, source=%s, payload=%v",
					m.Id, m.Type, m.Source, m.Payload)

				var err error
				var response any
				if api, ok := s.fileAPIS[m.Type]; ok {
					response, err = api(s, c, m.GetPayload())
					if err != nil {
						log.Warnf("File API %s error: %v", m.Type, err)
						details, _ := structpb.NewStruct(map[string]any{
							"input": m.GetPayload(),
						})
						// Convert error to appropriate response type
						response = &neutronproto.RemoteMessage_Error{
							Error: &neutronproto.ErrorMessage{
								Success: false,
								Error:   err.Error(),
								Details: details,
							},
						}
					}

				} else {
					response = &neutronproto.ErrorMessage{
						Error: "unknown api " + m.Type,
					}
				}

				log.Infof("RpcResponse[%s] payload=%v", m.Id, response)

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
				Source:      c.storageServerID,
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
			Source:      c.storageServerID,
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
			Source:      c.storageServerID,
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
}
