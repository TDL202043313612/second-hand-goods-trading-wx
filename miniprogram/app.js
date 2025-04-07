const config = require("config.js");

App({

 
      dataList: [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
      handleName: ['下架', '删除', '取消收藏', '', ''],
      orderStatus: ['待付款', '待发货', '待收货', '已完成', '已取消'],
      openid: '',
      userinfo:'',
      roomlist:[],
      canReflect:true,
      deltaNum:2,
      onLaunch: function() {
            if (!wx.cloud) {
                  console.error('请使用 2.2.3 或以上的基础库以使用云能力')
            } else {
                  wx.cloud.init({
                       env: JSON.parse(config.data).env,
                        traceUser: true,
                  })
            }
           this.systeminfo=wx.getWindowInfo();
        
      }
})