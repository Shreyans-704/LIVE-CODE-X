import React from 'react';
import Avatar from 'react-avatar';

function Client({username}) {
    return (
        <div className="client-item">
            <Avatar 
                name={username.toString()} 
                size={40}
                round="10px" 
                className="client-avatar"
            />
            <span className='client-name'>{username.toString()}</span>
        </div>
    );
}

export default Client;