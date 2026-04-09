var express = require('express');
var router = express.Router();
let { uploadImage } = require('../utils/uploadHandler');
let path = require('path');
let uploadModel = require('../schemas/uploads');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.post('/one_file', checkLogin, checkRole('admin', 'staff'), uploadImage.single('file'), async function (req, res, next) {
  let newUpload = new uploadModel({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    uploadedBy: req.user._id,
    resourceType: req.body.resourceType || 'general',
    resourceId: req.body.resourceId || null
  });
  await newUpload.save();
  res.send(newUpload);
});

router.post('/multiple_file', checkLogin, checkRole('admin', 'staff'), uploadImage.array('files', 5), async function (req, res, next) {
  let uploads = [];
  for (const f of req.files) {
    let doc = new uploadModel({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path,
      uploadedBy: req.user._id,
      resourceType: req.body.resourceType || 'general',
      resourceId: req.body.resourceId || null
    });
    await doc.save();
    uploads.push(doc);
  }
  res.send(uploads);
});

router.get('/:filename', function (req, res, next) {
  let pathFile = path.join(__dirname, '../uploads', req.params.filename);
  res.sendFile(pathFile);
});

module.exports = router;
