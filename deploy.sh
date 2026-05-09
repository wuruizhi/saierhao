#!/bin/bash
# 赛尔号精灵养成游戏 - 一键部署脚本
# 用法: 在服务器上执行  bash deploy.sh

set -e
echo "🎮 赛尔号一键部署开始..."

# 检测是否 root，root 不需要 sudo
if [ "$(id -u)" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

# 1. 安装 Node.js
if ! command -v node &> /dev/null; then
    echo "📦 正在安装 Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | $SUDO -E bash -
    $SUDO apt-get install -y nodejs
fi
echo "✅ Node.js $(node -v)"

# 2. 安装依赖
echo "📦 安装项目依赖..."
npm install --omit=dev

# 3. 安装 pm2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 pm2..."
    $SUDO npm install -g pm2
fi

# 4. 设置环境变量（仅首次生成）
if [ ! -f .env ]; then
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
    echo "JWT_SECRET=$JWT_SECRET" > .env
    echo "PORT=3000" >> .env
    echo "✅ 已生成 .env 文件"
fi

# 5. 启动/重启应用
pm2 delete saierhao 2>/dev/null || true
pm2 start server.js --name saierhao
pm2 save
pm2 startup 2>/dev/null || true

# 6. 安装并配置 Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 安装 Nginx..."
    $SUDO apt-get install -y nginx
fi

tee /etc/nginx/sites-available/saierhao > /dev/null <<'NGINX'
server {
    listen 9527 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/saierhao /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 7. 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "你的服务器IP")

echo ""
echo "========================================="
echo "🎉 部署完成！"
echo "🌐 访问地址: http://$SERVER_IP:9527"
echo "========================================="
echo ""
echo "常用命令:"
echo "  pm2 logs saierhao   # 查看日志"
echo "  pm2 restart saierhao # 重启"
echo "  pm2 status           # 查看状态"
