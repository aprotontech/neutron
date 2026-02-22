FROM ubuntu:22.04


RUN apt update -y &&  \
    apt install -y git vim wget make fuse3 curl sudo

RUN groupadd -g 1000 aproton && \
    useradd -m -u 1000 -g aproton -s /bin/bash aproton && \
    echo 'aproton ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/aproton && \
    chmod 0440 /etc/sudoers.d/aproton

USER aproton

RUN git config --global --add safe.directory /workspaces/neutron

# Install Go into aproton's home directory (/home/aproton/.local/go)
RUN ARCH=amd64; \
    mkdir -p /home/aproton/.local && \
    wget https://golang.google.cn/dl/go1.23.0.linux-${ARCH}.tar.gz -O /tmp/go1.23.0.linux-${ARCH}.tar.gz && \
    tar -C /home/aproton/.local -xzf /tmp/go1.23.0.linux-${ARCH}.tar.gz && \
    /home/aproton/.local/go/bin/go env -w GOPROXY=https://goproxy.cn,direct && \
    rm -f /tmp/go1.23.0.linux-${ARCH}.tar.gz

# Add Go bin and GOPATH to aproton's bashrc
RUN GO_HOME=$(/home/aproton/.local/go/bin/go env GOPATH); \
    echo 'export PATH=$PATH:/home/aproton/.local/go/bin:'$GO_HOME >>/home/aproton/.bashrc

# Install NVM for aproton (installs into /home/aproton/.nvm) and install Node 20
RUN export NVM_SOURCE=https://gitee.com/mirrors/nvm.git && \
    curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash && \
    echo 'export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node' >>/home/aproton/.bashrc


RUN export NVM_DIR="/home/aproton/.nvm" && \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
    nvm install 22

USER root
RUN apt-get update && apt-get install -y \
    curl wget unzip git openjdk-21-jdk sudo \
    && rm -rf /var/lib/apt/lists/*

USER aproton
# Install Android SDK
ENV ANDROID_HOME=/home/aproton/.android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools/bin
ENV GRADLE_USER_HOME=/home/aproton/.gradle

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools

RUN cd ${ANDROID_HOME}/cmdline-tools && \
    curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -o cmdline-tools.zip && \
    unzip -q cmdline-tools.zip && \
    rm cmdline-tools.zip && \
    mv cmdline-tools latest

RUN yes | sdkmanager --licenses

RUN sdkmanager \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0"

RUN ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --sdk_root=${ANDROID_HOME} --list

RUN mkdir -p ${GRADLE_USER_HOME} && \
    echo "org.gradle.caching=true" >> ${GRADLE_USER_HOME}/gradle.properties && \
    echo "org.gradle.parallel=true" >> ${GRADLE_USER_HOME}/gradle.properties && \
    echo "org.gradle.daemon=false" >> ${GRADLE_USER_HOME}/gradle.properties && \
    echo "systemProp.http.keepAlive=true" >> ${GRADLE_USER_HOME}/gradle.properties

RUN sudo apt-get update && sudo apt-get install -y gcc libsqlite3-dev protobuf-compiler

RUN alias go=/home/aproton/.local/go/bin/go; \
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest