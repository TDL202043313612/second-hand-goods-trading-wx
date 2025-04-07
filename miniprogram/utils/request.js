// request.js
function request(url, data = {}, method = 'GET') {
  const cookies = wx.getStorageSync('cookies'); // 从本地缓存中获取 Cookie
  return new Promise((resolve, reject) => {
    // wx.showLoading({
    //   title: '加载中...'
    // });
    wx.request({
      // url: 'http://localhost:8080' + url, 
      url: 'http://120.27.141.104:8080/' + url, 
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'Cookie': cookies, // 手动添加 Cookie 到请求头
      },
      success: (res) => {
        // wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.statusCode === 200) {
          // console.log("res_resolve",res);
          const cookies = res.cookies;
          if(cookies.length){
            const cookie = cookies[0].split(';')[0];
            wx.setStorageSync('cookies', cookie);
          }
          resolve(res.data);
        } else {
          reject(new Error('请求失败，状态码：' + res.statusCode));
        }
      },
      fail: (err) => {
        // wx.hideLoading();
        wx.stopPullDownRefresh();
        reject(new Error('网络请求失败：' + err.errMsg));
      }
    });
  });
}



export default request;