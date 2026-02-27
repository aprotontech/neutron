package discover

import webrtc "github.com/pion/webrtc/v4"

type WebRTCRemoteClient struct {
	peerConnection *webrtc.PeerConnection
	thumbnailDC    *webrtc.DataChannel
	dcFileMap      map[string]*WebRTCFileSender
}
