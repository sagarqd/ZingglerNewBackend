const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  length: Number,
  uploadDate: Date
});

module.exports = mongoose.model('Video', VideoSchema);
