# neutron
Neutron is a family file service

## Development

To build the project, use the make command:

```sh
make

# protoc --go_out=../pkg/proto/ --go_opt=paths=source_relative ./*.proto
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


netsh advfirewall firewall add rule name="开放端口" dir=in action=allow protocol=TCP localport=



#
```shell
adb pair 192.168.1.77:42415
adb connect 192.168.1.75:38751
adb install -r -d /workspaces/neutron/ui/android/app/build/outputs/apk/debug/app-debug.apk

adb logcat | grep -i Capacitor | grep 192.168
```

```shell
DEBUG_WEBSITE_URL=http://192.168.1.117:5173 INSTALL=1 make android
DEBUG_WEBSITE_URL=https://www.huxiaolong.cn INSTALL=1 make android
```