const multer = require('multer');
const CloudinaryStorage = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

const uploadProductImages = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB per file, max 5 files
}).array('images', 5);

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');

// Wrap multer in a promise to handle errors cleanly in async controllers
const handleUpload = (uploadFn) => (req, res) =>
  new Promise((resolve, reject) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        reject(new AppError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

module.exports = { uploadProductImages, uploadAvatar, handleUpload };
