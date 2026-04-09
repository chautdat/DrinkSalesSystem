let jwt = require('jsonwebtoken');
let userModel = require('../schemas/users');

module.exports = {
  checkLogin: async function (req, res, next) {
    try {
      let headerToken = String(req.headers.authorization || '');
      let token = '';
      if (headerToken.startsWith('Bearer ')) {
        token = headerToken.slice(7);
      } else if (req.cookies.TOKEN_LOGIN) {
        token = req.cookies.TOKEN_LOGIN;
      }

      if (!token) {
        res.status(401).send('ban chua dang nhap');
        return;
      }

      let payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      let user = await userModel.findOne({
        _id: payload.id,
        isDeleted: false
      });

      if (!user || user.status === false) {
        res.status(401).send('ban chua dang nhap');
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).send('ban chua dang nhap');
    }
  },
  checkRole: function (...requiredRole) {
    return function (req, res, next) {
      let currentRole = String(req.user.role || '').toLowerCase();
      let roles = requiredRole.map(function (role) {
        return String(role || '').toLowerCase();
      });
      if (roles.includes(currentRole)) {
        next();
      } else {
        res.status(403).send('ban khong co quyen');
      }
    };
  }
};
