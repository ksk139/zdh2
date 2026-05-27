import type { LimitItem, LimitReviewData } from './type';
import type { TemplateConfig } from '@/types/template';
import type { LimitReviewForm } from './LimitReviewForm.vue';

export interface LimitReviewConfig
  extends TemplateConfig<LimitReviewData, LimitReviewForm> {}

// 获取今天的日期
const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const formattedDate = `${month}/${day}`;

const config: LimitReviewConfig = {
  // 基础表格中不需要的字段
  BASE_FORM_DISABLED: ['subTitle', 'description', 'annotation'],
  // 基础表格的默认值
  BASE_FORM_DEFAULT: {
    title: `${formattedDate}A股涨停复盘`,
    dataSource: 'i问财-异动解读',
    producer: '@同花顺数据可视化',
    fileList: [
      {
        name: '示例（点击下载）.xlsx',
        url: `${import.meta.env.BASE_URL}xlsx/LimitReview.xlsx`,
      },
    ],
  },
  // 模板表格的默认值
  TEMPLATE_FORM_DEFAULT: {
    isLong: false,
    qrCode: '',
    total: 0,
    totalPromotionRate: 0,
    totalBlastRate: 0,
    totalBidIncrease: 0,
    theme: 'red',
  },
  // 表格处理函数
  SHEET_HANDLE: (sheet) => {
    const resultMap: Record<string, LimitItem[]> = {};
    const keyMappings: { [key: string]: keyof LimitItem } = {
      股票代码: 'stockCode',
      股票简称: 'stockName',
      连续涨停天数: 'limitTimes',
      最终涨停时间: 'lastLimitTime',
      涨停原因类别: 'causeCategory',
      涨停类型: 'limitType',
    };
    try {
      sheet.forEach((element: any) => {
        const obj: Partial<LimitItem> = {};
        for (const key in element) {
          // 赋值obj
          for (const searchKey in keyMappings) {
            if (key.includes(searchKey)) {
              const mappedKey = keyMappings[searchKey];
              obj[mappedKey] = element[key].toString().trim();
              break;
            }
          }

          // 赋值resultMap
          if (key === '涨停原因') {
            const reason = element[key];
            resultMap[reason] = resultMap[reason] || [];
            resultMap[reason].push(obj as LimitItem);
            continue;
          }
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        ElMessage.error(`表格处理失败：${error.message}`);
      } else {
        ElMessage.error(`表格处理失败：${JSON.stringify(error)}`);
      }
    }

    const result = Object.entries(resultMap).map(([reason, items]) => ({
      reason,
      items,
    }));

    // 板块间排序规则: 其他排在最后，剩余板块按照个股数量排序
    result.sort((a, b) => {
      if (a.reason.includes('其他')) {
        return Infinity;
      }
      if (b.reason.includes('其他')) {
        return -Infinity;
      }
      return b.items.length - a.items.length;
    });

    // 个股间排序规则：按照涨停次数排序
    result.forEach((r) => {
      r.items.sort((a, b) => b.limitTimes - a.limitTimes);
    });

    return result;
  },
} as const;

export default config;
