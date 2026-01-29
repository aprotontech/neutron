FROM ubuntu:22.04


RUN apt update -y &&  \
    apt install -y git vim wget make fuse3 curl sudo

RUN groupadd -g 1000 kog && \
    useradd -m -u 1000 -g kog -s /bin/bash kog && \
    echo 'kog ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/kog && \
    chmod 0440 /etc/sudoers.d/kog


USER kog

RUN git config --global --add safe.directory /workspaces/neutron

# Install Go into kog's home directory (/home/kog/.local/go)
RUN ARCH=amd64; \
    mkdir -p /home/kog/.local && \
    wget https://golang.google.cn/dl/go1.23.0.linux-${ARCH}.tar.gz -O /tmp/go1.23.0.linux-${ARCH}.tar.gz && \
    tar -C /home/kog/.local -xzf /tmp/go1.23.0.linux-${ARCH}.tar.gz && \
    /home/kog/.local/go/bin/go env -w GOPROXY=https://goproxy.cn,direct && \
    rm -f /tmp/go1.23.0.linux-${ARCH}.tar.gz

# Add Go bin and GOPATH to kog's bashrc
RUN GO_HOME=$(/home/kog/.local/go/bin/go env GOPATH); \
    echo 'export PATH=$PATH:/home/kog/.local/go/bin:'$GO_HOME >>/home/kog/.bashrc

# Install NVM for kog (installs into /home/kog/.nvm) and install Node 20
RUN export NVM_SOURCE=https://gitee.com/mirrors/nvm.git && \
    curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash && \
    echo 'export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node' >>/home/kog/.bashrc


RUN export NVM_DIR="/home/kog/.nvm" && \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
    nvm install 20


