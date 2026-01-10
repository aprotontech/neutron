package utils

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
)

func Hash(data any, length int) string {
	var content []byte
	if v, ok := data.([]byte); ok {
		content = v
	} else if v, ok := data.(string); ok {
		content = []byte(v)
	} else {
		v, err := json.Marshal(data)
		if err != nil {
			panic(err)
		}
		content = v
	}

	hash := md5.Sum(content)

	result := hex.EncodeToString(hash[:])
	if length > 0 && length < len(result) {
		offset := int((len(result) - length) / 2)
		result = result[offset:(offset + length)]
	}

	return result
}
