const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
	res.status(200).json({
		posts: [
			{
				_id: '753t1b76',
				title: 'Demo title',
				content: 'Demo',
				imageUrl: 'images/banner.jpg',
				creator: { name: 'Pappy' },
				createdAt: new Date()
			}
		]
	});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = new Error('Validation failed!');
		error.statusCode = 422;
		throw error;
	}

	const title = req.body.title;
	const content = req.body.content;
	const post = new Post({
		title: title,
		content: content,
		imageUrl: '/images/banner.jpg',
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
		.catch(err => next(err));
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
};
