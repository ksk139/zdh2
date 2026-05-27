// 模板接受的数据格式
// excel最终需要处理成的数据格式
// 后续接口最终需要处理成的数据格式

export type PerformanceForecastItem = {
  // 股票名称
  stockName: string;
  // 业绩预增
  performanceIncrease: number;
  // 涨跌类型
  limitType: string;
  // 涨跌幅
  limitRate: number;
  // 所属行业
  industry: string;
};

export type PerformanceForecastData = PerformanceForecastItem[];
