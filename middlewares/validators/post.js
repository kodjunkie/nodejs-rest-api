const { body } = require('express-validator/check');

module.exports = [
	body('title')
		.trim()
		.isString()
		.isLength({ min: 5 }),
	body('content')
		.trim()
		.isString()
		.isLength({ min: 5 })
];
