# 赛尔号精灵养成游戏 - 部署指南

## 系统要求

- **Node.js** >= 16 (推荐 18 LTS)
- **npm** >= 8
- Linux/macOS/Windows 服务器均可

## 快速部署

### 1. 上传项目文件

将整个 `saierhao` 目录上传到服务器，例如 `/opt/saierhao`

```bash
scp -r ./saierhao user@your-server:/opt/saierhao
```

### 2. 安装 Node.js（如未安装）

```bash
# 使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 3. 安装依赖

```bash
cd /opt/saierhao
npm install --production
```

### 4. 配置环境变量（可选）

```bash
# 修改端口（默认3000）
export PORT=3000

# 修改 JWT 密钥（建议生产环境修改）
export JWT_SECRET="your-super-secret-key-here"
```

### 5. 启动服务

```bash
# 前台运行（测试用）
node server.js

# 后台运行（生产用，推荐使用 pm2）
npm install -g pm2
pm2 start server.js --name saierhao
pm2 save
pm2 startup  # 开机自启
```

### 6. Nginx 反向代理（推荐）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# 重载 Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 7. HTTPS（可选但推荐）

```bash
# 使用 Let's Encrypt 免费证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 数据备份

数据库文件位于 `db/saierhao.db`，定期备份即可：

```bash
# 备份
cp db/saierhao.db db/saierhao.db.backup.$(date +%Y%m%d)

# 恢复
cp db/saierhao.db.backup.20260101 db/saierhao.db
```

## 管理命令

```bash
# 查看日志
pm2 logs saierhao

# 重启
pm2 restart saierhao

# 停止
pm2 stop saierhao

# 查看状态
pm2 status
```

## 注意事项

- 首次启动会自动创建数据库
- 默认端口 3000，可通过 `PORT` 环境变量修改
- WebSocket 用于 PVP 对战，Nginx 配置需要包含 `Upgrade` 和 `Connection` 头
- 生产环境务必修改 `JWT_SECRET` 环境变量
