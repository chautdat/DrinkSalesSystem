let socketServer = null;

function joinRoom(socket, roomId) {
  if (roomId === undefined || roomId === null) {
    return;
  }
  socket.join(String(roomId));
}

function leaveRoom(socket, roomId) {
  if (roomId === undefined || roomId === null) {
    return;
  }
  socket.leave(String(roomId));
}

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

      let joinEvents = ['join', 'user:join', 'conversation:join', 'room:join'];
      let leaveEvents = ['leave', 'user:leave', 'conversation:leave', 'room:leave'];

      joinEvents.forEach(function (eventName) {
        socket.on(eventName, function (roomId) {
          joinRoom(socket, roomId);
        });
      });

      leaveEvents.forEach(function (eventName) {
        socket.on(eventName, function (roomId) {
          leaveRoom(socket, roomId);
        });
      });

      socket.on('chat:typing', function (payload) {
        let roomId = payload && (payload.roomId || payload.conversationId || payload.to);
        if (!roomId) {
          return;
        }
        socket.to(String(roomId)).emit('chat:typing', payload);
      });

      socket.on('message:typing', function (payload) {
        let roomId = payload && (payload.roomId || payload.conversationId || payload.to);
        if (!roomId) {
          return;
        }
        socket.to(String(roomId)).emit('message:typing', payload);
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
  },
  emitToRoom: function (roomId, eventName, payload) {
    if (socketServer) {
      socketServer.to(String(roomId)).emit(eventName, payload);
    }
  }
};
