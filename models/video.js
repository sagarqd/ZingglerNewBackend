const mongoose = require('mongoose');
const Question = require('./questions');
const Course = require('./course');

const VideoSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  length: Number,
  uploadDate: Date,
  title:String,
  sectionNumber:Number,
  questions: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      startTime: Number, 
      endTime: Number  
    }
  ],
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
});

module.exports = mongoose.model('Video', VideoSchema);
