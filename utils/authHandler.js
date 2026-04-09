let jwt = require('jsonwebtoken');
let userController = require('../controllers/users');

module.exports = {
  checkLogin: async function (req, res, next) {
    try {
      let tokens = [];
      let headerToken = req.headers.authorization;
      if (headerToken && headerToken.startsWith('Bearer ')) {
        tokens.push(headerToken.split(' ')[1]);
      }
      if (req.cookies.TOKEN_LOGIN) {
        tokens.push(req.cookies.TOKEN_LOGIN);
      }

      if (!tokens.length) {
        res.status(404).send('ban chua dang nhap');
        return;
      }

      let user = null;
      for (let token of tokens) {
        try {
          let result = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          user = await userController.FindUserById(result.id);
          if (user && !user.isDeleted && user.status !== false) {
            req.user = user;
            next();
            return;
          }
        } catch (error) {
          continue;
        }
      }

      res.status(404).send('ban chua dang nhap');
    } catch (error) {
      res.status(404).send('ban chua dang nhap');
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
