Page({
  data: {
    currentDate: '',
    soilData: {
      "年份": 2023,
      "pH值": 7.19,
      "全氮含量（g/kg）": 1.64,
      "全磷含量（g/kg）": 0.89,
      "全钾含量（g/kg）": 15.72,
      "有机质含量（g/kg）": 29.86,
      "碱解氮含量（mg/kg）": 184.78,
      "有效磷含量（mg/kg）": 13.67,
      "速效钾含量（mg/kg）": 238.19
    },
    standards: {
      'nitrogen': { 'deficient': 90, 'critical': 120, 'optimal': 180, 'max': 200 },
      'phosphorus': { 'deficient': 10, 'critical': 20, 'optimal': 40, 'max': 50 },
      'potassium': { 'deficient': 100, 'critical': 150, 'optimal': 250, 'max': 300 }
    },
    farmList: [],
    hasFarmInfo: false,
    currentFarm: {},
    aiYield: 0,
    aiAdvice: "",
    cropCoefficients: {
      "水稻": 0.95, "小麦": 0.92, "玉米": 0.98, "大豆": 0.88, "蔬菜": 1.05, "果树": 0.90, "其他": 0.95
    },
    soilWeights: {
      nitrogen: 0.3, phosphorus: 0.25, potassium: 0.2, ph: 0.15, organicMatter: 0.1
    }
  },

  onLoad: function (options) {
    this.getCurrentDate();
    this.loadSoilData();
    this.loadFarmInfo();
  },

  onShow() {
    this.loadFarmInfo();
  },

  getCurrentDate: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    this.setData({ currentDate: `${year}-${month}-${day}` });
  },

  loadSoilData: function() {
    const data = this.data.soilData;
    const processedData = {
      年份: data["年份"],
      pH值: data["pH值"],
      全氮含量: data["全氮含量（g/kg）"],
      全磷含量: data["全磷含量（g/kg）"],
      全钾含量: data["全钾含量（g/kg）"],
      有机质含量: data["有机质含量（g/kg）"],
      碱解氮含量: data["碱解氮含量（mg/kg）"],
      有效磷含量: data["有效磷含量（mg/kg）"],
      速效钾含量: data["速效钾含量（mg/kg）"]
    };
    this.calculateNutrientLevels(processedData);
    this.setData({ soilData: processedData });
  },

  calculateNutrientLevels: function(data) {
    const nutrientLevels = {
      nitrogen: [
        { level: 1, name: '高', range: '>2.00', desc: '存在明显的氮素盈余，生态系统风险显著增加', recommendation: '零增长甚至负增长氮管理，转向生态安全型耕作模式', yieldCoeff: 1.05 },
        { level: 2, name: '较高', range: '1.50-2.00', desc: '土壤氮素丰富，过量施氮无效，还可能导致贪青晚熟、病虫害加重及面源污染风险上升', recommendation: '减量施肥，侧重调控，强化水分管理', yieldCoeff: 1.02 },
        { level: 3, name: '中', range: '1.00-1.50', desc: '理想肥力区间，土壤氮素供应与水稻需求基本匹配', recommendation: '实行测土配方施肥，控氮稳产，注重氮磷钾平衡', yieldCoeff: 1.0 },
        { level: 4, name: '较低', range: '0.50-1.00', desc: '土壤供氮能力不足，限制水稻高产潜力发挥', recommendation: '有机无机肥结合，提高利用率', yieldCoeff: 0.95 },
        { level: 5, name: '低', range: '≤0.50', desc: '土壤严重缺氮，有机质贫乏，保肥供肥能力差，水稻生长瘦弱、分蘖不足、易早衰', recommendation: '增施有机肥为基础，配合高量氮肥基追并重，快速提升地力', yieldCoeff: 0.85 }
      ],
      phosphorus: [
        { level: 1, name: '高', range: '>40.0', desc: '存在明显的磷素盈余风险，易导致水体富营养化', recommendation: '零磷输入管理，转向生态安全型耕作', yieldCoeff: 1.03 },
        { level: 2, name: '较高', range: '25.0-40.0', desc: '土壤磷素丰富，增施磷肥增产效应不显著，可能造成浪费和环境风险', recommendation: '减量或免施磷肥，重点监测磷素累积', yieldCoeff: 1.01 },
        { level: 3, name: '中', range: '10.0-25.0', desc: '土壤磷素基本满足水稻生长，属理想范围', recommendation: '维持性施肥，注重养分平衡', yieldCoeff: 1.0 },
        { level: 4, name: '较低', range: '5.0-10.0', desc: '土壤供磷不足，限制水稻高产', recommendation: '平衡施用，兼顾当季供应与地力培肥', yieldCoeff: 0.94 },
        { level: 5, name: '低', range: '≤5.0', desc: '土壤严重缺磷，水稻根系发育受阻，分蘖少，产量潜力极低', recommendation: '采用 "基肥为主、早施重施" 策略，快速提升土壤供磷能力', yieldCoeff: 0.82 }
      ],
      potassium: [
        { level: 1, name: '高', range: '>150', desc: '土壤速效钾丰富甚至过量，继续施用钾肥可能导致养分失衡、资源浪费及环境风险累积', recommendation: '原则上不施用化学钾肥', yieldCoeff: 1.04 },
        { level: 2, name: '较高', range: '100-150', desc: '土壤钾素供应能力强，常规施肥下一般不缺钾，过度施钾易引发生态风险', recommendation: '少量补充或视情免施化学钾肥', yieldCoeff: 1.01 },
        { level: 3, name: '中', range: '75-100', desc: '土壤供钾能力基本平衡，可满足水稻正常生长，有优化管理空间', recommendation: '适量补充钾肥，维持动态平衡', yieldCoeff: 1.0 },
        { level: 4, name: '较低', range: '50-75', desc: '轻度至中度缺钾，无明显症状但潜在减产风险高，补充钾素可提升光合效率、增强抗逆性', recommendation: '中等量补充钾肥，注重养分平衡', yieldCoeff: 0.93 },
        { level: 5, name: '低', range: '≤50', desc: '土壤严重缺钾，水稻生长受显著抑制，表现为植株矮小、茎秆软弱、易倒伏等，制约产量', recommendation: '大量增施化学钾肥，辅以有机肥协同改良土壤', yieldCoeff: 0.80 }
      ],
      organicMatter: [
        { level: 1, name: '高', range: '>35.0', desc: '土壤有机质丰富，供应能力强', recommendation: '化肥梯度减量，聚焦穗肥减氮，避免养分失衡；控释肥替代部分化肥，适配有机质养分释放节奏；谨慎控制有机物料投入，杜绝盲目增肥；深浅轮耕结合，优化整地，保护土壤结构；减少水搅浆频次，防止有机质分解加速。', yieldCoeff: 1.05 },
        { level: 2, name: '较高', range: '25.0-35.0', desc: '土壤有机质水平较高，供应能力良好', recommendation: '精准调控有机物料用量与类型，巩固有机质存量；化肥梯度减量 + 配比优化，匹配有机质供肥节奏；分区差异化施用有机肥，针对性提升肥力；冬种绿肥翻压，补充活性有机质。', yieldCoeff: 1.02 },
        { level: 3, name: '中等', range: '15.0-25.0', desc: '土壤有机质水平中等，供应能力一般', recommendation: '优化耕作与种植制度，保障有机质稳定留存；有机物料精准输入，定向提升有机质含量；深浅轮耕结合，保护土壤团粒结构；干湿交替灌溉，强化有机质活性；推广水旱轮作与豆科作物间作，拓展有机质来源。', yieldCoeff: 1.0 },
        { level: 4, name: '较低', range: '10.0-15.0', desc: '土壤有机质水平较低，供应能力不足', recommendation: '强化多元有机物料输入，快速补充土壤有机质；配套耕作与种植制度，保障有机质稳定留存；有机改良剂复配施用，加速有机质转化；定向施用堆沤肥，保障基础有机质供给；周期性深耕，促进有机质与土壤融合；水旱轮作改善土壤环境，延缓有机质消耗；间歇灌溉调控有机质矿化速率。', yieldCoeff: 0.94 },
        { level: 5, name: '低', range: '≤10.0', desc: '土壤有机质水平低，供应能力差', recommendation: '高强度多元有机物料输入，快速构建有机质基础库；优化有机无机配施比例，兼顾有机质积累与水稻产能；绿肥 - 秸秆 - 腐熟有机肥协同还田；增施河塘泥与生物炭强化固碳；采用有机肥替代化肥方案，或选用高有机质专用复混肥。', yieldCoeff: 0.85 }
      ],
      ph: [
        { level: 1, name: '1级', range: 'pH 6.0-7.0', desc: '适宜区', recommendation: '绿肥 - 稻草联合还田，优化有机质碳库结构；配施生物炭与有机肥，增强有机质固持能力；采用生态灌溉与耕作模式，减少有机质无效损耗；轻耕配合覆盖措施，保护土壤团聚体。', yieldCoeff: 1.05 },
        { level: 2, name: '2级', range: 'pH 7.0-7.5 或 5.5-6.0', desc: '较适宜区', recommendation: '针对 pH 5.5-6.0（弱酸性）稻田：有机 - 矿物复合配施，提升有机质稳定性；施用有机无机炭基肥，同步增碳与调酸；紫云英 - 秸秆联合还田，优化碳氮比促腐解。针对 pH 7.0-7.5（弱碱性）稻田：生物炭配施深翻，强化有机质深层积累；秸秆覆盖还田 + 腐熟剂，减少有机质地表损耗；泥炭 - 秸秆 - 生物有机肥配施，优化有机质组分。', yieldCoeff: 1.02 },
        { level: 3, name: '3级', range: 'pH 7.5-8.0 或 5.0-5.5', desc: '一般适宜区', recommendation: '针对 pH 5.0-5.5（中酸性）稻田：腐殖质类调理剂配施商品有机肥，同步提有机质与抑酸；绿肥 - 秸秆轮配还田，优化有机质积累环境；生物炭基肥配施生化黄腐酸钾，强化有机质固持。针对 pH 7.5-8.0（弱碱性）稻田：稻壳生物炭配施深翻，提升有机质深层存储量；天然腐殖质材料配施辅料，快速补充稳定有机质；商品有机肥配施生物炭基肥，协同提升有机质利用率。', yieldCoeff: 0.98 },
        { level: 4, name: '4级', range: 'pH 8.0-8.5 或 4.5-5.0', desc: '较不适宜区', recommendation: '针对 pH 4.5-5.0（酸性）水稻土：石灰与有机肥配施，同步调酸增碳；种植耐酸绿肥翻压，补充活性有机质；秸秆还田配合腐熟剂，提升有机质转化效率。针对 pH 8.0-8.5（偏碱）水稻土：施用 EM 堆肥，降碱同时富集有机质；秸秆 + 生物炭配施，构建稳定有机质碳库；有机无机肥结合，减少有机质淋溶流失。', yieldCoeff: 0.90 },
        { level: 5, name: '5级', range: 'pH >8.5 或 ≤4.5', desc: '不适宜区', recommendation: '针对 pH≤4.5（强酸性）水稻土：高量堆肥污泥施用，同步提 pH 与有机碳库；酸性土壤调理剂 + 绿肥混播翻压，补充活性有机质；秸秆腐熟还田配合石灰，降低酸害并提升有机质利用率。针对 pH>8.5（强碱性）水稻土：磷石膏 + 有机肥 + 腐殖酸复合施用，高效增有机质并抑返盐；脱硫石膏配 EM 堆肥，平衡降碱与有机质积累；秸秆还田 + 保水剂 + 微生物菌肥，减少有机质淋溶。', yieldCoeff: 0.80 }
      ]
    };

    const totalNitrogen = data.全氮含量;
    let nitrogenLevel = nutrientLevels.nitrogen.find(level => {
      if (level.range.includes('>')) return totalNitrogen > parseFloat(level.range.replace('>',''));
      else if (level.range.includes('<=')) return totalNitrogen <= parseFloat(level.range.replace('<=',''));
      else {
        const [min, max] = level.range.split('-').map(Number);
        return totalNitrogen >= min && totalNitrogen <= max;
      }
    }) || nutrientLevels.nitrogen[2];

    const availablePhosphorus = data.有效磷含量;
    let phosphorusLevel = nutrientLevels.phosphorus.find(level => {
      if (level.range.includes('>')) return availablePhosphorus > parseFloat(level.range.replace('>',''));
      else if (level.range.includes('<=')) return availablePhosphorus <= parseFloat(level.range.replace('<=',''));
      else {
        const [min, max] = level.range.split('-').map(Number);
        return availablePhosphorus >= min && availablePhosphorus <= max;
      }
    }) || nutrientLevels.phosphorus[2];

    const availablePotassium = data.速效钾含量;
    let potassiumLevel = nutrientLevels.potassium.find(level => {
      if (level.range.includes('>')) return availablePotassium > parseFloat(level.range.replace('>',''));
      else if (level.range.includes('<=')) return availablePotassium <= parseFloat(level.range.replace('<=',''));
      else {
        const [min, max] = level.range.split('-').map(Number);
        return availablePotassium >= min && availablePotassium <= max;
      }
    }) || nutrientLevels.potassium[2];

    const organicMatter = data.有机质含量;
    let organicMatterLevel = nutrientLevels.organicMatter.find(level => {
      if (level.range.includes('>')) return organicMatter > parseFloat(level.range.replace('>',''));
      else if (level.range.includes('<=')) return organicMatter <= parseFloat(level.range.replace('<=',''));
      else {
        const [min, max] = level.range.split('-').map(Number);
        return organicMatter >= min && organicMatter <= max;
      }
    }) || nutrientLevels.organicMatter[2];

    const phValue = data.pH值;
    let phLevel = nutrientLevels.ph.find(level => {
      if (level.range.includes('6.0-7.0')) return phValue >= 6.0 && phValue <= 7.0;
      else if (level.range.includes('7.0-7.5 或 5.5-6.0')) return (phValue >= 7.0 && phValue <= 7.5) || (phValue >= 5.5 && phValue <= 6.0);
      else if (level.range.includes('7.5-8.0 或 5.0-5.5')) return (phValue >= 7.5 && phValue <= 8.0) || (phValue >= 5.0 && phValue <= 5.5);
      else if (level.range.includes('8.0-8.5 或 4.5-5.0')) return (phValue >= 8.0 && phValue <= 8.5) || (phValue >= 4.5 && phValue <= 5.0);
      else if (level.range.includes('>8.5 或 ≤4.5')) return phValue > 8.5 || phValue <= 4.5;
      return false;
    }) || nutrientLevels.ph[1];

    data.nitrogenLevel = nitrogenLevel;
    data.phosphorusLevel = phosphorusLevel;
    data.potassiumLevel = potassiumLevel;
    data.organicMatterLevel = organicMatterLevel;
    data.phLevel = phLevel;
  },

  getBarClass: function(value, type) {
    const std = this.data.standards[type];
    if (value < std.deficient) return 'deficient';
    else if (value < std.critical) return 'critical';
    else if (value < std.optimal) return 'optimal';
    else return 'abundant';
  },

  getBarWidth: function(value, type) {
    const std = this.data.standards[type];
    return Math.min((value / std.max) * 100, 100);
  },

  getBarLabel: function(value, type) {
    const std = this.data.standards[type];
    if (value < std.deficient) return '缺乏';
    else if (value < std.critical) return '临界';
    else if (value < std.optimal) return '适宜';
    else return '丰富';
  },

  getPhPosition: function(ph) {
    return ((ph - 4) / (10 - 4)) * 100;
  },

  getPhLevel: function(ph) {
    if (ph < 5.5) return '过酸';
    else if (ph < 6.5) return '微酸';
    else if (ph < 7.5) return '适宜';
    else if (ph < 8.5) return '微碱';
    else return '过碱';
  },

  getOrganicLevel: function(om) {
    if (om > 40) return '丰富';
    else if (om >= 20) return '中等';
    else return '缺乏';
  },

  getOrganicLevelClass: function(om) {
    if (om > 40) return 'high';
    else if (om >= 20) return 'medium';
    else return 'low';
  },

  getOrganicSuggestion: function(om) {
    if (om > 40) return '继续保持';
    else if (om >= 20) return '建议保持有机肥投入';
    else return '需增加有机肥投入';
  },

  goToAdvice: function(e) {
    try {
      const type = e.currentTarget.dataset.type;
      if (!type) {
        wx.showToast({ title: '缺少跳转参数', icon: 'none', duration: 2000 });
        return;
      }
      wx.navigateTo({
        url: `/pages/advice/advice?type=${type}`,
        fail: () => {
          wx.showToast({ title: '跳转失败，请检查页面路径', icon: 'none', duration: 2000 });
        }
      });
    } catch (err) {
      console.error('跳转异常：', err);
      wx.showToast({ title: '系统异常', icon: 'none', duration: 2000 });
    }
  },

  loadFarmInfo() {
    const farmList = wx.getStorageSync('farmList') || [];
    const validFarmList = farmList.filter(item => item.plotName && item.crop && item.area);
    const currentFarm = validFarmList[0] || {};
    const hasFarmInfo = validFarmList.length > 0;

    this.setData({ farmList: validFarmList, currentFarm, hasFarmInfo });
    if (hasFarmInfo) {
      this.calcAiYield();
      this.generateAiAdvice();
    }
  },

  calcAiYield() {
    const { currentFarm, soilData, cropCoefficients, soilWeights } = this.data;
    const area = parseFloat(currentFarm.area) || 0;
    const yieldRange = parseFloat(currentFarm.yieldRange) || 0;
    const crop = currentFarm.crop || "其他";
    const baseYield = area * yieldRange;

    if (baseYield === 0) {
      this.setData({ aiYield: 0 });
      return;
    }

    const nitrogenCoeff = soilData.nitrogenLevel.yieldCoeff || 1.0;
    const phosphorusCoeff = soilData.phosphorusLevel.yieldCoeff || 1.0;
    const potassiumCoeff = soilData.potassiumLevel.yieldCoeff || 1.0;
    const phCoeff = soilData.phLevel.yieldCoeff || 1.0;
    const organicMatterCoeff = soilData.organicMatterLevel.yieldCoeff || 1.0;

    const soilTotalCoeff = 
      nitrogenCoeff * soilWeights.nitrogen +
      phosphorusCoeff * soilWeights.phosphorus +
      potassiumCoeff * soilWeights.potassium +
      phCoeff * soilWeights.ph +
      organicMatterCoeff * soilWeights.organicMatter;

    const cropCoeff = cropCoefficients[crop] || cropCoefficients["其他"];
    const finalYield = baseYield * soilTotalCoeff * cropCoeff;
    this.setData({ aiYield: finalYield.toFixed(2) });
  },

  generateAiAdvice() {
    const { currentFarm, soilData } = this.data;
    const crop = currentFarm.crop || "作物";
    const plotName = currentFarm.plotName || "该地块";

    const nitrogenAdvice = soilData.nitrogenLevel.recommendation || "";
    const phosphorusAdvice = soilData.phosphorusLevel.recommendation || "";
    const potassiumAdvice = soilData.potassiumLevel.recommendation || "";
    const phAdvice = soilData.phLevel.recommendation || "";
    const organicMatterAdvice = soilData.organicMatterLevel.recommendation || "";

    const aiAdvice = `
      针对${plotName}种植的${crop}，结合土壤检测数据给出以下建议：
      1. 氮肥管理：${nitrogenAdvice}
      2. 磷肥管理：${phosphorusAdvice}
      3. 钾肥管理：${potassiumAdvice}
      4. pH值调节：${phAdvice}
      5. 有机质提升：${organicMatterAdvice}
      整体管理建议：优先保证养分平衡，根据${crop}的生长周期调整施肥时机，结合田间水分管理提升肥料利用率，定期监测土壤指标变化。
    `.replace(/[\n\s]+/g, ' ').trim();

    this.setData({ aiAdvice });
  },

  gotoAddFarm() {
    wx.navigateTo({ url: '/pages/field/field' });
  }
});