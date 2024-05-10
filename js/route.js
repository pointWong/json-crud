const fs = require('fs'); // 引入文件系统模块
const path = require('path');

const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const writeFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, 'utf8', (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const homeHtml = './index.html'
const cityHtml = './html/city.html'
const upsertHtml = './html/upsert.html'
const jsonDir = './json'

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

function setRowInData (row, data) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.cityId === row.cityId) {
      data[i] = row;
      break
    }else{
      if (item.child) {
        data[i].child = setRowInData(row, item.child)
      }
    }
  }
  return data;
}

function insertRowInData (row, data) {
  if (row.upId == 0) {
    data.push(row)
    return data
  }
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.cityId === row.upId) {
      data[i].child = [...data[i].child, row];
      break
    }else{
      if (item.child) {
        data[i].child = insertRowInData(row, item.child)
      }
    }
  }
  return data;
}

function deleteRowFromData (row, data) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.cityId === row.cityId) {
      data.splice(i, 1)
      break
    }
    if (item.child) {
      data[i].child = deleteRowFromData(row, item.child)
    }
  }
  return data
}

const readFileAndResponse = async (res, path) => {
  const content = await readFile(path)
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(content);
}

const readAndWriteJSONData = async (req, res) => {
  const url = req.url
  const cityJSONPath = path.join(process.cwd(), `json${url}`)
  let content = await readFile(cityJSONPath)
  if (req.method === 'POST') {
    // 增加
    const contentJson = JSON.parse(content)
    const { data } = contentJson
    const row = await readRequestBody(req);
    contentJson.data = insertRowInData(row, data)
    await writeFile(cityJSONPath, JSON.stringify(contentJson))
    content = "{\"msg\":\"操作成功\"}";
  } else if (req.method === 'DELETE') {
    // 删除
    const contentJson = JSON.parse(content)
    const { data } = contentJson
    const row = await readRequestBody(req);
    contentJson.data = deleteRowFromData(row, data)
    await writeFile(cityJSONPath, JSON.stringify(contentJson))
    content = "{\"msg\":\"操作成功\"}";
  } else if (req.method === 'PUT') {
    // 修改
    const contentJson = JSON.parse(content)
    const { data } = contentJson
    const row = await readRequestBody(req);
    contentJson.data = setRowInData(row, data)
    await writeFile(cityJSONPath, JSON.stringify(contentJson))
    content = "{\"msg\":\"操作成功\"}";
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(content);
}

const sendResponse = async (req, res) => {
  const url = req.url;
  try {
    if (url === '/') {
      readFileAndResponse(res, homeHtml)
    } else if (url.startsWith('/upsert')) {
      readFileAndResponse(res, upsertHtml)
    } else if (/^\/city\-\d+[^\.(json)]*$/.test(url)) {
      readFileAndResponse(res, cityHtml)
    } else if (/^\/city-\d+\.json$/.test(url)) {
      readAndWriteJSONData(req, res)
    } else if (url.indexOf('/js/') !== -1 || url.indexOf('/components/') != -1) {
      const fp = path.join(process.cwd(), url)
      const content = await readFile(fp)
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(content);
    } else if(url == '/jsondir'){
      // 获取 json目录下所有文件名
      const files = fs.readdirSync(jsonDir);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(files));
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('Internal Server Error:' + JSON.stringify(error));
  }
}

module.exports = { sendResponse }