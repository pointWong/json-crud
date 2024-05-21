const path = require('path');
const homeHtml = './index.html'
const jsonHtml = './html/json.html'
const upsertHtml = './html/upsert.html'
const changedirHtml = './html/changedir.html'
const frontAssetsDirRegExp = /\/(js|css)\/\**/
const { getJsonFileList } = require('./file');
const { notFound, serverError, readHtmlAndResponse, readAndWriteJSONData, frontEndAssets, sendJsonDir, handleJSONFile, sendDirFileList, changeJsonDir, compressFile } = require('./res');

let jsonFileanmeList = getJsonFileList()

const sendResponse = async (req, res) => {
  const url = req.url;
  try {
    if (url === '/') {
      // 首页页面
      readHtmlAndResponse(res, homeHtml)
    } else if (url.startsWith('/upsert')) {
      // 添加、修改页面
      readHtmlAndResponse(res, upsertHtml)
    } else if (url.startsWith('/changedir')) {
      // 切换指定目录页面
      readHtmlAndResponse(res, changedirHtml)
    } else if (jsonFileanmeList.includes(url)) {
      // 数据展示页面
      readHtmlAndResponse(res, jsonHtml)
    } else if (/^[^\/]+\.json.*$/.test(url)) {
      // json文件数据操作，增删查改等
      readAndWriteJSONData(req, res)
    } else if (frontAssetsDirRegExp.test(url)) {
      // 前端资源
      frontEndAssets(res, url)
    } else if (url == '/jsondir') {
      // 获取指定目录下的json文件
      jsonFileanmeList = await getJsonFileList()
      sendJsonDir(res, jsonFileanmeList)
    } else if (url == '/handle-json') {
      // 创建/删除json文件
      handleJSONFile(req, res)
    } else if (url.startsWith('/get-dir')) {
      // 获取目录
      sendDirFileList(req, res)
    } else if (url == '/replace-dir') {
      // 更换json目录
      changeJsonDir(req, res)
    } else if (url == '/compress') {
      // 压缩
      compressFile(req, res)
    } else {
      notFound(res)
    }
  } catch (error) {
    serverError(res, error)
  }
}

module.exports = { sendResponse }