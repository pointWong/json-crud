function getUrlParams (url) {
  return Object.fromEntries(url.split('?')[1].split('&').map(item => item.split('=')))
}

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

function insertRowInJson (row = {}, data) {
  let { key, path, value } = row
  try {
    value = JSON.parse(value)
  } catch (error) {
    console.log("🚀 ~ updateJsonProperty ~ error:", error)
  }
  if (!path) return data
  let temp = path.reduce((data, key) => data[key] || {}, data);
  const isArray = Array.isArray(temp)
  if (isArray) {
    temp.push(value)
  } else {
    temp[key] = value
  }
  return data
}


function updateJsonProperty (row = {}, data) {
  let { key, value, path } = row
  let current = path.reduce((data, key) => data[key] || {}, data);
  try {
    value = JSON.parse(value)
  } catch (error) {
    console.log("🚀 ~ updateJsonProperty ~ error:", error)
  }
  current[key] = value
  return data
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

function deletePropertyByPath (row, obj) {
  let { path } = row
  const lastKey = path.pop()
  const parent = path.reduce((obj, key) => obj[key] || {}, obj);
  if (parent && lastKey) {
    if (Array.isArray(parent)) {
      parent.splice(lastKey, 1);
    } else {
      delete parent[lastKey];
    }
  }
  return obj
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



module.exports = {
  getUrlParams,
  readRequestBody,
  setRowInData,
  insertRowInData,
  insertRowInJson,
  updateJsonProperty,
  deleteRowFromData,
  deletePropertyByPath,
  setContentTypeByUrl
}