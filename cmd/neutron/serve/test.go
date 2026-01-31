package serve

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/patrickmn/go-cache"
	"github.com/spf13/cobra"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/cmd/neutron/serve/test"
	"github.com/aproton/neutron/pkg/utils/log"
)

var tokenCaches *cache.Cache

type LoginInfo struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenStr := r.URL.Query().Get("token")
		if tokenStr == "" {
			tokenStr = r.Header.Get("Authorization")
		}
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")

		if tokenStr == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if _, ok := tokenCaches.Get(tokenStr); !ok {
			http.Error(w, "Invalid Token", http.StatusUnauthorized)
			return
		}

		// token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		// 	return []byte("your-secret-key"), nil
		// })

		// if err != nil || !token.Valid {
		// 	http.Error(w, "Invalidate Token", http.StatusUnauthorized)
		// 	return
		// }

		// if claims, ok := token.Claims.(jwt.MapClaims); ok {
		// 	r = r.WithContext(context.WithValue(r.Context(), "userID", claims["userID"]))
		// 	r = r.WithContext(context.WithValue(r.Context(), "username", claims["username"]))
		// }

		next(w, r)
	}
}

func testLoginHandler(w http.ResponseWriter, r *http.Request) {
	var loginInfo LoginInfo
	if err := json.NewDecoder(r.Body).Decode(&loginInfo); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	tokenString := "test-token-" + loginInfo.Username
	tokenCaches.Set(tokenString, &loginInfo, 0)

	// claims := jwt.MapClaims{
	// 	"userID":   "kog",
	// 	"username": "test-username",
	// }

	// token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// tokenString, err := token.SignedString([]byte("your-secret-key"))
	// if err != nil {
	// 	http.Error(w, "Could not generate token", http.StatusInternalServerError)
	// 	return
	// }

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write([]byte(`{"token":"` + tokenString + `"}`)); err != nil {
		log.Warnf("Error writing response: %v", err)
	}
}

func testTokenHandler(w http.ResponseWriter, r *http.Request) {
	tokenStr := r.Header.Get("Authorization")
	tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
	if tokenStr == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if _, ok := tokenCaches.Get(tokenStr); !ok {
		http.Error(w, "Invalid Token", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte(`{"token":"` + tokenStr + `"}`)); err != nil {
		log.Warnf("Error writing response: %v", err)
	}
}

func testWebRTCServer(ctx context.Context) {
	server := test.NewSignalServer()

	go server.StartStunServer(ctx)

	http.HandleFunc("/ws", authMiddleware(server.HandleWebSocket))
	http.HandleFunc("/api/login", testLoginHandler)
	http.HandleFunc("/api/token", testTokenHandler)
	log.Infof("static %s", config.GlobalConfig.WebServer.StaticFolder)
	http.Handle("/", http.FileServer(http.Dir(config.GlobalConfig.WebServer.StaticFolder)))

	tokenCaches = cache.New(6*time.Hour, 24*time.Hour)
	tokenCaches.Set("file-server-token", &LoginInfo{}, 365*24*time.Hour)

	log.Info("Signal server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func testWebRTCClient(_ context.Context) {
	sender, _ := test.NewSender("ws://localhost:8080/ws")
	//sender, _ := test.NewSender("wss://www.huxiaolong.cn/ws")
	sender.Start()
}

func Test(cmd *cobra.Command, args []string) {
	go testWebRTCClient(cmd.Context())
	testWebRTCServer(cmd.Context())
}
