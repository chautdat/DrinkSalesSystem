const Product = require('../models/product.model');
const createCrudController = require('../controllers/crud.controller');
const createCrudRoutes = require('../utils/createCrudRoutes');

const crud = createCrudController(Product, {
  searchFields: ['name', 'description', 'sku'],
  populate: [
    { path: 'category', select: 'name slug' },
    { path: 'createdBy', select: 'fullName email role' },
  ],
});

module.exports = createCrudRoutes(crud, {
  writeRoles: ['admin', 'staff'],
});
