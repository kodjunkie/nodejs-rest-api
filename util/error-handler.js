exports.throwError = (message, status) => {
	const error = new Error(message);
	if (status) {
		error.statusCode = status;
	}
	throw error;
};

exports.handleError = (error, next, status) => {
	if (status) {
		error.statusCode = status;
	}
	next(error);
};
