import { io } from "socket.io-client";

export const initSocket = async () => {
	const option = {
		forceNew: true,
		reconnectionAttempts: Infinity,
		timeout: 10000,
		transports: ["websocket", "polling"],
	};

	const isDev = process.env.NODE_ENV === "development";

	let baseUrl;

	if (isDev) {
		baseUrl = "http://localhost:5000";
	} else {
		// ✅ Use environment variable in production
		baseUrl = process.env.REACT_APP_BACKEND_URL;
	}

	return io(baseUrl, option);
};