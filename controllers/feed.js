const { validationResult } = require('express-validator/check');

const Post = require('../models/post');
const Err = require('../util/error-handler');

exports.getPosts = (req, res, next) => {
	Post.find()
		.select('-updatedAt')
		.then(posts => {
			res.status(200).json({ posts: posts });
		})
		.catch(err => Err.catchError(err, next));
};

exports.createPost = (req, res, next) => {
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
		creator: {
			name: 'Pappy'
		}
	});
	post
		.save()
		.then(post => {
			res.status(201).json({
				message: 'Post created successfully!',
				post: post
			});
		})
		.catch(err => Err.catchError(err, next));
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
