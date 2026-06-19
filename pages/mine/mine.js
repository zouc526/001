Page({
  data: {
    userInfo: {},
    notifySwitch: true,
    farmList: [],
    tabActive: 2 
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const farmList = wx.getStorageSync('farmList') || [];
    this.setData({ userInfo, farmList });
  },

  gotoAddFarm() {
    wx.navigateTo({ url: '/pages/field/field' });
  },

  gotoEditFarm(e) {
    const index = e.currentTarget.dataset.index;
    wx.navigateTo({ url: `/pages/field/field?type=edit&index=${index}` });
  },

  deleteFarm(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '提示',
      content: '确定删除该农场吗？',
      success: (res) => {
        if (res.confirm) {
          const farmList = wx.getStorageSync('farmList') || [];
          farmList.splice(index, 1);
          wx.setStorageSync('farmList', farmList);
          this.setData({ farmList });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },


  login() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo });
      },
      fail: () => wx.showToast({ title: '登录失败', icon: 'error' })
    });
  },

  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({ userInfo });
  },

  login() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo });
        wx.showToast({ title: '登录成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '登录失败', icon: 'none' });
      }
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync('userInfo');
          this.setData({ userInfo: {} });
          wx.showToast({ title: '退出成功', icon: 'success' });
        }
      }
    });
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
      }
    });
  },

  editUserInfo() {
    wx.navigateTo({ url: '/pages/editUser/editUser' });
  },

  openSetting() {
    this.setData({
      notifySwitch: !this.data.notifySwitch
    });
  },


  aboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '稻田土壤检测小程序 v1.0\n专注稻田土壤检测与改良建议',
      showCancel: false
    });
  },

  switchNotify(e) {
    this.setData({ notifySwitch: e.detail.value });
  },


  gotoReport() {
    this.setData({ tabActive: 0 });
    wx.switchTab({ url: '/pages/report/report' });
  },
  gotoAI() {
    this.setData({ tabActive: 1 });
    wx.switchTab({ url: '/pages/ai/ai' });
  },
  gotoMine() {
    this.setData({ tabActive: 2 });

  }
});