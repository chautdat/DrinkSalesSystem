const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('admin', 'staff'),
  upload.single('file'),
  uploadController.createUpload
);

router.get('/', authenticate, authorize('admin', 'staff'), uploadController.listUploads);
router.get('/:id', authenticate, authorize('admin', 'staff'), uploadController.getUpload);
router.delete('/:id', authenticate, authorize('admin'), uploadController.deleteUpload);

module.exports = router;
