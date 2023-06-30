import { getFetch } from '../utils/functions';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import { BoxArrowUpRight, ArrowLeftCircle } from 'react-bootstrap-icons';
import { Link } from "react-router-dom";
import Session from 'react-session-api'
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
    },
};

let chartDatasetsByCriticality = [
    {
        label: 'Critical',
        data: [],
        borderColor: 'rgb(139, 0, 0)',
        backgroundColor: 'rgba(139, 0, 0, 0.5)',
    },
    {
        label: 'High',
        data: [],
        borderColor: 'rgb(255, 165, 0)',
        backgroundColor: 'rgba(255, 165, 0, 0.5)',
    },
    {
        label: 'Medium',
        data: [],
        borderColor: 'rgb(135, 206, 235)',
        backgroundColor: 'rgba(135, 206, 235, 0.5)',
    },
    {
        label: 'Low',
        data: [],
        borderColor: 'rgb(144, 238, 144)',
        backgroundColor: 'rgba(144, 238, 144, 0.5)',
    },
]
let chartDatasetsAllCVEs = [
    {
        label: 'All vulnerabilities',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
]
Session.config(true, 60)

const ProjectDashboard = () => {

    const SCAN_TYPES = ["Aggressive", "Normal"]

    const [projectName, setProjectName] = useState("Project Name");
    const [projectDate, setProjectDate] = useState("");
    const [userName, setUserName] = useState("");
    const [projectScans, setProjectScans] = useState([]);
    const [graphDataLine, setGraphDataLine] = useState({
        labels: [],
        datasets: chartDatasetsByCriticality
    });
    const [graphDataBar, setGraphDataBar] = useState({
        labels: [],
        datasets: chartDatasetsAllCVEs
    });


    let { projectId } = useParams();

    const getScansCVEs = async (scans) => {
        let labels = []
        for (const [scanKey, scan] of Object.entries(scans)) {
            labels.push(scan.scan_name)
            let scanCVEsNum = 0
            let scanCVEsCriticality = { critical: 0, high: 0, medium: 0, low: 0 }
            let scanCVEs = await getFetch({ username: Session.get("username"), token: Session.get("token"), scanId: scan.scan_id }, "/getScanCVEs")
            if (scanCVEs.error.errorMsg === undefined) {
                scanCVEsNum = scanCVEs.data.cves.length
                for (const [cveKey, cve] of Object.entries(scanCVEs.data.cves)) {
                    if (cve.cve_cvss < 4) {
                        scanCVEsCriticality.low += 1
                    } else if (cve.cve_cvss < 7) {
                        scanCVEsCriticality.medium += 1
                    } else if (cve.cve_cvss < 9) {
                        scanCVEsCriticality.high += 1
                    } else {
                        scanCVEsCriticality.critical += 1
                    }
                }
            }
            chartDatasetsByCriticality[0].data.push(scanCVEsCriticality.critical)
            chartDatasetsByCriticality[1].data.push(scanCVEsCriticality.high)
            chartDatasetsByCriticality[2].data.push(scanCVEsCriticality.medium)
            chartDatasetsByCriticality[3].data.push(scanCVEsCriticality.low)
            chartDatasetsAllCVEs[0].data.push(scanCVEsNum)
        }
        setGraphDataLine({ labels, datasets: chartDatasetsByCriticality })
        setGraphDataBar({labels, datasets: chartDatasetsAllCVEs})
    }
    const getProjectInfo = async () => {
        const projectInfo = await getFetch({ username: Session.get("username"), token: Session.get("token"), reportId: projectId }, "/getProjectInfo")
        const projectScans = await getFetch({ username: Session.get("username"), token: Session.get("token"), reportId: projectId }, "/getProjectScans")
        const userInfo = await getFetch({ reqUsername: Session.get("username"), reqToken: Session.get("token"), userId: projectInfo.data.userId }, "/getUserInfo")
        setProjectName(projectInfo.data.reportName)
        setProjectDate(projectInfo.data.reportDate)
        setProjectScans(projectScans.data.scans)
        setUserName(userInfo.data.user.user_name)
        getScansCVEs(projectScans.data.scans)
    }

    let navigate = useNavigate();

    useEffect(() => {

        if (Session.get("username") == undefined || Session.get("token") == undefined) {
            return navigate("/login");
        }

        getProjectInfo()

    }, []);


    return (
        <div className="container-fluid">
            <div className="d-sm-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-dark" onClick={() => navigate(-1)}><ArrowLeftCircle /> Back</Button>
            </div>
            <div className="d-sm-flex justify-content-between align-items-center mb-4">
                <h3 className="text-dark mb-0">{projectName}</h3><Link to={"/scancreation/" + projectId} className="btn btn-primary btn-sm d-none d-sm-inline-block" role="button" href="assets/add_asset.html"><i className="fas fa-plus fa-sm text-white-50"></i>&nbsp;New Scan</Link>
            </div>
            <div className="row">
                <div className="col">
                    <div className="card shadow mb-5">
                        <div className="card-header py-3">
                            <p className="text-primary m-0 fw-bold">Project informations&nbsp;</p>
                        </div>
                        <div className="card-body">
                            <form>
                                <div className="row">
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Project Name&nbsp;&nbsp;</strong></label>
                                            <p>{projectName}</p>
                                            <p></p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Creation date</strong></label>
                                            <p>{projectDate.toLocaleString('en-GB', { timeZone: 'UTC' }).split(".")[0]}</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Created by</strong></label>
                                            <p>{userName}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3"></div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7 col-xl-12">
                    <div className="card shadow mb-5">
                        <div className="card-header py-3">
                            <p className="text-primary m-0 fw-bold">All Scans</p>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-12 col-lg-12 col-xl-12">
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Type</th>
                                                    <th>Target</th>
                                                    <th>Edit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {projectScans.map((scan, i) => (
                                                    <tr key={i}>
                                                        <td>{scan.scan_name}</td>
                                                        <td>{SCAN_TYPES[scan.scan_type_id - 1]}</td>
                                                        <td>{scan.scan_target}</td>
                                                        <td><Link to={"/scan/" + scan.scan_id}><BoxArrowUpRight /></Link></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <form>
                                        <div className="mb-3"></div>
                                        <div className="mb-3"></div>
                                        <div className="mb-3"></div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-12 mb-1">
                    <div className="card shadow mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="text-primary fw-bold m-0">Vulnerabilities</h6>
                            <div className="dropdown no-arrow"><button className="btn btn-link btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button"><i className="fas fa-ellipsis-v text-gray-400"></i></button>
                                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                                    <p className="text-center dropdown-header">dropdown header:</p><a className="dropdown-item" href="#">&nbsp;Action</a><a className="dropdown-item" href="#">&nbsp;Another action</a>
                                    <div className="dropdown-divider"></div><a className="dropdown-item" href="#">&nbsp;Something else here</a>
                                </div>
                            </div>
                        </div>
                        <br />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6 mb-4">
                                    <div className="card">
                                        <div className="card-body">
                                            <Line data={graphDataLine} options={options} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb-4">
                                    <div className="card">
                                        <div className="card-body">
                                            <Bar data={graphDataBar} options={options} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default ProjectDashboard;