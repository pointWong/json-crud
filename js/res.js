const { readFile, getJsonDir, writeFile, readDirByPath, setJsonDir } = require("./file");
const { setContentTypeByUrl, readRequestBody, insertRowInJson, deletePropertyByPath, updateJsonProperty, getUrlParams } = require("./util");
const path = require('path');
const fs = require('fs');
const axios = require('axios')
const locales = require('../locale-map.json')
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
  res && res.writeHead(200, { 'Content-Type': 'application/json' });
  let contentJson = JSON.parse(content)
  if (req.method === "GET") {
    res.end(content);
    return
  }
  const row = await readRequestBody(req);
  if (req.method === 'POST') {
    // 增加
    contentJson = insertRowInJson(row, contentJson)
  } else if (req.method === 'DELETE') {
    // 删除
    contentJson = deletePropertyByPath(row, contentJson)
  } else if (req.method === 'PUT') {
    // 修改
    contentJson = updateJsonProperty(row, contentJson)
  }
  await writeFile(cityJSONPath, JSON.stringify(contentJson))
  res && res.end("{\"msg\":\"操作成功\"}");
}

// 指定文件夹列表
async function sendDirFileList (req, res) {
  try {
    const row = getUrlParams(req.url)
    const { path, hideFile } = row
    const dirs = await readDirByPath(path, hideFile)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dirs));
  } catch (error) {
    serverError(res, error)
  }
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
    res.end(JSON.stringify({ msg: '文件已删除', ok: true }))
  } else if (req.method === 'POST') {
    if (fs.existsSync(filePath)) {
      res.end(JSON.stringify({ msg: '文件已存在！', ok: false }));
      return
    }
    fs.writeFileSync(filePath, JSON.stringify({}))
    res.end(JSON.stringify({ msg: '操作成功', ok: true }));
  }
}

// 更换指定目录
async function changeJsonDir (req, res) {
  if (req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const row = await readRequestBody(req)
    const { dirPath } = row
    setJsonDir(dirPath)
    res.end(JSON.stringify({
      msg: '操作成功',
      dirPath
    }))
  } else {
    methodNotAllow()
  }
}

// 压缩文件
async function compressFile (req, res) {
  if (req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const row = await readRequestBody(req)
    let { fileName } = row
    if (!fileName.endsWith('.json')) {
      fileName = fileName + '.json'
    }
    const filePath = path.join(getJsonDir(), fileName)
    const content = await readFile(filePath)
    await writeFile(filePath, JSON.stringify(JSON.parse(content)))
    res.end(JSON.stringify({
      msg: '操作成功',
    }))
  } else {
    methodNotAllow()
  }
}

async function translate (req, res) {
  if (req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const row = await readRequestBody(req)
    let { lang, target, file } = row
    if (lang && target && file) {
      try {
        if (!file.endsWith('.json')) {
          file = file + '.json'
        }
        const filePath = path.join(getJsonDir(), file)
        let content = await readFile(filePath)
        const translateContent = await startTranslate(JSON.parse(content), lang, target)
        console.log("🚀 ~ translate ~ translateContent:", translateContent)
        const targetFileName = locales[target]
        console.log("🚀 ~ translate ~ targetFileName:", targetFileName)
        const translatedFilePath = path.join(getJsonDir(), `${targetFileName || target}.json`)
        console.log("🚀 ~ translate ~ translatedFilePath:", translatedFilePath)
        await writeFile(translatedFilePath, JSON.stringify(translateContent))
        res.end(JSON.stringify({
          msg: '操作成功',
        }))
      } catch (error) {
        console.log("🚀 ~ translate ~ error:", error)
        res.end(JSON.stringify({
          msg: '操作失败',
        }))
      }
    } else {
      res.end({ msg: 'lang,target,file都是必填！' })
    }
  } else {
    methodNotAllow()
  }
}

async function startTranslate (content, lang, target) {
  for (let key in content) {
    const value = content[key]
    if (value instanceof Object) {
      content[key] = await startTranslate(value, lang, target)
    } else {
      const tcontent = await fetchTranlate(value, lang, target)
      content[key] = tcontent
    }
  }
  return content
}

async function fetchTranlate (chunk, lang, target) {
  console.log("🚀 ~ fetchTranlate ~ chunk:", chunk)
  const rs = await axios.get(`https://benbb.cc/wssay/api/translate?content=${chunk}&lang=${lang}&target=${target}`)
  const { isOk, content: tcontent } = rs.data;
  console.log("🚀 ~ fetchTranlate ~ tcontent:", tcontent)
  if (isOk) {
    return tcontent
  } else {
    throw new Error('翻译失败')
  }
}

// 前端资源
async function frontEndAssets (res, url) {
  const fp = path.join(process.cwd(), url)
  const content = await readFile(fp)
  res.writeHead(200, { 'Content-Type': setContentTypeByUrl(url) });
  res.end(content);
}

// 获取指定目录下的json文件
async function sendJsonDir (res, jsonFileanmeList) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const obj = {
    jsonDir: getJsonDir(),
    jsonFileanmeList
  }
  res.end(JSON.stringify(obj));
}

// 404
async function notFound (res) {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end('Not Found');
}
// 405
async function methodNotAllow (res) {
  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end('method not allow!');
}
// 500
async function serverError (res, error) {
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    msg: '服务器出错',
    error: JSON.stringify(error)
  }));
}

module.exports = {
  readHtmlAndResponse,
  readAndWriteJSONData,
  sendDirFileList,
  handleJSONFile,
  changeJsonDir,
  compressFile,
  translate,
  frontEndAssets,
  sendJsonDir,
  notFound,
  serverError
}