export function overflowHandle(
  str: string,
  limit: number,
  overflowStr: string = '...'
) {
  if (str.length > limit) {
    return str.slice(0, limit) + overflowStr;
  }
  return str;
}
