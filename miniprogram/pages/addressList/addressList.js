import request from "../../utils/request";

Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    addressList:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

    // var arr = wx.getStorageSync('addressList') || [];
    // console.info("缓存数据：" + arr);
    // // 更新数据  
    // this.setData({
    //   addressList: arr
    // });
    that.getAddressData();
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
    this.getAddressData();
		
		
	},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();
  },

  async getAddressData(){
    let that = this;
    try{
      const res = await request('/address/info',{},'GET');
      console.log("getAddressData_res: ",res);
      if (res.status_code == 1) {
        let data = res.data;
        for (let i = 0; i < data.length; i++) {
            data[i].detailAddressText = data[i].provinceName + data[i].cityName + data[i].regionName + data[i].detailAddress;
            data[i].defaultAddress = data[i].defaultFlag ? '默认地址' : '设为默认';
        }
        // 更新数据  
        that.setData({
          addressList: data
        });
      }
    }catch(e){
      console.error(e);
    }
  },
  handleSetDefault(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    that.data.addressList[index].defaultFlag = true;
    that.update(that.data.addressList[index]);
  },
  async update(data){
    let that = this;
    console.log("data: ",data);
    try{
      const res = await request('/address/update',data,'POST');
      if (res.status_code == 1) {
        that.getAddressData();
        wx.showToast({
          title: '修改成功！',
          icon:'none'
        })
      } else {
          wx.showToast({
            title: '系统异常，修改失败！',
            icon:'none'
          })
      }
    }catch(e){
      wx.showToast({
        title: '网络异常！',
        icon:'none'
      })
      console.error(e);
    }
  },

  addAddress:function(){
    wx.navigateTo({ url: '/pages/address/address' });
  },
/* 删除item */
delAddress: async function (e) {
  let that = this;
  let index = e.currentTarget.dataset.index;
  let data = that.data.addressList[index];
  wx.showModal({
    title: '温馨提示',
    content: '是否删除此地址',
    async complete(res) {
      if (res.cancel) {
        return;
      }
      if (res.confirm) {
        try {
          const res = await request('/address/delete', data, 'POST');
          if (res.status_code == 1) {
            wx.showToast({
              title: '删除成功！',
              icon: 'none',
            });
            that.data.addressList.splice(index, 1);
            if (data.defaultFlag && that.data.addressList.length > 0) {
              that.data.addressList[0].defaultFlag = true;
              that.data.addressList[0].defaultAddress = '默认地址';
              that.update({
                id: that.data.addressList[0].id,
                defaultFlag: true,
              });
            }else{
              that.getAddressData();
            }
          } else {
            wx.showToast({
              title: '系统异常，删除失败！',
              icon: 'none',
            });
          }
        } catch (e) {
          wx.showToast({
            title: '网络异常！',
            icon: 'none',
          });
          console.error(e);
        }
      }
    },
  });
},
});


