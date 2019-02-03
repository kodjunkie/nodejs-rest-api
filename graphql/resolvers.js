const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = {
	signup: async function({ userInput }, req) {
		const name = userInput.name;
		const email = userInput.email;
		const password = userInput.password;

		try {
			const existingUser = await User.findOne({ email: email });

			if (existingUser) {
				throw new Error('User already exists!');
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
		} catch (err) {
			console.log(err);
		}
	}
};
