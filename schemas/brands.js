let mongoose = require('mongoose');
let slugify = require('slugify');

let brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    slug: {
      type: String
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: 'https://placeimg.com/640/480/tech'
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

brandSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true
    });
  }
  next();
});

brandSchema.pre('findOneAndUpdate', function (next) {
  let update = this.getUpdate() || {};
  let payload = update.$set || update;
  if (payload.name) {
    let slug = slugify(payload.name, {
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

module.exports = mongoose.model('brand', brandSchema);
