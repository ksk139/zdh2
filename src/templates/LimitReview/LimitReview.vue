<!-- 模板内容 -->
<script setup lang="ts">
import { computed } from 'vue';
import draggable from 'vuedraggable';
import { type Form } from '@/views/About/form.vue';
import { number2chinese } from '@/utils/math';
import TIcon from './assets/T.svg';
import 一Icon from './assets/yi.svg';
import CIcon from './assets/chuang.svg';
import { type LimitItem } from './type';
import themeSetup from './theme';

/** Props */
const props = defineProps({
  data: {
    type: Object as () => Form<'LimitReview'>,
    default: () => ({}),
  },
});

/** Ref */
const drag = ref(false);
const dataFormat = ref(props.data.parseData || []);

/** default */
/** 标题文本中的日期长度 */
const TITLE_DATE_LEN  = 5;

/** Computed */
// 将标题中的日期字符串拆分成数组，便于处理
const dateCharArr = computed(() => {
  const dateTemp = props.data.title?.slice(0, TITLE_DATE_LEN);
  
  return dateTemp?.split('');
})

// 将标题中的描述字符串拆分为数组，便于样式处理
const titleCharArr = computed(() => {
  const titleTemp = props.data.title?.slice(TITLE_DATE_LEN) || '';
  // 找到【涨停】所在的索引
  const keyword = '涨停';
  const keywordIndex = titleTemp.indexOf(keyword);
  const keywordIndexes = Array.from(
    { length: keyword.length },
    (_, index) => keywordIndex + index
  );
  // 将字符串拆分为数组
  const arr = titleTemp.split('');
  // 返回标签
  return arr.map((item, i) => {
    const highlightClassName =
      keywordIndex !== -1 && keywordIndexes.includes(i)
        ? 'limit-review-title-highlight'
        : '';
    return {
      char: item,
      // highlight与order互斥，所以这里直接用或逻辑
      class: highlightClassName,
    };
  });
});

const hasCountOverTen = computed(() => {
  return dataFormat.value.some((part) =>
    part.items.some((item) => item.limitTimes >= 10)
  );
});

const hasInnovateStock = computed(() => {
  return dataFormat.value.some((part) =>
    part.items.some((item) => item.stockCode.startsWith('30'))
  );
});

/** Watch */
// 短板时，限定内容长度
watch(
  () => props.data.parseData,
  (newVal) => {
    const newValTemp = newVal || [];
    if (props.data.isLong) {
      dataFormat.value = newValTemp;
    } else {
      // 内容长度计算方式: 个股数 + 板块数 * 2
      // 约定最大长度为30，但是偶尔会有越界1~2个的情况，所以这里取33
      const MAX_CONTENT_LENGTH = 33;
      const PART_FIX = 2;
      const result: typeof newValTemp = [];

      let count = 0;
      for (let part of newValTemp) {
        const { reason, items } = part;
        const length = items.length;
        if (count + length + PART_FIX <= MAX_CONTENT_LENGTH) {
          result.push(part);
          count += length + PART_FIX;
        } else {
          const diff = MAX_CONTENT_LENGTH - count - PART_FIX;
          // 如果剩余长度不足，则直接跳出
          if (diff <= 0) {
            break;
          }
          result.push({ reason, items: items.slice(0, diff) });
          break;
        }
      }
      dataFormat.value = result;
    }
  }
);

/** Methods */
function getStockLimitIcon(limitType: string) {
  const types = limitType.split('||');
  if (!types.length) {
    return;
  }
  if (types.includes('一字涨停')) {
    return 一Icon;
  }
  if (types.includes('T字涨停')) {
    return TIcon;
  }
}

function getInnovateStockIcon(stockCode: string) {
  return stockCode.startsWith('30') ? CIcon : '';
}

function getStockNameDecorationClassName(stock: LimitItem, reason: string) {
  // 如果连板数大于等于三，或者涨停原因关联该股票，则添加下滑线
  if (stock.limitTimes >= 3 || reason.includes(stock.stockName)) {
    return 'limit-review-content-item-stock-name-content--underline';
  }

  return '';
}

