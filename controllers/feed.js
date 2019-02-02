const { removeFile } = require('../util/storage');

const { validationResult } = require('express-validator/check');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');
const Err = require('../util/error-handler');

exports.getPosts = async (req, res, next) => {
	const page = +req.query.page || 1;
	const perPage = 2;
	try {
		const totalItems = await Post.find().countDocuments();
		const posts = await Post.find()
			.populate('creator')
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			.select('-updatedAt');

		res.status(200).json({ posts: posts, totalItems: totalItems });
	} catch (err) {
		Err.catchError(err, next);
	}
};

exports.createPost = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return Err.throwError('Validation failed!', 442);
	}

	const title = req.body.title;
	const content = req.body.content;
	const post = new Post({
		title: title,
		content: content,
		imageUrl: '/' + req.file.path,
		creator: req.userId
	});
	try {
		await post.save();
		const user = await User.findById(req.userId);
		user.posts.push(post);
		await user.save();

		io.getIO().emit('posts', { action: 'create', post: { ...post._doc, creator: user._doc } });

		res.status(201).json({
			message: 'Post created successfully.',
			post: post,
			creator: {
				_id: user._id.toString(),
				name: user.name
			}
		});
	} catch (err) {
		Err.catchError(err, next);
	}
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then(post => {
			if (!post) {
				return Err.throwError('Post not found!', 404);
			}
			res.status(200).json({ post });
		})
		.catch(err => Err.catchError(err, next));
};

exports.updatePost = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return Err.throwError('Validation failed!', 442);
	}

	const postId = req.params.postId;
	const inputs = req.body;
	let imageUrl = inputs.image;

	if (req.file) {
		imageUrl = '/' + req.file.path;
	}

	if (!imageUrl) {
		return Err.throwError('No file picked!', 422);
	}

	Post.findById(postId)
		.populate('creator')
		.then(post => {
			if (!post) {
				return Err.throwError('Post not found!', 404);
			}
			if (post.creator._id.toString() !== req.userId) {
				return Err.throwError('Not authorized!', 403);
			}
			post.title = inputs.title;
			post.content = inputs.content;
			if (post.imageUrl !== imageUrl) {
				removeFile(post.imageUrl);
			}
			post.imageUrl = imageUrl;

			return post.save();
		})
		.then(post => {
			io.getIO().emit('posts', { action: 'update', post: post });
			res.status(200).json({ post });
		})
		.catch(err => Err.catchError(err, next));
};

exports.deletePost = async (req, res, next) => {
	const postId = req.params.postId;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			return Err.throwError('Post not found!', 404);
		}
		if (post.creator.toString() !== req.userId) {
			return Err.throwError('Not authorized!', 403);
		}
		removeFile(post.imageUrl);
		await Post.findByIdAndDelete(post._id);
		const user = await User.findById(req.userId);

		user.posts.pull(postId);
		await user.save();

		io.getIO.emit('posts', { action: 'delete', post: postId });

		res.status(200).json({ message: 'Post deleted.' });
	} catch (err) {
		Err.catchError(err, next);
	}
};
