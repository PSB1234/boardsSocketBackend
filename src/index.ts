import { Server as SocketIOServer } from 'socket.io';
import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from '@/lib/types.js';
import express from 'express';
import http from 'http';
import { mainControllers } from '@/api/controllers/main-controller.js';
import Middleware from '@/middleware/auth-middleware.js';

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;

const io = new SocketIOServer<
	ServerToClientEvents,
	ClientToServerEvents,
	InterServerEvents,
	SocketData
>(server, {
	cors: {
		origin: 'http://localhost:3000',
	},
});
Middleware(io);
mainControllers(io);

server.listen(port, () => {
	console.log('listening on *:8080');
});
