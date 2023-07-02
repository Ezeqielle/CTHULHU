import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Navigate,
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import socketIO from "socket.io-client";
import { SERVER_PORT, SERVER_IP } from './utils/config';

// Route components
import BaseHome from './components/BaseHome';
import HomeDashboard from './components/HomeDashboard';
import AccountsManagement from './components/AccountsManagement';
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import NotFound404 from './components/NotFound404';
import AccountEdit from './components/AccountEdit';
import AllAgents from './components/AllAgents';
import Agent from './components/Agent';
import ChatPage from './components/ChatPage';
import ChatUserPage from './components/ChatUserPage';
import UserPay from './components/UserPay';

import reportWebVitals from './reportWebVitals';

// CSS
import './index.css';
import './assets/bootstrap/css/bootstrap.min.css';
import './assets/fonts/fontawesome-all.min.css';
import './assets/fonts/font-awesome.min.css';
import './assets/fonts/fontawesome5-overrides.min.css';

const socket = socketIO.connect("https://"+ SERVER_IP +":" + SERVER_PORT);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="notfound"/>} />
          <Route path="/" element={<BaseHome childComponent={<HomeDashboard />} />} />
          <Route path="/accountsmanagement" element={<BaseHome childComponent={<AccountsManagement />} />} />
          <Route path="/accountedit/:searcheduser" element={<BaseHome childComponent={<AccountEdit />} />} />
          <Route path="/allagentsview" element={<BaseHome childComponent={<AllAgents />} />} />
          <Route path="/agentview/:agentid" element={<BaseHome childComponent={<Agent />} />} />
          <Route path="/chat" element={<BaseHome childComponent={<ChatPage socket={socket} />} />} />
          <Route path="/chatuser/:username" element={<ChatUserPage socket={socket} />} />
          <Route path="/userpay/:agenttag" element={<UserPay />} />
          <Route path="/login" element={<Login socket={socket} />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<BaseHome childComponent={<Register />} />} />
          <Route path="/notfound" element={<NotFound404 />} />
        </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
