const express = require('express');
const { body } = require('express-validator/check');

const authController = require('../controllers/auth');
const userValidator = require('../middlewares/validators/user');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.put('/signup', userValidator.check, authController.signup);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getUserStatus);

router.patch(
	'/status',
	isAuth,
	[
		body('status')
			.trim()
			.not()
			.isEmpty()
	],
	authController.updateUserStatus
);

module.exports = router;
