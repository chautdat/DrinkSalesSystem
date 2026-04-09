let mongoose = require('mongoose');
let slugify = require('slugify');

let categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, 'name khong duoc trung'],
      required: true
    },
    slug: {
      type: String
    },
    image: {
      type: String,
      default: 'https://placeimg.com/640/480/tech'
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

categorySchema.pre('save', function (next) {
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

categorySchema.pre('findOneAndUpdate', function (next) {
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

module.exports = mongoose.model('category', categorySchema);
