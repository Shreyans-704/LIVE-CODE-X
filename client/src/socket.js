import { io } from "socket.io-client";

export const initSocket = async () => {
	const option = {
		forceNew: true,
		reconnectionAttempts: Infinity,
		timeout: 10000,
		transports: ["websocket", "polling"],
		withCredentials: true,
		reconnection: true,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000,
	};

	const isDev = process.env.NODE_ENV === "development";

	let baseUrl;

	if (isDev) {
		baseUrl = "http://localhost:5000";
	} else {
		baseUrl = process.env.REACT_APP_BACKEND_URL;
		
		// Ensure proper URL format
		if (!baseUrl) {
			console.error("REACT_APP_BACKEND_URL is not set!");
			throw new Error("Backend URL not configured");
		}
		
		// Remove trailing slash if present
		baseUrl = baseUrl.replace(/\/$/, '');
	}

	console.log("Connecting to socket at:", baseUrl);
	return io(baseUrl, option);
};