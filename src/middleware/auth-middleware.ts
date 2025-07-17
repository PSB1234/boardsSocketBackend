import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from '@/lib/types.js';
import type { Server } from 'socket.io';

export default function Middleware(
	io: Server<
		ServerToClientEvents,
		ClientToServerEvents,
		InterServerEvents,
		SocketData
	>
) {
	io.use((socket, next) => {
		const username = socket.handshake.auth.username;
		if (!username) {
			return next(new Error('Username Invalid'));
		}
		socket.data.username = username;
		next();
	});
}
