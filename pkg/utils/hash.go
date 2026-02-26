package utils

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
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

func HashFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := md5.New()

	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil

}

func HashToPath(data any, titleLen int, depthCount int) (string, string, error) {
	hash := Hash(data, 32)

	if titleLen <= 0 || depthCount <= 0 || titleLen*depthCount >= len(hash) {
		return "", "", fmt.Errorf("hash length (%d) <= title(%d)*depth(%d)", len(hash), titleLen, depthCount)
	}

	var pathParts []string

	for i := range depthCount {
		start := i * titleLen
		end := start + titleLen
		pathParts = append(pathParts, hash[start:end])
	}

	return strings.Join(pathParts, "/"), hash[(depthCount * titleLen):], nil
}
