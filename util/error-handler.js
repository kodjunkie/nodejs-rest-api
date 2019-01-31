exports.throwError = (message, statusCode = 500, data = null) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	if (data) {
		error.data = data;
	}
	throw error;
};

exports.catchError = (error, next, statusCode = 500) => {
	error.statusCode = statusCode;
	next(error);
};

exports.errorHandler = (error, req, res, next) => {
	if (error) {
		console.log(error);

		let resObj = { message: error.message };
		if (error.data) {
			resObj = { message: error.message, data: error.data };
		}

		return res.status(error.statusCode || 500).json(resObj);
	}
	next();
};
