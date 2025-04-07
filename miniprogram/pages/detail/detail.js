import request from '../../utils/request';
const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");


const _ = db.command;
let obj = ''
Page({

  onUnload() {
    // 获取页面栈
    const pages = getCurrentPages();
    // 获取上一个页面实例
    const prevPage = pages[pages.length - 2];
    // 设置数据
    if (prevPage && prevPage.setData) {
      prevPage.setData({
        returnData: { message: 123 }
      });
    }

  },
      /**
       * 页面的初始数据
       */
      data: {
            id: null,
            first_title: true,
            place: '',
            roomID: '',
            goodssaller: '',
            openid: '',
            imgs: [],
            isShow: true,
            status: 0,
            avatarUrl: '',
            buyerInfo: [],
            isMaster:false,
            isExist: Boolean,
            address:'',
            roomlist:[],
            messageDtail:[], //详细的留言
            isReply: false, // 是否显示输入框
            replyContent: '', // 回复内容
            selectedIndex: null, // 在弹窗展示详细留言中使用

            actionSheetHidden: true,   //作为开关控制弹窗是否从底部弹出

            replyData:{
              toUserNickname:'',
              toMessage:''
          },
          toUser:null,
          toMessage:null,

          showModal: false, // 是否显示弹框
          selectedContent: '', // 选中的文本内容

          isFavorite:true,
          favoriteId:0,
      },
      onShow(e){
        if (app.openid) {
          this.setData({
                openid: app.openid
          })
          if(this.data.publishinfo!=null){
            if(this.data.openid == this.data.publishinfo.userId){
              this.setData({
                isMaster:true
              })
            }
          }
          
        }
        if(this.data.id){
          this.getIdleItem(this.data.id); // 重新获取商品信息
          this.getIdleItemMessage(this.data.id); // 重新获取商品留言
        }
      },
      onLoad(e) {
            obj = e;
            //this.getuserdetail();
            this.data.id = e.scene;

            
            // console.log("this.data.id",this.data.id);
            // this.getPublish(e.scene);
            //获取商品信息（包括卖家信息）
            this.getIdleItem(e.scene);
            
            //获取商品全部留言
            this.getIdleItemMessage(e.scene);
            if (app.openid) {
                  this.setData({
                      openid: app.openid
                  })
            } else {
                  // console.log("no openid");
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
            //买家信息
            //this.getBuyer(this.data.openid)
            wx.showShareMenu({
                  withShareTicket: true,
                  menus: ['shareAppMessage', 'shareTimeline']
            })
      },
      async collect(e){
        let that = this;
        let id = e.currentTarget.dataset.id;
        if(that.data.isFavorite){
          try{
            const res = await request('/favorite/delete',{id: that.data.favoriteId},'GET');
            if(res.status_code===1){
              wx.showToast({
                title: '已取消收藏！',
                icon:'none'
              })
              that.setData({
                isFavorite: false
              })
            }else {
              wx.showToast({
                title: '取消收藏失败！',
                icon:'none'
              })
            }
          }catch(e){
            console.error(e);
          }
          
        }else {
          try{
            const res = await request('/favorite/add',{idleId: id},'POST');
            if(res.status_code===1){
              wx.showToast({
                title: '已收藏！',
                icon:'none'
              })
              that.setData({
                isFavorite: true,
                favoriteId:res.data
              })
            }else {
              wx.showToast({
                title: '收藏失败！',
                icon:'none'
              })
            }
          }catch(e){
            console.error(e);
          }

        }
      },
      async checkFavorite(){

        let that = this;
        try{
          const res = await request('/favorite/check',{idleId:that.data.publishinfo.id},'GET');
          if(!res.data){
            that.setData({
              isFavorite:false
            })
          }else {
            that.setData({
              favoriteId:res.data
            })
          }
        }catch(e){
          console.error(e);
        }
      },
      async init_charList() {
        let that = this;
        let messageDtail_=[];
        try{
          const res = await request('/message/idle',{idleId:that.data.publishinfo.id},'GET');
          // console.log("init_charList_: ",res);
          wx.stopPullDownRefresh()
          if(res.status_code == 1){
            for(let i=0;i<res.data.length;i++){
              if(res.data[i].toU.nickname!=null && res.data[i].toM.content.length>5){
                res.data[i].toM.content = res.data[i].toM.content.substring(0,5)+'...';
              }
              
              messageDtail_.push(res.data[i].content);
              res.data[i].content = res.data[i].content.length>10?res.data[i].content.substring(0,10)+'...':res.data[i].content;
              

              // res.data[i].createTime = res.data[i].createTime.substring(0,10);
            }
            app.roomlist = res.data;
            that.setData({
              roomlist: app.roomlist,
              messageDtail: messageDtail_
            })
            
          }
        }catch(e){
          console.error(e);
        }
      },
      replyMessage(e){
        let that = this;
        let index = e.currentTarget.dataset.index;
        console.log("index: ",index);
        if (app.openid) {
          that.data.replyData.toUserNickname=that.data.roomlist[index].fromU.nickname;
          that.data.replyData.toMessage=that.data.roomlist[index].content.substring(0,5)+(that.data.roomlist[index].content.length>5?'...':'');
          this.setData({
                isReply:true,
                actionSheetHidden: false,
                replyData:that.data.replyData,
                toUser:that.data.roomlist[index].userId,
                toMessage:that.data.roomlist[index].id,
          })
        } else {
          // console.log("no openid");
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
      cancelReply(e){
        let that = this;
        that.data.replyData.toUserNickname='';
        that.data.replyData.toMessage='';
        that.setData({
          isReply:false,
          replyData:that.data.replyData,
          toUser:that.data.publishinfo.userId,
          toMessage:null,
    })
      },
       //将输入的内容绑定到 msg 中
      obtainInput(e) {
        this.data.replyContent = e.detail.value;
      },
      inputConfirm(e){
        let that = this;
        let replyMessage = that.data.replyContent.trim();
        // console.log("replyMessage: ",replyMessage);
        if(replyMessage != ""){
          that.sendMessage(replyMessage);
          
        }else{
          wx.showToast({
            title: '回复内容不能为空',
            icon:'none'
          })
        }
        
      },
      inputCancel(){
        // console.log("inputCancel");
        let that = this;
        
        that.setData({
          actionSheetHidden: true
        })
        that.setData({
          replyContent:''
        })
        that.cancelReply();
      },
      leaveMessage(){
        console.log("leaveMessage");
        let that = this;
        if(app.openid){
          that.setData({
            actionSheetHidden: false,
          })
        } else {
        // console.log("no openid");
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
      detailMessage(e){
        let that = this;
        let index = e.currentTarget.dataset.index;
        const content = that.data.messageDtail[index]; // 获取对应的内容
        
        this.setData({
          showModal: true,
          selectedContent: content,
          selectedIndex:index
        });
        

      },
      // 弹窗确认回复
      onModalConfirm() {
        const index = this.data.selectedIndex; // 使用保存的 index
        this.replyMessage({ currentTarget: { dataset: { index } } }); // 手动触发回复方法
        this.setData({ showModal: false });
      },
      hideModal() {
        this.setData({
          showModal: false,
        });
      },
      async sendMessage(content){
        let that = this;
        if(that.data.toUser == null){
          that.data.toUser=that.data.publishinfo.userId;
        }
        let contentList=content.split(/\r?\n/);
        let contenHtml=contentList[0];
        for(let i=1;i<contentList.length;i++){
          contenHtml+='<br>'+contentList[i];
        }
        try{
          const res = await request('/message/send',{idleId:that.data.publishinfo.id,
                                                      content:contenHtml,
                                                      toUser:that.data.toUser,
                                                      toMessage:that.data.toMessage},'POST');
          // console.log("sendMessage_res: ",res);
          if(res.status_code == 1){
            wx.showToast({
              title: '留言成功',
              icon:'none'
            })
            that.setData({
              replyContent:'',
              actionSheetHidden: true,
            })
            that.cancelReply();
            that.init_charList();
          }else{
            wx.showToast({
              title: '留言失败',
              icon:'none'
            })
          }                                            
        }catch(e){
          wx.showToast({
            title: '留言失败',
            icon:'none'
          })
          console.error(e);
        }
      },



      changeTitle(e) {
            let that = this;
            that.setData({
                  first_title: e.currentTarget.dataset.id
            })
      },

      async getIdleItem(e){
        let that = this;
        // console.log("getIdleItem")
        try {
          const res = await request('/idle/info', { id: e }, 'GET');
          let list_ = res.data;
          const pictureList = JSON.parse(list_.pictureList);
          list_.pictureList = pictureList;
          if(that.data.openid == list_.userId){
            that.setData({
              isMaster: true
            })
          }
          that.setData({
            publishinfo: list_
          })
          //获取商品留言
          that.init_charList();
          //获取商品是否被收藏
          that.checkFavorite();
          // console.log(that.data.publishinfo.pictureList[0])
        }catch (error) {
          console.error(error);
        }
      },
      async getIdleItemMessage(e){
        let that = this;
        try {
          const res = await request('/message/idle', { idleId: e }, 'GET');
          let list_ = res.data;
          
          that.setData({
            messageList: list_
          })
          
        }catch (error) {
          console.error(error);
        }
      },
      
      
      //回到首页
      home() {
            wx.switchTab({
                  url: '/pages/index/index',
            })
      },
      //回到我的
      my() {
            wx.switchTab({
                  url: '/pages/my/my',
            })
      },
      //购买检测
      async buy(e) {
            var myid = this.data.openid;
            var sallerid = this.data.publishinfo.userId;
            var detail = e.currentTarget.dataset.detail;
            let that = this;
            console.log(myid,sallerid)
            
            if ((myid!='' && sallerid!='') && myid == sallerid) {
                  wx.showToast({
                        title: '自己买不了自己的噢！',
                        icon: 'none',
                        duration: 1500
                  })
                  return false
            }
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
            // if (that.data.publishinfo.deliveryid == 1) {
            //       if (that.data.place == '') {
            //             wx.hideLoading();
            //             wx.showToast({
            //                   title: '请输入您的收货地址',
            //                   icon: 'none'
            //             })
            //             return false
            //       }
            // }
            try{
              const res = await request('/order/add',{idleId:detail.id,
              orderPrice:detail.idlePrice},'POST');
              if(res.status_code==1){
                wx.navigateTo({
                  url: '../order/detail/detail?id=' + res.data.id,
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
            

            
      },
      downShelf(e){
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
                                          that.getIdleItem(that.data.id);
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
      upShelf(e){
        let that = this;
        let up = e.currentTarget.dataset.up;
        wx.showModal({
              title: '温馨提示',
              content: '您确定要重新上架该商品吗？',
              async  success(res) {
                if (res.confirm) {
                      wx.showLoading({
                            title: '正在上架'
                      })
                      try{
                          const res = await request('/idle/update',{id:up.id,idleStatus:1},'POST')
                          wx.hideLoading();
                                  wx.showToast({
                                        title: '上架成功',
                                  })
                                  that.getIdleItem(that.data.id);
                      }catch(e){
                        wx.hideLoading();
                                  wx.showToast({
                                        title: '上架失败',
                                        icon: 'none'
                                  })
                        console.error(e);
                      }
                      
                }
          }
        })
      },
      //获取订单状态
      getStatus() {
            let that = this;
            let _id = that.data.publishinfo._id;
            console.log(_id);
            db.collection('publish').doc(_id).get({
                  success(e) {
                        if (e.data.status == 0) {
                              that.creatOrder(_id);
                        }
                        if (e.data.status == 1) {
                              wx.showToast({
                                    title: '该物品刚刚被抢光了~',
                                    icon: 'none'
                              })
                        }
                        if (e.data.status == 2) {
                              wx.showToast({
                                    title: '该物品已出售',
                                    icon: 'none'
                              })
                        }
                        if (e.data.status == 3) {
                              wx.showToast({
                                    title: '该物品已下架',
                                    icon: 'none'
                              })
                        }
                  }
            })
      },
      //创建订单
      creatOrder(iid) {
            let that = this;

            db.collection('order').where({
                  _id: iid
            }).get().then(res => {
                  console.log(res.data);
                  if (res.data.length > 0) {
                        that.setData({
                              isExist: true
                        })
                        console.log("isExist:" + that.data.isExist)
                  } else {
                        that.setData({
                              isExist: false
                        })
                        console.log("isExist:" + that.data.isExist)
                  }
            })

            wx.showModal({
                  title: '确认提示',
                  content: '是否确认下单购买此商品？',
                  success(res) {
                        if (res.confirm) {
                              if (!that.data.isExist) {
                                    wx.cloud.callFunction({
                                          // 云函数名称
                                          name: 'node',
                                          // 传给云函数的参数
                                          data: {
                                                _id: iid,
                                                status: 1
                                          },
                                          success: function (res) {
                                                console.log(res)
                                          },
                                          fail: console.error
                                    })
                                    wx.getUserInfo({
                                          success: function (res) {
                                                that.setData({
                                                      buyerName: res.userInfo.nickName,
                                                      avatarUrl: res.userInfo.avatarUrl,
                                                })
                                          },
                                          fail(){
                                                console.log("调用getUserinfo失败")
                                          }
                                    })
                                    db.collection('publish').doc({
                                          iid
                                    }).update({
                                          data: {
                                                status: 1
                                          },
                                          success() {
                                                wx.hideLoading();
                                                // that.getList();
                                                db.collection('order').add({
                                                      data: {
                                                            creat: new Date().getTime(),
                                                            status: 1, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；
                                                            price: that.data.publishinfo.price, //售价
                                                            deliveryid: that.data.publishinfo.deliveryid, //0自1配
                                                            ztplace: that.data.publishinfo.place, //自提时地址
                                                            psplace: that.data.place, //配送时买家填的地址
                                                            bookinfo: {
                                                                  describe: that.data.publishinfo.bookinfo.describe,
                                                                  pic: that.data.publishinfo.bookinfo.pic,
                                                                  good: that.data.publishinfo.bookinfo.good,
                                                            },
                                                            buyerInfo: that.data.buyerInfo,
                                                            seller: that.data.publishinfo._openid,
                                                            sellid: that.data.publishinfo._id,
                                                            _id: that.data.publishinfo._id,
                                                      },
                                                      success() {
                                                            that.getAddress()
                                                            that.send(that.data.goodssaller)
                                                            wx.showToast({
                                                                  title: '成功预订！',
                                                                  icon: 'success',
                                                                  duration: 3000
                                                            })
                                                            setTimeout(function () {
                                                                  wx.switchTab({
                                                                        url: '/pages/index/index',
                                                                  })
                                                            }, 3000)
                                                      },
                                                      fail() {
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
                                    that.onLoad(obj);
                              } else {
                                    wx.cloud.callFunction({
                                          // 云函数名称
                                          name: 'node',
                                          // 传给云函数的参数
                                          data: {
                                                _id: iid,
                                                status: 1
                                          },
                                          success: function (res) {
                                                console.log(res)
                                          },
                                          fail: console.error
                                    })
                                    db.collection('publish').doc({
                                          iid
                                    }).update({
                                          data: {
                                                status: 1
                                          },
                                          success() {
                                                wx.hideLoading();
                                                // that.getList();
                                                wx.cloud.callFunction({
                                                      // 云函数名称
                                                      name: 'pay',
                                                      // 传给云函数的参数
                                                      data: {
                                                            $url: "changeO", //云函数路由参数
                                                            _id: iid,
                                                            status: 1
                                                      },
                                                      success() {
                                                            that.getAddress()
                                                            that.send(that.data.goodssaller)
                                                            wx.showToast({
                                                                  title: '成功预订！',
                                                                  icon: 'success',
                                                                  duration: 3000
                                                            })
                                                      },
                                                      fail() {
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
                                    that.onLoad(obj);
                              }
                        }
                  }
            })

      },

      //发送模板消息到指定用户,推送之前要先获取用户的openid
      send(openid) {
            let that = this;
            wx.cloud.callFunction({
                  name: "sendMsg",
                  data: {
                        openid: openid,
                        status: '买家已预定', //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；
                        address:that.data.address,
                        describe: that.data.publishinfo.bookinfo.describe,
                        good: that.data.publishinfo.bookinfo.good,
                        nickName: that.data.buyerInfo.info.nickName,
                        color: 'red'
                  }
            }).then(res => {
                  console.log("推送消息成功", res)
            }).catch(res => {
                  console.log("推送消息失败", res)
            })
      },

      //路由
      go(e) {
            wx.navigateTo({
                  url: e.currentTarget.dataset.go,
            })
      },
      //地址输入
      placeInput(e) {
            this.data.place = e.detail.value
      },
      //为了数据安全可靠，每次进入获取一次用户信息
      getuserdetail() {
            if (!app.openid) {
                  wx.cloud.callFunction({
                        name: 'regist', // 对应云函数名
                        data: {
                              $url: "getid", //云函数路由参数
                        },
                        success: re => {
                              db.collection('user').where({
                                    _openid: re.result
                              }).get({
                                    success: function (res) {
                                          if (res.data.length !== 0) {
                                                app.openid = re.result;
                                                app.userinfo = res.data[0];
                                                console.log(app)
                                          }
                                          console.log(res)
                                    }
                              })
                        }
                  })
            }
      },

      //图片点击事件
      img: function (event) {
            let arr = [];
            arr.push(this.data.publishinfo.pictureList);
            var src = event.currentTarget.dataset.src; //获取data-src
            // var imgList = that.data.result.images_fileID;
            //图片预览
            wx.previewImage({
                  current: src, // 当前显示图片的http链接
                  urls: arr[0] // 需要预览的图片http链接列表
            })
      },

      /**
       * 获取地址
       */
      getAddress() {
            let that = this;
            if (that.data.publishinfo.deliveryid == 0) {
                  that.setData({
                        address: that.data.publishinfo.place
                  })
            } else {
                  that.setData({
                        address: that.data.place
                  })
            }
      },
})