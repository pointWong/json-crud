const fs = require('fs'); // 引入文件系统模块
const path = require('path');

// 读文件
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

// 写文件
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

// 更新数据
function setRowInData (row, data) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.cityId === row.cityId) {
      data[i] = row;
      break
    } else {
      if (item.child) {
        data[i].child = setRowInData(row, item.child)
      }
    }
  }
  return data;
}

// 插入数据
function insertRowInData (row, data) {
  if (row.upId == 0) {
    if (data) {
      data.push(row)
    } else {
      data = [row]
    }
    return data
  }
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.cityId === row.upId) {
      data[i].child = [...data[i].child, row];
      break
    } else {
      if (item.child) {
        data[i].child = insertRowInData(row, item.child)
      }
    }
  }
  return data;
}

// 删除数据
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

// 
const readHtmlAndResponse = async (res, path) => {
  const content = await readFile(path)
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(content);
}

const readAndWriteJSONData = async (req, res) => {
  const url = req.url
  const cityJSONPath = path.join(process.cwd(), url)
  let content = await readFile(cityJSONPath)
  res.writeHead(200, { 'Content-Type': 'application/json' });
  if (req.method === "GET") {
    res.end(content);
    return
  }
  const contentJson = JSON.parse(content)
  const { data } = contentJson
  const row = await readRequestBody(req);
  if (req.method === 'POST') {
    // 增加
    contentJson.data = insertRowInData(row, data)
  } else if (req.method === 'DELETE') {
    // 删除
    contentJson.data = deleteRowFromData(row, data)
  } else if (req.method === 'PUT') {
    // 修改
    contentJson.data = setRowInData(row, data)
  }
  await writeFile(cityJSONPath, JSON.stringify(contentJson))
  res.end("{\"msg\":\"操作成功\"}");
}

function setContentTypeByUrl (url) {
  if (url.endsWith('.js')) {
    return 'application/javascript'
  } else if (url.endsWith('.css')) {
    return 'text/css'
  } else {
    return 'text/html'
  }
}

// 添加json文件
async function handleJSONFile (req, res) {
  const row = await readRequestBody(req)
  let { fileName } = row
  if (!fileName.endsWith('.json')) {
    fileName = fileName + '.json'
  }
  const filePath = path.join(process.cwd(), '/json', fileName)
  res.writeHead(200, { 'Content-Type': 'application/json' });
  if (req.method === 'DELETE') {
    fs.unlinkSync(filePath)
    res.end("{\"msg\":\"文件已删除！\"}")
  } else if (req.method === 'POST') {
    if (fs.existsSync(filePath)) {
      res.end("{\"msg\":\"文件已存在！\"}");
      return
    }
    fs.writeFileSync(filePath, JSON.stringify({ data: [] }))
    res.end("{\"msg\":\"操作成功\"}");
  }
}

const frontAssetsDirRegExp = /\/(js|css)\/\**/
const homeHtml = './index.html'
const jsonHtml = './html/json.html'
const upsertHtml = './html/upsert.html'
const sendResponse = async (req, res, jsonFileanmeList) => {
  const url = req.url;
  try {
    if (url === '/') {
      // 首页页面
      readHtmlAndResponse(res, homeHtml)
    } else if (url.startsWith('/upsert')) {
      // 添加、修改页面
      readHtmlAndResponse(res, upsertHtml)
    } else if (jsonFileanmeList.includes(url)) {
      // 数据展示页面
      readHtmlAndResponse(res, jsonHtml)
    } else if (/^\/json\/.+\.json.*$/.test(url)) {
      // json文件数据操作，增删查改等
      readAndWriteJSONData(req, res)
    } else if (frontAssetsDirRegExp.test(url)) {
      // 前端资源
      const fp = path.join(process.cwd(), url)
      const content = await readFile(fp)
      res.writeHead(200, { 'Content-Type': setContentTypeByUrl(url) });
      res.end(content);
    } else if (url == '/jsondir') {
      // 获取 json目录下所有文件名
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jsonFileanmeList));
    } else if (url == '/handle-json') {
      // 创建json文件
      handleJSONFile(req, res)
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end('Not Found');
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('Internal Server Error:' + JSON.stringify(error));
  }
}

module.exports = { sendResponse }