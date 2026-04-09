let mongoose = require('mongoose');

let itemOrderSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'product'
    },
    title: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      min: 1
    },
    price: {
      type: Number,
      min: 0
    },
    subtotal: {
      type: Number,
      min: 0
    }
  },
  {
    _id: false
  }
);

let orderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      required: true
    },
    shippingName: {
      type: String,
      default: ''
    },
    shippingPhone: {
      type: String,
      default: ''
    },
    shippingAddress: {
      type: String,
      default: ''
    },
    items: {
      type: [itemOrderSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Shipping', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'BANKING', 'WALLET'],
      default: 'COD'
    },
    paymentMethodId: {
      type: mongoose.Types.ObjectId,
      ref: 'paymentMethod',
      default: null
    },
    subtotal: {
      type: Number,
      min: 0,
      default: 0
    },
    shippingFee: {
      type: Number,
      min: 0,
      default: 0
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      min: 0,
      default: 0
    },
    note: {
      type: String,
      default: ''
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

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'OD-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('order', orderSchema);
