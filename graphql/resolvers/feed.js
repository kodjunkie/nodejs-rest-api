const validator = require('validator');

const User = require('../../models/user');
const Post = require('../../models/post');
const { removeFile } = require('../../util/storage');
const { throwError } = require('../../util/error-handler');

module.exports = {
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
			imageUrl: '/' + postInput.imageUrl,
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
	},

	getPosts: async function(args, req) {
		if (!req.isAuth) {
			return throwError('Not Authenticated!', 401);
		}

		const page = +args.page || 1;
		const perPage = 2;
		const totalItems = await Post.find().countDocuments();
		const posts = await Post.find()
			.populate('creator')
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			.select('-updatedAt');

		if (!posts) {
			return throwError('No post found!', 404);
		}

		return {
			posts: posts.map(post => {
				return { ...post._doc, createdAt: post.createdAt.toISOString(), _id: post._id.toString() };
			}),
			totalItems: totalItems
		};
	},

	getPost: async function({ postId }, req) {
		if (!req.isAuth) {
			return throwError('Not Authenticated!', 401);
		}

		const post = await Post.findById(postId).populate('creator');
		if (!post) {
			return throwError('No post found!', 404);
		}

		return { ...post._doc, createdAt: post.createdAt.toISOString() };
	},

	updatePost: async function({ id, postInput }, req) {
		if (!req.isAuth) {
			return throwError('Not Authenticated!', 401);
		}

		const post = await Post.findById(id).populate('creator');
		if (!post) {
			return throwError('No post found!', 404);
		}
		if (post.creator._id.toString() !== req.userId) {
			return throwError("You're not authorized!", 403);
		}

		const errors = [];
		if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
			errors.push({ message: 'Title is invalid.' });
		}
		if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
			errors.push({ message: 'Content is invalid.' });
		}
		if (errors.length > 0) {
			return throwError('Invalid input', 422, errors);
		}

		post.title = postInput.title;
		post.content = postInput.content;
		if (postInput.imageUrl !== 'undefined') {
			post.imageUrl = '/' + postInput.imageUrl;
		}
		const updatedPost = await post.save();

		return {
			...updatedPost._doc,
			createdAt: updatedPost.createdAt.toISOString(),
			_id: updatedPost._id.toString()
		};
	},

	deletePost: async function({ id }, req) {
		if (!req.isAuth) {
			return throwError('Not Authenticated!', 401);
		}

		const post = await Post.findById(id);
		if (!post) {
			return throwError('No post found!', 404);
		}

		if (post.creator.toString() !== req.userId) {
			return throwError("You're not authorized!", 403);
		}

		try {
			removeFile(post.imageUrl);

			await Post.findByIdAndDelete(id);
			const user = await User.findById(req.userId);
			user.posts.pull(id);
			await user.save();

			return true;
		} catch (err) {
			return false;
		}
	},

	user: async function(args, req) {
		if (!req.isAuth) {
			return throwError('Not Authenticated!', 401);
		}
		const user = await User.findById(req.userId);
		if (!user) {
			return throwError('Invalid user.', 401);
		}

		return {
			...user._doc,
			_id: user._id.toString(),
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString()
		};
	},

	updateStatus: async function({ status }, req) {
		if (!req.isAuth) {
			return throwError('Not Authenticated!', 401);
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return throwError('Invalid user.', 401);
		}

		user.status = status;
		await user.save();

		return {
			...user._doc,
			_id: user._id.toString(),
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString()
		};
	}
};
