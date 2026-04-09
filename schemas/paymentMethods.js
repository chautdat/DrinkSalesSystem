let mongoose = require('mongoose');

let paymentMethodSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
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

paymentMethodSchema.pre('save', function (next) {
  if (this.isModified('code')) {
    this.code = String(this.code || '').trim().toUpperCase();
  }
  if (this.isModified('name')) {
    this.name = String(this.name || '').trim();
  }
  next();
});

paymentMethodSchema.pre('findOneAndUpdate', function (next) {
  let update = this.getUpdate() || {};
  let payload = update.$set || update;

  if (payload.code) {
    payload.code = String(payload.code).trim().toUpperCase();
  }
  if (payload.name) {
    payload.name = String(payload.name).trim();
  }

  if (update.$set) {
    update.$set = payload;
  } else {
    update = payload;
  }

  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('paymentMethod', paymentMethodSchema);
