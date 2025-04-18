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
            scrollTop: 0,
            newlist: [],
            list: [],
            key: '',
            blank: false,
            hislist: [],
            nomore:false,
      },
      onLoad: function(options) {
            this.gethis();
            this.getnew();
      },
      //获取本地记录
      gethis() {
            let that = this;
            wx.getStorage({
                  key: 'history',
                  success: function(res) {
                        let hislist = JSON.parse(res.data);
                        //限制长度
                        if (hislist.length > 5) {
                              hislist.length = 5
                        }
                        that.setData({
                              hislist: hislist
                        })
                  },
            })
      },
      //选择历史搜索关键词
      choosekey(e) {
            this.data.key = e.currentTarget.dataset.key;
            this.search('his');
      },
      //最新推荐书籍
      async getnew() {
            let that = this;
            try{
              const res = await request('/idle/find',{ page: 1, nums: 5 ,randomPick:true},'GET');
              let newlist = res.data.list;
              for (let i=0; i < newlist.length; i++) {
                const pictureList = JSON.parse(newlist[i].pictureList);
                newlist[i].pictureList = pictureList;
                newlist[i].releaseTime = newlist[i].releaseTime.substring(0, 10);
              }  
              that.setData({
                newlist: newlist,
              })          
              // console.log("newlist: ",that.data.newlist);
            }catch(e){
              console.error(e);
            }
      },
      //跳转详情
      detail(e) {
            let that = this;
            wx.navigateTo({
                  url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
            })
      },
      //搜索结果
      async search(n) {
            let that = this;
            let key = that.data.key;
            if (key == '') {
                  wx.showToast({
                        title: '请输入关键词',
                        icon: 'none',
                  })
                  return false;
            }
            wx.setNavigationBarTitle({
                  title:'"'+ that.data.key + '"的搜索结果',
            })
            wx.showLoading({
                  title: '加载中',
            })
            // 如果不是从历史记录触发的搜索，则将关键词保存到历史记录
            if (n !== 'his') {
                  that.history(key);
            }
            try{
              const res = await request('/idle/find',{ page: 1, nums: 5 ,findValue:key},'GET');
              wx.hideLoading();
              let list_ = res.data.list;
              for (let i=0; i < list_.length; i++) {
                const pictureList = JSON.parse(list_[i].pictureList);
                list_[i].pictureList = pictureList;
                list_[i].releaseTime = list_[i].releaseTime.substring(0, 10);
              }  
              that.setData({
                blank: true,
                page: 0,
                list: list_,
                nomore: false,
          })         
              // console.log("newlist: ",that.data.newlist);
            }catch(e){
              wx.hideLoading();
              console.error(e);
            }
            db.collection('publish').where({
                  status: 0,
                  dura: _.gt(new Date().getTime()),
                  key: db.RegExp({
                        regexp: '.*' + key + '.*',
                        options: 'i',
                  })
            }).orderBy('creat', 'desc').limit(20).get({
                  success(e) {
                        wx.hideLoading();
                        that.setData({
                              blank: true,
                              page: 0,
                              list: e.data,
                              nomore: false,
                        })
                  }
            })
      },
      onReachBottom() {
            this.more();
      },
      //添加到搜索历史
      history(key) {
            let that = this;
            wx.getStorage({
                  key: 'history',
                  success(res) {
                        let oldarr = JSON.parse(res.data); //字符串转数组
                        let newa = [key]; //对象转为数组
                        let newarr = JSON.stringify(newa.concat(oldarr)); //连接数组\转字符串
                        wx.setStorage({
                              key: 'history',
                              data: newarr,
                        })
                  },
                  fail(res) {
                        //第一次打开时获取为null
                        let newa = [key]; //对象转为数组
                        var newarr = JSON.stringify(newa); //数组转字符串
                        wx.setStorage({
                              key: 'history',
                              data: newarr,
                        })
                  }
            });
      },
      keyInput(e) {
            this.data.key = e.detail.value
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
      //加载更多
      more() {
            let that = this;
            if (that.data.nomore || that.data.list.length < 20) {
                  return false
            }
            let page = that.data.page + 1;
            if (that.data.collegeCur == -2) {
                  var collegeid = _.neq(-2); //除-2之外所有
            } else {
                  var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
            }
            db.collection('publish').where({
                  status: 0,
                  dura: _.gt(new Date().getTime()),
                  key: db.RegExp({
                        regexp: '.*' + that.data.key + '.*',
                        options: 'i',
                  })
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
})
