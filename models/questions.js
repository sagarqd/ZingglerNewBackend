const mongoose = require('mongoose');

// Define the schema for questions and answers

const QuestionSchema = new mongoose.Schema({
    questionText: String,
    correctAnswer: [String], 
    options: [String], 
    isDefault: { type: Boolean, default: false }, 
    type: { type: String, enum: ['multipleChoice', 'singleChoice', 'true/false', 'oneLine'], required: true },
  });
  
module.exports = mongoose.model('Question', QuestionSchema);
