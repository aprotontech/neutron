

all: neutron

neutron:
	@echo "building ./cmd/neutron/ --> ./build/bin/neutron"
	@mkdir -p ./build/bin ./build/static ./build/etc
	@go fmt ./... && go vet ./...
	@go build -o ./build/bin/neutron ./cmd/neutron/
	@rm -rf ./build/static/*
	@cp -r ./html/fileviewer/* ./build/static/
	@cp ./etc/config.yaml ./build/etc/

local-test: neutron
	@cd ./build && ./bin/neutron server test --config ../etc/config.yaml


remote: neutron
	@bash ./test/remote/update.sh