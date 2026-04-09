const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const messageController = require('../controllers/message.controller');

const router = express.Router();

router.get('/', authenticate, messageController.listMessages);
router.post('/', authenticate, authorize('admin', 'staff', 'customer'), messageController.createMessage);
router.get('/:id', authenticate, messageController.getMessage);
router.patch('/:id', authenticate, authorize('admin', 'staff'), messageController.updateMessage);
router.delete('/:id', authenticate, authorize('admin', 'staff'), messageController.deleteMessage);

module.exports = router;
