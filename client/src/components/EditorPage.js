import React, { useEffect, useState, useRef } from 'react'
import Client from './Client'
import Editor from './Editor'
import './EditorPage.css'
import { initSocket } from '../socket'
import { useNavigate, useLocation, useParams, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from "axios";

const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

const LANGUAGES = [
    "python3",
    "java",
    "cpp",
    "nodejs",
    "c",
    "ruby",
    "go",
    "scala",
    "bash",
    "sql",
    "pascal",
    "csharp",
    "php",
    "swift",
    "rust",
    "r",
];

function EditorPage() {
    const [clients, setClients] = useState([])
    const codeRef = useRef("");
    const [socket, setSocket] = useState(null);

    const [output, setOutput] = useState("");
    const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("python3");

    const location = useLocation();
    const navigate = useNavigate();
    const {roomid} = useParams();
    
    const socketRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            setSocket(socketRef.current);
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));
            
            const handleErrors = (e) => {
                console.log("Socket Error: ", e);
                toast.error("Socket connection failed");
                navigate("/");
            }
            
            socketRef.current.emit('join', {
                roomid,
                username: location.state?.username,
            })

            socketRef.current.on('joined', ({clients, username, socketId}) => {
                setClients(clients);
                // Only existing users should push their current code to the newcomer
                if (username !== location.state?.username) {
                    toast.success(`${username} joined`)
                    socketRef.current.emit('sync-code', {
                        code: codeRef.current,
                        socketId,
                    })
                }
            })

            //disconnected
            socketRef.current.on('disconnected', ({socketId, username}) => {
                toast.error(`${username} left`)
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId)
                })
            })
        }

        init();

        return () => {
            socketRef.current && socketRef.current?.disconnect();
            socketRef.current?.off('joined');
            socketRef.current?.off('disconnected');
            setSocket(null);
        }

    }, [location.state?.username, navigate, roomid])

    if(!location.state){
        return <Navigate to="/" />
    }

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomid);
            toast.success("Room ID copied to clipboard")
        } catch (error) {
            console.log(error)
            toast.error("Unable to copy Room ID")
        }
    }

    const leaveRoom = () => {
        navigate("/");
    }

    // new
    const runCode = async () => {
        setIsCompiling(true);
        try {
            const response = await axios.post(`${API_BASE}/compile`, 
            {
                code: codeRef.current,
                language: selectedLanguage,
            });
            console.log("Backend response:", response.data);
            setOutput(response.data.output || JSON.stringify(response.data));
        } catch (error) {
            console.error("Error compiling code:", error);
            setOutput(error.response?.data?.error || "An error occurred");
        } finally {
            setIsCompiling(false);
        }
    };

    const toggleCompileWindow = () => {
        setIsCompileWindowOpen(!isCompileWindowOpen);
    };

    return (
    <div className='editor-container'>
        <div className='editor-wrapper'>
            {/* Sidebar */}
            <div className='editor-sidebar'>
                {/* Logo Section */}
                <div className='sidebar-logo-section'>
                    <img 
                        src="/images/logo-neon.svg" 
                        alt="LIVECODEX" 
                        className='sidebar-logo'
                    />
                </div>
                
                {/* Divider */}
                <div className='sidebar-divider'></div>

                {/* Clients List */}
                <div className='clients-list'>
                    <div className='clients-header'>Connected Users</div>
                    {clients.map((client) => (
                        <Client key={client.socketId} username={client.username} />
                    ))}
                </div>

                {/* Action Buttons */}
                <div className='sidebar-actions'>
                    <button onClick={copyRoomId} className='action-button action-primary'>
                        ✓ Copy Room ID
                    </button>
                    <button onClick={leaveRoom} className='action-button action-danger'>
                        ✕ Leave Room
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className='editor-main'>
                {/* Header with Language Selector */}
                <div className="editor-header">
                    <select
                        className="language-select"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Code Editor */}
                <div className='editor-content'>
                    <Editor 
                        socket={socket}
                        roomid={roomid}
                        onCodeChange= {(code) => (codeRef.current = code)}
                    />
                </div>

                {/* Compiler Button */}
                <button
                    className="compiler-toggle"
                    onClick={toggleCompileWindow}
                >
                    {isCompileWindowOpen ? "✕ Close Compiler" : "▶ Open Compiler"}
                </button>

                {/* Compiler Output */}
                <div
                    className={`compiler-panel ${isCompileWindowOpen ? "open" : "closed"}`}
                >
                    <div className="compiler-header">
                        <h5 className="compiler-title">Output ({selectedLanguage})</h5>
                        <div className="compiler-controls">
                            <button
                                className="compiler-button compiler-run"
                                onClick={runCode}
                                disabled={isCompiling}
                            >
                                {isCompiling ? "⏳ Compiling..." : "▶ Run Code"}
                            </button>
                            <button 
                                className="compiler-button compiler-close" 
                                onClick={toggleCompileWindow}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <pre className="compiler-output">
                        {output || "Output will appear here..."}
                    </pre>
                </div>
            </div>
        </div>
    </div>
    )
}

export default EditorPage