// 为了时间可以实现等宽，将其拆分
function getTimeSplit(time: string) {
  const timeArr = time.toString().trim().split('');
  return timeArr.map((char) => {
    return {
      char,
      className:
        char === ':'
          ? 'limit-review-content-item-stock-time-split'
          : 'limit-review-content-item-stock-time-char',
    };
  });
}
</script>

<template>
  <div
    class="limit-review"
    :is-long="data.isLong"
    :class="themeSetup(data.theme) || ''"
  >
    <div class="limit-review-watermark"></div>
    <div class="limit-review-logo">
      <div class="limit-review-logo-top_logo"></div>
      <div class="limit-review-logo-top_split"></div>
    </div>
    <div class="limit-review-title limit-review-title-date">
      <span 
        v-for="(item, index) in dateCharArr"
        :key="index"
      >
        {{ item }}
      </span>
    </div>
    <div class="limit-review-title limit-review-title-content">
      <span
        v-for="(item, index) in titleCharArr"
        :key="index"
        :class="item.class"
      >
        {{ item.char }}
      </span>
    </div>
    <div class="limit-review-legend">
      <div class="limit-review-legend-item">
        <img
          src="./assets/yi.svg"
          alt="legend_yi"
          class="limit-review-legend-item-logo"
        />
        <div class="limit-review-legend-item-label">一字涨停</div>
      </div>
      <div class="limit-review-legend-item">
        <img
          src="./assets/T.svg"
          alt="legend_T"
          class="limit-review-legend-item-logo"
        />
        <div class="limit-review-legend-item-label">T字涨停</div>
      </div>
    </div>
    <div class="limit-review-stat">
      <div
        class="limit-review-stat-item"
        v-for="item in data.stat"
        :key="item.label"
      >
        <div class="limit-review-stat-item-label">{{ item.label }}：</div>
        <div class="limit-review-stat-item-value">{{ item.value }}</div>
        <div class="limit-review-stat-item-unit">{{ item.unit }}</div>
      </div>
    </div>
    <div class="limit-review-content">
      <draggable
        v-model="dataFormat"
        handle=".limit-review-content-item-reason"
        item-key="reason"
        animation="300"
        @start="drag = true"
        @end="drag = false"
      >
        <template #item="{ element }">
          <div class="limit-review-content-item">
            <div class="limit-review-content-item-reason">
              {{ element.reason }}
            </div>
            <div
              class="limit-review-content-item-stock"
              v-for="item in element.items"
              :key="item.stockName"
            >
              <div
                class="limit-review-content-item-stock-icon"
                :style="{
                  backgroundImage: `url(${getStockLimitIcon(item.limitType)})`,
                }"
              ></div>
              <div
                class="limit-review-content-item-stock-count"
                :style="{
                  justifyContent: hasCountOverTen
                    ? 'space-between'
                    : 'space-around',
                  marginRight: hasCountOverTen
                    ? '10px !important'
                    : '8px !important',
                }"
              >
                <span
                  v-for="char in `${number2chinese(Number(item.limitTimes))}板`"
                >
                  {{ char }}
                </span>
              </div>
              <div
                v-if="data.isLong"
                class="limit-review-content-item-stock-code"
              >
                <span
                  v-for="(char, cIndex) in item.stockCode
                    .replace(/\D/g, '')
                    .split('')"
                  :key="cIndex"
                  >{{ char }}</span
                >
              </div>
              <div class="limit-review-content-item-stock-name">
                <div
                  class="limit-review-content-item-stock-name-content"
                  :class="getStockNameDecorationClassName(item, element.reason)"
                >
                  <span
                    v-for="(char, cIndex) in item.stockName.split('')"
                    :key="cIndex"
                    >{{ char }}</span
                  >
                </div>
                <!-- 标记是否为科创板 -->
                <div
                  v-if="hasInnovateStock && !data.isLong"
                  class="limit-review-content-item-stock-name-sign"
                  :style="{
                    backgroundImage: `url(${getInnovateStockIcon(
                      item.stockCode
                    )})`,
                  }"
                ></div>
              </div>
              <div class="limit-review-content-item-stock-time">
                <span
                  v-for="(char, cIndex) in getTimeSplit(item.lastLimitTime)"
                  :key="cIndex"
                  :class="char.className"
                  >{{ char.char }}</span
                >
              </div>
              <div class="limit-review-content-item-stock-reason">
                {{ item.causeCategory }}
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <div class="limit-review-annotation">
      注：数据为连板数/个股/最终涨停时间/涨停原因分类；连板数高/涨停早/形态强，则资金关注度高
    </div>
    <div class="limit-review-sign">
      <div class="limit-review-sign-text">
        <div>
          图片由AI生成
        </div>
        <div class="limit-review-sign-text-datasource">
          数据来源：{{ data.dataSource }}
        </div>
        <div class="limit-review-sign-text-producer">
          可视模型：{{ data.producer }}
        </div>
      </div>
      <div
        v-if="data.isLong"
        class="limit-review-sign-qrcode"
        :style="{
          display: data.qrCode ? 'block' : 'none',
          backgroundImage: `url(${data.qrCode})`,
        }"
      ></div>
      <div v-else class="limit-review-sign-logo"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.limit-review {
  width: 590px;
  height: 1040px;
  padding: 68px 45px 85px;
  background-image: var(--bg-image);
  background-size: auto 100%;
  background-position: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;

  &[is-long='true'] {
    height: fit-content;
    padding-left: 25px;
    padding-right: 25px;
    padding-bottom: 38px;

    .limit-review-legend,
    .limit-review-title,
    .limit-review-stat {
      padding-left: 20px;
      padding-right: 20px;
    }

    .limit-review-content {
      &-item {
        &-stock {
          & > * {
            margin-right: 10px !important;
          }
          & > *:last-child,
          & > *:first-child {
            margin-right: 0px !important;
          }

          &-name {
            &-content {
              margin-right: 0;
            }
          }
        }
      }
    }

    .limit-review-annotation {
      padding-top: 9px;
      padding-left: 0px;
    }

    .limit-review-sign {
      margin-top: 24px;
      align-items: flex-end;
      &-qrcode {
        width: 90px;
        height: 90px;
        background-position: center;
        background-size: 100%;
        background-repeat: no-repeat;
      }
    }
  }

  &-watermark {
    position: absolute;
    inset: 0;
    background-image: var(--watermark-image);
    background-size: 100% auto;
    background-position: center top;
    opacity: 0.3;
    z-index: 999;
    pointer-events: none;
  }
  &-logo {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    &-top_logo {
      height: 21px;
      width: 150px;
      background-image: var(--top-logo);
      margin-bottom: 8px;
    }
    &-top_split {
      width: 100%;
      height: 8px;
      background-image: var(--top-split);
    }
    &-top_logo, &-top_split {
      background-size: 100% auto;
      background-position: center top;
    }
  }
  &-legend {
    display: flex;
    margin-bottom: 4px;
    &-item {
      display: flex;
      align-items: center;
      margin-right: 12px;
      &-logo {
        width: 14px;
        height: 14px;
        margin-right: 6px;
      }
      &-label {
        font-family: 'MiSans-Medium', 'Microsoft YaHei', sans-serif;
        font-size: 12px;
        color: var(--stat-text-color);
        letter-spacing: 0;
        font-weight: normal;
      }
    }
  }
  &-title {
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    font-family: 'MiSans-Bold', 'Microsoft YaHei', sans-serif;
    font-size: 65px;
    color: var(--title-text-color);
    letter-spacing: 0;
    line-height: 65px;
    font-weight: normal;
    margin-bottom: 8px;
    :deep(&-highlight) {
      color: var(--title-highlight-text-color);
    }
    :deep(&-order) {
      font-size: 36px;
    }
    :deep(&-date) {
      margin-top: 10px;
      margin-bottom: 0;
    }
  }
  &-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    &-item {
      display: flex;
      align-items: baseline;
      &:first-child {
        .limit-review-stat-item-value {
          font-family: 'MiSans-Bold', 'Microsoft YaHei', sans-serif;
          font-size: 16px;
          color: var(--stat-highlight-text-color);
          letter-spacing: 0;
          font-weight: normal;
          margin-right: 4px;
        }
      }
      &-label {
        font-family: 'MiSans-Medium', 'Microsoft YaHei', sans-serif;
        font-size: 11.5px;
        color: var(--stat-text-color);
        letter-spacing: 0;
        font-weight: normal;
      }
      &-value,
      &-unit {
        font-family: 'MiSans-Demibold', 'Microsoft YaHei', sans-serif;
        font-size: 13px;
        color: var(--stat-text-color);
        letter-spacing: 0;
        font-weight: normal;
      }
    }
  }
  &-content {
    &-item {
      background: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
      &-reason {
        height: 25px;
        background-image: var(--reason-bg-color);
        font-family: 'MiSans-Semibold', 'Microsoft YaHei', sans-serif;
        font-size: 13px;
        color: var(--reason-text-color);
        letter-spacing: 0;
        text-align: center;
        font-weight: normal;
        line-height: 25px;
        margin-bottom: 6px;
        cursor: move;
      }
      &-stock {
        height: 16px;
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        padding-left: 12px;
        padding-right: 26px;

        & > * {
          flex-shrink: 1;
          margin-right: 28px;
        }

        & > *:nth-child(2) {
          margin-right: 24px;
        }
        & > *:nth-child(3) {
          margin-right: 18px;
        }

        & > *:last-child,
        & > *:first-child {
          margin-right: 0;
        }

        &:last-child {
          margin-bottom: 12px;
        }

        &-icon {
          width: 14px;
          height: 14px;
          margin-right: 2px;
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat;
        }

        &-count {
          display: flex;
          width: 36px;
          font-family: 'MiSans-Demibold', 'Microsoft YaHei', sans-serif;
          font-size: 12px;
          color: #000000;
          letter-spacing: 0;
          font-weight: normal;
          white-space: nowrap;
        }

        &-code {
          display: flex;
          justify-content: space-between;
          flex-wrap: nowrap;
          width: 44px;
          font-family: 'MiSans-Demibold', 'Microsoft YaHei', sans-serif;
          font-size: 12px;
          color: #e03114;
          letter-spacing: 0;
          text-align: justify;
          font-weight: normal;

          & > span {
            width: 6px;
            flex-shrink: 1;
            text-align: center;
          }
        }

        &-name {
          display: flex;
          align-items: center;

          &-sign {
            width: 14px;
            height: 14px;
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
          }

                  &-content {
          display: flex;
          justify-content: space-between;
          flex-wrap: nowrap;
          width: 48px;
          font-family: 'MiSans-Demibold', 'Microsoft YaHei', sans-serif;
          font-size: 12px;
          color: #e03114;
          letter-spacing: 0;
          font-weight: normal;
          margin-right: 4px;

            & > * {
              flex-shrink: 1;
            }
            &--underline {
              border-bottom: 1px solid #e03114;
            }
          }
        }

        &-time {
          display: flex;
          justify-content: space-between;
          flex-wrap: nowrap;
          width: 56px;
          font-family: 'Aileron-Regular';
          font-size: 13px;
          color: #000000;
          font-weight: 500;
          & > * {
            text-align: center;
            flex-shrink: 1;
          }
          &-split {
            width: 4px;
          }
          &-char {
            width: 8px;
          }
        }

        &-reason {
          flex: 1;
          width: 0px;
          font-family: 'MiSans-Medium', 'Microsoft YaHei', sans-serif;
          font-size: 12px;
          color: #5a5959;
          letter-spacing: 0;
          font-weight: 400;
          white-space: nowrap; /* 文本不换行 */
          overflow: hidden; /* 超出部分隐藏 */
          text-overflow: ellipsis; /* 超出部分显示省略号 */
        }
      }
    }

    &-item:last-child {
      margin-bottom: 0px;
    }
  }
  &-annotation {
    padding-top: 6px;
    padding-left: 12px;
    font-family: 'MiSans-Regular', 'Microsoft YaHei', sans-serif;
    font-size: 11px;
    color: var(--annotation-text-color);
    letter-spacing: 0;
    text-align: justify;
    font-weight: 400;
  }
  &-sign {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-text {
      font-family: 'MiSans-Medium', 'Microsoft YaHei', sans-serif;
      font-size: 12px;
      color: var(--sign-text-color);
      letter-spacing: 0;
      text-align: justify;
      font-weight: 400;
      opacity: 0.8;
    }
    &-logo {
      width: 40px;
      height: 40px;
      background-color: var(--icon-color);
      -webkit-mask-image: url('@/assets/images/logo.svg');
      mask-image: url('@/assets/images/logo.svg');
    }
  }
}
</style>
