# Templates

## 设计说明

每个模板均由 UI 部分和数据部分组成

UI 部分指的是模板中的静态图片和文本

数据部分则指代表格、图表等强依赖数据的部分

前期数据部分均依赖 EXCEL 传入，EXCEL 的结构需要与设计师约定

## 文件结构

templates 文件夹采用【约定大于配置】的思想

以 LimitReview 为例

- 文件名为大驼峰，最多不超过三个单词
  - assets 文件夹【可省略】，包含该模板独有的设计资源，如果部分设计资源可以复用，需要转到 src/assets 下
  - theme 文件夹【可省略】，包含该模板独有的主题资源，如果部分主题资源可以复用，需要转到 src/theme 下
  - type.d.ts，用于描述模板中涉及的数据类型
    - ${TemplateName}Data
  - form.vue【可省略】，表示该模板独有的表单配置，比如图表或者图片等特有的暴露出的功能，如果部分选项可抽象复用，需要提取到 src/components/BaseForm 中
  - ${TemplateName}.vue，表示模板本身的 UI 内容
  - ${TemplateName}.config.ts，模板的说明文件
- public/xlsx/${TemplateName}.xlsx【可省略】，表示模板的示例数据
- public/images/${TemplateName}-preview.png，表示模板的预览图
