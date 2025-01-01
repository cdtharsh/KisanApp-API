@echo off
cd F:/KisanApp-Github/KisanApp-API
pm2 start server.js --name "server" --watch --instances 0 --max-memory-restart 300M
pm2 save