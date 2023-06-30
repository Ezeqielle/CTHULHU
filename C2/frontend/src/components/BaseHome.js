import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const BaseHome = ({ childComponent }) => {
    const [inputText, setInputText] = useState("");
    let inputHandler = (e) => {
        //convert input text to lower case
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
    };

    function getData(e) {
        e.preventDefault();
        console.log(inputText);
        console.log('Le lien a été cliqué.');
    }

    return (
        <div id="wrapper">
            <Navbar />
            <div className="d-flex flex-column" id="content-wrapper">
                <div id="content">
                    <nav className="navbar navbar-light navbar-expand bg-white shadow mb-4 topbar static-top">
                        <div className="container-fluid">
                            <button
                                className="btn btn-link d-md-none rounded-circle me-3"
                                id="sidebarToggleTop"
                                type="button"
                            >
                                <i className="fas fa-bars"></i>
                            </button>
                            <form className="d-none d-sm-inline-block me-auto ms-md-3 my-2 my-md-0 mw-100 navbar-search" onSubmit={getData}>
                                <div className="input-group">
                                    <input
                                        className="bg-light form-control border-0 small"
                                        type="text"
                                        onChange={inputHandler}

                                        placeholder="Search for ..."
                                    />
                                    <button className="btn btn-primary py-0" onClick={getData} type="button">
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            </form>
                            <ul className="navbar-nav flex-nowrap ms-auto">
                                <li className="nav-item dropdown d-sm-none no-arrow">
                                    <a
                                        className="dropdown-toggle nav-link"
                                        aria-expanded="false"
                                        data-bs-toggle="dropdown"
                                        href="#"
                                    >
                                        <i className="fas fa-search"></i>
                                    </a>
                                    <div
                                        className="dropdown-menu dropdown-menu-end p-3 animated--grow-in"
                                        aria-labelledby="searchDropdown"
                                    >
                                        <form className="me-auto navbar-search w-100">
                                            <div className="input-group">
                                                <input
                                                    className="bg-light form-control border-0 small"
                                                    type="text"
                                                    placeholder="Search for ..."
                                                />
                                                <div className="input-group-append">
                                                    <button className="btn btn-primary py-0" type="button">
                                                        <i className="fas fa-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </li>
                                <li className="nav-item dropdown no-arrow mx-1">
                                    <div className="nav-item dropdown no-arrow">
                                        <a
                                            className="dropdown-toggle nav-link"
                                            aria-expanded="false"
                                            data-bs-toggle="dropdown"
                                            href="#"
                                        >
                                            <span className="badge bg-danger badge-counter">3+</span>
                                            <i className="fas fa-bell fa-fw"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end dropdown-list animated--grow-in">
                                            <h6 className="dropdown-header">alerts center</h6>
                                            <a
                                                className="dropdown-item d-flex align-items-center"
                                                href="#"
                                            >
                                                <div className="me-3">
                                                    <div className="bg-primary icon-circle">
                                                        <i className="fas fa-file-alt text-white"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="small text-gray-500">
                                                        December 12, 2019
                                                    </span>
                                                    <p>A new monthly report is ready to download!</p>
                                                </div>
                                            </a>
                                            <a
                                                className="dropdown-item d-flex align-items-center"
                                                href="#"
                                            >
                                                <div className="me-3">
                                                    <div className="bg-success icon-circle">
                                                        <i className="fas fa-donate text-white"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="small text-gray-500">
                                                        December 7, 2019
                                                    </span>
                                                    <p>$290.29 has been deposited into your account!</p>
                                                </div>
                                            </a>
                                            <a
                                                className="dropdown-item d-flex align-items-center"
                                                href="#"
                                            >
                                                <div className="me-3">
                                                    <div className="bg-warning icon-circle">
                                                        <i className="fas fa-exclamation-triangle text-white"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="small text-gray-500">
                                                        December 2, 2019
                                                    </span>
                                                    <p>
                                                        Spending Alert: We've noticed unusually high spending
                                                        for your account.
                                                    </p>
                                                </div>
                                            </a>
                                            <a
                                                className="dropdown-item text-center small text-gray-500"
                                                href="#"
                                            >
                                                Show All Alerts
                                            </a>
                                        </div>
                                    </div>
                                </li>
                                <li className="nav-item dropdown no-arrow mx-1">
                                    <div
                                        className="shadow dropdown-list dropdown-menu dropdown-menu-end"
                                        aria-labelledby="alertsDropdown"
                                    ></div>
                                </li>
                                <div className="d-none d-sm-block topbar-divider"></div>
                                <li className="nav-item dropdown no-arrow">
                                    <div className="nav-item dropdown no-arrow">
                                        <Link
                                            to="/logout"
                                            className="dropdown-toggle nav-link"
                                            aria-expanded="false"
                                            data-bs-toggle="dropdown"
                                            href="#"
                                        >
                                            <span className="d-none d-lg-inline me-2 text-gray-600 small">
                                                logout
                                            </span>
                                        </Link>
                                        <div className="dropdown-menu shadow dropdown-menu-end animated--grow-in">
                                            <a className="dropdown-item" href="#">
                                                <i className="fas fa-user fa-sm fa-fw me-2 text-gray-400"></i>
                                                &nbsp;Profile
                                            </a>
                                            <a className="dropdown-item" href="#">
                                                <i className="fas fa-cogs fa-sm fa-fw me-2 text-gray-400"></i>
                                                &nbsp;Settings
                                            </a>
                                            <a className="dropdown-item" href="#">
                                                <i className="fas fa-list fa-sm fa-fw me-2 text-gray-400"></i>
                                                &nbsp;Activity log
                                            </a>
                                            <div className="dropdown-divider"></div>
                                            <a className="dropdown-item" href="#">
                                                <i className="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400"></i>
                                                &nbsp;Logout
                                            </a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    {childComponent}
                </div>
                <Footer />
            </div>
            <a className="border rounded d-inline scroll-to-top" href="#page-top">
                <i className="fas fa-angle-up"></i>
            </a>
        </div>
    )
};

export default BaseHome;