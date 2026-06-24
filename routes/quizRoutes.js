const express = require('express');

const router = express.Router();
const QuizController =require('../controllers/QuizController');

router.post('/', QuizController.createQuiz);
router.get('/:lessonId', QuizController.getQuizzesByLesson);
router.get('/quiz/:id', QuizController.getQuizById);
router.put('/quiz/:id', QuizController.updateQuiz);
router.delete('/quiz/:id', QuizController.deleteQuiz);

module.exports = router;
