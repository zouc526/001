const app = getApp();

Page({
  data: {
    riceVariety: "",
    fieldArea: "",
    plantingMethod: "",
    soilPh: "",
    soilOrganic: "",
    totalNitrogen: "",
    availablePhosphorus: "",
    availablePotassium: "",
    perAcreYield: "",
    totalYield: "",
    
    adviceList: [], 
    loading: false, 

    activeTab: 0, 
    expertAdvice: `全氮：减量施肥，侧重调控，强化水分管理。1.总氮量减至常规用量的70%（约12-15公斤N/亩）；2.氮肥分配为"前轻中重后控"（基肥5公斤/亩、分蘖肥6公斤/亩、穗肥3-4公斤/亩）；3.加强湿润灌溉与晒田控蘖；4.秸秆年还田率不低于80%。
有效磷：维持性施肥，注重养分平衡。1.基肥施过磷酸钙20-30公斤/亩或钙镁磷肥15-25公斤/亩；2.推广测土配方施肥，微调用量；3.施用复合肥料（N-P-K=15-15-15）30-40公斤/亩。
速效钾：原则上不施用化学钾肥。1.施用腐熟农家肥200-300公斤/亩；2.密切监测土壤钾含量，连续三年高于250mg/kg则完全停止外源钾输入，轮作耗钾作物`,

    farmData: {}, 
    hasBasicInfo: false 
  },
  
  onLoad(options) {
    this.loadAllData(options); 
  },

  onShow() {
    this.loadAllData(); 
  },

  loadAllData(options = {}) {
    let farmData = wx.getStorageSync('farmBasicInfo') || {};
    const farmList = wx.getStorageSync('farmList') || [];
    if (Object.keys(farmData).length === 0 && farmList.length > 0) {
      farmData = farmList[0]; 
    }
    console.log("最终读取的农田信息：", farmData); 
    
    const yieldInfo = wx.getStorageSync("yieldInfo") || {};
    const soilData = wx.getStorageSync("soilData") || {};
    

    const perAcreYield = Number(options.perAcreYield || farmData.yieldRange || yieldInfo.per_acre_yield || "");
    const fieldAreaNum = Number(farmData.area || farmData.fieldArea || 0);
    const totalYield = Number(options.totalYield || yieldInfo.total_yield || (fieldAreaNum && perAcreYield ? (fieldAreaNum * perAcreYield) : ""));

    const finalData = {
      riceVariety: options.riceVariety || farmData.cropType || farmData.crop || "", 
      fieldArea: Number(options.fieldArea || farmData.fieldArea || farmData.area || ""),  
      plantingMethod: options.plantingMethod || farmData.farmIntro || "移栽",      
      soilPh: Number(options.soilPh || soilData.soilPh || 0),
      soilOrganic: Number(options.soilOrganic || soilData.soilOrganic || 0),
      totalNitrogen: Number(options.totalNitrogen || soilData.totalNitrogen || 0),
      availablePhosphorus: Number(options.availablePhosphorus || soilData.availablePhosphorus || 0),
      availablePotassium: Number(options.availablePotassium || soilData.availablePotassium || 0),
      perAcreYield,
      totalYield
    };

    const hasBasicInfo = !!farmData.farmName || !!farmData.plotName || !!farmData.cropType || !!farmData.crop;
    
    if (!hasBasicInfo) {
      wx.showModal({
        title: "提示",
        content: "未检测到农田基础信息，是否前往填写？",
        cancelText: "留在当前页",
        confirmText: "去填写",
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: "/pages/field/field" }); 
          }
        }
      });
    }

    this.setData({
      farmData,
      hasBasicInfo,
      ...finalData 
    });
  },

  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      activeTab: index
    });
    if (index === 1 && this.data.hasBasicInfo) {
      this.getAIAdvice();
    }
  },
  
  getAIAdvice() {
    const { riceVariety, fieldArea } = this.data;
    if (!riceVariety || !fieldArea || isNaN(fieldArea) || fieldArea <= 0) {
      wx.showToast({ title: "请填写有效的作物名称和田块面积", icon: "none" });
      return;
    }

    this.setData({ loading: true });
    
    const {
      plantingMethod,
      soilPh, soilOrganic, totalNitrogen,
      availablePhosphorus, availablePotassium,
      perAcreYield, totalYield
    } = this.data;
    
    if (!app.globalData?.baseUrl) {
      this.setData({ loading: false });
      wx.showToast({ title: "未配置后端接口地址", icon: "none" });
      console.error("baseUrl未配置：", app.globalData);
      return;
    }

    const requestData = {
      riceVariety,
      fieldArea, 
      fertilizeHistory: "",
      soilPh, 
      soilOrganic, 
      totalNitrogen,
      availablePhosphorus, 
      availablePotassium, 
      plantingMethod,
      yieldInfo: {
        per_acre_yield: perAcreYield || 0, 
        total_yield: totalYield || 0       
      }
    };
    console.log("AI建议请求参数：", requestData);
    
    wx.request({
      url: app.globalData.baseUrl + "/get_ai_advice",
      method: "POST",
      header: {
        'Content-Type': 'application/json' 
      },
      data: requestData,
      timeout: 30000, 
      success: (res) => {
        console.log("AI建议接口返回：", res); 
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            const adviceText = res.data.data.advice;
            const adviceList = this.parseAdvice(adviceText);
            this.setData({ adviceList });
          } else {
            wx.showToast({ title: res.data.msg || "获取建议失败", icon: "none" });
          }
        } else {
          wx.showToast({ title: `接口返回异常：${res.statusCode}`, icon: "none" });
        }
      },
      fail: (err) => {
        console.error("建议接口调用失败详情：", err);
        if (err.errMsg.includes("timeout")) {
          wx.showToast({ title: "请求超时，请检查后端服务是否运行", icon: "none" });
        } else if (err.errMsg.includes("request:fail")) {
          wx.showToast({ title: "网络连接失败，请检查后端地址是否正确", icon: "none" });
        } else {
          wx.showToast({ title: "建议加载失败，请重试", icon: "none" });
        }
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },
  
  parseAdvice(text) {
    if (!text) return []; 
    const sections = text.split(/\n\n|\r\n\r\n/).filter(section => section.trim());
    const titles = ["精准施肥方案", "水分管理要点", "病虫害防治策略", "土壤改良建议"];
    const adviceList = [];
    
    sections.forEach((section, index) => {
      const titleMatch = section.match(/^[一二三四]+、(.+?)(：|：|)/);
      let title = titles[index] || `种植建议${index+1}`;
      let content = section;
      
      if (titleMatch) {
        title = titleMatch[1];
        content = section.replace(titleMatch[0], "").trim();
      }
      
      adviceList.push({
        title,
        content: content.replace(/\d+\./g, "\n• ").trim() 
      });
    });
    
    return adviceList.length > 0 ? adviceList : [{ title: "AI种植建议", content: text }];
  },
  
  goToAI() {
    const yieldInfo = wx.getStorageSync("yieldInfo");
    const soilData = wx.getStorageSync("soilData");
    
    wx.navigateTo({
      url: `/pages/ai/ai?` +
           `perAcreYield=${yieldInfo.per_acre_yield || 600}&` +
           `totalYield=${yieldInfo.total_yield || 0}&` +
           `soilPh=${soilData.soilPh || "7.0"}`
    });
  },
  goToFieldPage() {
    wx.navigateTo({ url: "/pages/field/field" });
  }
});
