import red from './red.module.less';
import blue from './blue.module.less';
import green from './green.module.less';
import yellow from './yellow.module.less';
import gray from './gray.module.less';
import lightblue from './lightblue.module.less';

export const themeMap = {
  red,
  blue,
  green,
  yellow,
  gray,
  lightblue,
};

export default function themeSetup(theme: keyof typeof themeMap) {
  if (!themeMap[theme]) {
    return '';
  }
  return themeMap[theme]['limit-review-theme'];
}
