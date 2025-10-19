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

  // io.use(verifyJWT); // JWT middleware for WebSocket
  io.on('connection', (socket: Socket) => {
    const userId: string = ((socket.data.user as User | undefined)?.sub) ?? socket.id;
    console.log(`User ${userId} connected`);

    socket.join(userId); // Join user's private room

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });
}
