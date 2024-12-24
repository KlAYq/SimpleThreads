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
    // cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    cb(null, "uploaded_image.jpg")
  }
});

// Configure Multer
imageUploadConfig.upload = multer({
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
}).single("image");

// Upload cloudinary
imageUploadConfig.uploadResult = async (filename, transform) => {
  const results = await cloudinary.uploader
    .upload(filename)
    .catch((error) => {
      console.log(error);
    });

  return cloudinary.url(results.public_id, {transformation : transform});
}

module.exports = imageUploadConfig;
