const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const socketService = require('../services/socket.service');

const listMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.query;
  const filter = conversationId ? { conversation: conversationId } : {};

  const messages = await Message.find(filter)
    .populate('sender', 'fullName email role')
    .populate('conversation')
    .sort('createdAt');

  res.json({
    success: true,
    data: messages,
  });
});

const createMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, type = 'text', attachments = [] } = req.body;

  if (!conversationId || !content) {
    throw new ApiError(400, 'conversationId and content are required');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    content,
    type,
    attachments,
  });

  conversation.lastMessage = content;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'fullName email role')
    .populate('conversation');

  socketService.emitToRoom(conversation._id, 'message:new', populatedMessage);

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

const getMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id)
    .populate('sender', 'fullName email role')
    .populate('conversation');

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  res.json({
    success: true,
    data: message,
  });
});

const updateMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  res.json({
    success: true,
    data: message,
  });
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully',
    data: null,
  });
});

module.exports = {
  listMessages,
  createMessage,
  getMessage,
  updateMessage,
  deleteMessage,
};
