exports.throwError = (message, code = 500) => {
	const error = new Error(message);
	error.statusCode = code;
	throw error;
};

exports.handleError = (error, next, code = 500) => {
	error.statusCode = code;
	next(error);
};
