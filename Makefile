

all: neutron
	echo "test"

neutron:
	go build -o ./build/neturon ./cmd/neutron/