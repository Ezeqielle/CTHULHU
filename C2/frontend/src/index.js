import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Navigate,
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Route components
import BaseHome from './components/BaseHome';
import HomeDashboard from './components/HomeDashboard';
import Profile from './components/Profile';
import AccountsManagement from './components/AccountsManagement';
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Host from './components/Host';
import NotFound404 from './components/NotFound404';
import ScanCreation from './components/ScanCreation';
import ProjectCreation from './components/ProjectCreation';
import ProjectDashboard from './components/ProjectDashboard';
import AccountEdit from './components/AccountEdit';
import Scan from './components/Scan';
import Vulnerability from './components/Vulnerability';
import VulnerabilitiesList from './components/VulnerabilitiesList';
import AllProjects from './components/AllProjects';
import AllAgents from './components/AllAgents';
import Agent from './components/Agent';

import reportWebVitals from './reportWebVitals';

// CSS
import './index.css';
import './assets/bootstrap/css/bootstrap.min.css';
import './assets/fonts/fontawesome-all.min.css';
import './assets/fonts/font-awesome.min.css';
import './assets/fonts/fontawesome5-overrides.min.css';
console.log(process.env.REACT_APP_HOST_IP)


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="notfound"/>} />
          <Route path="/" element={<BaseHome childComponent={<HomeDashboard />} />} />
          <Route path="/profile" element={<BaseHome childComponent={<Profile />} />} />
          <Route path="/accountsmanagement" element={<BaseHome childComponent={<AccountsManagement />} />} />
          <Route path="/allagentsview" element={<BaseHome childComponent={<AllAgents />} />} />
          <Route path="/agentview/:agentid" element={<BaseHome childComponent={<Agent />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/forgotpassword" element={<ForgotPassword />} /> */}
          <Route path="/notfound" element={<NotFound404 />} />
          <Route path="/scancreation/:projectId" element={<BaseHome childComponent={<ScanCreation />} />} />
          <Route path="/projectcreation" element={<BaseHome childComponent={<ProjectCreation />} />} />
          <Route path="/projectdashboard/:projectId" element={<BaseHome childComponent={<ProjectDashboard />} />} />
          <Route path="/allprojects" element={<BaseHome childComponent={<AllProjects />} />} />
          <Route path="/accountedit/:searcheduser" element={<BaseHome childComponent={<AccountEdit />} />} />
          <Route path="/scan/:scanId" element={<BaseHome childComponent={<Scan />} />} />
          <Route path="/host/:hostId" element={<BaseHome childComponent={<Host />} />} />
          <Route path="/vulnerability/:portId/:cveId" element={<BaseHome childComponent={<Vulnerability />} />} />
          <Route path="/vulnerabilitiesList" element={<BaseHome childComponent={<VulnerabilitiesList />} />} />
        </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
