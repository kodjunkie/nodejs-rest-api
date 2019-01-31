const express = require('express');

const authController = require('../controllers/auth');
const userValidator = require('../middlewares/validators/user');

const router = express.Router();

router.put('/signup', userValidator.check, authController.signup);

module.exports = router;
