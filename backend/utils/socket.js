import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Register user and join rooms
    socket.on('register', ({ userId, role }) => {
      if (userId) {
        socket.userId = userId;
        socket.role = role;
        
        // Join specific user room
        socket.join(`user:${userId}`);
        
        // Join specific role room
        if (role) {
          socket.join(`role:${role}`);
        }
        
        console.log(`Socket ${socket.id} registered to user:${userId} and role:${role}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Emit real-time notification to a specific user
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit real-time notification to a specific user role (citizen, field_worker, admin)
 */
export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

/**
 * Broadcast real-time notification/announcement to all users
 */
export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
