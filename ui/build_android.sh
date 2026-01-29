PROJECT_DIR=/home/huxiaolong/projects/neutron/ui

CACHE_DIR=$PROJECT_DIR/cache

docker run --rm -v $PROJECT_DIR/android:/workspace \
    -v $CACHE_DIR/android:/usr/local/android \
    -v $CACHE_DIR/.gradle:/home/runner/.gradle \
    -v $CACHE_DIR/.android:/home/runner/.android \
    -v $PROJECT_DIR/node_modules:/node_modules \
    -e HTTPS_PROXY=socks5://192.168.1.115:30808 \
    -w /workspace -it centralx/android:16.0 bash

# docker run --rm -v $PROJECT_DIR/android:/workspace \
#     -w /workspace docker.io/mobiledevops/android-sdk-image:34.0.1 ./gradlew assembleRelease\


# ./gradlew clean
# ./gradlew :capacitor-android:assembleRelease
# ./gradlew assembleRelease