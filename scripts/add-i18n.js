const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');

// Функция для добавления getServerSideProps к файлу
function addGetServerSideProps(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Проверяем, есть ли уже getServerSideProps
  if (content.includes('getServerSideProps')) {
    console.log(`Skipping ${filePath} - already has getServerSideProps`);
    return;
  }
  
  // Проверяем, есть ли уже импорты для i18n
  let newContent = content;
  
  if (!content.includes('useTranslation')) {
    // Добавляем импорт useTranslation
    const importMatch = content.match(/import.*from.*['"]/);
    if (importMatch) {
      const lastImportIndex = content.lastIndexOf('import');
      const lastImportEndIndex = content.indexOf('\n', lastImportIndex) + 1;
      
      newContent = content.slice(0, lastImportEndIndex) + 
        "import { useTranslation } from 'next-i18next'\n" +
        "import { serverSideTranslations } from 'next-i18next/serverSideTranslations'\n" +
        "import { GetServerSideProps } from 'next'\n" +
        content.slice(lastImportEndIndex);
    }
  }
  
  // Добавляем getServerSideProps в конец файла
  if (!newContent.includes('export const getServerSideProps')) {
    const exportMatch = newContent.match(/export default.*$/m);
    if (exportMatch) {
      const exportIndex = newContent.lastIndexOf('export default');
      const exportEndIndex = newContent.indexOf('\n', exportIndex) + 1;
      
      newContent = newContent.slice(0, exportEndIndex) + 
        "\nexport const getServerSideProps: GetServerSideProps = async ({ locale }) => {\n" +
        "  return {\n" +
        "    props: {\n" +
        "      ...(await serverSideTranslations(locale || 'en', ['common'])),\n" +
        "    },\n" +
        "  }\n" +
        "}\n";
    }
  }
  
  // Записываем обновленный файл
  fs.writeFileSync(filePath, newContent);
  console.log(`Updated ${filePath}`);
}

// Рекурсивно обходим все файлы в директории pages
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') && !file.startsWith('_')) {
      addGetServerSideProps(filePath);
    }
  });
}

// Запускаем обработку
console.log('Adding getServerSideProps to pages...');
processDirectory(pagesDir);
console.log('Done!'); 