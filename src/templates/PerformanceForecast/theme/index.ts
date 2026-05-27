import red from './red.module.less';
import blue from './blue.module.less';
import yellow from './yellow.module.less';

export const themeMap = {
  red,
  blue,
  yellow,
};

export default function themeSetup(theme: keyof typeof themeMap) {
  if (!themeMap[theme]) {
    return '';
  }
  return themeMap[theme]['performance-forecast-theme'];
}
