const Conversation = require('../models/conversation.model');
const createCrudController = require('../controllers/crud.controller');
const createCrudRoutes = require('../utils/createCrudRoutes');

const crud = createCrudController(Conversation, {
  searchFields: ['title', 'lastMessage'],
  populate: [
    { path: 'participants', select: 'fullName email role' },
    { path: 'lastMessageBy', select: 'fullName email role' },
  ],
});

module.exports = createCrudRoutes(crud, {
  writeRoles: ['admin', 'staff', 'customer'],
  readAuth: true,
});
