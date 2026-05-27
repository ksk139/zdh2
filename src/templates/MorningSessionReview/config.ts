import { TemplateConfig } from "@/types/template";
import { MorningSessionReviewData } from "./type";
import { MorningSessionReviewForm } from "./MorningSessionReviewForm.vue";

export interface MorningSessionReviewConfig
    extends TemplateConfig<MorningSessionReviewData, MorningSessionReviewForm> { };


// 获取今天的日期
const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const formattedDate = `${month}/${day}`;



// 根据主题动态生成标题的函数
function getTitleByTheme(theme: string): string {
    // 资金流入模板：棕色、紫色、红色
    const inflowThemes = ['brown', 'purple', 'red'];
    // 资金流出模板：深蓝、蓝色、绿色
    const outflowThemes = ['darkblue', 'blue', 'green'];
    
    if (inflowThemes.includes(theme)) {
        return '期货资金流入前20';
    } else if (outflowThemes.includes(theme)) {
        return '期货资金流出前20';
    } else {
        return '期货资金流向前20'; // 默认标题
    }
}

const config: MorningSessionReviewConfig = {
    BASE_FORM_DISABLED: ['fileList'],
    BASE_FORM_DEFAULT: {
        title: getTitleByTheme('red'), // 默认标题，会根据主题动态更新
        subTitle: `${formattedDate}今日回顾`,
        dataSource: '同花顺期货通',
        producer: '@ 同花顺期货通',
        annotation: `数据截至时间：${new Date().toLocaleString('zh-CN', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}`,
        fileList: [
            {
                name: '示例(点击下载).xlsx',
                url: `${import.meta.env.BASE_URL}xlsx/PerformanceForecast.xlsx`,
            }
        ]
    },
    TEMPLATE_FORM_DEFAULT: {
        theme: 'red',
        excelData: []
    },
    SHEET_HANDLE() {
        return [];
    },
} as const;

export { getTitleByTheme };
export default config;