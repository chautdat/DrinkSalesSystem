const Voucher = require('../models/voucher.model');
const createCrudController = require('../controllers/crud.controller');
const createCrudRoutes = require('../utils/createCrudRoutes');

const crud = createCrudController(Voucher, {
  searchFields: ['code', 'title'],
});

module.exports = createCrudRoutes(crud, {
  writeRoles: ['admin', 'staff'],
});
