const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Err = require('../util/error-handler');

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return Err.throwError('Validation failed!', 422, errors.array());
	}

	const inputs = req.body;
	bcrypt
		.hash(inputs.password, 12)
		.then(hashPassword => {
			const user = new User({
				name: inputs.name,
				email: inputs.email,
				password: hashPassword,
				posts: []
			});
			return user.save();
		})
		.then(user => {
			res.status(201).json({ message: 'User created', userId: user._id });
		})
		.catch(err => Err.catchError(err, next));
};
