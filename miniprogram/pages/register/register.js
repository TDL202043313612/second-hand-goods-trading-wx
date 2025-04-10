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
            userPassword_:'',
            checked:false,
            campus: JSON.parse(config.data).campus,
            userInfo:{
              accountNumber:'',
              userPassword:'',
              nickname:'',
              userType:''
            }
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


      anInput(e){
        this.data.userInfo.accountNumber = e.detail.value;
      },
      upInput(e){
        this.data.userInfo.userPassword = e.detail.value;
      },
      nameInput(e){
        this.data.userInfo.nickname = e.detail.value;
      },
      upInput_(e){
        this.data.userPassword_ = e.detail.value;
      },
      register(e){
        let that = this;
            //昵称
            let name = that.data.userInfo.nickname;
            //校检账号
            let num = that.data.userInfo.accountNumber;
            //校检密码
            let Password = that.data.userInfo.userPassword;
            let Password_ = that.data.userPassword_;

            that.data.userInfo.userType = 1;
            if(name == ""){
              wx.showToast({
                title: '昵称不能为空',
                icon: 'none',
              })
              return;
            }
            if(num == "" || Password == "" || Password_ == ""){
              wx.showToast({
                title: '账号，密码不能为空',
                icon: 'none',
              })
              return;
            }
            if(Password != Password_){
              wx.showToast({
                title: '密码不同',
                icon: 'none',
              })
              return;
            }

            that.register_(that.data.userInfo);
      },
      toLogin(e) {
          app.deltaNum++;
          wx.navigateTo({
            url: '/pages/login/login',
          })
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
      async register_(userInfo){
        let that = this;
        that.showLoading("正在提交","网络错误",3000)
        console.log("userInfo: ",userInfo);
        try {
          const res = await request('/user/sign-in',userInfo,'POST');
          console.log("register_res: ",res);
          wx.hideLoading();
          if(res.status_code == 1){
            // wx.hideLoading();
            wx.showToast({
              title: '注册成功',
              icon: 'success',
            })
            app.deltaNum--;
            wx.navigateBack({})
          }else {
            // wx.hideLoading();
            wx.showToast({
              title: res.msg,
              icon: 'none',
            })
          }
          
        }catch(e){
          wx.hideLoading();
          wx.showToast({
            title: '注册失败',
            icon:'none'
          })
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