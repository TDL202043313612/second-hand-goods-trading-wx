const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
import request from '../../utils/request';

Page({

      /**
       * 页面的初始数据
       */
      data: {
            ids: -1,
            wxnum: '',
            qqnum: '',
            email: '',
            accountNumber:'',
            userPassword:'',
            checked:false,
            campus: JSON.parse(config.data).campus,
      },

      onChange(event) {
            if(event.detail==true){
                  wx.requestSubscribeMessage({
                        tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0','XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
                        success(res) {          
                              console.log('授权成功', res)
                        },
                        fail(res) {
                              console.log('授权失败', res)
                        }
                  })
            }
            this.setData({
              checked: event.detail,
            });
          },

      choose(e) {
            let that = this;
            that.setData({
                  ids: e.detail.value
            })
            //下面这种办法无法修改页面数据
            /* this.data.ids = e.detail.value;*/
      },
      wxInput(e) {
            this.data.wxnum = e.detail.value;
      },
      qqInput(e) {
            this.data.qqnum = e.detail.value;
      },
      emInput(e) {
            this.data.email = e.detail.value;
            
      },
      anInput(e){
        this.data.accountNumber = e.detail.value;
      },
      upInput(e){
        this.data.userPassword = e.detail.value;
      },
      toRegister(e) {
          app.deltaNum++;
          wx.navigateTo({
            url: '/pages/register/register',
          })
      },
      //校检
      check() {
            let that = this;
            //校检账号
            let num = that.data.accountNumber;
            //校检密码
            let Password = that.data.userPassword;
            if(num!="" && Password!=""){
              that.login(num,Password)
            }else{
              wx.showToast({
                title: '账号，密码不能为空',
                icon: 'error',
              })
              return;
            }
      },
      showLoading(LoadingTitle,ErrorTitle,time){
        wx.showLoading({
          title: LoadingTitle,
        })
        // setTimeout(function() {
        //   wx.hideLoading();
        //   // 这里可以执行其他操作，例如更新页面数据等
        //   wx.showToast({
        //     title: ErrorTitle,
        //     icon: 'error'
        //   });
        // }, time);
      },
      async login(accountNumber,userPassword){
        let that = this;
        that.showLoading("正在提交","网络错误",3000)
        try {
          const res = await request('/user/login',{accountNumber: accountNumber,
                                userPassword: userPassword},'GET');
          console.log("login_res: ",res);
          wx.hideLoading();
          if(res.status_code == 1){
            wx.hideLoading();
            wx.showToast({
              title: '登录成功',
              icon: 'success',
            })
            res.data.signInTime=res.data.signInTime.substring(0,10);
            app.openid = res.data.id;
            app.userinfo = res.data;
            // console.log("app.userinfo: ",app.userinfo);
            // console.log("app.openid: ",app.openid);
            wx.navigateBack({
              delta: app.deltaNum
            })
          }else {
            wx.hideLoading();
            wx.showToast({
              title: res.msg,
              icon: 'none',
            })
          }
          
        }catch(e){
          console.error(e);
        }
        
        
      },
        //获取授权的点击事件
        shouquan() {
            wx.requestSubscribeMessage({
                  tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0','XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
                  success(res) {          
                        console.log('授权成功', res)
                  },
                  fail(res) {
                        console.log('授权失败', res)
                  }
            })
      },
})