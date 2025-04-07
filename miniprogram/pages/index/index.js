import request from '../../utils/request';
const app = getApp()

const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;
Page({
      data: {
            college: JSON.parse(config.data).college,
            collegeCur: -2,
            showList: false,
            scrollTop: 0,
            nomore: false,
            page: 1,
            nums:10,
            adShow: false,
            list: [],
            picture_i: 0,
            banner: [{
              
            }],
            indexTip: '欢迎光临二手交易平台',
            openid: app.openid
      },
      // 用户点击右上角分享给好友,要先在分享好友这里设置menus的两个参数,才可以分享朋友圈
      onShareAppMessage: function () {
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
      
      onLoad() {
            this.listkind();
            
      },

      //监测屏幕滚动
      onPageScroll: function (e) {
            this.setData({
                  scrollTop: parseInt((e.scrollTop) * wx.getWindowInfo().pixelRatio)
            })
      },
    
        
      //获取上次布局记忆
      listkind() {
            let that = this;
            wx.getStorage({
                  key: 'iscard',
                  success: function (res) {
                        that.setData({
                              iscard: res.data
                        })
                  },
                  fail() {
                        that.setData({
                              iscard: true,
                        })
                  }
            })
      },
      //布局方式选择
      changeCard() {
            let that = this;
            if (that.data.iscard) {
                  that.setData({
                        iscard: false
                  })
                  wx.setStorage({
                        key: 'iscard',
                        data: false,
                  })
            } else {
                  that.setData({
                        iscard: true
                  })
                  wx.setStorage({
                        key: 'iscard',
                        data: true,
                  })
            }
      },
      //跳转搜索
      search() {
            wx.navigateTo({
                  url: '/pages/search/search',
            })
      },
      //类别选择
      collegeSelect(e) {
            this.setData({
                  collegeCur: e.currentTarget.dataset.id - 1,
                  scrollLeft: (e.currentTarget.dataset.id - 3) * 100,
                  showList: false,
            })
            this.getList();
      },
      //选择全部
      selectAll() {
            this.setData({
                  collegeCur: -2,
                  scrollLeft: -200,
                  showList: false,
            })
            this.getList();
      },
      //展示列表小面板
      showlist() {
            let that = this;
            if (that.data.showList) {
                  that.setData({
                        showList: false,
                  })
            } else {
                  that.setData({
                        showList: true,
                  })
            }
      },
      //微信云数据库
      // getList() {
      //       console.log("调用了getlist")
      //       let that = this;
      //       if (that.data.collegeCur == -2) {
      //             var collegeid = _.neq(-2); //除-2之外所有
      //       } else {
      //             var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
                  
      //       }
            
      //       db.collection('publish').where({
      //             status: 0,
      //             dura: _.gt(new Date().getTime()),
      //             collegeid: collegeid
      //       }).orderBy('creat', 'desc').limit(20).get({
      //             success: function (res) {
      //                   wx.stopPullDownRefresh(); //暂停刷新动作
      //                   if (res.data.length == 0) {
      //                         that.setData({
      //                               nomore: true,
      //                               list: [],
      //                         })
      //                         return false;
      //                   }
      //                   if (res.data.length < 20) {
      //                         that.setData({
      //                               nomore: true,
      //                               page: 0,
      //                               list: res.data,
      //                         })
      //                   } else {
      //                         that.setData({
      //                               page: 0,
      //                               list: res.data,
      //                               nomore: false,
      //                         })
      //                   }
      //             }
      //       })
      // },
      //
      
      //
      
      //Mysql
      // getList() {
      //         console.log("调用了getlist")
      //         let that = this;
      //         let labelName = that.data.collegeCur + 2;
      //         console.log("labelName: "+labelName)
      //         if (labelName == 0) { //等于0：查询所有
      //                 wx.request({
      //                         url:'http://localhost:8080/idle/find',
      //                         method: 'GET',
      //                         data:{
      //                                 page : that.data.page,
      //                                 nums : 20,
      //                         },
      //                         success(res) {
      //                           // const res_ = JSON.parse(res);
      //                           console.log("success");
      //                           console.log("res.data: ",res.data);
      //                           console.log("res: ",res);
      //                           console.log(res.status_code);
      //                           // console.log("status_code: ",res.status_code);
      //                           // console.log("count: ",res.data.count);
                                
      //                           wx.stopPullDownRefresh(); // 停止下拉刷新动画
      //                           if (res.data.length == 0) {
      //                               that.setData({
      //                                   nomore: true,
      //                                   list: [],
      //                               });
      //                               return false;
      //                           }
                    
      //                           if (res.data.length < 20) {
      //                               that.setData({
      //                                   nomore: true,
      //                                   page: 1,
      //                                   list: res.data,
      //                               });
      //                           } else {
      //                               that.setData({
      //                                   page: 1,
      //                                   list: res.data,
      //                                   nomore: false,
      //                               });
      //                           }
      //                       },
      //                 });
      //         } else {
      //                 wx.request({
      //                     url:'http://localhost:8080/idle/lable',
      //                     method: 'GET',
      //                     data:{
      //                             idleLabel : labelName,
      //                             page : that.data.page,
      //                             nums : 20,
      //                     },
      //                     success(res) {
      //                       wx.stopPullDownRefresh(); // 停止下拉刷新动画
      //                       if (res.data.length == 0) {
      //                           that.setData({
      //                               nomore: true,
      //                               list: [],
      //                           });
      //                           return false;
      //                       }
                
      //                       if (res.data.length < 20) {
      //                           that.setData({
      //                               nomore: true,
      //                               page: 1,
      //                               list: res.data,
      //                           });
      //                       } else {
      //                           that.setData({
      //                               page: 1,
      //                               list: res.data,
      //                               nomore: false,
      //                           });
      //                       }
      //                     },
      //                 });
      //         }
      // },

      pictureString_toList(list,i){
        let that = this;
          for (; i < list.length; i++) {
            const pictureList = JSON.parse(list[i].pictureList);
            list[i].pictureList = pictureList;
            list[i].releaseTime = list[i].releaseTime.substring(0, 10);
          }
          
          that.setData({
            list: list,
          });
          that.data.picture_i = i
      },

      async getList() {
        let that = this;
        that.data.picture_i = 0;
        // console.log("调用了getlist")
        let labelName = that.data.collegeCur + 2;
        if(labelName == 0){ //等于0：查询所有
          try {
            const res = await request('/idle/find', { page: 1, nums: that.data.nums }, 'GET');
            // console.log("res.data.count: ",res.data.count);
            if (res.data.list.length == 0) {
              that.setData({
                  nomore: true,
                  list: [],
              });
              return false;
            }else if (res.data.list.length < that.data.nums) {
              // console.log("rcount < 20");
                that.setData({
                    nomore: true,
                    page: 1,
                    list: res.data.list,
                });
            } else {
                that.setData({
                    page: 1,
                    list: res.data.list,
                    nomore: false,
                });
            }
          } catch (error) {
            console.error(error);
          }
          
          
          // console.log("list_length: ",that.data.list[0].pictureList);
        }else{ //不等于0：按分类查询
          try {
            const res = await request('/idle/lable', { idleLabel: labelName,page: 1, nums: that.data.nums }, 'GET');
            if (res.data.list.length == 0) {
              that.setData({
                  nomore: true,
                  list: [],
              });
              return false;
            }

            if (res.data.list.length < that.data.nums) {
                that.setData({
                    nomore: true,
                    page: 1,
                    list: res.data.list,
                });
            } else {
                that.setData({
                    page: 1,
                    list: res.data.list,
                    nomore: false,
                });
            }
          } catch (error) {
            console.error(error);
          }
        }
        that.pictureString_toList(that.data.list,that.data.picture_i);
      },
      async more() {
        console.log("more");
            let that = this;
            if (that.data.nomore || that.data.list.length < that.data.nums) {
                  return false
            }
            let page = that.data.page + 1;
            let labelName = that.data.collegeCur + 2;
            if (labelName == 0) {
              try {
                const res = await request('/idle/find', { page: page, nums: that.data.nums }, 'GET');

                console.log("res.data.list.length: ",res.data.list.length);

                if (res.data.list.length == 0) {
                  that.setData({
                      nomore: true,
                      // list: [],
                  });
                  return false;
                }else if (res.data.list.length < that.data.nums) {
                  // console.log("rcount < 20");
                    that.setData({
                        nomore: true,
                        page: page,
                        list: that.data.list.concat(res.data.list),
                    });
                } else {
                    that.setData({
                        page: page,
                        list: that.data.list.concat(res.data.list),
                        nomore: false,
                    });
                }
              } catch (error) {
                console.error(error);
              }
            } else {
              try {
                const res = await request('/idle/lable', { idleLabel: labelName,page: page, nums: that.data.nums }, 'GET');
                if (res.data.list.length == 0) {
                  that.setData({
                      nomore: true,
                      // list: [],
                  });
                  return false;
                }else if (res.data.list.length < that.data.nums) {
                    that.setData({
                        nomore: true,
                        page: page,
                        list: that.data.list.concat(res.data.list),
                    });
                } else {
                    that.setData({
                        page: page,
                        list: that.data.list.concat(res.data.list),
                        nomore: false,
                    });
                }
              } catch (error) {
                console.error(error);
              }
            }
            that.pictureString_toList(that.data.list,that.data.picture_i);
            console.log("more_list: ",that.data.list)
            
      },
      onReachBottom() {
            this.more();
      },
      //下拉刷新
      onPullDownRefresh() {
            this.getList();
            this.getbanner();
      },
      gotop() {
            wx.pageScrollTo({
                  scrollTop: 0
            })
      },
      //跳转详情
      detail(e) {
        
            let that = this;
            wx.navigateTo({
                  url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
            })
      },
      //获取轮播
      async getbanner() {
        // console.log("getbanner")
            let that = this;
            let banner_=[{}];
            try{
              const res = await request('/idle/banner', {}, 'GET');
              // console.log("/idle/banner",res);
              for (let i=0; i < res.data.length; i++) {
                if (!banner_[i]) {
                  banner_.push({ id: 0, pictureList: "" });
                }
                const pictureList = JSON.parse(res.data[i].pictureList);
                banner_[i].id = res.data[i].id;
                banner_[i].pictureList = pictureList[0];
              }
              that.setData({
                banner:banner_
              })
              // console.log("that.data.banner",that.data.banner);
            }catch (error) {
              console.error(error);
            }

      },
      //跳转轮播链接
      goweb(e) {
            console.log("e.currentTarget.dataset.banner.id: ",e.currentTarget.dataset.banner.id)
            console.log("goweb_banner: ",this.data.banner);
            wx.navigateTo({
                  // url: '/pages/web/web?url=' + e.currentTarget.dataset.web.url,
                  // url: '/pages/web/web?url=' + e.currentTarget.dataset.banner.id,
                  url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.banner.id,

            })
      },
      onShareAppMessage() {
            return {
                  title: JSON.parse(config.data).share_title,
                  imageUrl: JSON.parse(config.data).share_img,
                  path: '/pages/start/start'
            }
      },

      onShow() {
        // console.log("this.data.returnData: ",this.data.returnData);
            if(!(this.data.returnData?.message)||this.data.returnData.message!=123){
              this.getList()
              this.getTip()
              this.getbanner()
            }
            
      },

      getTip() {
            let that = this
            db.collection('Tip').where({}).get({
                  success: function (res) {
                        that.setData({
                              indexTip: res.data[0].tip
                        })
                        console.log("zhelishixiaoxi" + res)
                  },
            })
      },
})