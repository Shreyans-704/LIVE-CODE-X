import React, { useState } from "react";
import { v4 as uuid} from "uuid"
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./Home.css"

function Home() {
    const[roomid, setRoomid] = useState("");
    const[username, setUsername] = useState("");
    const navigate = useNavigate();

    const generateRoomId = (e) => {
        e.preventDefault();
        setRoomid(uuid());
        toast.success("Room ID generated")
    }

    const joinRoom = () => {
        if(!roomid || !username){
            toast.error("Both the fields are required!")
            return;
        }

        navigate(`/editor/${roomid}`, {
            state: {username},
        })
        toast.success("Room Joined!")
    }

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo Section */}
                <div className="logo-section">
                    <img 
                        src="/images/logo.svg" 
                        alt="LIVECODEX" 
                        className="logo"
                    />
                </div>

                {/* Title Section */}
                <div className="title-section">
                    <h1 className="app-title">LIVECODEX</h1>
                    <p className="app-subtitle">Real-time Collaborative Code Editor</p>
                </div>

                {/* Form Section */}
                <form className="login-form" onSubmit={(e) => { e.preventDefault(); joinRoom(); }}>
                    <div className="form-group">
                        <label htmlFor="roomid" className="form-label">Room ID</label>
                        <input 
                            id="roomid"
                            value={roomid}
                            onChange={(e) => setRoomid(e.target.value)}
                            type="text"
                            className="form-input"
                            placeholder="Enter room ID"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            className="form-input"
                            placeholder="Enter your username"
                        />
                    </div>

                    <button type="submit" className="join-button">
                        Join Room
                    </button>
                </form>

                {/* Divider */}
                <div className="divider">or</div>

                {/* Create Room Section */}
                <div className="create-room-section">
                    <p className="create-text">
                        Don't have a room ID?
                    </p>
                    <button 
                        type="button"
                        className="create-button"
                        onClick={generateRoomId}
                    >
                        Create New Room
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;
