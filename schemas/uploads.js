let mongoose = require('mongoose');

let uploadSchema = mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      default: null
    },
    resourceType: {
      type: String,
      default: 'general'
    },
    resourceId: {
      type: mongoose.Types.ObjectId,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('upload', uploadSchema);
