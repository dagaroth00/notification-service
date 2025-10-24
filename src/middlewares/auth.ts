import 'dotenv/config';
import { Socket } from "socket.io";
import { verifyToken } from './jwtVerifier.js';

interface SocketError extends Error {
  data?: any;
}

export default function verifyJWT(socket: Socket, next: (err?: SocketError) => void) {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

  if (!token) {
    const err = new Error("Authentication error: Token missing") as SocketError;
    err.data = { type: "UnauthorizedError" };
    return next(err);
  }

  verifyToken(token as string)
    .then((decoded) => {
      socket.data.user = decoded;
      next();
    })
    .catch((err) => {
      console.error("JWT verification failed:", err.message || err);
      const error = new Error("Authentication error: Invalid token") as SocketError;
      error.data = { type: "UnauthorizedError" };
      return next(error);
    });
}
