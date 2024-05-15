const fs = require('fs'); // 引入文件系统模块
const path = require('path');
const { readRequestBody } = require('./req');
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

// 创建或删除json文件
async function handleJSONFile (req, res) {
  const row = await readRequestBody(req)
  let { fileName } = row
  if (!fileName.endsWith('.json')) {
    fileName = fileName + '.json'
  }
  const filePath = path.join(getJsonDir(), fileName)
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

let jsonDir = path.join(process.cwd(), 'json')

function getFileList () {
  const files = fs.readdirSync(jsonDir);
  return files
}

function getJsonFileList () {
  const files = getFileList().filter(item => item.endsWith('.json')).map(item => `/${item.replace('.json', '')}`)
  return files
}

function getJsonDir () {
  return jsonDir
}

async function changeJsonDir (req, res) {
  if (req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const row = await readRequestBody(req)
    const { dirPath } = row
    jsonDir = dirPath
    res.end(JSON.stringify({
      msg:'操作成功',
      dirPath
    }))
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end('method not allow!');
  }

}

module.exports = { readFile, writeFile, handleJSONFile, getFileList, getJsonDir, changeJsonDir, getJsonFileList }