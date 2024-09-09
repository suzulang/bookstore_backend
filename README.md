update README

# 书店后端项目

## 安装和运行

1. 安装依赖：
   ```
   npm install
   ```

2. 启动项目：
   ```
   npm start
   ```

## 前置条件

### MongoDB

在启动项目之前，您需要安装并配置 MongoDB。

#### MongoDB 版本

本项目使用的是 MongoDB 4.4 或更高版本。请确保您安装的 MongoDB 版本与此兼容。

#### MongoDB 配置

1. 安装 MongoDB：
   请访问 [MongoDB 官方网站](https://www.mongodb.com/try/download/community) 下载并安装适合您操作系统的 MongoDB 版本。

2. 启动 MongoDB 服务：
   安装完成后，请确保 MongoDB 服务已经启动。

3. 配置连接：
   在项目的 `.env` 文件中，设置 MongoDB 的连接 URL。例如：
   ```
   MONGODB_URI=mongodb://localhost:27017/your_database_name
   ```

   请将 `your_database_name` 替换为您想使用的数据库名称。

4. 确保 MongoDB 正在运行：
   在启动项目之前，请确保 MongoDB 服务正在运行。

## 注意事项

- 本项目使用 `nodemon` 进行开发时的自动重启。
- 确保您的环境变量（如数据库连接、JWT 密钥等）已正确配置在 `.env` 文件中。

