import 'dotenv/config';
import { Socket } from "socket.io";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

interface SocketError extends Error {
  data?: any;
}

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid as string, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export default function verifyJWT(socket: Socket, next: (err?: SocketError) => void) {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
  
  if (!token) {
    const err = new Error("Authentication error: Token missing") as SocketError;
    err.data = { type: "UnauthorizedError" };
    return next(err);
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.COGNITO_APP_CLIENT_ID,
      issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        const error = new Error("Authentication error: Invalid token") as SocketError;
        error.data = { type: "UnauthorizedError" };
        return next(error);
      }

      socket.data.user = decoded;
      next();
    }
  );
}
