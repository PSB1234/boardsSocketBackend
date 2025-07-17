import type { Socket } from 'socket.io';

export default function errorHandler(socket: Socket) {
	socket.emit('connect_error');
}
