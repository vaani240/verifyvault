const multer = require('multer');

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

const fileFilter = (req, file, cb) => {
  try {
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error('Invalid file type. Only PDF, PNG, and JPG are allowed.'));
  } catch (error) {
    return cb(new Error('File validation failed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_BYTES) || 5 * 1024 * 1024,
  },
});

module.exports = upload;
