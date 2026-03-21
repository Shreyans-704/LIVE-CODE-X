require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:3000';

const server = http.createServer(app);
const io = new Server(
	server,
	{
		cors: {
			origin: clientOrigin,
			methods: ["GET", "POST"],
		},
	}
);

if (!isProduction) {
	app.use(cors({ origin: clientOrigin }));
} else {
	app.use(cors({ origin: clientOrigin, credentials: true }));
}
app.use(express.json());

const userSocketMap = {};
// {
//     "fowewefbiueb" : "vidur",
//     "uwdgyfgw" : "vidur"
// }

const getAllConnectedClients = (roomid) => {
	return Array.from(io.sockets.adapter.rooms.get(roomid) || []).map(
		(socketId) => {
			return {
				socketId,
				username: userSocketMap[socketId],
			};
		}
	);
};

io.on('connection', (socket) => {
	// console.log(`User connected: ${socket.id}`);

	socket.on('join', ({ roomid, username }) => {
		userSocketMap[socket.id] = username;
		socket.join(roomid);
		const clients = getAllConnectedClients(roomid);
		// notify to all user that new user joined
		clients.forEach(({ socketId }) => {
			io.to(socketId).emit('joined', {
				clients,
				username,
				socketId: socket.id,
			});
		});
	});

	socket.on('code-change', ({ roomid, code }) => {
		socket.in(roomid).emit('code-change', {
			code,
		});
	});

	socket.on('sync-code', ({ socketId, code }) => {
		io.to(socketId).emit('code-change', { code });
	});

	socket.on('disconnecting', () => {
		const rooms = [...socket.rooms];
		rooms.forEach((roomid) => {
			socket.in(roomid).emit('disconnected', {
				socketId: socket.id,
				username: userSocketMap[socket.id],
			});
		});
		delete userSocketMap[socket.id];
	});
});

// Code execution function
const executeCode = (code, language) => {
	const tempDir = os.tmpdir();
	const timestamp = Date.now();
	
	let fileName, command, interpreter;
	
	switch(language) {
		case 'python3':
			fileName = `script_${timestamp}.py`;
			interpreter = process.platform === 'win32' ? 'python' : 'python3';
			break;
		case 'nodejs':
			fileName = `script_${timestamp}.js`;
			interpreter = 'node';
			break;
		case 'bash':
			fileName = `script_${timestamp}.sh`;
			interpreter = 'bash';
			break;
		case 'java':
			fileName = `Main_${timestamp}.java`;
			interpreter = 'java';
			break;
		case 'cpp':
			fileName = `program_${timestamp}.cpp`;
			interpreter = 'g++';
			break;
		case 'c':
			fileName = `program_${timestamp}.c`;
			interpreter = 'gcc';
			break;
		case 'ruby':
			fileName = `script_${timestamp}.rb`;
			interpreter = 'ruby';
			break;
		default:
			const supportedLanguages = ['python3', 'javascript', 'cpp', 'c', 'java', 'ruby', 'nodejs', 'bash'];
			throw new Error(`Language '${language}' is not supported. Supported languages: ${supportedLanguages.join(', ')}`);
	}
	
	const filePath = path.join(tempDir, fileName);
	
	try {
		// Write code to temporary file
		fs.writeFileSync(filePath, code);
		
		let output;
		
		// Execute based on language
		if (language === 'python3') {
			output = execSync(`${interpreter} "${filePath}"`, { 
				encoding: 'utf-8',
				maxBuffer: 1024 * 1024 * 10,
				timeout: 10000,
				stdio: 'pipe'
			});
		} else if (language === 'nodejs') {
			output = execSync(`${interpreter} "${filePath}"`, { 
				encoding: 'utf-8',
				maxBuffer: 1024 * 1024 * 10,
				timeout: 10000,
				stdio: 'pipe'
			});
		} else if (language === 'bash') {
			output = execSync(`${interpreter} "${filePath}"`, { 
				encoding: 'utf-8',
				maxBuffer: 1024 * 1024 * 10,
				timeout: 10000
			});
		} else if (language === 'java') {
			const className = `Main_${timestamp}`;
			const javaFile = path.join(tempDir, `${className}.java`);
			fs.writeFileSync(javaFile, code.replace(/public class \w+/, `public class ${className}`));
			execSync(`javac "${javaFile}"`, { timeout: 10000 });
			output = execSync(`java -cp "${tempDir}" ${className}`, { 
				encoding: 'utf-8',
				timeout: 10000
			});
		} else if (language === 'cpp') {
			const exePath = path.join(tempDir, `program_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`);
			execSync(`g++ -o "${exePath}" "${filePath}"`, { timeout: 10000 });
			output = execSync(`"${exePath}"`, { 
				encoding: 'utf-8',
				timeout: 10000
			});
		} else if (language === 'c') {
			const exePath = path.join(tempDir, `program_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`);
			execSync(`gcc -o "${exePath}" "${filePath}"`, { timeout: 10000 });
			output = execSync(`"${exePath}"`, { 
				encoding: 'utf-8',
				timeout: 10000
			});
		} else if (language === 'ruby') {
			output = execSync(`${interpreter} "${filePath}"`, { 
				encoding: 'utf-8',
				timeout: 10000
			});
		}
		
		// Cleanup
		try { fs.unlinkSync(filePath); } catch (e) {}
		
		return output || '';
	} catch (error) {
		// Cleanup on error
		try { fs.unlinkSync(filePath); } catch (e) {}
		throw error;
	}
};

// API routes
app.post('/compile', async (req, res) => {
	try {
		const { code, language } = req.body || {};
		if (!code || !language) {
			return res.status(400).json({ error: 'code and language required' });
		}
		
		const output = executeCode(code, language);
		return res.json({ output: output || '(No output)' });
	} catch (error) {
		let errorMessage = error.message || 'Failed to execute code';
		
		// Provide user-friendly error messages
		if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
			errorMessage = `Interpreter not found. Make sure ${(error.message.match(/python3|node|g\+\+|gcc|java|ruby|bash/) || ['your language'])[0]} is installed on the server.`;
		} else if (errorMessage.includes('TIMEOUT')) {
			errorMessage = 'Code execution timeout (max 10 seconds)';
		}
		
		console.error('Execution error:', error.message);
		return res.status(500).json({ error: errorMessage, success: false });
	}
});

// Serve React build if in production OR build exists
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
const hasClientBuild = fs.existsSync(path.join(clientBuildPath, 'index.html'));

if (isProduction || hasClientBuild) {
	app.use(express.static(clientBuildPath));
	// Use a RegExp to avoid path-to-regexp star parsing issues in Express 5
	// Exclude Socket.IO and API endpoints from SPA fallback
	app.get(/^\/(?!socket\.io|compile)(.*)$/i, (req, res) => {
		res.sendFile(path.join(clientBuildPath, 'index.html'));
	});
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`NODE_ENV=${process.env.NODE_ENV || ''} | isProduction=${isProduction} | serveStatic=${isProduction || hasClientBuild}`);
	console.log(`Static path: ${clientBuildPath} | exists=${hasClientBuild}`);
});