// 模板接受的数据格式
// excel最终需要处理成的数据格式
// 后续接口最终需要处理成的数据格式

export type LimitItem = {
  // 股票代码
  stockCode: string;
  // 股票名称
  stockName: string;
  // 连板板数
  limitTimes: number;
  // 最终涨停时间
  lastLimitTime: string;
  // 涨停原因类别
  causeCategory: string;
  // 涨停类型
  limitType: string;
};

export type LimitPart = {
  // 涨停原因
  reason: string;
  items: LimitItem[];
};

export type LimitReviewData = LimitPart[];
