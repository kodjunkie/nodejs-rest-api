const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const { throwError } = require('../util/error-handler');
const User = require('../models/user');
const Post = require('../models/post');

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
	},

	createPost: async function({ postInput }, req) {
		if (!req.isAuth) {
			throwError('Not Authenticated', 401);
		}

		const errors = [];
		if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
			errors.push({ message: 'Title is invalid.' });
		}
		if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
			errors.push({ message: 'Content is invalid.' });
		}
		if (errors.length > 0) {
			throwError('Invalid input', 422, errors);
		}

		const user = await User.findById(req.userId);
		if (!user) {
			throwError('Invalid user.', 401);
		}

		const post = new Post({
			title: postInput.title,
			content: postInput.content,
			imageUrl: postInput.imageUrl,
			creator: user._id
		});
		const createdPost = await post.save();
		user.posts.push(createdPost._id);
		await user.save();

		return {
			...createdPost._doc,
			_id: createdPost._id.toString(),
			createdAt: createdPost.createdAt.toISOString(),
			updatedAt: createdPost.updatedAt.toISOString(),
			creator: user._doc
		};
	}
};
