

all: neutron

neutron:
	@echo "building ./cmd/neutron/ --> ./build/bin/neutron"
	@rm -rf ./build/www ./build/etc
	@mkdir -p ./build/bin ./build/www ./build/etc
	@go fmt ./... && go vet ./...
	@go build -o ./build/bin/neutron ./cmd/neutron/
	@cp ./etc/config.yaml ./build/etc/
	@cp ./etc/passwords.txt ./build/etc/
	@cp -r ui/www ./build

local-test: neutron
	@cd ./build && ./bin/neutron server test

html:
	@cd ui && npm run build

remote: neutron html
	@bash ./test/remote/update.sh

web:
	@cd ui && npm run dev

android: html
	@cd ui && npx cap sync android && cd android && ./gradlew clean &&./gradlew assembleDebug

online: android neutron
	@TO=dev01 bash ./test/remote/update.sh