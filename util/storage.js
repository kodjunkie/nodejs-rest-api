const fs = require('fs');

const { throwError } = require('./error-handler');

exports.removeFile = filePath => {
	fs.unlink(filePath.substr(1), err => {
		if (err) {
			throwError(err.message, err.code);
		}
	});
};
