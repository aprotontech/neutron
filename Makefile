
ENV ?= development

VITE_NEUTRON_HTTP_API ?= http://192.168.1.115:8080
VITE_NEUTRON_WEBSOCKET_ADDR ?= ws://192.168.1.115:8080/ws

all: neutron



ifeq ($(ENV), production)
	VITE_NEUTRON_HTTP_API = https://www.huxiaolong.cn
	VITE_NEUTRON_WEBSOCKET_ADDR = wss://www.huxiaolong.cn/ws
endif

neutron:
	@echo "building ./cmd/neutron/ --> ./build/bin/neutron"
	@rm -rf ./build/www ./build/etc
	@mkdir -p ./build/bin ./build/www ./build/etc
	@go fmt ./... && go vet ./...
	@CGO_ENABLED=1 go build -o ./build/bin/neutron ./cmd/neutron/
	@cp ./etc/config.yaml ./build/etc/
	@cp ./etc/passwords.txt ./build/etc/
	@cp -r ui/www ./build

local-test: neutron
	@cd ./build && ./bin/neutron server start

html:
	@cd ui && rm -rf  www && VITE_NEUTRON_HTTP_API=$(VITE_NEUTRON_HTTP_API) \
		VITE_NEUTRON_WEBSOCKET_ADDR=$(VITE_NEUTRON_WEBSOCKET_ADDR) \
		npm run build

remote: neutron html
	@bash ./test/remote/update.sh

web:
	@cd ui && npm run dev

android: html
	@cd ui && npx cap sync android && cd android && ./gradlew clean &&./gradlew assembleDebug
	@if [ "$(INSTALL)" = "1" ]; then \
		echo "install to android"; \
		adb install -r -d ./ui/android/app/build/outputs/apk/debug/app-debug.apk; \
	fi

online: android neutron
	@TO=dev01 bash ./test/remote/update.sh