const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const Upload = require('../models/upload.model');

const createUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'File is required');
  }

  const upload = await Upload.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: path.posix.join('/', env.uploadDir, req.file.filename),
    uploadedBy: req.user?._id || null,
    resourceType: req.body.resourceType || 'general',
    resourceId: req.body.resourceId || null,
  });

  res.status(201).json({
    success: true,
    data: upload,
  });
});

const listUploads = asyncHandler(async (_req, res) => {
  const uploads = await Upload.find().sort('-createdAt');
  res.json({
    success: true,
    data: uploads,
  });
});

const getUpload = asyncHandler(async (req, res) => {
  const upload = await Upload.findById(req.params.id);
  if (!upload) {
    throw new ApiError(404, 'Upload not found');
  }

  res.json({
    success: true,
    data: upload,
  });
});

const deleteUpload = asyncHandler(async (req, res) => {
  const upload = await Upload.findByIdAndDelete(req.params.id);
  if (!upload) {
    throw new ApiError(404, 'Upload not found');
  }

  res.status(200).json({
    success: true,
    message: 'Upload deleted successfully',
    data: null,
  });
});

module.exports = {
  createUpload,
  listUploads,
  getUpload,
  deleteUpload,
};
