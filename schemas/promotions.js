let mongoose = require('mongoose');

let promotionSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    discount: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    applyFor: {
      type: String,
      default: 'Tất cả'
    },
    expireDate: {
      type: Date,
      default: null
    },
    usageCount: {
      type: Number,
      default: 0
    },
    maxUsage: {
      type: Number,
      default: 0
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

promotionSchema.pre('save', function (next) {
  if (this.isModified('code')) {
    this.code = String(this.code || '').trim().toUpperCase();
  }
  if (this.isModified('applyFor')) {
    this.applyFor = String(this.applyFor || '').trim() || 'Tất cả';
  }
  next();
});

promotionSchema.pre('findOneAndUpdate', function (next) {
  let update = this.getUpdate() || {};
  let payload = update.$set || update;

  if (payload.code) {
    payload.code = String(payload.code).trim().toUpperCase();
  }
  if (payload.applyFor !== undefined) {
    payload.applyFor = String(payload.applyFor || '').trim() || 'Tất cả';
  }

  if (update.$set) {
    update.$set = payload;
  } else {
    update = payload;
  }

  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('promotion', promotionSchema);
