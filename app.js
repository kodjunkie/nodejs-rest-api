const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const graphqlHttp = require('express-graphql');

const { errorHandler, throwError } = require('./util/error-handler');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolver');
const multer = require('./middlewares/multer');
const auth = require('./middlewares/auth');
const storage = require('./util/storage');

const app = express();

app.use(bodyParser.json());
app.use(multer.single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
	if (!req.isAuth) {
		return throwError('Not Authenticated!', 401);
	}
	if (!req.file) {
		return throwError('No file provided!', 200);
	}
	if (req.body.oldPath) {
		storage.removeFile(req.body.oldPath);
	}
	return res.status(201).json({ path: req.file.path });
});

app.use(
	'/graphql',
	graphqlHttp({
		schema: graphqlSchema,
		rootValue: graphqlResolver,
		graphiql: true,
		formatError(err) {
			console.log(err);

			if (!err.originalError) {
				return err;
			}
			const data = err.originalError.data;
			const code = err.originalError.statusCode || 500;
			const message = err.message || 'An error occurred!';

			return { message: message, status: code, data: data };
		}
	})
);

app.use(errorHandler);

mongoose
	.connect('mongodb://127.0.0.1:27017/messenger', { useNewUrlParser: true })
	.then(() => {
		app.listen(8080);
	})
	.catch(error => console.error(error));
