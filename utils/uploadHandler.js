let multer = require('multer');
let path = require('path');

let storageSetting = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    let namefile = Date.now() + '-' + Math.round(Math.random() * 2E9) + ext;
    cb(null, namefile);
  }
});

let filterImage = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('file sai dinh dang'));
  }
};

module.exports = {
  uploadImage: multer({
    storage: storageSetting,
    limits: 5 * 1024 * 1024,
    fileFilter: filterImage
  })
};
