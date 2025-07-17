export interface ServerToClientEvents {
	message: (msg: string) => void;
	// noArg: () => void;
	// basicEmit: (a: number, b: string, c: Buffer) => void;
	// withAck: (d: string, callback: (e: number) => void) => void;
}
export interface ClientToServerEvents {
	sendMessage: (msg: string) => void;
	joinRoom: (roomId: string) => void;
	leaveRoom: (roomId: string) => void;
}
export interface InterServerEvents {}
export interface SocketData {
	username: string;
}
