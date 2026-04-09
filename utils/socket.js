let socketServer = null;

module.exports = {
  initSocket: function (server) {
    if (socketServer) {
      return socketServer;
    }

    let io = require('socket.io')(server, {
      cors: {
        origin: process.env.CLIENT_URL || '*',
        credentials: true
      }
    });

    io.on('connection', function (socket) {
      socket.on('join', function (roomId) {
        socket.join(String(roomId));
      });

      socket.on('leave', function (roomId) {
        socket.leave(String(roomId));
      });
    });

    socketServer = io;
    return io;
  },
  getIO: function () {
    return socketServer;
  },
  emit: function (eventName, payload) {
    if (socketServer) {
      socketServer.emit(eventName, payload);
    }
  },
  emitToRoom: function (roomId, eventName, payload) {
    if (socketServer) {
      socketServer.to(String(roomId)).emit(eventName, payload);
    }
  }
};
