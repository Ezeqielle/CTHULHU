import { Link } from "react-router-dom";
import { Speedometer, PersonFill, PeopleFill, PcDisplay, ChatDotsFill } from "react-bootstrap-icons";
import Session from 'react-session-api';
Session.config(true, 60)

const Navbar = () => (
  <nav className="navbar navbar-dark align-items-start sidebar sidebar-dark accordion bg-gradient-primary p-0">
    <div className="container-fluid d-flex flex-column p-0">
      <a
        className="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0"
        href="./src"
      >
        <div className="sidebar-brand-icon rotate-n-15">
          <i className="fas fa-laugh-wink"></i>
        </div>
        <div className="sidebar-brand-text mx-3">
          <span>Admin CTHULHU</span>
        </div>
      </a>
      <ul className="navbar-nav text-light" id="accordionSidebar">
        <li className="nav-item">
          <Link to={"/accountedit/" + Session.get("username")} className="nav-link">
            <PersonFill />
            <span> Profile</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/accountsmanagement" className="nav-link">
            <PeopleFill />
            <span> Accounts</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/allagentsview" className="nav-link">
            <PcDisplay />
            <span> All Agents</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/chat" className="nav-link">
            <ChatDotsFill />
            <span> Chat</span>
          </Link>
        </li>
      </ul>
      <div className="text-center d-none d-md-inline">
        <button
          className="btn rounded-circle border-0"
          id="sidebarToggle"
          type="button"
        ></button>
      </div>
    </div>
  </nav>
)

export default Navbar;