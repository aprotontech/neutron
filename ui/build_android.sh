PROJECT_DIR=/home/kog/neutron

CACHE_DIR=$PROJECT_DIR/ui/.cache

mkdir -p $CACHE_DIR/android-sdk $CACHE_DIR/gradle $CACHE_DIR/android

#echo "systemProp.socksProxyHost=192.168.1.27" >  $CACHE_DIR/gradle/gradle.properties
#echo "systemProp.socksProxyPort=30808" >> $CACHE_DIR/gradle

docker run --rm --userns=keep-id -v $PROJECT_DIR:/workspace/neutron \
    -v $CACHE_DIR/android-sdk:/opt/android-sdk \
    -v $CACHE_DIR/gradle:/home/kog/.gradle \
    -v $CACHE_DIR/android:/home/kog/.android \
    -w /workspace/neutron/ui/android -it localhost/android-builder:latest bash

# docker run --rm -v $PROJECT_DIR/android:/workspace \
#     -w /workspace docker.io/mobiledevops/android-sdk-image:34.0.1 ./gradlew assembleRelease\


# ./gradlew clean
# ./gradlew :capacitor-android:assembleRelease
# ./gradlew assembleRelease



keytool -genkey -v \
  -keystore android/app/aproton-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias $ANDROID_KEY_ALIAS \
  -storetype JKS \
  -storepass $ANDROID_KEYSTORE_PASSWORD \
  -keypass $ANDROID_KEY_PASSWORD \
  -dname "CN=www.aproton.tech, OU=Development, O=aproton, L=HangZhou, ST=Zhejiang, C=CN"