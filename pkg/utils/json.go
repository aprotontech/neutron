package utils

import "encoding/json"

func JsonEncode(v any) string {
	m, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}

	return string(m)
}
