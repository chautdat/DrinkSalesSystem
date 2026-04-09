const mongoose = require('mongoose');
const slugify = require('slugify');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roleSchema.pre('save', function roleSlug(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

roleSchema.pre('findOneAndUpdate', function roleSlugOnUpdate(next) {
  const update = this.getUpdate() || {};
  const payload = update.$set || update;

  if (payload.name) {
    const slug = slugify(payload.name, { lower: true, strict: true });
    if (update.$set) {
      update.$set.slug = slug;
    } else {
      update.slug = slug;
    }
    this.setUpdate(update);
  }

  next();
});

module.exports = mongoose.model('Role', roleSchema);
