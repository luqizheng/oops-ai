## 终端
1. 默认执行 powershell 命令

## 后端
1. 后端服务启动，端口为3001，不需要重复启动，他会自动热更新。如果没有启动，那么请先启动后端服务。
1. 启动后端方式 在 /backend 目录下执行 `pnpm start:debug`


## web 前端
1. 前端服务启动，端口为3000，不需要重复启动，他会自动热更新。如果没有启动，那么请先启动前端服务。
1. 启动前端方式 在 /frontend 目录下执行 `pnpm dev`
1. 优先采用 element-plus 组件库
1. 优先采用 element-plus 的 icon 库。

## 开发
1. 在 /backend 目录下执行 `pnpm start:debug` 启动后端服务。
1. 在 /frontend 目录下执行 `pnpm dev` 启动前端服务。
1. 检查端口是否被占用，kill了之后，再次重启
