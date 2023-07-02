import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import '../assets/chat.css';
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import Session from 'react-session-api'
Session.config(true, 60)

const ChatPage = ({ socket }) => {
    const [messages, setMessages] = useState([])
    const [messagesToView, setMessagesToView] = useState([])
    const [users, setUsers] = useState([])
    const [typingStatus, setTypingStatus] = useState("")
    const [messageTo, setMessageTo] = useState("")
    const [chattingUser, setchattingUser] = useState("")

    const lastMessageRef = useRef(null);
    let navigate = useNavigate();
    useEffect(() => {

        if (Session.get("username") == undefined || Session.get("token") == undefined) {
            return navigate("/login");
        }
        socket.emit("newUser", { userName: Session.get("username"), socketID: socket.id })
    }, []);

    useEffect(() => {
        let messagesToView = []
        for (let message of messages) {
            console.log(`${message.to} === ${messageTo} || ${message.from} === ${messageTo}`)
            if (message.to === messageTo || message.from === messageTo) {
                messagesToView.push(message)
            }
        }
        setMessagesToView(messagesToView)
        setchattingUser(messageTo)
    }, [messageTo, messages])

    useEffect(() => {
        socket.on("newUserResponse", data => setUsers(data))
    }, [socket, users])

    useEffect(() => {
        socket.on("messageResponse", data => {
            console.log(data)
            //getSetMessagesToView([...messages, data])
            setMessages([...messages, data])

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
        <div className="chat">
            <div className='chat__sidebar'>
                <h2>{chattingUser !== ""? "Chatting with " + chattingUser: "Please select chat user"}</h2>
                <div>
                    <h4 className='chat__header'>ACTIVE USERS</h4>
                    <div className='chat__users'>
                        {
                            users.filter(user => {
                                if (user.userName !== Session.get("username")) {
                                    return user;
                                }
                            }).map(user =>
                                <Button key={user.socketID + user.userName} variant="light" onClick={() => setMessageTo(user.userName)}>{user.userName}</Button>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className='chat__main'>
                <ChatBody messages={messagesToView} typingStatus={typingStatus} lastMessageRef={lastMessageRef} username={Session.get("username")} />
                <ChatFooter socket={socket} username={Session.get("username")} messageTo={messageTo} isAdmin={"YES"}/>
            </div>
        </div>
    )
}

export default ChatPage