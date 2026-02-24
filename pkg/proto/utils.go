package proto

import "fmt"

func SetRemoteMessagePayload(msg *RemoteMessage, payload any) error {
	v, ok := payload.(isRemoteMessage_Payload)
	if !ok {
		return fmt.Errorf("payload type %T does not implement isRemoteMessage_Payload", payload)
	}
	msg.Payload = v
	return nil
}
