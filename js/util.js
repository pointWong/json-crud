const path = require('path');
const { readRequestBody, getUrlParams } = require("./req");
const { readFile, writeFile, getJsonDir } = require("./file");
const { readDirByPath } = require('./dir');

// 更新数据
function setRowInData (row, data) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if ((item.cityId && item.cityId === row.cityId) || (item.id && item.id === row.id)) {
      data[i] = row
      break
    } else {
      if (item.child && item.child.length) {
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
    if ((item.cityId && item.cityId === row.upId) || (item.id && item.id === row.upId)) {
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
    if ((item.cityId && item.cityId === row.cityId) || (item.id && item.id === row.id)) {
      data.splice(i, 1)
      break
    }
    if (item.child) {
      data[i].child = deleteRowFromData(row, item.child)
    }
  }
  return data
}

// 返回html
const readHtmlAndResponse = async (res, path) => {
  const content = await readFile(path)
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(content);
}

// 读取、写入或删除json数据
const readAndWriteJSONData = async (req, res) => {
  const url = req.url
  const cityJSONPath = path.join(getJsonDir(), url)
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

// 通过url设置相应头content-type
function setContentTypeByUrl (url) {
  if (url.endsWith('.js')) {
    return 'application/javascript'
  } else if (url.endsWith('.css')) {
    return 'text/css'
  } else {
    return 'text/html'
  }
}

function sendDirFileList (req, res) {
  const row = getUrlParams(req.url)
  const { path, hideFile } = row
  const dirs = readDirByPath(path, hideFile)
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(dirs));
}

module.exports = {
  readRequestBody,
  setRowInData,
  insertRowInData,
  deleteRowFromData,
  readHtmlAndResponse,
  readAndWriteJSONData,
  setContentTypeByUrl,
  sendDirFileList
}