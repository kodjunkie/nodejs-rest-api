const fs = require('fs');

exports.removeFile = filePath => {
	fs.unlink(filePath.substr(1), err => {
		if (err) {
			console.log(err.message, err.code);
		}
	});
};
