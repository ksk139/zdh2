import red from './red.module.less';
import blue from './blue.module.less';
import darkblue from './darkblue.module.less';
import purple from './purple.module.less';
import green from './green.module.less';
import brown from './brown.module.less';

export const themeMap = {
    red,
    blue,
    darkblue,
    purple,
    green,
    brown
}

export default function themeSetup(theme: keyof typeof themeMap) {
    if (!themeMap[theme]) {
        return '';
    }
    return themeMap[theme]['morning-session-review-theme']
}