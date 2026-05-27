import fs from 'fs';
/**
 * 按照组件约定，可以直接通过文件结构更新相关类型
 * 更新内容包括：
 * 1. 引入 ${TemplateName}Data 类型
 * 2. 引入 ${TemplateName}Form 类型
 * 3. 更新字符串面量类型 TemplateName
 * 4. 更新 TemplateDataMap 接口
 * 5. 更新 TemplateFormMap 接口
 */

const templatesFolderPath = '../templates'; // 模板路径
const typeFilePath = './template.ts';
// 读取templates文件夹中的所有文件夹（非文件）的名称
fs.readdir(templatesFolderPath, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error('Error reading the templates directory:', err);
    return;
  }

  // 过滤出文件夹
  const folderNames = files
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // 读取类型文件
  fs.readFile(typeFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the types file:', err);
      return;
    }

    let typesFileContent = data;
    let hasChanges = false;
    let lastImportIndex = typesFileContent.lastIndexOf('import');
    // 找到最后一个import语句的结束位置
    if (lastImportIndex !== -1) {
      lastImportIndex = typesFileContent.indexOf(';', lastImportIndex) + 1;
    }

    folderNames.forEach((folderName) => {
      const dataTypeName = `${folderName}Data`;
      const formTypeName = `${folderName}Form`;
      const formExportName = `${folderName}FormExport`;
      const dataImportStatement = `\nimport type { ${dataTypeName} } from '@/templates/${folderName}/type';`;
      const formImportStatement = `\nimport type { ${formTypeName}, ${formExportName} } from '@/templates/${folderName}/${folderName}Form.vue';`;

      // 如果没有DataType则插入新的import语句
      if (!typesFileContent.includes(dataImportStatement.trim())) {
        if (lastImportIndex !== -1) {
          typesFileContent =
            typesFileContent.slice(0, lastImportIndex) +
            dataImportStatement +
            typesFileContent.slice(lastImportIndex);
          lastImportIndex += dataImportStatement.length;
        } else {
          typesFileContent = dataImportStatement + typesFileContent;
        }
        hasChanges = true;
      }

      // 如果没有FormType则插入新的import语句
      if (!typesFileContent.includes(formImportStatement.trim())) {
        if (lastImportIndex !== -1) {
          typesFileContent =
            typesFileContent.slice(0, lastImportIndex) +
            formImportStatement +
            typesFileContent.slice(lastImportIndex);
          lastImportIndex += formImportStatement.length;
        } else {
          typesFileContent = formImportStatement + typesFileContent;
        }
        hasChanges = true;
      }

      // 添加到TemplateName类型定义中
      const templateNamePattern = /export type TemplateName = ([^;]+);/;
      const templateNameMatch = typesFileContent.match(templateNamePattern);

      if (
        templateNameMatch &&
        !templateNameMatch[1].includes(`'${folderName}'`)
      ) {
        typesFileContent = typesFileContent.replace(
          templateNamePattern,
          `export type TemplateName = ${templateNameMatch[1]} | '${folderName}';`
        );
        hasChanges = true;
      }

      // 添加到TemplateDataMap接口中
      const templateDataMapPattern =
        /export interface TemplateDataMap {([^}]+)}/;
      const templateDataMapMatch = typesFileContent.match(
        templateDataMapPattern
      );

      if (
        templateDataMapMatch &&
        !templateDataMapMatch[1].includes(`${folderName}:`)
      ) {
        const newTemplateDataMapEntry = `  ${folderName}: ${dataTypeName};\n`;
        typesFileContent = typesFileContent.replace(
          templateDataMapPattern,
          `export interface TemplateDataMap {${templateDataMapMatch[1]}\n${newTemplateDataMapEntry}}`
        );
        hasChanges = true;
      }

      // 添加到TemplateFormMap接口中
      const templateFormMapPattern =
        /export interface TemplateFormMap {([^}]+)}/;
      const templateFormMapMatch = typesFileContent.match(
        templateFormMapPattern
      );

      if (
        templateFormMapMatch &&
        !templateFormMapMatch[1].includes(`${folderName}:`)
      ) {
        const newTemplateFormMapEntry = `  ${folderName}: ${formTypeName}Form;\n`;
        typesFileContent = typesFileContent.replace(
          templateFormMapPattern,
          `export interface TemplateFormMap {${templateFormMapMatch[1]}\n${newTemplateFormMapEntry}}`
        );
        hasChanges = true;
      }

      // 添加到TemplateFormExportMap接口中
      const templateFormExportMapPattern =
        /export interface TemplateFormExportMap {([^}]+)}/;
      const templateFormExportMapMatch = typesFileContent.match(
        templateFormExportMapPattern
      );

      if (
        templateFormExportMapMatch &&
        !templateFormExportMapMatch[1].includes(`${folderName}:`)
      ) {
        const newTemplateFormExportMapEntry = `  ${folderName}: ${formExportName};\n`;
        typesFileContent = typesFileContent.replace(
          templateFormExportMapPattern,
          `export interface TemplateFormExportMap {${templateFormExportMapMatch[1]}\n${newTemplateFormExportMapEntry}}`
        );
        hasChanges = true;
      }
    });

    // 如果有变化，更新类型文件
    if (hasChanges) {
      fs.writeFile(typeFilePath, typesFileContent, 'utf8', (err) => {
        if (err) {
          console.error('Error writing to the types file:', err);
          return;
        }
        console.log('Types file updated successfully.');
      });
    } else {
      console.log('No changes to the types file.');
    }
  });
});
