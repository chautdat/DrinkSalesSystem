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
      socket.emit('socket:connected', {
        socketId: socket.id
      });

      socket.on('ping', function (payload) {
        socket.emit('pong', payload || {
          ok: true
        });
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
  }
};
