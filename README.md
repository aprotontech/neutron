# neutron
Neutron is a family file service

## Development

To build the project, use the make command:

```sh
make
```

Common targets:
- make          # build the project

Ensure you have make installed on your system (e.g. apt install make on Debian/Ubuntu).


## Test

```sh
./build/neturon server start --config etc/config.yaml
```


```sh

```

# 清理构建
docker run --rm -v $(pwd):/app android-capacitor-builder \
  bash -c "cd /app/android && ./gradlew clean"

# 编译 debug APK
docker run --rm -v $(pwd):/app android-capacitor-builder \
  bash -c "cd /app/android && ./gradlew assembleDebug"

# 编译 release APK
docker run --rm -v $(pwd):/app android-capacitor-builder \
  bash -c "cd /app/android && ./gradlew assembleRelease"

# 运行测试
docker run --rm -v $(pwd):/app android-capacitor-builder \
  bash -c "cd /app/android && ./gradlew test"