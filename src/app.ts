import 'dotenv/config';
import express from "express";
import * as http from 'http';
import { Server } from "socket.io";
import cors from "cors";
import notificationRoutes from "./routes/notification.routes.js";
import setupSocket from "./sockets/socket.server.js";

const app = express();
app.use(cors());
app.use(express.json());
app.set('io', null);

// REST APIs
app.use("/api/notifications", notificationRoutes);

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