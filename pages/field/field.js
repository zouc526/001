Page({
  data: {
    formData: {
      farmName: "",       
      cropType: "",      
      location: "",    
      fieldArea: "",    
      plantYearSeason: "",
      yieldRange: "",    
      farmIntro: ""    
    },
    isEdit: false,
    editIndex: -1
  },

  onLoad(options) {
    if (options.editIndex !== undefined) {
      const farmList = wx.getStorageSync('farmList') || [];
      const editIndex = parseInt(options.editIndex);
      const oldData = farmList[editIndex] || {};
      this.setData({
        formData: {
          farmName: oldData.plotName || "",  
          cropType: oldData.crop || "",       
          location: oldData.location || "",  
          fieldArea: oldData.area || "",      
          plantYearSeason: oldData.plantingSeason || "", 
          yieldRange: oldData.yieldRange || "",  
          farmIntro: oldData.intro || ""       
        },
        isEdit: true,
        editIndex
      });
    }
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  onInputChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value.trim(); 
    this.setData({
      [`formData.${key}`]: value
    });
  },

  submitForm() {
    const { formData, isEdit, editIndex } = this.data;

    const requiredFields = [
      { key: "farmName", name: "地块名称" },
      { key: "cropType", name: "种植作物" },
      { key: "location", name: "地理位置" },
      { key: "plantYearSeason", name: "种植年份/季节" }
    ];

    for (const field of requiredFields) {
      if (!formData[field.key]) {
        wx.showToast({
          title: `请填写${field.name}`,
          icon: "none",
          duration: 2000
        });
        return; 
      }
    }

    const farmItem = {
      plotName: formData.farmName,        
      crop: formData.cropType,         
      location: formData.location,    
      area: formData.fieldArea || 0,     
      areaUnit: "亩",                    
      plantingSeason: formData.plantYearSeason, 
      yieldRange: formData.yieldRange || 0, 
      yieldUnit: "斤/亩",                 
      intro: formData.farmIntro           
    };

    let farmList = wx.getStorageSync('farmList') || [];
 
    if (isEdit && editIndex >= 0) {
      farmList[editIndex] = farmItem;
    } else {
      farmList.push(farmItem);
    }

    wx.setStorageSync('farmList', farmList);
    wx.setStorageSync('yieldData', {
      fieldArea: formData.fieldArea,
      yieldRange: formData.yieldRange
    });

    wx.showToast({
      title: isEdit ? "信息编辑成功" : "信息保存成功",
      icon: "success",
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.redirectTo({
            url: "/pages/mine/mine", 
            fail: (err) => {
              console.error("跳转失败：", err);
              wx.navigateBack({ delta: 1 });
            }
          });

        }, 1500); 
      }
    });
  }
});