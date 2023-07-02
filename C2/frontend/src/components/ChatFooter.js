import React, { useState } from 'react'

const ChatFooter = ({ socket, username, messageTo, isAdmin}) => {
    const [message, setMessage] = useState("")
    const handleTyping = () => socket.emit("typing", `${username} is typing`)

    const handleSendMessage = (e) => {
        e.preventDefault()
        socket.emit("message",
            {
                text: message.trim(),
                from: username,
                to: messageTo,
                id: `${socket.id}${Math.random()}`,
                socketID: socket.id,
                isAdmin: isAdmin

            }
        )
        setMessage("")
    }
    return (
        <div className='chat__footer'>
            <form className='form' onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder='Write message'
                    className='message'
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleTyping}
                />
                <button className="sendBtn">SEND</button>
            </form>
        </div>
    )
}

export default ChatFooter