exports.throwError = (message, statusCode = 500, data = null) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	if (data) {
		error.data = data;
	}
	throw error;
};

exports.catchError = (error, next, statusCode = 500) => {
	if (!error.statusCode) {
		error.statusCode = statusCode;
	}
	next(error);
};

exports.errorHandler = (error, req, res, next) => {
	if (error) {
		let resObj = { message: error.message };
		if (error.data) {
			resObj = { message: error.message, data: error.data };
		}

		return res.status(error.statusCode).json(resObj);
	}
	next();
};
