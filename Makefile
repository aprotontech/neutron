

all: neutron

neutron:
	@echo "building ./cmd/neutron/ --> ./build/bin/neutron"
	@mkdir -p ./build/bin ./build/static ./build/etc
	@go fmt ./... && go vet ./...
	@go build -o ./build/bin/neutron ./cmd/neutron/
	@cp ./etc/config.yaml ./build/etc/
	@cp ./etc/passwords.txt ./build/etc/

local-test: neutron
	@cd ./build && ./bin/neutron server test


remote: neutron
	@bash ./test/remote/update.sh