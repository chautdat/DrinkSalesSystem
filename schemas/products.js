let mongoose = require('mongoose');
let slugify = require('slugify');

let productSchema = mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      unique: true
    },
    slug: {
      type: String
    },
    price: {
      type: Number,
      min: 0,
      default: 0
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    description: {
      type: String,
      default: '',
      maxLength: 999
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'category',
      required: true
    },
    images: {
      type: [String],
      default: [
        'https://placeimg.com/640/480/any'
      ]
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

productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true
    });
  }
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  let update = this.getUpdate() || {};
  let payload = update.$set || update;
  if (payload.title) {
    let slug = slugify(payload.title, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true
    });
    if (update.$set) {
      update.$set.slug = slug;
    } else {
      update.slug = slug;
    }
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('product', productSchema);
