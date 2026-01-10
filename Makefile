

all: neutron

neutron:
	@echo "building ./cmd/neutron/ --> ./build/bin/neutron"
	@mkdir -p ./build/bin ./build/static
	@go fmt ./... && go vet ./...
	@go build -o ./build/bin/neutron ./cmd/neutron/
	@cp -r ./html/test/* ./build/static/