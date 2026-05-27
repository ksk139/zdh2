/**
 * 判断颜色属于深色还是浅色
 * @param color 支持格式：#RGB、#RRGGBB、rgb(r,g,b)、rgba(r,g,b,a)
 * @returns boolean true表示浅色，false表示深色
 */
export function isLightColor(color: string): boolean {
  // 统一处理前缀和空格
  const processedColor = color.trim().toLowerCase();
  
  // 解析颜色值为RGB数组
  let rgb = [0, 0, 0];
  if (processedColor.startsWith('#')) {
    rgb = hexToRgb(processedColor);
  } else if (processedColor.startsWith('rgb')) {
    rgb = rgbStringToRgb(processedColor);
  }

  // 计算相对亮度（W3C标准公式）
  const luminance = 0.2126 * rgb[0]/255 + 0.7152 * rgb[1]/255 + 0.0722 * rgb[2]/255;
  
  // 阈值判断（0.5为中间值）
  return luminance > 0.5;
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace('#', '');
  
  // 处理缩写格式 #RGB => RRGGBB
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  // 解析为十进制数值
  const num = parseInt(hex, 16);
  return [
    (num >> 16) & 255, // red
    (num >> 8) & 255,  // green
    num & 255          // blue
  ];
}

function rgbStringToRgb(rgbStr: string): number[] {
  // 提取数值部分
  const values = rgbStr.match(/(\d+)/g)?.map(Number) || [];
  return values.slice(0, 3); // 取前三个数值（忽略alpha）
}
