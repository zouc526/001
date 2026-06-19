Page({
  data: {
    selectType: "soil",  
    imagePath: "",      
    recognitionResult: "",  
    question: "",      
    answer: ""          
  },

  imageBase64: "",

  setRecognizeType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectType: type });
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sourceType: ["album", "camera"],
      sizeType: ["compressed"],
      success: (res) => {
        const tempImagePath = res.tempFilePaths[0];
        this.setData({ imagePath: tempImagePath });
        this.convertImageToBase64(tempImagePath);
      }
    });
  },

  clearImage() {
    this.setData({ imagePath: "", recognitionResult: "" });
    this.imageBase64 = "";
  },

  convertImageToBase64(tempImagePath) {
    const fs = wx.getFileSystemManager();
    fs.readFile({
      filePath: tempImagePath,
      encoding: "base64",
      success: (res) => {
        this.imageBase64 = res.data;
      },
      fail: (err) => {
        wx.showToast({ title: "图片处理失败", icon: "none" });
      }
    });
  },

  // 提交图片识别
  submitImageRecognition() {
    if (!this.imageBase64 || !this.data.imagePath) {
      wx.showToast({ title: "请先选择图片", icon: "none" });
      return;
    }

    wx.showLoading({ title: "识别中..." });
    const { selectType } = this.data;

    wx.request({
      url: "请在这里输入你的域名IP/image_recognition",
      method: "POST",
      header: { "Content-Type": "application/json" },
      data: {
        imageBase64: this.imageBase64,
        type: selectType
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          this.setData({ recognitionResult: res.data.data.result });
        } else {
          wx.showToast({ title: res.data.msg, icon: "none" });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: "识别失败，请检查后端", icon: "none" });
      }
    });
  },

  inputQuestion(e) {
    this.setData({ question: e.detail.value });
  },

  submitQuestion() {
    const { question } = this.data;
    if (!question.trim()) {
      wx.showToast({ title: "请输入问题", icon: "none" });
      return;
    }

    wx.showLoading({ title: "思考中..." });

    wx.request({
      url: "请在这里输入你的域名IP/ai_qa",
      method: "POST",
      header: { "Content-Type": "application/json" },
      data: {
        question: question,
        soilData: {
          soilPh: "7.19",
          soilOrganic: "29.86 g/kg"
        }
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          this.setData({ answer: res.data.data.answer });
        } else {
          wx.showToast({ title: res.data.msg, icon: "none" });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: "问答失败，请检查后端", icon: "none" });
      }
    });
  }
});