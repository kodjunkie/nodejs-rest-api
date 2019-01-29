exports.throwError = (message, statusCode = 500) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	throw error;
};

exports.catchError = (error, next, statusCode = 500) => {
	error.statusCode = statusCode;
	next(error);
};

exports.errorHandler = (error, req, res, next) => {
	if (error) {
		const message = error.message;
		console.log(error);
		return res.status(error.statusCode || 500).json({ message: message });
	}
	next();
};
