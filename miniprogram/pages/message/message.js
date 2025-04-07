const app = getApp()
const { default: request } = require('../../utils/request.js');
var time = require('../../utils/util.js');
const db = wx.cloud.database();
Page({

  data: {
    roomlist: [],
    openid: '',
    myNickName: '',

  },

  onLoad: function (_options) {
    
    this.setData({
      openid: app.openid,
    })
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
    this.init_charList()
    
    
  },
  /*
  页面初始化
  */
  async init_charList() {
    let that = this;
    try{
      const res = await request('/message/my',{},'GET');
      wx.stopPullDownRefresh()
      if(res.status_code == 1){
        for(let i=0;i<res.data.length;i++){
          let pictureList = JSON.parse(res.data[i].idle.pictureList);
          res.data[i].idle.pictureList = pictureList.length > 0 ? pictureList[0] : '';
          // res.data[i].createTime = res.data[i].createTime.substring(0,10);
        }
        app.roomlist = res.data;
        that.setData({
          roomlist: app.roomlist
        })
        
      }
    }catch(e){
      console.error(e);
    }
  },

  /**
   * 删除按钮事件
   */
  slideButtonTap(e) {
    var that = this
    console.log('slide button tap', e)
    wx.showModal({
      title: '提示',
      content: '是否确认删除',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中..',
          })
          console.log('用户点击确定')
          wx.cloud.callFunction({
            name: 'removeChat',
            data: {
              id: e.currentTarget.dataset.delid
            },
            success: res => {
              console.log('[云函数] [removeChat] 调用成功: ', res)

              wx.showToast({
                title: '删除成功',
              })
              wx.startPullDownRefresh()

            },
            fail: err => {
              console.error('[云函数] [removeChat] 调用失败', err)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  findtime() {
    console.log("111111111111111111111111111");
    wx.cloud.init({
      env: 'taoshaoji-46f0r',
      traceUser: true
    });
    //初始化数据库
    const db = wx.cloud.database();
    var list = this.data.roomlist;
    var that = this;
    console.log(list);
    for (var i = 0; i < list.length; i++) {
      (function (i) {
        db.collection('chatroom').where({
          groupId: list[i].roomid,
          deleted: 0
        }).get().then(res => {
          console.log("输出聊天数据" + res.data.length);
          console.log(res.data);
          // list[i].time = time.formatTime(res.data[res.data.length - 1].sendTime);
          list[i].time = res.data[res.data.length - 1].sendTimeTS;
          that.setData({
            roomlist: list
          })
          console.log(list);
        })

      })(i);
    }
  },
  timesort() {
    this.data.roomlist.sort(function (a, b) {
      if (a.time > b.time) {
        console.log("");
        return -1;
      } else if (a.time == b.time) {
        console.log("不变变");
        return 0;
      } else {
        console.log("我也不变变");
        return 1;
      }

    });
    var test1 = setTimeout(this.changetime, "1000");

  },
  changetime() {
    var list = this.data.roomlist
    for (var i = 0; i < list.length; i++) {
      console.log("改格式" + time.formatTime(list[i].time, 'Y/M/D h:m:s'));
      list[i].time = time.formatTime(list[i].time, 'Y/M/D h:m:s');
    }
    this.setData({
      roomlist: list
    })
  },
  go(e) {
    wx.navigateTo({
      // url: '../detail/room/room?id=' + e.currentTarget.dataset.id,
      url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
    })
  },
  onShow() {
    this.init_charList()
    this.setData({
      openid: app.openid,
      roomlist: app.roomlist
    })
  },
  //下拉刷新
  onPullDownRefresh() {
    this.onLoad();
  },


  getMyNickName() {
    console.log("调用了getMyNickName")
    let that = this;
    var myopenid = app.openid
    db.collection('user').where({
      _openid: myopenid
    }).get().then(res => {
      that.setData({
        myNickName: res.data[0]
      })
      console.log("res.data.info.nickName:" + res.data[0])
    })
  },


  sendTip(e) {
    let that = this;
    that.onChange()
    that.getMyNickName()
    wx.showModal({
      title: '温馨提示',
      content: '您确定要发送消息通知提醒对方和你聊天吗？',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "sendTip",
            data: {
              openid: e.currentTarget.dataset.opid,
              nickName: that.data.myNickName.info.nickName,
              tip: "快去消息中心看看吧！"
            }
          }).then(res => {
            wx.showToast({
              title: '提醒成功',
              icon: 'success',
              duration: 2000
            })
            console.log("推送消息成功", res)
            console.log(e.currentTarget.dataset.id)
          }).catch(res => {
            console.log("推送消息失败", res)
          })
        }
      }
    })
  },


  onChange() {
    wx.requestSubscribeMessage({
      tmplIds: ['XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
      success(res) {
        console.log('授权成功', res)
      },
      fail(res) {
        console.log('授权失败', res)
      }
    })
  },
})