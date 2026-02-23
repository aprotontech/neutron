
ENV ?= development

VITE_NEUTRON_HTTP_API = http://192.168.1.115:8080
VITE_NEUTRON_WEBSOCKET_ADDR = ws://192.168.1.115:8080/ws
ANDROID_APK_PATH = ./ui/android/app/build/outputs/apk/debug/app-debug.apk
ANDROID_BUILD_TYPE = assembleDebug

ifeq ($(ENV), production)
	VITE_NEUTRON_HTTP_API = https://www.huxiaolong.cn
	VITE_NEUTRON_WEBSOCKET_ADDR = wss://www.huxiaolong.cn/ws
	ANDROID_APK_PATH = ./ui/android/app/build/outputs/apk/release/app-release.apk
	ANDROID_BUILD_TYPE = assembleRelease
endif

all: neutron

proto:
	@echo "generating protobuf javascript files using protobufjs"
	@cd ui && npm run proto

neutron:
	@echo "building ./cmd/neutron/ --> ./build/bin/neutron"
	@rm -rf ./build/www ./build/etc
	@mkdir -p ./build/bin ./build/www ./build/etc
	@go fmt ./... && go vet ./...
	@CGO_ENABLED=1 go build -o ./build/bin/neutron ./cmd/neutron/
	@cp ./etc/config.yaml ./build/etc/
	@cp ./etc/passwords.txt ./build/etc/

local-test: neutron
	@cd ./build && ./bin/neutron server start

html:
	@echo $(VITE_NEUTRON_HTTP_API)
	@cd ui && rm -rf  www && VITE_NEUTRON_HTTP_API=$(VITE_NEUTRON_HTTP_API) \
		VITE_NEUTRON_WEBSOCKET_ADDR=$(VITE_NEUTRON_WEBSOCKET_ADDR) \
		npm run build
	@cp -r ui/www ./build

remote: neutron html
	@bash ./test/remote/update.sh

web:
	@cd ui && npm run dev

android: html
	@if [ "$(ENV)" = "production" ]; then \
		export DEBUG_WEBSITE_URL=; \
	fi

	@cd ui && export $$(cat .env | xargs) && npx cap sync android && cd android && ./gradlew clean &&./gradlew $(ANDROID_BUILD_TYPE)

	@if [ "$(INSTALL)" = "1" ]; then \
		echo "install to android"; \
		adb install -r -d $(ANDROID_APK_PATH); \
	fi

online: neutron
	@make android ENV=production
	@TO=dev01 bash ./test/remote/update.sh
	@TO=dev02 bash ./test/remote/update.sh