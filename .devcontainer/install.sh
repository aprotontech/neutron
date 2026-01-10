set -ex

apt update 

apt install -y git vim wget make fuse3

ROOT=$(cd $(dirname $0);pwd)

ARCH=$([[ "$(uname -m)" == "x86_64" ]] && echo "amd64" || ([[ "$(uname -m)" == "aarch64" ]] && echo "arm64" || echo "$(uname -m)"))

if [ ! -f $ROOT/go1.23.0.linux-${ARCH}.tar.gz ]; then
    wget https://golang.google.cn/dl/go1.23.0.linux-${ARCH}.tar.gz -O $ROOT/go1.23.0.linux-${ARCH}.tar.gz
fi

tar -C /usr/local -xzf $ROOT/go1.23.0.linux-${ARCH}.tar.gz

GO_HOME=$(/usr/local/go/bin/go env GOPATH)
echo 'export PATH=$PATH:/usr/local/go/bin:'$GO_HOME >>/root/.bashrc

/usr/local/go/bin/go env -w GOPROXY=https://goproxy.cn,direct

git config --global --add safe.directory /workspaces/neutron