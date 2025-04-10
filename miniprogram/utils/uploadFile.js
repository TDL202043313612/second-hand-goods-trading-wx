/**
 * 封装 wx.uploadFile
 * @param {string} url - 上传接口地址
 * @param {string} filePath - 临时文件路径
 * @param {string} name - 文件对应的 key
 * @param {object} formData - 额外的表单数据
 * @param {object} headers - 请求头
 * @returns {Promise} - 返回一个 Promise 对象
 */
function uploadFile(url, filePath, name = 'file', formData = {}, headers = {}) {
  return new Promise((resolve, reject) => { 
    // 显示加载提示
    // wx.showLoading({
    //   title: '上传中...',
    // });
    // 调用 wx.uploadFile
    wx.uploadFile({
      url: 'http://localhost:8080' + url, // 拼接完整的接口地址
      // url: 'http://120.27.141.104:8080' + url, // 拼接完整的接口地址
      filePath: filePath, // 临时文件路径
      name: name, // 文件对应的 key
      formData: formData, // 额外的表单数据
      header: {
        'Content-Type': 'multipart/form-data', // 设置请求头
        ...headers, // 合并自定义请求头
      },
      success: (res) => {
        // wx.hideLoading(); // 隐藏加载提示

        if (res.statusCode === 200) {
          // 解析返回的数据（假设返回的是 JSON 字符串）
          try {
            const data = JSON.parse(res.data);
            resolve(data); // 返回解析后的数据
          } catch (err) {
            reject(new Error('解析响应数据失败：' + err.message));
          }
        } else {
          reject(new Error('上传失败，状态码：' + res.statusCode));
        }
      },
      fail: (err) => {
        // wx.hideLoading(); // 隐藏加载提示
        reject(new Error('网络请求失败：' + err.errMsg));
      },
    });
  });
}

export default uploadFile;