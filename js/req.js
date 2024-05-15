// 读取请求body参数
async function readRequestBody (req) {
  const data = [];
  // 读取请求体的流
  for await (const chunk of req) {
    data.push(chunk);
  }
  // 将Buffer数组转换为字符串，并尝试解析为JSON
  const buffer = Buffer.concat(data);
  return JSON.parse(buffer.toString());
}

function getUrlParams (url) {
  return Object.fromEntries(url.split('?')[1].split('&').map(item => item.split('=')))
}

module.exports = { readRequestBody, getUrlParams }