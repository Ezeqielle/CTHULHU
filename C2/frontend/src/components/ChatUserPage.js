import React, { useEffect, useState, useRef} from 'react'
import { useParams } from "react-router-dom";
import '../assets/chat.css';
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'

const ChatUserPage = ({socket}) => { 
  const [messages, setMessages] = useState([])
  const [typingStatus, setTypingStatus] = useState("")
  const [messageTo, setMessageTo] = useState("")

  const lastMessageRef = useRef(null);

  const { username } = useParams();
    
  useEffect(()=> {
    socket.emit("newUser", {userName: username, socketID: socket.id})
  }, [])

  useEffect(()=> {
    socket.on("messageResponse", data => {
        if ((data.isAdmin === "YES" && data.to === username) || data.from === username){
            if (data.from !== username){
                setMessageTo(data.from)
            }
            setMessages([...messages, data])
        }
    })
  }, [socket, messages])

  useEffect(()=> {
    socket.on("typingResponse", data => setTypingStatus(data))
  }, [socket])

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  return (
    <div className="chat">
      <div className='chat__main'>
        <ChatBody messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} username={username}/>
        <ChatFooter socket={socket} username={username} messageTo={messageTo} isAdmin={"NO"}/>
      </div>
    </div>
  )
}

export default ChatUserPage