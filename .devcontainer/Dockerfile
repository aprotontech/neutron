FROM ubuntu:22.04


RUN apt update -y &&  \
    apt install -y git vim wget make fuse3


RUN ARCH=amd64; \
    wget https://golang.google.cn/dl/go1.23.0.linux-${ARCH}.tar.gz -O /tmp/go1.23.0.linux-${ARCH}.tar.gz && \
    tar -C /usr/local -xzf /tmp/go1.23.0.linux-${ARCH}.tar.gz && \
    /usr/local/go/bin/go env -w GOPROXY=https://goproxy.cn,direct && \
    git config --global --add safe.directory /workspaces/neutron

RUN GO_HOME=$(/usr/local/go/bin/go env GOPATH); \
    echo 'export PATH=$PATH:/usr/local/go/bin:'$GO_HOME >>/root/.bashrc
