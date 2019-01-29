exports.throwError = (message, statusCode = 500) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	throw error;
};

exports.catchError = (error, next, statusCode = 500) => {
	error.statusCode = statusCode;
	next(error);
};
