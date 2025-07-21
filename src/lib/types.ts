export interface ServerToClientEvents {
	receiveMessage: (messageData: ChatMessageSchema) => void;
	getPlayersFromRoom: (usernameList: string[]) => void;
}
export interface ClientToServerEvents {
	sendMessage: (roomId: string, messageData: ChatMessageSchema) => void;
	joinRoom: (roomId: string) => void;
	leaveRoom: (roomId: string) => void;
	findPlayersFromRoom: (roomId: string) => void;
}
export interface InterServerEvents {}
export interface SocketData {
	username: string;
}
export interface ChatMessageSchema {
	username: string;
	message: string;
}
