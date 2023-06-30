import { getFetch, postFetch } from '../utils/functions';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import Session from 'react-session-api'
import { BoxArrowUpRight, ArrowLeftCircle } from 'react-bootstrap-icons';
import { SERVER_PORT } from '../utils/config';
import { saveAs } from "file-saver";
import PieChart from "./PieChart"

Session.config(true, 60)

const Scan = () => {

    const SCAN_TYPES = ["Aggressive", "Normal"]

    const [scanName, setScanName] = useState("Scan Name");
    const [scanTarget, setScanTarget] = useState("");
    const [scanStartDate, setScanStartDate] = useState("None");
    const [scanEndDate, setScanEndDate] = useState("None");
    const [scanType, setScanType] = useState("");
    const [scanHashId, setScanHashId] = useState("");
    const [scanCVEsNum, setScanCVEsNum] = useState(0);
    const [scanHostVulnarable, setScanHostVulnarable] = useState(0);
    const [scanHostsNum, setScanHostsNum] = useState(0);
    const [scanHighCVEsNum, setScanHighCVEsNum] = useState(0);
    const [scanHosts, setScanHosts] = useState([]);
    const [showAlert, setShowAlert] = useState(false);

    const [graphDataArc, setGraphDataArc] = useState([0,0,0,0]);

    let { scanId } = useParams();

    const generateScanReport = async () => {
        let hashId = ""
        if (scanHashId === "None") {
            const res = await postFetch({ username: Session.get("username"), token: Session.get("token"), scanId }, "/generateScanReport")
            hashId = res.data.scanHashId
        } else {
            hashId = scanHashId
        }
        saveAs(
            "https://" + process.env.REACT_APP_HOST_IP + ':' + SERVER_PORT + "/download?file=" + hashId + ".csv",
            scanName + ".csv"
        );
    };

    const getHosts = async () => {
        let res = await getFetch({ username: Session.get("username"), token: Session.get("token"), scanId }, "/getScanHosts")
        setScanHosts(res.data.hosts)
        setScanHostsNum(res.data.hosts.length)
    }

    const getCVEs = async () => {
        let scanCVEsCriticality = [0, 0, 0, 0]

        let scanCVEs = await getFetch({ username: Session.get("username"), token: Session.get("token"), scanId }, "/getScanCVEs")
        if (scanCVEs.error.errorMsg === undefined) {
            let vulnarableHost = [];
            setScanCVEsNum(scanCVEs.data.cves.length)
            for (const [cveKey, cve] of Object.entries(scanCVEs.data.cves)) {
                if (cve.cve_cvss < 4) {
                    scanCVEsCriticality[3] += 1
                } else if (cve.cve_cvss < 7) {
                    scanCVEsCriticality[2] += 1
                } else if (cve.cve_cvss < 9) {
                    scanCVEsCriticality[1] += 1
                } else {
                    scanCVEsCriticality[0] += 1
                }
                if (!vulnarableHost.includes(cve.host_id)) {
                    vulnarableHost.push(cve.host_id)
                }
            }
            setScanHostVulnarable(vulnarableHost.length)
            setScanHighCVEsNum(scanCVEsCriticality[0] + scanCVEsCriticality[1])
            
        }
        setGraphDataArc(scanCVEsCriticality)
    }

    const startScan = async () => {
        const res = await postFetch({ username: Session.get("username"), token: Session.get("token"), scanId, scanTarget }, "/startScan")
        setScanStartDate(res.data.scanStartDate)
        setShowAlert(true)
    }

    const getScanInfo = async () => {
        const scanInfo = await getFetch({ username: Session.get("username"), token: Session.get("token"), scanId }, "/getScan")
        setScanName(scanInfo.data.scan.scan_name)
        setScanTarget(scanInfo.data.scan.scan_target)
        setScanStartDate(scanInfo.data.scan.scan_start_date)
        setScanEndDate(scanInfo.data.scan.scan_end_date)
        setScanType(SCAN_TYPES[scanInfo.data.scan.scan_type_id - 1])
        setScanHashId(scanInfo.data.scan.hash_id)
    }

    let navigate = useNavigate();

    useEffect(() => {

        if (Session.get("username") == undefined || Session.get("token") == undefined) {
            return navigate("/login");
        }

        getScanInfo()
        getCVEs()
        getHosts()

    }, []);

    return (
        <div className="container-fluid">
            <div className="d-sm-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-dark" onClick={() => navigate(-1)}><ArrowLeftCircle /> Back</Button><Button variant="secondary" size="lg" onClick={generateScanReport}>Download report</Button><Button variant="outline-success" onClick={startScan} disabled={scanStartDate !== null ? true : false}>Start Scan</Button>
            </div>
            <div className="row">
                <div className="d-sm-flex justify-content-between align-items-center mb-4">
                    <h3 className="text-dark mb-0">&nbsp;{scanName}</h3>

                </div>
            </div>
            <Alert show={showAlert} variant="success">
                <Alert.Heading>Scan started</Alert.Heading>
                <p>
                    Your target scan has been started !
                </p>
                <hr />
                <div className="d-flex justify-content-end">
                    <Button onClick={() => setShowAlert(false)} variant="outline-success">
                        Close
                    </Button>
                </div>
            </Alert>
            <div className="row">
                <div className="col-md-6 col-xl-3 mb-4">
                    <div className="card shadow border-start-primary py-2">
                        <div className="card-body">
                            <div className="row align-items-center no-gutters">
                                <div className="col me-2">
                                    <div className="text-uppercase text-primary fw-bold text-xs mb-1"><span>nb of vulnerable hosts</span></div>
                                    <div className="text-dark fw-bold h5 mb-0"><span>{scanHostVulnarable}</span></div>
                                </div>
                                <div className="col-auto"><i className="fas fa-door-open fa-2x text-gray-300"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3 mb-4">
                    <div className="card shadow border-start-success py-2">
                        <div className="card-body">
                            <div className="row align-items-center no-gutters">
                                <div className="col me-2">
                                    <div className="text-uppercase text-success fw-bold text-xs mb-1"><span style={{ color: "var(--bs-blue)" }}>NB of Hosts</span></div>
                                    <div className="text-dark fw-bold h5 mb-0"><span>{scanHostsNum}</span></div>
                                </div>
                                <div className="col-auto"><i className="fas fa-door-closed fa-2x text-gray-300"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3 mb-4">
                    <div className="card shadow border-start-info py-2">
                        <div className="card-body">
                            <div className="row align-items-center no-gutters">
                                <div className="col me-2">
                                    <div className="text-uppercase text-info fw-bold text-xs mb-1"><span style={{ color: "var(--bs-orange)" }}>Vulnerabilities</span></div>
                                    <div className="row g-0 align-items-center">
                                        <div className="col-auto">
                                            <div className="text-dark fw-bold h5 mb-0 me-3"><span>{scanCVEsNum}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-auto"><i className="fas fa-clipboard-list fa-2x text-gray-300"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3 mb-4">
                    <div className="card shadow border-start-warning py-2">
                        <div className="card-body">
                            <div className="row align-items-center no-gutters">
                                <div className="col me-2">
                                    <div className="text-uppercase text-warning fw-bold text-xs mb-1"><span style={{ color: "var(--bs-red)" }}>high to critical vulnerabilities</span>
                                        <div className="row g-0 align-items-center">
                                            <div className="col-auto">
                                                <div className="text-dark fw-bold h5 mb-0 me-3"><span>{scanHighCVEsNum}</span></div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="col-auto"><i className="fas fa-exclamation-triangle fa-2x text-gray-300"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card shadow mb-5">
                        <div className="card-header py-3">
                            <p className="text-primary m-0 fw-bold">Scan information&nbsp;</p>
                        </div>
                        <div className="card-body">
                            <form>
                                <div className="row">
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Name</strong></label>
                                            <p>{scanName}</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Type of scan&nbsp;&nbsp;</strong></label>
                                            <p>{scanType}</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Duration</strong></label>
                                            <p>{scanStartDate <= scanEndDate ? "None" : scanStartDate - scanEndDate}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Target</strong></label>
                                            <p>{scanTarget}</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Start Date</strong></label>
                                            <p>{scanStartDate == null ? "Scan not started yet" : scanStartDate}</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>End Date</strong></label>
                                            <p>{scanEndDate == null ? "Scan not ended yet" : scanEndDate}<br /></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3"></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-7 col-xl-8">
                    <div className="card shadow mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="text-primary fw-bold m-0">All Up Hosts</h6>
                            <div className="dropdown no-arrow"><button className="btn btn-link btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button"><i className="fas fa-ellipsis-v text-gray-400"></i></button>
                                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                                    <p className="text-center dropdown-header">Options</p><a className="dropdown-item" href="#">&nbsp;View all vulnerabilities</a>
                                    <div className="dropdown-divider"></div><a className="dropdown-item" href="#">&nbsp;Something else here</a>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>IP</th>
                                        <th>Mac</th>
                                        <th>View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scanHosts.map((host, i) => (
                                        <tr key={i}>
                                            <td> {host.host_name}</td>
                                            <td>{host.host_ip}</td>
                                            <td>{host.host_mac}</td>
                                            <td><Link to={"/host/" + host.host_id}><BoxArrowUpRight /></Link></td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5 col-xl-4">
                    <div className="card shadow mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="text-primary fw-bold m-0">Vulnerabilities repartition</h6>
                            <div className="dropdown no-arrow"><button className="btn btn-link btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button"><i className="fas fa-ellipsis-v text-gray-400"></i></button>
                                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                                    <p className="text-center dropdown-header">dropdown header:</p><a className="dropdown-item" href="#">&nbsp;Action</a><a className="dropdown-item" href="#">&nbsp;Another action</a>
                                    <div className="dropdown-divider"></div><a className="dropdown-item" href="#">&nbsp;Something else here</a>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div><PieChart chartData={graphDataArc} /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Scan;