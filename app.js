const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
	if (error) {
		const message = error.message;
		console.log(message);
		return res.status(error.statusCode || 500).json({ message: message });
	}
	next();
});

mongoose
	.connect(
		'mongodb://127.0.0.1:27017/messenger',
		{ useNewUrlParser: true }
	)
	.then(() => {
		app.listen(8080);
	})
	.catch(error => console.error(error));
