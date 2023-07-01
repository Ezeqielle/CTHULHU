import { getFetch } from '../utils/functions';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Session from 'react-session-api'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ['Critical', 'High', 'Medium', 'Low', 'Info'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const HomeDashboard = () => {

  let navigate = useNavigate();
  
  useEffect(() => {

    if (Session.get("username") == undefined || Session.get("token") == undefined) {
      return navigate("/login");
    }

  }, []);

  return (
    <div className="container-fluid">
      <div className="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark mb-0">Dashboard</h3>
      </div>
      <div className="row">
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card shadow border-start-primary py-2">
            <div className="card-body">
              <div className="row align-items-center no-gutters">
                <div className="col me-2">
                  <div className="text-uppercase text-primary fw-bold text-xs mb-1">
                    <span>Host</span>
                  </div>
                  <div className="text-dark fw-bold h5 mb-0">
                    <span>35</span>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-rss fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card shadow border-start-success py-2">
            <div className="card-body">
              <div className="row align-items-center no-gutters">
                <div className="col me-2">
                  <div className="text-uppercase text-success fw-bold text-xs mb-1">
                    <span style={{ color: "var(--bs-blue)" }}>SCANS</span>
                  </div>
                  <div className="text-dark fw-bold h5 mb-0">
                    <span>12</span>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-desktop fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card shadow border-start-info py-2">
            <div className="card-body">
              <div className="row align-items-center no-gutters">
                <div className="col me-2">
                  <div className="text-uppercase text-info fw-bold text-xs mb-1">
                    <span style={{ color: "var(--bs-green)" }}>
                      Vulnerabilities
                    </span>
                  </div>
                  <div className="row g-0 align-items-center">
                    <div className="col-auto">
                      <div className="text-dark fw-bold h5 mb-0 me-3">
                        <span>50</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-4">
          <div className="card shadow border-start-warning py-2">
            <div className="card-body">
              <div className="row align-items-center no-gutters">
                <div className="col me-2">
                  <div className="text-uppercase text-warning fw-bold text-xs mb-1">
                    <span style={{ color: "var(--bs-red)" }}>
                      high vulnerabilities
                    </span>
                    <div className="row g-0 align-items-center">
                      <div className="col-auto">
                        <div className="text-dark fw-bold h5 mb-0 me-3">
                          <span>50</span>
                        </div>
                      </div>
                      <div
                        className="col"
                        style={{ color: "var(--bs-pink)" }}
                      >
                        <div
                          className="progress progress-sm"
                          style={{
                            color: "var(--bs-red)",
                            borderColor: "var(--bs-red)",
                          }}
                        >
                          <div
                            className="progress-bar bg-danger"
                            aria-valuenow="50"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            style={{ width: "50%" }}
                          >
                            <span className="visually-hidden">50%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-exclamation-triangle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-7 col-xl-8">
          <div className="card shadow mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="text-primary fw-bold m-0">Completed scans</h6>
              <div className="dropdown no-arrow">
                <button
                  className="btn btn-link btn-sm dropdown-toggle"
                  aria-expanded="false"
                  data-bs-toggle="dropdown"
                  type="button"
                >
                  <i className="fas fa-ellipsis-v text-gray-400"></i>
                </button>
                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                  <p className="text-center dropdown-header">
                    dropdown header:
                  </p>
                  <a className="dropdown-item" href="./src">
                    &nbsp;Action
                  </a>
                  <a className="dropdown-item" href="./src">
                    &nbsp;Another action
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="./src">
                    &nbsp;Something else here
                  </a>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Scan</th>
                    <th>Host</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>first scan</td>
                    <td>127.0.0.1</td>
                    <td>agressive</td>
                    <td>24/03/2021</td>
                    <td>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icon-tabler-external-link"
                        data-bs-toggle="tooltip"
                        data-bss-tooltip=""
                        data-bs-placement="bottom"
                        style={{
                          color: "var(--bs-blue)",
                          fontSize: "20px",
                        }}
                        title="Details"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5"></path>
                        <line x1="10" y1="14" x2="20" y2="4"></line>
                        <polyline points="15 4 20 4 20 9"></polyline>
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="text-primary fw-bold m-0">
                Vulnerabilitie repartition
              </h6>
              <div className="dropdown no-arrow">
                <button
                  className="btn btn-link btn-sm dropdown-toggle"
                  aria-expanded="false"
                  data-bs-toggle="dropdown"
                  type="button"
                >
                  <i className="fas fa-ellipsis-v text-gray-400"></i>
                </button>
                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                  <p className="text-center dropdown-header">
                    dropdown header:
                  </p>
                  <a className="dropdown-item" href="./src">
                    &nbsp;Action
                  </a>
                  <a className="dropdown-item" href="./src">
                    &nbsp;Another action
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="./src">
                    &nbsp;Something else here
                  </a>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div>
                <Pie data={data} />
              </div>
              <div className="text-center small mt-4">
                <span className="me-2">
                  <i
                    className="fas fa-circle"
                    style={{ color: "#252525" }}
                  ></i>
                  &nbsp;Critical
                </span>
                <span className="me-2">
                  <i
                    className="fas fa-circle"
                    style={{ color: "var(--bs-red)" }}
                  ></i>
                  &nbsp;High
                </span>
                <span className="me-2">
                  <i
                    className="fas fa-circle"
                    style={{ color: "var(--bs-orange)" }}
                  ></i>
                  &nbsp;Medium
                </span>
                <span className="me-2">
                  <i
                    className="fas fa-circle"
                    style={{ color: "var(--bs-yellow)" }}
                  ></i>
                  &nbsp;Low
                </span>
                <span className="me-2">
                  <i className="fas fa-circle text-info"></i>&nbsp;Info
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeDashboard;