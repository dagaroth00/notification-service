import 'dotenv/config';
import express from "express";
import * as http from 'http';
import { Server } from "socket.io";
import cors from "cors";
import notificationRoutes from "./routes/notification.routes.js";
import setupSocket from "./sockets/socket.server.js";
import errorHandler from './middlewares/errorHandler.js';
import requestLogger from './middlewares/requestLogger.js';

const app = express();
app.use(cors());
app.use(express.json());
app.set('io', null);

// Request logging
app.use(requestLogger);

// REST APIs
app.use("/api/notifications", notificationRoutes);

// Error handler (should be after routes)
app.use(errorHandler);

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Initialize socket events

// setupSocket(io);
setupSocket(io).then((io) => {
  app.set('io', io);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
  });
});