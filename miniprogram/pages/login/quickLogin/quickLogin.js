// pages/login/quickLogin/quickLogin.js
const { default: request } = require("../../../utils/request.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    userInfo:{
      nickname:'',
      avatar:'',
      userType:'',
      code:''
    }
  },

  oneClick(e){
    let that = this;

    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        // console.log("获取用户信息成功", res)
        that.setData({
          userInfo:res.userInfo
        })
        console.log("res.userInfo: ",res.userInfo);
        that.data.userInfo.nickname = res.userInfo.nickName;
        that.data.userInfo.avatar = res.userInfo.avatarUrl;
        that.data.userInfo.userType = 2;
        

        wx.login({
          success: async(res) => {
            that.data.userInfo.code = res.code;
            try{
              const res = await request('/wxuser/wxlogin',that.data.userInfo,'POST')
              console.log("oneClick: ",res);

              app.openid = res.data.id;
              app.userinfo = res.data;
              wx.navigateBack();
            }catch(e){
              console.error(e);
            }
          },
        })
      },
      fail: res => {
        // console.log("获取用户信息失败", res)
      }
    })


    // this.setData({
    //   isHide: true
    // });
  },
  go(e) {
    wx.navigateTo({
          url: e.currentTarget.dataset.go
    })
  },
})