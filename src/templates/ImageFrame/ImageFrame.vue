<script setup lang="ts">
import { isLightColor } from "@/utils/color";
import { Form } from "@/views/About/form.vue";
import { ref } from "vue";

const colorThief = new ColorThief();
const palette = ref([]);
const backgroundColor = ref("#fff");

const props = defineProps({
  data: {
    type: Object as () => Form<"ImageFrame">,
    default: () => ({}),
  },
});
console.log('props', props.data);


const imgRef = ref<HTMLImageElement>();
const handleImageLoad = () => {
  if (imgRef.value) {
    const result = colorThief.getColor(imgRef.value, 10);
    palette.value = colorThief.getPalette(imgRef.value, 3, 10);
    backgroundColor.value = `rgb(${result.join(", ")})`;
  }
};

const labelColor = computed(() => {
  return isLightColor(backgroundColor.value) ? "#000" : "#fff";
});
</script>

<template>
  <div
    class="image-frame"
    :style="{
      backgroundColor: backgroundColor,
    }"
  >
    <div class="image-frame-content">
      <img
        class="image-frame-content-image"
        :src="data.image"
        ref="imgRef"
        @load="handleImageLoad"
        style="display: block; object-fit: contain"
        alt="请在左侧上传图片"
      />
    </div>
    <div class="image-frame-footer">
      <div
        class="image-frame-footer-description"
        :style="{ color: labelColor }"
      >
        <div class="image-frame-footer-description-1">
          <div>{{ data.footerTitle }}</div>
          <div
            :style="{
              backgroundImage: `linear-gradient(to bottom, ${data.footerLabelColor[0]} 0%, ${data.footerLabelColor[1]} 74%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }"
          >
            {{ data.footerLabel }}
          </div>
        </div>
        <div class="image-frame-footer-description-2">{{ data.footerSubtitle }}</div>
      </div>
      <div class="image-frame-footer-qrcode">
        <div
          class="image-frame-footer-qrcode-wrapper"
          :class="{
            'image-frame-footer-qrcode-wrapper-light': isLightColor(backgroundColor),
            'image-frame-footer-qrcode-wrapper-dark': !isLightColor(backgroundColor),
          }"
        >
          <div class="image-frame-footer-qrcode-wrapper-image"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.image-frame {
  --qr-code-path-light: url("./assets/qr-code.png");
  --qr-code-wrapper-path-light: url("./assets/qr-code-wrapper-light.png");
  --qr-code-wrapper-path-dark: url("./assets/qr-code-wrapper-dark.png");
  --footer-height: 120px;
  // width: 590px;
  height: 1040px;
  &-content {
    width: 100%;
    height: calc(100% - var(--footer-height));
    padding: 10px 10px 0 10px;

    &-image {
      width: 100%;
      height: 100%;
    }
  }
  &-footer {
    height: var(--footer-height);
    width: 100%;
    padding: 0 50px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-description {
      color: #fff;
      display: flex;
      flex-direction: column;
      font-family: MiSans-Medium;
      line-height: 25px;
      font-size: 18px;
      letter-spacing: 3px;

      &-1 {
        display: flex;
      }
    }
    &-qrcode {
      width: 80px;
      height: 80px;

      &-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-position: center;
        background-size: 100%;
        background-repeat: no-repeat;
        &-light {
          background-image: var(--qr-code-wrapper-path-light);
        }
        &-dark {
          background-image: var(--qr-code-wrapper-path-dark);
        }
        &-image {
          width: 90%;
          height: 90%;
          display: block;
          background-position: center;
          background-size: 100%;
          background-repeat: no-repeat;
          background-image: var(--qr-code-path-light);
        }
      }
    }
  }
}
</style>
