const app = getApp()
const db = wx.cloud.database();
const config = require("../../../config.js");
const { default: request } = require("../../../utils/request.js");
const _ = db.command;
Page({

      /**
       * 页面的初始数据
       */
      data: {
            userinfo: [],
            creatTime: '',
            detail: {
              orderInfo:{},
              orderAddress:{
              id:'',
              update:false,
              consigneeName: '',
              consigneePhone: '',
              detailAddress: ''},
            },
            status: Number,
            openid: app.openid,
            orderStatus:[],
            handleName:[],
            addressDialogVisible:false,
            addressData: [],
          //   addressInfo: {
          //     id:'',
          //     update:false,
          //     consigneeName: '',
          //     consigneePhone: '',
          //     detailAddress: ''
          // },
      },
      onLoad: function (e) {
            if (app.openid) {
                  this.setData({
                        openid: app.openid,
                        orderStatus:app.orderStatus
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
            };
            
            this.getdetail(e.id);
      },

      //回到首页
      home() {
            wx.switchTab({
                  url: '/pages/index/index',
            })
      },
      //获取订单详情
      async getdetail(id) {
        // console.log("getdetail.id: ",id);
            let that = this;
            try{
              const res = await request("/order/info",{id:id},"GET");
              // console.log("res__: ",res);
              let pictureList = JSON.parse(res.data.idleItem.pictureList);
              res.data.idleItem.pictureList = pictureList.length > 0 ? pictureList[0] : '';
              
              that.data.detail.orderInfo = res.data;
              that.setData({
                detail:that.data.detail
              })
              that.getOrderAddress(that.data.detail.orderInfo.id);

            }catch(e){
              console.error(e);
            }

      },
      //查看当前订单是否有买家地址
      async getOrderAddress(id){
        let that = this;
        try{
          const res = await request("/order-address/info",{orderId:id},"GET")
          if(res.data){
            that.data.detail.orderAddress = res.data;
            that.data.detail.orderAddress.update = true;
            that.setData({
              detail:that.data.detail
            })
          }else{
            that.getAddressData();
          }
          
        }catch(e){
          console.error(e);
        }
      },
      //获取卖家信息
      getSeller(m) {
            let that = this;
            db.collection('user').where({
                  _openid: m
            }).get({
                  success: function (res) {
                        wx.hideLoading();
                        that.setData({
                              userinfo: res.data[0]
                        })
                  }
            })
      },
      detail_(e){
        let that = this;
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
          url: '/pages/detail/detail?scene=' + id,
        })
      },
      ancel(e){
        let that = this;
        let id = e.currentTarget.dataset.id;
        wx.showModal({
          title: '温暖提示',
          content: '是否取消订单！',
          complete: async(res) => {
            if (res.cancel) {
              
            }
        
            if (res.confirm) {
              try{
                const res = await request("/order/update",{id:id,orderStatus:4},"POST");
      
                if(res.status_code == 1){
                  wx.showToast({
                    title: '取消订单成功',
                    icon:"none"
                  })
                  that.data.detail.orderInfo.orderStatus = 4;
                  that.setData({
                    detail:that.data.detail
                  })
                }else{
                  wx.showToast({
                    title: res.msg,
                    icon:"none"
                  })
                }
              }catch(e){
                wx.showToast({
                  title: '取消订单失败',
                  icon:"none"
                })
                console.error(e);
              }
            }
          }
        })
        
      },
      onPullDownRefresh(){
        this.getdetail(this.data.detail.orderInfo.id);
      },
      selectAddressDialog(){
        let that = this;
        console.log("selectAddressDialog")
        if(that.data.detail.orderInfo.userId==that.data.openid){
          that.setData({
            addressDialogVisible:true
          })
          if(that.data.addressData.length==0){
            that.getAddressData();
          }
      }
      },
      async getAddressData(){
        let that = this;
        try{
          const res = await request('/address/info',{},'GET');
          // console.log("getAddressData_res: ",res);
          if (res.status_code == 1) {
            let data = res.data;
            for (let i = 0; i < data.length; i++) {
                data[i].detailAddressText = data[i].provinceName + data[i].cityName + data[i].regionName + data[i].detailAddress;
            }
            that.setData({
              //存储用户的全部地址
              addressData:data
            })
            // console.log("addressData: ",that.data.addressData);
            if(!that.data.detail.orderAddress.update){
              for(let i=0;i<data.length;i++){
                  if(data[i].defaultFlag){
                      that.selectAddress(i,data[i]);
                  }
              }
            }
          }
        }catch(e){
          console.error(e);
        }
        
      },
      // 关闭对话框
      closeAddressDialog() {
        this.setData({ addressDialogVisible: false });
      },
      selectAddress_(e){
        let that = this;
        const index = e.currentTarget.dataset.index; // 获取索引
        const item = e.currentTarget.dataset.item; // 获取当前项的数据
        that.selectAddress(index,item);
      },
      async selectAddress(i,item){
        let that = this;
        that.setData({
          addressDialogVisible: false
        })
        // console.log(item,this.addressInfo);
        that.data.detail.orderAddress.consigneeName=item.consigneeName;
        that.data.detail.orderAddress.consigneePhone=item.consigneePhone;
        that.data.detail.orderAddress.detailAddress=item.detailAddressText;
        if(that.data.detail.orderAddress.update){
          try{
            const res = await request('/order-address/update',{id:that.data.detail.orderAddress.id,
              consigneeName:item.consigneeName,
              consigneePhone:item.consigneePhone,
              detailAddress:item.detailAddressText},'POST');
          }catch(e){
            console.error(e);
          }
        }else{
          try{
            const res = await request('/order-address/add',{orderId:that.data.detail.orderInfo.id,
              consigneeName:item.consigneeName,
              consigneePhone:item.consigneePhone,
              detailAddress:item.detailAddressText},'POST');
              if(res.status_code===1){
                that.data.detail.orderAddress.update=true;
                that.data.detail.orderAddress.id=res.data.id;
                that.setData({
                  detail:that.data.detail
                })
                
              }else {
                wx.showToast({
                  title: res.msg,
                  icon:'none'
                })
              }
          }catch(e){
            console.error(e);
          }
        }
        that.setData({
          detail: that.data.detail
        })
      },
      async deliver(e){
        let that = this;
        let id = e.currentTarget.dataset.id;
        try{
          const res = await request("/order/update",{id:id,orderStatus:2},"POST");
          // console.log("res__: ",res);
          if(res.status_code == 1){
            wx.showToast({
              title: '发货成功',
              icon:"none"
            })
            that.data.detail.orderInfo.orderStatus = 2;
            that.setData({
              detail:that.data.detail
            })
          }else{
            wx.showToast({
              title: res.msg,
              icon:"none"
            })
          }
        }catch(e){
          wx.showToast({
            title: '发货失败',
            icon:"none"
          })
          console.error(e);
        }
      },

      payment(e){
        let that = this;
        let id = e.currentTarget.dataset.id;
        wx.showModal({
          title: '支付订单',
          content: '模拟支付宝支付，是否确认支付',
          complete: async (res) => {
            if (res.cancel) {
              
            }
        
            if (res.confirm) {
              try{
                const res = await request('/order/update',{
                                          id: id,
                                          orderStatus: 1,
                                          paymentStatus: 1,
                                          paymentWay: '支付宝',
                                          },'POST')
                // console.log("payment_res: ",res);
                if (res.status_code == 1) {
                  wx.showToast({
                    title: '支付成功！',
                    icon:'success'
                  });
                  that.data.detail.orderInfo.orderStatus = 1;
                  that.data.detail.orderInfo.paymentStatus = 1;
                  that.data.detail.orderInfo.paymentWay = '支付宝';
                  that.data.detail.orderInfo.paymentTime = res.data.paymentTime;
                  that.setData({
                    detail:that.data.detail,
                  })
                }
              }catch(e){
                console.error(e);
              }
              
            }
          }
        })
      },
      receipt(e){
        let that = this;
        let id = e.currentTarget.dataset.id;
        wx.showModal({
          title: '温馨提示',
          content: '您确定要确认收货吗？',
          async  success(res) {
            try{
              const res = await request("/order/update",{id:id,orderStatus:3},"POST");
              if(res.status_code == 1){
                wx.showToast({
                  title: '收货成功',
                  icon:"none"
                })
                that.data.detail.orderInfo.orderStatus = 3;
                that.setData({
                  detail:that.data.detail
                })
              }else{
                wx.showToast({
                  title: res.msg,
                  icon:"none"
                })
              }
            }catch(e){
              wx.showToast({
                title: '收货失败',
                icon:"none"
              })
              console.error(e);
            }
          }
        })
      },
      //确认收货
      confirm() {
            let that = this;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要此条订单完成了吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在处理',
                              })
                              wx.cloud.callFunction({
                                    name: 'pay',
                                    data: {
                                          $url: "changeP", //云函数路由参数
                                          _id: that.data.detail.sellid,
                                          status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                    },
                                    success: res => {
                                          console.log('修改订单状态成功')
                                          wx.cloud.callFunction({
                                                name: 'pay',
                                                data: {
                                                      $url: "changeO", //云函数路由参数
                                                      _id: that.data.detail._id,
                                                      status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                                },
                                                success: res => {
                                                      wx.showToast({
                                                            title: '交易成功！',
                                                            icon: 'none'
                                                      })
                                                      that.getdetail(that.data.detail._id);
                                                      wx.showModal({
                                                            title: '打赏小程序',
                                                            content: '请开发者喝阔落？',
                                                            showCancel: true, 
                                                            cancelText:'下次一定',
                                                            confirmText:'现在就去',
                                                            confirmColor: '#fbbd08', 
                                                            success(res) {
                                                                  if (res.confirm) {
                                                                        wx.previewImage({
                                                                              urls: ['https://7461-taoshaoji-46f0r-1302243411.tcb.qcloud.la/appreciate-code/appreciateimg.jpg?sign=b6789b4ae3b6c830689f41ddca8f183e&t=1597523262'],
                                                                        })
                                                                  }
                                                            }
                                                      })
                                                },
                                                fail(e) {
                                                      wx.hideLoading();
                                                      wx.showToast({
                                                            title: '发生异常，请及时和管理人员联系处理',
                                                            icon: 'none'
                                                      })
                                                }
                                          })
                                    },
                                    fail(e) {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '发生异常，请及时和管理人员联系处理',
                                                icon: 'none'
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      //删除订单
      delete() {
            let that = this;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确认要删除此订单吗',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在处理',
                              })
                              db.collection('publish').doc(that.data.detail._id).remove({
                                    success() {
                                          //页面栈返回
                                          let i = getCurrentPages()
                                          wx.navigateBack({
                                                success: function () {
                                                      i[i.length - 2].getlist();
                                                }
                                          });
                                    },
                                    fail: console.error
                              })
                        }
                  }
            })
      },
      //复制
      copy(e) {
            wx.setClipboardData({
                  data: e.currentTarget.dataset.copy,
                  success: res => {
                        wx.showToast({
                              title: '复制' + e.currentTarget.dataset.name + '成功',
                              icon: 'success',
                              duration: 1000,
                        })
                  }
            })
      },

      //历史记录
      history(name, num, type) {
            let that = this;
            db.collection('history').add({
                  data: {
                        stamp: new Date().getTime(),
                        type: type, //1充值2支付
                        name: name,
                        num: num,
                        oid: app.openid
                  },
                  success: function (res) {
                        console.log(res)
                  },
                  fail: console.error
            })
      },

      goo(e) {
            var myid = this.data.detail.buyerInfo._openid;
            var sallerid = this.data.detail.seller;
            wx.cloud.init({
                  env: 'taoshaoji-46f0r',
                  traceUser: true
            });
            //初始化数据库
            const db = wx.cloud.database();
            if (myid != sallerid) {
                  db.collection('rooms').where({
                        p_b: myid,
                        p_s: sallerid,
                        deleted :0
                  }).get().then(res => {
                        console.log(res.data);
                        if (res.data.length > 0) {
                              this.setData({
                                    roomID: res.data[0]._id
                              })
                              wx.navigateTo({
                                    url: '/pages/detail/room/room?id=' + this.data.roomID,
                              })
                        } else {
                              db.collection('rooms').add({
                                    data: {
                                          p_b: myid,
                                          p_s: sallerid,
                                          deleted :0
                                    },
                              }).then(res => {
                                    console.log(res)
                                    this.setData({
                                          roomID: res._id
                                    })
                                    wx.navigateTo({
                                          url: '/pages/detail/room/room?id=' + this.data.roomID,
                                    })
                              })
                        }
                  })
            } else {
                  wx.showToast({
                        title: '无法和自己建立聊天',
                        icon: 'none',
                        duration: 1500
                  })
            }
      },

})