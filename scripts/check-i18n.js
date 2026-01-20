import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

function getKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getKeys(obj[el], prefix + el + '.')];
    }
    return [...res, prefix + el];
  }, []);
}

const files = fs.readdirSync(LOCALES_DIR).filter(file => file.endsWith('.json'));

if (files.length < 2) {
  console.log('Not enough locale files to compare.');
  process.exit(0);
}

const localesData = files.map(file => {
  const content = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8'));
  return {
    file,
    keys: getKeys(content)
  };
});

// 1. Tüm dosyalardaki benzersiz anahtarların bir listesini (Union) oluştur
const allUniqueKeys = new Set();
localesData.forEach(locale => {
  locale.keys.forEach(key => allUniqueKeys.add(key));
});

let hasError = false;

// 2. Her dosyayı bu "evrensel" listeye göre kontrol et
localesData.forEach(locale => {
  const missingKeys = Array.from(allUniqueKeys).filter(key => !locale.keys.includes(key));
  
  if (missingKeys.length > 0) {
    console.error(`\x1b[31mError: Missing keys in ${locale.file}:\x1b[0m`);
    missingKeys.sort().forEach(key => console.error(` - ${key}`));
    hasError = true;
  }
});

if (hasError) {
  console.error('\n\x1b[31mi18n validation failed! Some locale files are missing keys found in others.\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32mi18n validation passed! All locale files are perfectly synchronized.\x1b[0m');
  process.exit(0);
}