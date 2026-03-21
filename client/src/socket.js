import {io} from "socket.io-client";

export const initSocket = async () => {
	const option = {
		forceNew: true,
		reconnectionAttempts: Infinity,
		timeout: 10000,
		transports: ['websocket', 'polling'],
	};

	const isDev = process.env.NODE_ENV === 'development';
	let baseUrl;
	
	if (isDev) {
		baseUrl = 'http://localhost:5000';
	} else if (typeof window !== 'undefined') {
		// In production, use the same origin as the client
		baseUrl = window.location.origin;
	} else {
		// Fallback for SSR or server environments
		baseUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
	}
	
	return io(baseUrl, option);
}