const multer = require('multer');

const fileStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'images');
	},
	filename: function(req, file, cb) {
		cb(null, new Date().toISOString() + '-' + file.originalname);
	}
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/gif'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

module.exports = multer({ storage: fileStorage, fileFilter: fileFilter });
