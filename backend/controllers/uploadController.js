const asyncHandler = require('express-async-handler');
const { uploadProductImages, uploadAvatar, handleUpload } = require('../middlewares/uploadMiddleware');

const uploadImages = asyncHandler(async (req, res) => {
  await handleUpload(uploadProductImages)(req, res);
  const images = req.files.map((f) => ({ public_id: f.filename, url: f.path }));
  res.status(200).json({ success: true, images });
});

const uploadUserAvatar = asyncHandler(async (req, res) => {
  await handleUpload(uploadAvatar)(req, res);
  res.status(200).json({
    success: true,
    avatar: { public_id: req.file.filename, url: req.file.path },
  });
});

module.exports = { uploadImages, uploadUserAvatar };
