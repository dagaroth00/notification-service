import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import  verifyJWT  from '../middlewares/auth.js';

interface User {
  sub: string;
}

interface SocketError extends Error {
  data?: any;
}

export default async function setupSocket(io: Server) {
  // Redis adapter
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  io.engine.on('connection_error', (err) => {
    console.error(
      `WebSocket transport error`,
      JSON.stringify({
        code: err.code,
        message: err.message,
        context: err.context,
      })
    );
  });

  io.use(verifyJWT); // JWT middleware for WebSocket
  io.on('connection', (socket: Socket) => {
    console.info(
      `WebSocket client connected`,
      JSON.stringify({
        socketId: socket.id,
        remoteAddress: socket.handshake.address,
        query: socket.handshake.query,
      })
    );
    const userId: string = ((socket.data.user as User | undefined)?.sub) ?? socket.id;
    console.log(`User ${userId} connected`);

    socket.join(userId); // Join user's private room
    socket.join("21"); // Join user's private room
    socket.join("vipingera@hotmail.com"); // Join user's private room

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });

    socket.on('error', (err: SocketError) => {
      console.error(
        `WebSocket client error`,
        JSON.stringify({
          socketId: socket.id,
          remoteAddress: socket.handshake.address,
          message: err.message,
          data: err.data,
        })
      );
    });
  });
  return io;
}
