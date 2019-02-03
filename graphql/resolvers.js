const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/user');
const { throwError } = require('../util/error-handler');

module.exports = {
	signup: async function({ userInput }, req) {
		const name = userInput.name;
		const email = userInput.email;
		const password = userInput.password;

		const errors = [];
		if (!validator.isEmail(email)) {
			errors.push({ message: 'E-mail is invalid.', field: 'email' });
		}
		if (validator.isEmpty(password) || !validator.isLength(password, { min: 6 })) {
			errors.push({ message: 'Password too short.', field: 'password' });
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
	}
};
