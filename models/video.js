const mongoose = require('mongoose');
const Question = require('./questions')

const VideoSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  length: Number,
  uploadDate: Date,
  questions: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      startTime: Number, 
      endTime: Number  
    }
  ]
});

module.exports = mongoose.model('Video', VideoSchema);
