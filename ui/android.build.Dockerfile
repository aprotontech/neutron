FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl wget unzip git openjdk-21-jdk sudo \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1000 kog && \
    useradd -m -u 1000 -g kog -s /bin/bash kog && \
    echo 'kog ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/kog && \
    chmod 0440 /etc/sudoers.d/kog

ENV ANDROID_HOME=/home/kog/.android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools/bin
ENV GRADLE_USER_HOME=/home/kog/.gradle

USER kog

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

WORKDIR /app

VOLUME ["/app", "/home/kog/.android-sdk", "/home/kog/.gradle", "/home/kog/.android"]

CMD ["bash"]