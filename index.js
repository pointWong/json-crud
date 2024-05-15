const http = require('http'); // 引入http模块
const { sendResponse } = require('./js/route')

// 创建一个HTTP服务器
const server = http.createServer((req, res) => {
  sendResponse(req, res)
});

// 指定服务器监听的端口号
const port = 3456;

// 服务器监听指定端口
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});