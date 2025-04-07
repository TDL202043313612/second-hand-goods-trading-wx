var area = require('../../utils/area.js');
const { default: request } = require('../../utils/request.js');
var areaInfo = []; //所有省市区县数据
var provinces = []; //省
var provinceNames = []; //省名称
var citys = []; //城市
var cityNames = []; //城市名称
var countys = []; //区县
var countyNames = []; //区县名称
var value = [0, 0, 0]; //数据位置下标
var addressList = null;
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    transportValues: ["收货时间不限", "周六日/节假日收货", "周一至周五收货"],
    transportIndex: 0,
    provinceIndex: 0, //省份
    cityIndex: 0, //城市
    countyIndex: 0, //区县
    addressInfo: {
      consigneeName: '',
      consigneePhone: '',
      provinceName: '',
      cityName: '',
      regionName: '',
      detailAddress: '',
      defaultFlag: false
    }
  },
 
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
 
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    // area.getAreaInfo(function(arr) {
    //   areaInfo = arr;
    //   //获取省份数据
    //   that.getProvinceData();
    // });
    that.setData({
      provinceNames: area.getProvinces(),
      cityNames: area.getCitys(0),
      countyNames: area.getAreas(0,0)
    })
    // console.log(area.getProvinces());
    // console.log(area.getCitys());
    // console.log(area.getAreas());
  },
  // 获取省份数据
  getProvinceData: function() {
    var that = this;
    var s;
    provinces = [];
    provinceNames = [];
    var num = 0;
    for (var i = 0; i < areaInfo.length; i++) {
      s = areaInfo[i];
      if (s.di == "00" && s.xian == "00") {
        provinces[num] = s;
        provinceNames[num] = s.name;
        num++;
      }
    }
    that.setData({
      provinceNames: provinceNames
    })
 
    that.getCityArr();
    that.getCountyInfo();
  },
 
  // 获取城市数据
  getCityArr: function(count = 0) {
    var c;
    citys = [];
    cityNames = [];
    var num = 0;
    for (var i = 0; i < areaInfo.length; i++) {
      c = areaInfo[i];
      if (c.xian == "00" && c.sheng == provinces[count].sheng && c.di != "00") {
        citys[num] = c;
        cityNames[num] = c.name;
        num++;
      }
    }
    if (citys.length == 0) {
      citys[0] = {
        name: ''
      };
      cityNames[0] = {
        name: ''
      };
    }
    var that = this;
    that.setData({
      citys: citys,
      cityNames: cityNames
    })
    console.log('cityNames:' + cityNames);
    that.getCountyInfo(count, 0);
  },
 
  // 获取区县数据
  getCountyInfo: function(column0 = 0, column1 = 0) {
    var c;
    countys = [];
    countyNames = [];
    var num = 0;
    for (var i = 0; i < areaInfo.length; i++) {
      c = areaInfo[i];
      if (c.xian != "00" && c.sheng == provinces[column0].sheng && c.di == citys[column1].di) {
        countys[num] = c;
        countyNames[num] = c.name;
        num++;
      }
    }
    if (countys.length == 0) {
      countys[0] = {
        name: ''
      };
      countyNames[0] = {
        name: ''
      };
    }
    console.log('countyNames:' + countyNames);
    var that = this;
    // value = [column0, column1, 0];
 
    that.setData({
      countys: countys,
      countyNames: countyNames,
      // value: value,
    })
  },
 
  bindTransportDayChange: function(e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);
    this.setData({
      transportIndex: e.detail.value
    })
  },
 
  bindProvinceNameChange: function(e) {
    var that = this;
    console.log('picker province 发生选择改变，携带值为', e.detail.value);
    var val = e.detail.value
    that.setData({
      cityNames: area.getCitys(val)
    })
    

    // that.getCityArr(val); //获取地级市数据
    // that.getCountyInfo(val, 0); //获取区县数据
 
    value = [val, 0, 0];
    this.setData({
      provinceIndex: e.detail.value,
      cityIndex: 0,
      countyIndex: 0,
      value: value
    })
 
  },
 
  bindCityNameChange: function(e) {
    var that = this;
    console.log('picker city 发生选择改变，携带值为', e.detail.value);
 
    var val = e.detail.value

    that.setData({
      countyNames: area.getAreas(value[0],val)
    })


    // that.getCountyInfo(value[0], val); //获取区县数据
    value = [value[0], val, 0];
    this.setData({
      cityIndex: e.detail.value,
      countyIndex: 0,
      value: value
    })
  },
 
  bindCountyNameChange: function(e) {
    var that = this;
    console.log('picker county 发生选择改变，携带值为', e.detail.value);
    this.setData({
      countyIndex: e.detail.value
    })
  },
  // addressInfo: {
  //   consigneeName: '',
  //   consigneePhone: '',
  //   provinceName: '',
  //   cityName: '',
  //   regionName: '',
  //   detailAddress: '',
  //   defaultFlag: false
  // }
  saveAddress: function(e) {
    let that = this;
    if(e.detail.value.consignee==""){
      wx.showToast({
        title: '名称不能为空',
        icon:'none'
      })
      return;
    }
    if(e.detail.value.mobile==""){
      wx.showToast({
        title: '电话号码不能为空',
        icon:'none'
      })
      return;
    }
    if(e.detail.value.address==""){
      wx.showToast({
        title: '请填入详细地址',
        icon:'none'
      })
      return;
    }
    that.data.addressInfo.consigneeName = e.detail.value.consignee;
    that.data.addressInfo.consigneePhone = e.detail.value.mobile;
    that.data.addressInfo.provinceName = e.detail.value.provinceName;
    that.data.addressInfo.cityName = e.detail.value.cityName;
    that.data.addressInfo.regionName = e.detail.value.countyName;
    that.data.addressInfo.detailAddress = e.detail.value.address;
    if(e.detail.value.checkbox.length>0){
      that.data.addressInfo.defaultFlag = true;
    }else{
      that.data.addressInfo.defaultFlag = false;
    }
    
    that.save(that.data.addressInfo);
 
  
  },

  async save(addressInfo){
    let that = this
    try{
      const res = await request('/address/add',addressInfo,'POST');
      if (res.status_code == 1) {
        wx.showToast({
          title: '新增成功！',
          icon:'none'
        })

        that.data.addressInfo = {
            consigneeName: '',
            consigneePhone: '',
            provinceName: '',
            cityName: '',
            regionName: '',
            detailAddress: '',
            defaultFlag: false
        };
        wx.navigateBack({})
    } else {
      wx.showToast({
        title: '系统异常，新增失败！',
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
  }
})
