const mongoose = require('mongoose');

// Define the schema for questions and answers

const QuestionSchema = new mongoose.Schema({
    question: String,
    correctAnswers: [String], 
    options: [String], 
    isDefault: { type: Boolean, default: false }, 
    type: { type: String, enum: ['multiple-choice', 'single-choice', 'true/false', 'one-line'], required: true },
  });
  
module.exports = mongoose.model('Question', QuestionSchema);
