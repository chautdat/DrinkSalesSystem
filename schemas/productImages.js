let mongoose = require('mongoose');

let productImageSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'product',
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('productImage', productImageSchema);
