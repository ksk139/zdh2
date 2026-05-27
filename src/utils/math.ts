export function number2chinese(num: number) {
  if (num < 1 || num > 100) {
    throw new Error('数字范围必须在1到100之间');
  }
  if (num === 1) {
    return '首';
  }

  const units = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const tens = [
    '',
    '十',
    '二十',
    '三十',
    '四十',
    '五十',
    '六十',
    '七十',
    '八十',
    '九十',
  ];

  if (num < 10) {
    return units[num];
  } else {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + units[unit];
  }
}

/**
 * 数值单位换算（万/亿）
 * @param num - 原始数字
 * @returns 带单位的格式化字符串
 * @example
 * formatNumberWithUnit(123456789) // returns '1.23亿'
 * formatNumberWithUnit(12345)     // returns '1.23万'
 * formatNumberWithUnit(1234.56)   // returns '1,234.56'
 */
export function formatNumberWithUnit(num: number | string): string {
  // 处理字符串输入，去除可能的单位和格式化字符
  let numValue: number;
  if (typeof num === 'string') {
    // 移除可能的单位（万、亿）和其他非数字字符，但保留负号和小数点
    const cleanStr = num.replace(/[万亿,，]/g, '').replace(/[^\d.-]/g, '');
    numValue = parseFloat(cleanStr);
    
    // 如果原字符串包含单位，需要还原数值
    if (num.includes('万')) {
      numValue = numValue * 1e4;
    } else if (num.includes('亿')) {
      numValue = numValue * 1e8;
    }
  } else {
    numValue = num;
  }
  
  // 如果转换失败，返回0
  if (isNaN(numValue)) {
    return '0.00';
  }
  
  const absNum = Math.abs(numValue);
  let value: number;
  let unit: string;

  if (absNum >= 1e8) {
    // 大于等于1亿
    value = numValue / 1e8;
    unit = '亿';
  } else if (absNum >= 1e4) {
    // 大于等于1万
    value = numValue / 1e4;
    unit = '万';
  } else {
    // 小于1万时直接格式化，保留两位小数
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  }

  // 根据单位决定小数位数：万元不保留小数，亿元保留两位小数
  let formatted: string;
  if (unit === '万') {
    formatted = Math.round(value).toString();
  } else {
    formatted = value.toFixed(2);
  }

  return `${formatted}${unit}`;
}
