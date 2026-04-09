const Role = require('../models/role.model');
const createCrudController = require('../controllers/crud.controller');
const createCrudRoutes = require('../utils/createCrudRoutes');

const crud = createCrudController(Role, {
  searchFields: ['name', 'description'],
});

module.exports = createCrudRoutes(crud, {
  writeRoles: ['admin'],
});
