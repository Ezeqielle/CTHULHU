import React, { useEffect, useState, useRef } from 'react'
import { useParams } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import '../assets/chat.css';
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'

const ChatUserPage = ({ socket }) => {
    const [messages, setMessages] = useState([])
    const [typingStatus, setTypingStatus] = useState("")
    const [messageTo, setMessageTo] = useState("")

    const [show, setShow] = useState(true);

    const lastMessageRef = useRef(null);

    const { username } = useParams();

    useEffect(() => {
        socket.emit("newUser", { userName: username, socketID: socket.id })
    }, [])

    useEffect(() => {
        socket.on("messageResponse", data => {
            if ((data.isAdmin === "YES" && data.to === username) || data.from === username) {
                if (data.from !== username) {
                    setMessageTo(data.from)
                }
                setMessages([...messages, data])
            }
        })
    }, [socket, messages])

    useEffect(() => {
        socket.on("typingResponse", data => setTypingStatus(data))
    }, [socket])

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>CTHULHU Support chat</Modal.Title>
                </Modal.Header>
                <Modal.Body>Welcome! Please wait, a support agent will contact you shortly.</Modal.Body>
            </Modal>
            <div className="chat">
                <div className='chat__main'>
                    <ChatBody messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} username={username} />
                    <ChatFooter socket={socket} username={username} messageTo={messageTo} isAdmin={"NO"} />
                </div>
            </div>
        </>
    )
}

export default ChatUserPage