const app = getApp();
const config = require("../../config.js");
import uploadFile from '../../utils/uploadFile';
const { default: request } = require("../../utils/request.js");
const MAX_IMG_NUM = 1;
Page({

      /**
       * 页面的初始数据
       */
      data: {
            showShare: false,
            poster: JSON.parse(config.data).share_poster,
            username: '',
            openid: '',
            roomlist: [],
            userinfo:'',
            tempFilePaths: [],
            params: {
              imgUrl: new Array(),
        },
            // imgUrl:'',
      },
      onShow() {
            this.setData({
                  userinfo: app.userinfo
            })
      },
      onLoad: function (options) {
            this.setData({
                  openid: app.openid
            })
      },
      chooseImage: function () {
        console.log("chooseImage")
        const that = this;
        let max = MAX_IMG_NUM - that.data.tempFilePaths.length;
        
        wx.chooseImage({
            count: max,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: async (res) => {
                const tempFiles = res.tempFiles;
                const filePaths = res.tempFilePaths;
                
                try {
                    // 使用Promise.all等待所有上传完成
                    const uploadPromises = filePaths.map((path, index) => {
                        return new Promise((resolve) => {
                            setTimeout(async () => {
                                try {
                                    const result = await that.doUpload(path);
                                    resolve(result);
                                } catch (error) {
                                    resolve(null); // 或者 reject，根据你的需求
                                }
                            }, index * 300); // 适当延迟
                        });
                    });
                    
                    // 等待所有上传完成
                    const uploadResults = await Promise.all(uploadPromises);
                    
                    // 过滤掉失败的上传（如果有）
                    const successfulUploads = uploadResults.filter(result => result !== null);
                    
                    // 更新tempFilePaths
                    const { tempFilePaths } = that.data;
                    that.setData({
                        tempFilePaths: tempFilePaths.concat(filePaths) // 或者用其他方式更新
                    }, () => {
                        console.log(that.data.tempFilePaths)
                    });
                    
                    max = MAX_IMG_NUM - that.data.tempFilePaths.length;
                    
                    // 上传完成后继续执行
                    try {
                        const res = await request('/user/info', {avatar: that.data.imgUrl[that.data.imgUrl.length-1]}, 'POST');
                        // console.log("that.data.imgUrl: ", that.data.imgUrl);
                        // console.log("chooseImage_res: ", res);
                        app.userinfo.avatar = that.data.imgUrl[that.data.imgUrl.length-1];
                        that.setData({
                            userinfo: app.userinfo
                        });
                    } catch(e) {
                        console.error(e);
                    }
                    
                } catch (e) {
                    console.error('上传过程中出错:', e);
                }
            },
            fail: e => {
                console.log(e.errMsg);
            }
        });
    },
      async doUpload(filePath) {
        const that = this;
        // console.log("filePath: ",filePath);
        try {
          // 调用封装的 uploadFile 函数
          const res = await uploadFile('/file', filePath, 'file');
        
          wx.showToast({
            title: '上传成功',
            icon: 'success',
          });
          console.log('[上传文件] 成功：', res)
                  const {
                        params
                  } = that.data;
                  const {
                        imgUrl
                  } = params;
                  imgUrl.push(res.data);
                  // imgUrl=res.data;
                  params['imgUrl'] = imgUrl;
                  that.setData({
                        imgUrl,
                  });
                  console.log("imgUrl",that.data.imgUrl);

        } catch (err) {
          console.error('[上传文件] 失败：', err);
                  wx.showToast({
                        icon: 'none',
                        title: '上传失败',
                        duration: 1000
                  })
        }
      },
      goo() {
            console.log(app.roomlist);
            if (!app.openid) {
                  wx.showModal({
                        title: '温馨提示',
                        content: '该功能需要注册方可使用，是否马上去注册',
                        success(res) {
                              if (res.confirm) {
                                    wx.navigateTo({
                                          url: '/pages/login/login',
                                    })
                              }
                        }
                  })
                  return false
            }else{
                  wx.navigateTo({
                        url: '../message/message',
                  })
            }

      },
      go(e) {
            if (e.currentTarget.dataset.status == '1') {
                  if (!app.openid) {
                        wx.showModal({
                              title: '温馨提示',
                              content: '该功能需要注册方可使用，是否马上去注册',
                              success(res) {
                                    if (res.confirm) {
                                          wx.navigateTo({
                                                url: '/pages/login/login',
                                          })
                                    }
                              }
                        })
                        return false
                  }
            }
            wx.navigateTo({
                  url: e.currentTarget.dataset.go
            })
      },
      editAddress(){
        if (app.openid) {
          wx.navigateTo({
            url: '/pages/addressList/addressList',
          })
        } else {
          console.log("no openid");
          wx.showModal({
                title: '温馨提示',
                content: '该功能需要注册方可使用，是否马上去注册',
                success(res) {
                      if (res.confirm) {
                            wx.navigateTo({
                                  url: '/pages/login/login',
                            })
                      }
                }
          })
          return false
        }
      },
      logout(){
        let that = this;
        if(!app.openid){
          wx.showToast({
            title: '尚未登录！',
            icon:'none'
          })
          return;
        }
        wx.showModal({
          title: '温馨提示',
          content: '您确定要退出登录吗？',
          async success (res) {
            if (res.confirm) {
              try{
                const res = await request('/user/logout',{},'GET');
                if(res.status_code==1){
                  app.openid = '';
                  app.userinfo = '';
                  that.setData({
                    userinfo:'',
                    openid:''
                  })
                  console.log("login out");
                  
                }else {
                  wx.showToast({
                    title: '网络或系统异常，退出登录失败！',
                    icon:'none'
                  })
                } 
              }catch(e){
                wx.showToast({
                  title: '网络或系统异常，退出登录失败！',
                  icon:'none'
                })
                console.error(e);
              }
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      },
      //展示分享弹窗
      showShare() {
            this.setData({
                  showShare: true
            });
      },
      //关闭弹窗
      closePop() {
            this.setData({
                  showShare: false,
            });
      },
      //预览图片
      preview(e) {
            
            wx.previewImage({
                  urls: e.currentTarget.dataset.link.split(",")
            });
      },
      onShareAppMessage() {
            return {
                  title: JSON.parse(config.data).share_title,
                  imageUrl: JSON.parse(config.data).share_img,
                  path: '/pages/start/start'
            }

      },
      // 用户点击右上角分享给好友,要先在分享好友这里设置menus的两个参数,才可以分享朋友圈
	onShareAppMessage: function() {
		wx.showShareMenu({
	      withShareTicket: true,
	      menus: ['shareAppMessage', 'shareTimeline']
	    })
	},
	//用户点击右上角分享朋友圈
	onShareTimeline: function () {
		return {
	      title: '',
	      query: {
	        key: value
	      },
	      imageUrl: ''
	    }
	},
      //获取授权的点击事件
      shouquan() {
            wx.requestSubscribeMessage({
                  tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0'], //这里填入我们生成的模板id
                  success(res) {          
                        console.log('授权成功', res)
                  },
                  fail(res) {
                        console.log('授权失败', res)
                  }
            })
      },
})