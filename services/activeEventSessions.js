const activeEventSockets = new Map();

const getActiveEventKey = (userId, eventId) => `${userId}:${eventId}`;

const addActiveEventSocket = (userId, eventId, socketId) => {
  const key = getActiveEventKey(userId, eventId);

  if (!activeEventSockets.has(key)) {
    activeEventSockets.set(key, new Set());
  }

  activeEventSockets.get(key).add(socketId);
};

const removeActiveEventSocket = (userId, eventId, socketId) => {
  const key = getActiveEventKey(userId, eventId);
  const sockets = activeEventSockets.get(key);

  if (!sockets) return false;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    activeEventSockets.delete(key);
    return true;
  }

  return false;
};

const hasActiveEventSession = (userId, eventId) => {
  const sockets = activeEventSockets.get(getActiveEventKey(userId, eventId));
  return Boolean(sockets?.size);
};

module.exports = {
  addActiveEventSocket,
  hasActiveEventSession,
  removeActiveEventSocket,
};
