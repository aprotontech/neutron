# Protobuf 文件生成说明

## 问题背景
之前使用 `protoc` 生成的 JavaScript 文件使用 CommonJS 模块格式，在浏览器环境中会出现 `exports is not defined` 错误。

## 解决方案
使用 `protobufjs-cli` 的 `pbjs` 工具生成 ES6 模块格式的 protobuf 文件，更适合现代前端构建工具（如 Vite）。

## 使用方法

### 生成 protobuf 文件
```bash
# 在项目根目录
make proto

# 或者在 ui 目录
npm run proto
```

### 构建项目
```bash
# 开发模式
npm run dev

# 生产构建
npm run build
```

## 文件结构
- 生成的 protobuf 文件：`src/lib/proto/neutron_pb.js`
- 包含所有 protobuf 定义（message.proto, fileapi.proto, user.proto, webrtc.proto）

## 导入方式
在代码中导入 protobuf 定义：
```javascript
import { neutron } from '../proto/neutron_pb.js';

// 使用示例
const RemoteMessage = neutron.RemoteMessage;
```

## 依赖
- `protobufjs-cli`: 用于生成 protobuf 文件
- `protobufjs/minimal`: 运行时依赖（已自动包含在生成的文件中）

## 注意事项
1. 生成的文件是 ES6 模块格式，与 Vite 兼容
2. 不再需要 CommonJS 转换插件
3. 文件较大（~2.5KB），但已优化