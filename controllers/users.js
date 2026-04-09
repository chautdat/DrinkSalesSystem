let userModel = require('../schemas/users');

module.exports = {
  CreateAnUser: async function (
    fullName,
    password,
    email,
    role,
    avatarUrl,
    status,
    loginCount,
    session
  ) {
    let newUser = new userModel({
      fullName: fullName,
      password: password,
      email: email.toLowerCase(),
      avatarUrl: avatarUrl,
      status: status,
      role: role,
      loginCount: loginCount
    });
    await newUser.save({ session });
    return newUser;
  },
  FindUserByEmail: async function (email) {
    return await userModel.findOne({
      email: email.toLowerCase(),
      isDeleted: false
    });
  },
  FindUserById: async function (id) {
    try {
      return await userModel.findOne({
        _id: id,
        isDeleted: false
      });
    } catch (error) {
      return false;
    }
  },
  FindUserByToken: async function (token) {
    return await userModel.findOne({
      forgotPasswordToken: token,
      isDeleted: false
    });
  }
};
