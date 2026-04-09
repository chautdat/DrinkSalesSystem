const mongoose = require('mongoose');
let bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    phone: {
      type: String,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: 'https://i.sstatic.net/l60Hf.png'
    },
    status: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer'
    },
    loginCount: {
      type: Number,
      default: 0,
      min: [0, 'Login count cannot be negative']
    },
    lockTime: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExp: Date
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', function () {
  if (this.isModified('password')) {
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
});

userSchema.pre('findOneAndUpdate', function () {
  let salt = bcrypt.genSaltSync(10);
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(this._update.password, salt);
  }
  if (this._update.$set && this._update.$set.password) {
    this._update.$set.password = bcrypt.hashSync(this._update.$set.password, salt);
  }
});

userSchema.set('toJSON', {
  transform: function (_doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('user', userSchema);
