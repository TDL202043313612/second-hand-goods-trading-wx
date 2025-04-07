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
            checked:false,
            campus: JSON.parse(config.data).campus,
            oAccountname:"",
            accountname:"",
            oUserPassword:"",
            userPassword:"",
            userPassword2:"",
            nameIsDisabled:true,
            userPasswordEdit:false,
            nameButtonValue:"编辑",
            passwordButtonValue:"编辑"
      },
      nameChange(e){
        let that = this;
        that.setData({
          nameIsDisabled:!that.data.nameIsDisabled,
          nameButtonValue:that.data.nameButtonValue=="编辑"?"完成":"编辑"
        })
        if(that.data.nameButtonValue == "编辑"){
          if(that.data.oAccountname != that.data.accountname){
            that.changeUserName(that.data.accountname);
            
          }
        }
      },
      async changeUserName(newName){
        let that = this;
        try {
          const res = await request('/user/info',{nickname:newName},'POST');
          if(res.status_code == 1){
            wx.showToast({
              title: '更改成功',
            });
            that.setData({
              oAccountname:  newName
            })
            app.userinfo.nickname = newName;
          }
        }catch(e){
          console.error(e);
        }
      },
      async changeUserPassword(oldPassword,newPassword){
        let that = this;
        try {
          const res = await request('/user/password',{oldPassword:oldPassword,newPassword:newPassword},'GET');
          if(res.status_code == 1){
            wx.showToast({
              title: '更改成功',
            });
            that.setData({
              userPasswordEdit:false
            })
          }else{
            wx.showToast({
              title: res.msg,
              icon: "none"
            });
          }
        }catch(e){
          console.error(e);
        }
      },
      savePassword(e){
        let that = this;
        if (!that.data.userPassword2 || !this.data.userPassword) {
          wx.showToast({
            title: '密码为空！',
            icon: 'error',
          })
        } else if (that.data.userPassword2 == that.data.userPassword) {
          that.changeUserPassword(that.data.oUserPassword,that.data.userPassword);

        }
      },
      changeUserPasswordEdit(e){
        this.setData({
          userPasswordEdit:true
        })
      },
      anInput(e){
        let that = this;
        that.setData({
          accountname:e.detail.value
        })
      },
      upInput_1(e){
        let that = this;
        that.setData({
          oUserPassword:e.detail.value
        })
      },
      upInput_2(e){
        let that = this;
        that.setData({
          userPassword:e.detail.value
        })
      },
      upInput_3(e){
        let that = this;
        that.setData({
          userPassword2:e.detail.value
        })
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
      onLoad() {
            this.getdetail();
      },
      getdetail() {
            let that = this;
            that.setData({
              oAccountname:app.userinfo.nickname,
              accountname:app.userinfo.nickname
            });
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
      getUserInfo(e) {
            let that = this;
            wx.navigateBack({});
      },
      //校检
      check() {
            let that = this;
            //校检手机
            let phone = that.data.phone;
            if (phone == '') {
                  wx.showToast({
                        title: '请先获取您的电话',
                        icon: 'none',
                        duration: 2000
                  });
                  return false
            }
            //校检校区
            let ids = that.data.ids;
            let campus = that.data.campus;
            if (ids == -1) {
                  wx.showToast({
                        title: '请先获取您的校区',
                        icon: 'none',
                        duration: 2000
                  });
            }
            //校检邮箱
            let email = that.data.email;
            if (!(/^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/.test(email))) {
                  wx.showToast({
                        title: '请输入常用邮箱',
                        icon: 'none',
                        duration: 2000
                  });
                  return false;
            }
            //校检QQ号
            let qqnum = that.data.qqnum;
            if (qqnum !== '') {
                  if (!(/^\s*[.0-9]{5,11}\s*$/.test(qqnum))) {
                        wx.showToast({
                              title: '请输入正确QQ号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            //校检微信号
            let wxnum = that.data.wxnum;
            if (wxnum !== '') {
                  if (!(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(wxnum))) {
                        wx.showToast({
                              title: '请输入正确微信号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            wx.showLoading({
                  title: '正在提交',
            })
            db.collection('user').doc(that.data._id).update({
                  data: {
                        phone: that.data.phone,
                        campus: that.data.campus[that.data.ids],
                        qqnum: that.data.qqnum,
                        email: that.data.email,
                        wxnum: that.data.wxnum,
                        info: that.data.userInfo,
                        updatedat: new Date().getTime(),
                  },
                  success: function(res) {
                        console.log(res)
                        db.collection('user').doc(that.data._id).get({
                              success: function(res) {
                                    app.userinfo = res.data;
                                    app.openid = res.data._openid;
                                    wx.hideLoading();
                                    wx.showToast({
                                          title: '修改成功',
                                          icon: 'success'
                                    })
                              },
                        })
                  },
                  fail() {
                        wx.hideLoading();
                        wx.showToast({
                              title: '注册失败，请重新提交',
                              icon: 'none',
                        })
                  }
            })
      },
})