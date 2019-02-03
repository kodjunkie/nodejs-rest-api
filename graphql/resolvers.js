const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { throwError } = require('../util/error-handler');

module.exports = {
	signup: async function({ userInput }, req) {
		const name = userInput.name;
		const email = userInput.email;
		const password = userInput.password;

		const errors = [];
		if (!validator.isEmail(email)) {
			errors.push({ message: 'E-mail is invalid.' });
		}
		if (validator.isEmpty(password) || !validator.isLength(password, { min: 6 })) {
			errors.push({ message: 'Password too short.' });
		}
		if (errors.length > 0) {
			throwError('Invalid input', 422, errors);
		}

		const existingUser = await User.findOne({ email: email });

		if (existingUser) {
			throwError('User already exists!');
		}

		const hashpw = await bcrypt.hash(password, 12);
		const user = new User({
			name: name,
			email: email,
			password: hashpw,
			posts: []
		});
		const createdUser = await user.save();
		return {
			...createdUser._doc,
			_id: createdUser._id.toString()
		};
	},

	login: async function({ email, password }, req) {
		const errors = [];
		if (!validator.isEmail(email)) {
			errors.push({ message: 'E-mail is invalid.' });
		}
		if (validator.isEmpty(password) || !validator.isLength(password, { min: 6 })) {
			errors.push({ message: 'Password too short.' });
		}
		if (errors.length > 0) {
			throwError('Invalid input', 422, errors);
		}

		const user = await User.findOne({ email: email });
		if (!user) {
			throwError('Your credentials do not match our record!', 401);
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			throwError('Your credentials do not match our record!', 401);
		}

		const token = await jwt.sign(
			{
				email: user.email,
				userId: user._id.toString()
			},
			'secret',
			{ expiresIn: '1h' }
		);

		return { token: token, userId: user._id.toString() };
	}
};
