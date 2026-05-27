import type { PerformanceForecastItem, PerformanceForecastData } from './type';
import type { TemplateConfig } from '@/types/template';
import type { PerformanceForecastForm } from './PerformanceForecastForm.vue';

export interface PerformanceForecastConfig
  extends TemplateConfig<PerformanceForecastData, PerformanceForecastForm> {}

const config: PerformanceForecastConfig = {
  // 基础表格中不需要的字段
  BASE_FORM_DISABLED: ['description'],
  // 基础表格的默认值
  BASE_FORM_DEFAULT: {
    title: '业绩预增股票名单一览',
    subTitle: '年报行情拉开内幕',
    annotation: '数据截至2024年1月9日收盘',
    dataSource: 'i问财',
    producer: '@同花顺数据可视化',
    fileList: [
      {
        name: '示例（点击下载）.xlsx',
        url: `${import.meta.env.BASE_URL}xlsx/PerformanceForecast.xlsx`,
      },
    ],
  },
  // 模板表格的默认值
  TEMPLATE_FORM_DEFAULT: {
    theme: 'red',
  },
  // 表格处理函数
  SHEET_HANDLE: (sheet) => {
    const result: PerformanceForecastItem[] = [];
    const keyMappings: { [key: string]: keyof PerformanceForecastItem } = {
      股票简称: 'stockName',
      预告净利润变动中值: 'performanceIncrease',
      业绩预告类型: 'limitType',
      区间涨跌幅: 'limitRate',
      所属同花顺一级行业: 'industry',
    };
    try {
      sheet.forEach((element: any) => {
        const obj: Partial<PerformanceForecastItem> = {};
        for (const key in element) {
          // 赋值obj
          for (const searchKey in keyMappings) {
            if (key.includes(searchKey)) {
              const mappedKey = keyMappings[searchKey];
              obj[mappedKey] = element[key];
              break;
            }
          }
        }
        result.push(obj as PerformanceForecastItem);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        ElMessage.error(`表格处理失败：${error.message}`);
      } else {
        ElMessage.error(`表格处理失败：${JSON.stringify(error)}`);
      }
    }
    return result;
  },
};

export default config;
