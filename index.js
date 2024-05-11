const http = require('http'); // 引入http模块
const fs = require('fs'); // 引入文件系统模块
const { sendResponse } = require('./js/route')

const jsonDir = './json'

// 创建一个HTTP服务器
const server = http.createServer((req, res) => {
  const files = fs.readdirSync(jsonDir);
  const jsonFileanmeList = files.map(item => `/${item.replace('.json', '')}`)
  sendResponse(req, res, jsonFileanmeList)
});

// 指定服务器监听的端口号
const port = 3456;

// 服务器监听指定端口
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});