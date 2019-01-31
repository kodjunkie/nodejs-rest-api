const express = require('express');

const feedController = require('../controllers/feed');
const postValidator = require('../middlewares/validators/post');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/posts', isAuth, feedController.getPosts);

router.post('/post', isAuth, postValidator, feedController.createPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId', isAuth, postValidator, feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;
