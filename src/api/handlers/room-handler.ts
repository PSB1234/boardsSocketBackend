import type { Socket } from 'socket.io';

export default function roomHandlers(socket: Socket) {
	socket.on('joinRoom', (roomId: string) => {
		socket.join(roomId);
		console.log(`User joined room: ${roomId}`);
	});

	socket.on('leaveRoom', (roomId: string) => {
		socket.leave(roomId);
		console.log(`User left room: ${roomId}`);
	});
}
