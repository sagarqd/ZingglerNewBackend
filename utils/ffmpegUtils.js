const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const convertVideo = (inputStream, format, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputStream)
      .toFormat(format)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

const generateThumbnail = (inputStream, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputStream)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .screenshots({
        count: 1,
        folder: path.dirname(outputPath),
        filename: path.basename(outputPath)
      });
  });
};

module.exports = { convertVideo, generateThumbnail };
