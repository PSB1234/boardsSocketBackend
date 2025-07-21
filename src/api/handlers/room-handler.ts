import type { Server, Socket } from 'socket.io';

export default function roomHandlers(io: Server, socket: Socket) {
	socket.on('joinRoom', (roomId: string) => {
		socket.join(roomId);
		console.log(`User joined room: ${roomId}`);
	});

	socket.on('leaveRoom', (roomId: string) => {
		socket.leave(roomId);
		console.log(`User left room: ${roomId}`);
	});

	socket.on('findPlayersFromRoom', (roomId: string) => {
		const socketList = io.sockets.adapter.rooms.get(roomId);
		if (socketList) {
			const usernameList: string[] = Array.from(socketList).map((socketId) => {
				const socket = io.sockets.sockets.get(socketId);
				return socket?.data.username;
			});
			socket.emit('getPlayersFromRoom', usernameList);
		}
	});
}
