const path = require('path');
const { getJsonFileList, handleJSONFile, readFile, changeJsonDir, getJsonDir } = require('./file');
const { readHtmlAndResponse, readAndWriteJSONData, setContentTypeByUrl, sendDirFileList } = require('./util');
const homeHtml = './index.html'
const jsonHtml = './html/json.html'
const upsertHtml = './html/upsert.html'
const changedirHtml = './html/changedir.html'
const frontAssetsDirRegExp = /\/(js|css)\/\**/

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
    } else if(url.startsWith('/changedir')){
      readHtmlAndResponse(res, changedirHtml)
    } else if (jsonFileanmeList.includes(url)) {
      // 数据展示页面
      readHtmlAndResponse(res, jsonHtml)
    } else if (/^.+\.json.*$/.test(url)) {
      // json文件数据操作，增删查改等
      readAndWriteJSONData(req, res)
    } else if (frontAssetsDirRegExp.test(url)) {
      // 前端资源
      const fp = path.join(process.cwd(), url)
      const content = await readFile(fp)
      res.writeHead(200, { 'Content-Type': setContentTypeByUrl(url) });
      res.end(content);
    } else if (url == '/jsondir') {
      // 获取指定目录下的json文件
      jsonFileanmeList = await getJsonFileList()
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const obj = {
        jsonDir: getJsonDir(),
        jsonFileanmeList
      }
      res.end(JSON.stringify(obj));
    } else if (url == '/handle-json') {
      // 创建/删除json文件
      handleJSONFile(req, res)
    } else if (url.startsWith('/get-dir')) {
      // 获取目录
      sendDirFileList(req, res)
    } else if (url == '/replace-dir') {
      // 更换json目录
      changeJsonDir(req, res)
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