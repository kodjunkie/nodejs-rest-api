const fs = require('fs');
const path = require('path');

exports.removeFile = filePath => {
	const rootDir = path.dirname(process.mainModule.filename);
	fs.unlink(path.join(rootDir, filePath.substr(1)), err => {
		if (err) {
			console.log(err.message, err.code);
		}
	});
};
