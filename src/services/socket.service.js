let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

function emit(eventName, payload) {
  if (ioInstance) {
    ioInstance.emit(eventName, payload);
  }
}

function emitToRoom(roomId, eventName, payload) {
  if (ioInstance) {
    ioInstance.to(String(roomId)).emit(eventName, payload);
  }
}

module.exports = {
  setIO,
  getIO,
  emit,
  emitToRoom,
};
