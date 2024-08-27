const mongoose = require('mongoose');
const Question = require('../models/questions'); 
const dotenv = require('dotenv');

// Define the default questions
const defaultQuestions = [
  {
    "question": "Which of the following are prime numbers?",
    "options": ["2", "4", "6", "7"],
    "correctAnswers": ["2", "7"],
    "type": "multiple-choice",
    "isDefault": true,
  },
  {
    "question": "Is this software available on mobile platforms?",
    "options": [],
    "correctAnswers": ["true"], // Assuming the correct answer is "true"
    "type": "true/false",
    "isDefault": true
  },
  {
    "question": "What is the primary purpose of this software?",
    "options": [],
    "correctAnswers": ["To demonstrate functionality"], // Example one-line answer
    "type": "one-line",
    "isDefault": true
  },

];

dotenv.config();
async function addDefaultQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://sagarqd:Qu8et2024@zinggerrlms.afp8ls4.mongodb.net/?retryWrites=true&w=majority&appName=zinggerrlms")
        .then(() => console.log('DB connected Successfully'))
        .catch((error) => console.log('DB unable to connect', error));

    for (const dq of defaultQuestions) {
      const existingQuestion = await Question.findOne({ question: dq.question, isDefault: true });
      if (!existingQuestion) {
        await new Question(dq).save();
        console.log(`Added default question: "${dq.question}"`);
      } else {
        console.log(`Default question already exists: "${dq.question}"`);
      }
    }

    console.log('Default questions added successfully.');
  } catch (error) {
    console.error('Error adding default questions:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function to add default questions
addDefaultQuestions();
