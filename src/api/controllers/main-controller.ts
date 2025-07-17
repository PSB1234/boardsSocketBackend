import type {
	ServerToClientEvents,
	ClientToServerEvents,
	InterServerEvents,
	SocketData,
} from '@/lib/types.js';
import type { Server, Socket } from 'socket.io';

export function mainControllers(
	io: Server<
		ServerToClientEvents,
		ClientToServerEvents,
		InterServerEvents,
		SocketData
	>
) {
	io.on(
		'connection',
		(socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
			console.log('a user connected');

			socket.on('disconnect', () => {
				console.log('user disconnected');
			});
		}
	);
}
