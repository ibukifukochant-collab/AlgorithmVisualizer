/**
 * 生成标准尺寸的缩略图
 * 推荐尺寸：300x180 像素
 */

const fs = require('fs');
const path = require('path');

// 检查是否安装了 sharp 库，如果没有则提供替代方案
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('Sharp library not found. Install it using: npm install sharp');
  console.log('For now, showing the recommended dimensions:');
  console.log('Recommended thumbnail size: 300x180 pixels');
  console.log('Alternative high-res size: 600x360 pixels');
  process.exit(0);
}

/**
 * 生成指定尺寸的缩略图
 * @param {string} inputPath - 输入图片路径
 * @param {string} outputPath - 输出图片路径
 * @param {number} width - 目标宽度
 * @param {number} height - 目标高度
 */
async function generateThumbnail(inputPath, outputPath, width, height) {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover', // 保持宽高比并填充整个尺寸
        position: 'center' // 从中心裁剪
      })
      .toFile(outputPath);
    
    console.log(`Thumbnail generated: ${outputPath} (${width}x${height})`);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
  }
}

// 如果用户提供了输入文件路径
if (process.argv[2]) {
  const inputPath = process.argv[2];
  const outputDir = path.dirname(inputPath);
  const outputFile = path.join(outputDir, 'thumbnail-standard.png');
  const outputFileHiRes = path.join(outputDir, 'thumbnail-hires.png');
  
  generateThumbnail(inputPath, outputFile, 300, 180);
  generateThumbnail(inputPath, outputFileHiRes, 600, 360);
} else {
  console.log('Usage: node generate_thumbnail.js <input_image_path>');
  console.log('Recommended thumbnail size: 300x180 pixels');
  console.log('Alternative high-res size: 600x360 pixels');
}