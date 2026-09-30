const  Quiz = require("../models/Course/Quiz");

const QuizController={
    createQuiz: async (req, res) => {
        const { title, lessonId, questions } = req.body;
        try {
            const quiz = new Quiz({ title, lessonId, questions });
            await quiz.save();
            res.status(201).json(quiz);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getQuizzesByLesson: async (req, res) => {
        const { lessonId } = req.params;
        try {
            const quizzes = await Quiz.find({ lessonId });
            res.status(200).json(quizzes);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getQuizById: async (req, res) => {
        const { id } = req.params;
        try {
            const quiz = await Quiz.findById(id);
            if (!quiz) {
                return res.status(404).json({ error: "Quiz not found" });
            }
            res.status(200).json(quiz);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    updateQuiz: async (req, res) => {
        const { id } = req.params;
        const { title, lessonId, questions } = req.body;
        try {
            const quiz = await Quiz.findByIdAndUpdate(id, { title, lessonId, questions }, { new: true });
            if (!quiz) {
                return res.status(404).json({ error: "Quiz not found" });
            }
            res.status(200).json(quiz);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    deleteQuiz: async (req, res) => {
        const { id } = req.params;
        try {
            const quiz = await Quiz.findByIdAndDelete(id);
            if (!quiz) {
                return res.status(404).json({ error: "Quiz not found" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }   

}
module.exports = QuizController;
    