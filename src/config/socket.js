const { Server } = require('socket.io');
const env = require('./env');
const socketService = require('../services/socket.service');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  socketService.setIO(io);

  io.on('connection', (socket) => {
    socket.on('conversation:join', (conversationId) => {
      socket.join(String(conversationId));
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(String(conversationId));
    });

    socket.on('chat:typing', (payload) => {
      if (payload?.conversationId) {
        socket.to(String(payload.conversationId)).emit('chat:typing', payload);
      }
    });
  });

  return io;
}

module.exports = initSocket;
