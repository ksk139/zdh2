// 模板接受的数据格式
// excel或接口数据最终需要处理成的数据格式


export type MorningSessionReviewItem = {
    /** 股票名称 */
    stockName: string;
    /** 涨跌幅 */
    limitRate: number;
    /** 主力资金流向 */
    mainFundsFlow: number;
    /** 暗盘资金流向 */
    lowerFundsFlow: number;
    /** 所属行业 */
    industry: string;
};

export type MorningSessionReviewData = MorningSessionReviewItem[];