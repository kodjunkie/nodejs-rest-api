const { body } = require('express-validator/check');

const User = require('../../models/user');

exports.check = [
	body('name')
		.trim()
		.isString()
		.isLength({ min: 3 }),
	body('email')
		.trim()
		.isEmail()
		.withMessage('Please enter a valid email!')
		.custom(value => {
			return User.findOne({ email: value }).then(user => {
				if (user) {
					return Promise.reject('E-mail address already exists!');
				}
			});
		})
		.normalizeEmail(),
	body('password')
		.isString()
		.isLength({ min: 6 })
];
