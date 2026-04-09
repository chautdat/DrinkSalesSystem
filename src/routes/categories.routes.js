const Category = require('../models/category.model');
const createCrudController = require('../controllers/crud.controller');
const createCrudRoutes = require('../utils/createCrudRoutes');

const crud = createCrudController(Category, {
  searchFields: ['name', 'description'],
});

module.exports = createCrudRoutes(crud, {
  writeRoles: ['admin', 'staff'],
});
