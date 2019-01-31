const jwt = require('jsonwebtoken');

const Err = require('../util/error-handler');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		return Err.throwError('Not Authenticated.', 401);
	}
	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, 'secret');
	} catch (error) {
		return Err.catchError(error, next);
	}
	if (!decodedToken) {
		return Err.throwError('Not Authenticated!', 401);
	}
	req.userId = decodedToken.userId;
	next();
};
