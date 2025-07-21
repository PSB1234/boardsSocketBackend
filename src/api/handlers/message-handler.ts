import type { Server, Socket } from 'socket.io';
import type { ChatMessageSchema } from '@/lib/types.js';
export function messageHandlers(io: Server, socket: Socket) {
	socket.on('sendMessage', (roomId: string, messageData: ChatMessageSchema) => {
		io.to(roomId).emit('receiveMessage', messageData);
		console.log(`Message sent to room ${roomId}: ${messageData}`);
	});
}
