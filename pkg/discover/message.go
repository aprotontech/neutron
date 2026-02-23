package discover

// type RemoteMessage struct {
// 	Type         string      `json:"type"`
// 	Source       string      `json:"source"`
// 	Destionation string      `json:"destination"`
// 	ID           string      `json:"id,omitempty"`
// 	Data         interface{} `json:"data"`

// 	mapData  *map[string]interface{}
// 	msgBytes []byte
// }

type LoginRequest struct {
	ClientID        string `json:"clientID"`
	Username        string `json:"username"`
	Password        string `json:"password"`
	StorageServerID string `json:"storageServerID"`
}

type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Token   string `json:"token"`
}

// type WebRTCOfferContent struct {
// 	SDP string `json:"sdp"`
// }

// type WebRTCCandidateContent struct {
// 	Candidate string `json:"candidate"`
// }

// func (m *RemoteMessage) getDataValue(key string) (interface{}, error) {
// 	if m.Data == nil {
// 		return nil, errors.New("data is empty")
// 	}

// 	if m.mapData == nil {
// 		data, ok := m.Data.(map[string]interface{})
// 		if !ok {
// 			return nil, errors.New("Data is not map")
// 		}
// 		m.mapData = &data
// 	}

// 	v, ok := (*m.mapData)[key]
// 	if !ok {
// 		return nil, errors.New("not found key")
// 	}

// 	return v, nil
// }

// func (m *RemoteMessage) GetLoginRequest() (*LoginRequest, error) {
// 	clientID, err := m.getDataValue("clientID")
// 	if err != nil {
// 		return nil, err
// 	}

// 	password, err := m.getDataValue("password")
// 	if err != nil {
// 		return nil, err
// 	}

// 	username, err := m.getDataValue("username")
// 	if err != nil {
// 		return nil, err
// 	}

// 	storageServerID, err := m.getDataValue("storageServerID")
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &LoginRequest{
// 		ClientID:        clientID.(string),
// 		Username:        username.(string),
// 		Password:        password.(string),
// 		StorageServerID: storageServerID.(string),
// 	}, nil

// }

// func (m *RemoteMessage) GetLoginResponse() (*LoginResponse, error) {
// 	success, err := m.getDataValue("success")
// 	if err != nil {
// 		return nil, err
// 	}

// 	message, err := m.getDataValue("message")
// 	if err != nil {
// 		return nil, err
// 	}

// 	token, err := m.getDataValue("token")
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &LoginResponse{
// 		Success: success.(bool),
// 		Message: message.(string),
// 		Token:   token.(string),
// 	}, nil

// }

// func (m *RemoteMessage) GetWebRTCOfferContent() (*WebRTCOfferContent, error) {
// 	sdp, err := m.getDataValue("sdp")
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &WebRTCOfferContent{
// 		SDP: sdp.(string),
// 	}, nil
// }

// func (m *RemoteMessage) GetWebRTCCandidateContent() (*WebRTCCandidateContent, error) {
// 	candidate, err := m.getDataValue("candidate")
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &WebRTCCandidateContent{
// 		Candidate: candidate.(string),
// 	}, nil
// }
