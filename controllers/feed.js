exports.getPosts = (req, res, next) => {
	res.status(200).json({ message: 'Success' });
};

exports.createPost = (req, res, next) => {
	const title = req.body.title;
	const content = req.body.content;
	// TODO: Persist post in db

	res.status(201).json({
		message: 'Post created successfully!',
		post: {
			_id: new Date().toISOString(),
			title: title,
			content: content
		}
	});
};
