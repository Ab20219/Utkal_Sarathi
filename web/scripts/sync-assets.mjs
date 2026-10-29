import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const androidDrawableDir = resolve(__dirname, '../../app/src/main/res/drawable');
const webImagesDir = resolve(__dirname, '../public/images');

const assetMap = [
  ['img_app_logo_emblem_1793266422316.jpg', 'utkal-emblem.jpg'],
  ['img_hero_puri_konark_1793266424187.jpg', 'hero-puri-konark.jpg'],
  ['img_crafts_cuisine_1793266426716.jpg', 'crafts-cuisine.jpg'],
  ['img_nature_ecotourism_1793266426113.jpg', 'nature-ecotourism.jpg']
];

mkdirSync(webImagesDir, { recursive: true });

for (const [srcName, destName] of assetMap) {
  const srcPath = resolve(androidDrawableDir, srcName);
  const destPath = resolve(webImagesDir, destName);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
  }
}
