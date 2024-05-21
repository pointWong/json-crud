const fs = require('fs'); // 引入文件系统模块
const path = require('path');

// 读取文件夹下所有文件
function readDirByPath (path = '/', justDir = true) {
  try {
    const dirfile = fs.readdirSync(path);
    if (justDir) {
      return dirfile.filter(file => !file.startsWith('.')).filter(file => fs.statSync((path.endsWith('/') ? path : path + '/') + file).isDirectory())
    }
    return dirfile
  } catch (error) {
    console.log("🚀 ~ readDirByPath ~ error:", error)
  }
}
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

let jsonDir = path.join(process.cwd(), 'json')

function getFileList () {
  try {
    const files = fs.readdirSync(jsonDir);
    return files
  } catch (error) {
    console.log("🚀 ~ getFileList ~ error:", error)
  }
}

function getJsonFileList () {
  try {
    const files = getFileList().filter(item => item.endsWith('.json')).map(item => `/${item.replace('.json', '')}`)
    return files
  } catch (error) {
    console.log("🚀 ~ getJsonFileList ~ error:", error)
  }
}

function getJsonDir () {
  return jsonDir
}

function setJsonDir (dir) {
  jsonDir = dir
}

module.exports = {
  readDirByPath,
  readFile,
  writeFile,
  getFileList,
  getJsonFileList,
  getJsonDir,
  setJsonDir
}