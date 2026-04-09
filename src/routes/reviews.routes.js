const Review = require('../models/review.model');
const createCrudController = require('../controllers/crud.controller');
const createCrudRoutes = require('../utils/createCrudRoutes');

const crud = createCrudController(Review, {
  searchFields: ['comment'],
  populate: [
    { path: 'user', select: 'fullName email role' },
    { path: 'product', select: 'name price salePrice images' },
  ],
});

module.exports = createCrudRoutes(crud, {
  writeRoles: ['admin', 'staff', 'customer'],
});
