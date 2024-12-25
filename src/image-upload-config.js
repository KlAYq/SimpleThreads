const imageUploadConfig = {}
const multer = require("multer");
const path = require("path");
const cloudinary = require('cloudinary').v2;

const maxSize = 5 * 1000 * 1000; // 5MB
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error: File upload only supports the following filetypes - " + filetypes);
  }
}).array("images", 10); // Accept up to 10 images

const uploadResult = async (filePaths, transform) => {
  const uploadPromises = filePaths.map(async (filePath) => {
    const result = await cloudinary.uploader.upload(filePath, {
      transformation: transform,
    });
    return cloudinary.url(result.public_id, { transformation: transform });
  });

  return Promise.all(uploadPromises);
};

module.exports = {
  upload,
  uploadResult,
};