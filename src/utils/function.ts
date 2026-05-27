/**
 * 检测是否为空函数
 * @param fn 要检测的函数
 * @returns 如果是空函数返回true，否则返回false
 * 
 * ### 支持检测的格式
 * - `() => {}`
 * - `function() {}` 
 * - `() => { /* empty *\/ }`
 * - `function(){// comment}`
 * - `() => {\n}` (包含换行的空函数)
 */
export function isEmptyFunction(fn: Function): boolean {
  const functionString = fn.toString();
  
  // 增强型正则匹配函数体（支持多行匹配）
  const bodyMatch = functionString.match(
    /(?:=>|function.*?)\s*{?\s*([\s\S]*?)\s*}?\s*$/m
  );
  if (!bodyMatch) return false;

  let body = bodyMatch[1]
    // 移除所有注释（包括多行和单行）
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    // 移除所有空白字符（包含换行符）
    .replace(/[\s\n\r\t]/g, ''); 

  return body === '';
}
