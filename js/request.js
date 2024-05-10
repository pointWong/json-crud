// 封装的AJAX请求函数，返回一个Promise对象
function ajaxRequest (method, url, data = null) {
    return new Promise((resolve, reject) => {
        // 创建新的XMLHttpRequest对象
        const xhr = new XMLHttpRequest();

        // 处理GET请求
        if (method === 'GET') {
            // 如果有数据，将数据转换为查询字符串并附加到URL上
            const queryString = data ? `?${stringifyData(data)}` : '';
            xhr.open(method, `${url}${queryString}`, true);
            // 处理POST请求
        } else if (method === 'POST') {
            xhr.open(method, url, true);
            // 设置请求头部，告诉服务器我们发送的是JSON格式的数据
            xhr.setRequestHeader('Content-Type', 'application/json');
        } else if (method === 'PUT') {
            xhr.open(method, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
        } else if (method === 'DELETE') {
            xhr.open(method, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
        } else {
            // 如果请求方法不是GET或POST，拒绝Promise
            reject(new Error('Only GET or POST methods are supported.'));
            return;
        }

        // 设置请求成功时的处理
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                // 将响应转换为JSON对象（如果是JSON格式）
                const response = xhr.responseText ? JSON.parse(xhr.responseText) : xhr.responseText;
                resolve(response);
            } else {
                // 如果不是200-299范围内的状态码，拒绝Promise
                reject(new Error(`Request failed with status: ${xhr.status}`));
            }
        };

        // 设置请求发生错误时的处理
        xhr.onerror = function () {
            reject(new Error('Network error'));
        };

        // 发送请求
        xhr.send(method === 'GET' ? null : JSON.stringify(data));
    });
}

// 将数据对象转换为查询字符串的辅助函数
function stringifyData (data) {
    return Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
}

// // 使用示例
// // GET请求
// ajaxRequest('GET', 'http://localhost:3000/api/data')
//   .then(data => {
//       console.log('Data retrieved:', data);
//   })
//   .catch(error => {
//       console.error('Error:', error);
//   });

// // POST请求
// ajaxRequest('POST', 'http://localhost:3000/api/data', { key: 'value' })
//   .then(data => {
//       console.log('Data saved:', data);
//   })
//   .catch(error => {
//       console.error('Error:', error);
//   });