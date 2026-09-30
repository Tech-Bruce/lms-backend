const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');

router.get('/', UserController.getAllUsers);    
router.post('/', UserController.createUser);
router.get('/students', UserController.getAllStudents);   // 👈 new route
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
