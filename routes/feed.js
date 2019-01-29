const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/posts', feedController.getPosts);

router.post(
	'/post',
	[
		body('title')
			.trim()
			.isString()
			.isLength({ min: 5 }),
		body('content')
			.trim()
			.isString()
			.isLength({ min: 5 })
	],
	feedController.createPost
);

router.get('/post/:postId', feedController.getPost);

router.put(
	'/post/:postId',
	[
		body('title')
			.trim()
			.isString()
			.isLength({ min: 5 }),
		body('content')
			.trim()
			.isString()
			.isLength({ min: 5 })
	],
	feedController.updatePost
);

module.exports = router;
