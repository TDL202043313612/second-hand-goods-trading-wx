const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const { default: request } = require("../../utils/request.js");
const _ = db.command;
Page({

      /**
       * 页面的初始数据
       */
      data: {
            list: [],
            page: 1,
            scrollTop: 0,
            nomore: false,
            roomlist: [],
            buyerInfo: [],
            address: '',
            sellerInfo: '',
            orderStatus:[]
      },
      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function (options) {
            wx.showLoading({
                  title: '加载中',
            })
            this.getList();
            this.setData({
              orderStatus:app.orderStatus
            })
      },

      /**
       * 获取买家名字
       */
      getBuyerInfo(orderid) {
            let that = this;
            db.collection('order').where({
                  sellid: orderid,
            }).get({
                  success: function (res) {
                        that.setData({
                              buyerInfo: res.data[0],
                        })
                  }
            })
      },
      pictureString_toList(list){
        let that = this;
          for (let i = 0; i < list.length; i++) {
            const pictureList = JSON.parse(list[i].pictureList);
            list[i].pictureList = pictureList;
            list[i].releaseTime = list[i].releaseTime.substring(0, 10);
          }
          
          that.setData({
            list: list,
          });
          
      },
      async getList() {
        // console.log("getList");
            let that = this;
            try{
              const res = await request("/order/my-sold",{},"GET");
              wx.hideLoading();
              wx.stopPullDownRefresh(); //暂停刷新动作
              app.dataList[3]=[];
              for (let i = 0; i < res.data.length; i++) {
                let pictureList = JSON.parse(res.data[i].idleItem.pictureList);
                res.data[i].idleItem.pictureList = pictureList.length > 0 ? pictureList[0] : '';
                // res.data[i].releaseTime = res.data[i].releaseTime.substring(0,10);
                
                app.dataList[3].push(res.data[i]);
                
            }
              that.setData({
                nomore: true,
                list:app.dataList[3],
                page: 1,
              })

            }catch(e){
              console.error(e);
            }
            
      },
      //下架
      del(e) {
            let that = this;
            let del = e.currentTarget.dataset.del;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要下架此条订单吗？',
                  async  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在下架'
                              })
                              try{
                                  const res = await request('/idle/update',{id:del.id,idleStatus:2},'POST')
                                  wx.hideLoading();
                                          wx.showToast({
                                                title: '成功下架',
                                          })
                                          that.getList();
                              }catch(e){
                                wx.hideLoading();
                                          wx.showToast({
                                                title: '下架失败',
                                                icon: 'none'
                                          })
                                console.error(e);
                              }
                              
                        }
                  }
            })
      },
      //擦亮
      crash(e) {
            let that = this;
            let crash = e.currentTarget.dataset.crash;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要擦亮此条订单吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在擦亮'
                              })
                              db.collection('publish').doc(crash._id).update({
                                    data: {
                                          creat: new Date().getTime(),
                                          dura: new Date().getTime() + 7 * (24 * 60 * 60 * 1000), //每次擦亮管7天
                                    },
                                    success() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '成功擦亮',
                                          })
                                          that.getList();
                                    },
                                    fail() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '操作失败',
                                                icon: 'none'
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      //取消交易
      quxiao(e) {
            let that = this;
            let quxiao = e.currentTarget.dataset.quxiao;
            that.getBuyerInfo(quxiao._id);
            that.getSellerInfo()
            console.log("sellname--->" + that.data.sellerName)
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要取消此条订单吗？',
                  success(res) {
                        if (res.confirm) {
                              that.getAddress()
                              wx.showLoading({
                                    title: '正在取消'
                              })
                              db.collection('publish').doc(quxiao._id).update({
                                    data: {
                                          status: 3,
                                    },
                                    success() {
                                          wx.cloud.callFunction({
                                                name: 'removeOrder',
                                                data: {
                                                      _id: quxiao._id,
                                                },
                                                success: res => {
                                                      wx.hideLoading();
                                                      wx.showToast({
                                                            title: '成功取消该订单',
                                                      })
                                                      that.sendCancel(that.data.buyerInfo._openid)
                                                      that.getList();
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
                                    fail() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '操作失败',
                                                icon: 'none'
                                          })
                                    }
                              })

                        }
                  }
            })
      },
      //获取当前的用户昵称
      getSellerInfo() {
            let that = this;
            db.collection('user').where({
                  _openid: app.openid
            }).get().then(res => {
                  console.log(res.data[0]);
                  that.setData({
                        sellerInfo: res.data[0].info
                  })
            })
      },
      /**
       * 获取地址
       */
      getAddress() {
            let that = this;
            if (that.data.buyerInfo.deliveryid == 0) {
                  that.setData({
                        address: that.data.buyerInfo.ztplace
                  })
            } else {
                  that.setData({
                        address: that.data.buyerInfo.psplace
                  })
            }
      },
      //发送模板消息到指定用户,推送之前要先获取用户的openid
      sendCancel(openid) {
            let that = this;
            wx.cloud.callFunction({
                  name: "sendMsg",
                  data: {
                        openid: openid,
                        status: '卖家取消交易', //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；
                        address: that.data.address,
                        describe: that.data.buyerInfo.bookinfo.describe,
                        good: that.data.buyerInfo.bookinfo.good,
                        nickName: that.data.sellerInfo.nickName,
                        color: 'yellow'
                  }
            }).then(res => {
                  console.log("推送消息成功", res)
            }).catch(res => {
                  console.log("推送消息失败", res)
            })
      },
      //完成交易
      wancheng(e) {
            let that = this;
            let wancheng = e.currentTarget.dataset.wancheng._id;
            console.log("wancheng:" + wancheng)
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要此条订单完成了吗？',
                  success(res) {
                        console.log(e.currentTarget.data)
                        db.collection('order').doc(wancheng).get({
                              success(e) {
                                    if (res.confirm) {
                                          if (e.data.status == 5) {
                                                wx.showLoading({
                                                      title: '正在操作'
                                                })
                                                wx.cloud.callFunction({
                                                      name: 'pay',
                                                      data: {
                                                            $url: "changeP", //云函数路由参数
                                                            _id: wancheng,
                                                            status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款；4、等待卖家确认交易
                                                      },
                                                      success: res => {
                                                            console.log('修改卖家订单状态成功')
                                                            wx.cloud.callFunction({
                                                                  name: 'pay',
                                                                  data: {
                                                                        $url: "changeO", //云函数路由参数
                                                                        _id: wancheng,
                                                                        status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款；4、等待卖家确认交易
                                                                  },
                                                                  success: res => {
                                                                        wx.showToast({
                                                                              title: '交易成功！',
                                                                              icon: 'none'
                                                                        })
                                                                        that.getList();
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
                                                that.getList();
                                          } else {
                                                wx.hideLoading();
                                                wx.showToast({
                                                      title: '操作失败，买家未确认收货',
                                                      icon: 'none'
                                                })
                                          }
                                    }
                              }
                        })
                  }
            })
      },
      //重新上架
      up(e) {
            let that = this;
            let up = e.currentTarget.dataset.up;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要重新上架该商品吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在操作'
                              })
                              db.collection('publish').doc(up._id).update({
                                    data: {
                                          status: 0,
                                    },
                                    success() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '该商品成功上架',
                                          })
                                          that.getList();
                                    },
                                    fail() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '操作失败',
                                                icon: 'none'
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      //查看详情
      detail(e) {
            let that = this;
            let detail = e.currentTarget.dataset.detail;
            if (false) {
                  wx.navigateTo({
                        url: '/pages/detail/detail?scene=' + detail._id,
                  })
            } else {
                  wx.navigateTo({
                        //发送卖出订单id
                        url: '/pages/sale/detail/detail?id=' + detail.id,
                  })
            }

      },
      //下拉刷新
      onPullDownRefresh() {
        
            this.getList();
      },
      //至顶
      gotop() {
            wx.pageScrollTo({
                  scrollTop: 0
            })
      },
      //监测屏幕滚动
      onPageScroll: function (e) {
            this.setData({
                  scrollTop: parseInt((e.scrollTop) * wx.getWindowInfo().pixelRatio)
            })
      },
      onReachBottom() {
            this.more();
      },
      //加载更多
      more() {
            let that = this;
            if (that.data.nomore || that.data.list.length < 20) {
                  return false
            }
            let page = that.data.page + 1;
            db.collection('publish').where({
                  _openid: app.openid
            }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
                  success: function (res) {
                        if (res.data.length == 0) {
                              that.setData({
                                    nomore: true
                              })
                              return false;
                        }
                        if (res.data.length < 20) {
                              that.setData({
                                    nomore: true
                              })
                        }
                        that.setData({
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                  },
                  fail() {
                        wx.showToast({
                              title: '获取失败',
                              icon: 'none'
                        })
                  }
            })
      },
      onShow() {
            // this.getList()
      }
})