import React from 'react'
import { useNavigate } from "react-router-dom"

const ChatBody = ({ messages, typingStatus, lastMessageRef, username, messageTo }) => {
    const navigate = useNavigate()

    return (
        <>
            <header className='chat__mainHeader'>
                <p>CTHULHU Support Chat</p>
            </header>


            <div className='message__container'>
                {messages.map(message => (
                    message.from === username ? (
                        <div className="message__chats" key={message.id}>
                            <p className='sender__name'>You</p>
                            <div className='message__sender'>
                                <p>{message.text}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="message__chats" key={message.id}>
                            <p>{message.from}</p>
                            <div className='message__recipient'>
                                <p>{message.text}</p>
                            </div>
                        </div>
                    )
                ))}

                <div className='message__status'>
                    <p>{typingStatus}</p>
                </div>
                <div ref={lastMessageRef} />
            </div>
        </>
    )
}

export default ChatBody