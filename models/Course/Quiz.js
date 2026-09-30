 const mongoose = require('mongoose');
const QuizSchema = new mongoose.Schema({
  title: String,
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswerIndex: Number
    }
  ]
});
module.exports = mongoose.model('Quiz', QuizSchema);