import { getFetch } from '../utils/functions';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import Session from 'react-session-api'
import PieChart from "./PieChart"
import { BoxArrowUpRight, ArrowLeftCircle } from 'react-bootstrap-icons';

Session.config(true, 60)

const Host = () => {

    const SCAN_TYPES = ["Aggressive", "Normal"]

    const [hostName, setHostName] = useState("None");
    const [hostIp, setHostIp] = useState("None");
    const [hostOs, setHostOs] = useState("None");
    const [hostMac, setHostMac] = useState("None");
    const [hostCVEsNum, sethostCVEsNum] = useState(0);
    const [hostPortsVulnarable, setHostPortsVulnarable] = useState(0);
    const [hostPortsNum, setHostPortsNum] = useState(0);
    const [hostHighCVEsNum, setHostHighCVEsNum] = useState(0);
    const [hostPorts, setHostPorts] = useState([]);
    const [hostCVEsPorts, setHostCVEsPorts] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [searchCVEs, setSearchCVEs] = useState("");
    const [searchPorts, setSearchPorts] = useState("");
    const [graphDataArc, setGraphDataArc] = useState([0,0,0,0]);

    const searchCVEsHandler = (e) => {
        //convert input text to lower case
        var lowerCase = e.target.value.toLowerCase();
        setSearchCVEs(lowerCase);
    };

    const searchPortsHandler = (e) => {
        //convert input text to lower case
        var lowerCase = e.target.value.toLowerCase();
        setSearchPorts(lowerCase);
    };

    let { hostId } = useParams();

    const getPorts = async () => {
        let res = await getFetch({ username: Session.get("username"), token: Session.get("token"), hostId }, "/getHostPorts")
        setHostPorts(res.data.ports)
        setHostPortsNum(res.data.ports.length)
    }

    const getCVEs = async () => {
        let hostCVEsCriticality = [0, 0, 0, 0]

        let hostCVEs = await getFetch({ username: Session.get("username"), token: Session.get("token"), hostId }, "/getHostCVEs")

        if (hostCVEs.error.errorMsg === undefined) {
            let vulnarablePorts = [];
            sethostCVEsNum(hostCVEs.data.cves.length)
            for (const [cveKey, cve] of Object.entries(hostCVEs.data.cves)) {
                if (cve.cve_cvss < 4) {
                    hostCVEsCriticality[3] += 1
                } else if (cve.cve_cvss < 7) {
                    hostCVEsCriticality[2] += 1
                } else if (cve.cve_cvss < 9) {
                    hostCVEsCriticality[1] += 1
                } else {
                    hostCVEsCriticality[0] += 1
                }
                if (!vulnarablePorts.includes(cve.port_id)) {
                    vulnarablePorts.push(cve.port_id)
                }
            }
            setHostPortsVulnarable(vulnarablePorts.length)
            setHostHighCVEsNum(hostCVEsCriticality[0] + hostCVEsCriticality[1])
            setGraphDataArc(hostCVEsCriticality)
            setHostCVEsPorts(hostCVEs.data.cves)
        }
    }


    const getHostInfo = async () => {
        const hostInfo = await getFetch({ username: Session.get("username"), token: Session.get("token"), hostId }, "/getHost")
        setHostName(hostInfo.data.host.host_name)
        setHostIp(hostInfo.data.host.host_ip)
        setHostOs(hostInfo.data.host.host_os)
        setHostMac(hostInfo.data.host.host_mac)
    }


    let navigate = useNavigate();

    useEffect(() => {

        if (Session.get("username") == undefined || Session.get("token") == undefined) {
            return navigate("/login");
        }

        getHostInfo()
        getCVEs()
        getPorts()

    }, []);

    return (
        <div className="container-fluid">
            <div className="d-sm-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-dark" onClick={() => navigate(-1)}><ArrowLeftCircle /> Back</Button>
            </div>
            <div className="d-sm-flex justify-content-between align-items-center mb-4">
                <h3 className="text-dark mb-0">&nbsp;{hostName}</h3>

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
                                    <div className="text-uppercase text-primary fw-bold text-xs mb-1"><span>nb of vulnerable ports</span></div>
                                    <div className="text-dark fw-bold h5 mb-0"><span>{hostPortsVulnarable}</span></div>
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
                                    <div className="text-uppercase text-success fw-bold text-xs mb-1"><span style={{ color: "var(--bs-blue)" }}>nb of ports</span></div>
                                    <div className="text-dark fw-bold h5 mb-0"><span>{hostPortsNum}</span></div>
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
                                            <div className="text-dark fw-bold h5 mb-0 me-3"><span>{hostCVEsNum}</span></div>
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
                                                <div className="text-dark fw-bold h5 mb-0 me-3"><span>{hostHighCVEsNum}</span></div>
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
                            <p className="text-primary m-0 fw-bold">Host information&nbsp;</p>
                        </div>
                        <div className="card-body">
                            <form>
                                <div className="row">
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Name</strong></label>
                                            <p>{hostName}</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Host IP&nbsp;&nbsp;</strong></label>
                                            <p>{hostIp}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Host Mac</strong></label>
                                            <p>{hostMac}</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Host Os</strong></label>
                                            <p>{hostOs}<br /></p>
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
                            <h6 className="text-primary fw-bold m-0">All CVEs</h6>
                            <div className="dropdown no-arrow"><button className="btn btn-link btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button"><i className="fas fa-ellipsis-v text-gray-400"></i></button>
                                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                                    <p className="text-center dropdown-header">Options</p><a className="dropdown-item" href="#">&nbsp;View all vulnerabilities</a>
                                    <div className="dropdown-divider"></div><a className="dropdown-item" href="#">&nbsp;Something else here</a>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 text-nowrap">
                                <div
                                    id="dataTable_length"
                                    className="dataTables_length"
                                    aria-controls="dataTable"
                                ></div>
                            </div>
                            <div className="col-md-6">
                                <div
                                    className="text-md-end dataTables_filter"
                                    id="dataTable_filter"
                                >
                                    <label className="form-label">
                                        <input
                                            type="search"
                                            className="form-control form-control-sm"
                                            aria-controls="dataTable"
                                            onChange={searchCVEsHandler}
                                            placeholder="Search"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive" style={{ height: "50vh" }}>
                            <Table striped="columns" responsive="sm">
                                <thead>
                                    <tr>
                                        <th>CVE</th>
                                        <th>CVSS</th>
                                        <th>Port Number</th>
                                        <th>Service Name</th>
                                        <th>View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hostCVEsPorts.filter(post => {
                                        if (searchCVEs === '') {
                                            return post;
                                        } else if (post.cve_name.toLowerCase().includes(searchCVEs)) {
                                            return post;
                                        } else if (post.service_name.toLowerCase().includes(searchCVEs)) {
                                            return post;
                                        } else if (post.port_number.toString().toLowerCase().includes(searchCVEs)) {
                                            return post;
                                        } else if (post.cve_cvss.toString().toLowerCase().includes(searchCVEs)) {
                                            return post;
                                        }
                                        
                                    }).map((cvePort, i) => (
                                        <tr key={i}>
                                            <td> {cvePort.cve_name}</td>
                                            <td>{cvePort.cve_cvss}</td>
                                            <td>{cvePort.port_number}</td>
                                            <td>{cvePort.service_name}</td>
                                            <td><Link to={"/vulnerability/" + cvePort.port_id + "/" + cvePort.cve_id}><BoxArrowUpRight /></Link></td>
                                        </tr>
                                    ))}

                                </tbody>
                            </Table>
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
            <div className="row">
                <div className="col-lg-7 col-xl-8">
                    <div className="card shadow mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="text-primary fw-bold m-0">All Open Ports</h6>
                            <div className="dropdown no-arrow"><button className="btn btn-link btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button"><i className="fas fa-ellipsis-v text-gray-400"></i></button>
                                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                                    <p className="text-center dropdown-header">Options</p><a className="dropdown-item" href="#">&nbsp;View all vulnerabilities</a>
                                    <div className="dropdown-divider"></div><a className="dropdown-item" href="#">&nbsp;Something else here</a>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 text-nowrap">
                                <div
                                    id="dataTable_length"
                                    className="dataTables_length"
                                    aria-controls="dataTable"
                                ></div>
                            </div>
                            <div className="col-md-6">
                                <div
                                    className="text-md-end dataTables_filter"
                                    id="dataTable_filter"
                                >
                                    <label className="form-label">
                                        <input
                                            type="search"
                                            className="form-control form-control-sm"
                                            aria-controls="dataTable"
                                            onChange={searchPortsHandler}
                                            placeholder="Search"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive" style={{ height: "50vh" }}>

                            <Table striped="columns" responsive="sm">
                                <thead>
                                    <tr>
                                        <th>Port Number</th>
                                        <th>Protocol</th>
                                        <th>Service Name</th>
                                        <th>Service Version</th>
                                        <th>Service Product</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hostPorts.filter(post => {
                                        if (searchPorts === '') {
                                            return post;
                                        } else if (post.port_number.toString().toLowerCase().includes(searchPorts)) {
                                            return post;
                                        } else if (post.service_name.toLowerCase().includes(searchPorts)) {
                                            return post;
                                        } else if (post.service_product.toLowerCase().includes(searchPorts)) {
                                            return post;
                                        } else if (post.port_protocol.toLowerCase().includes(searchPorts)) {
                                            return post;
                                        }
                                    }).map((port, i) => (
                                        <tr key={i}>
                                            <td> {port.port_number}</td>
                                            <td>{port.port_protocol}</td>
                                            <td>{port.service_name}</td>
                                            <td>{port.service_version}</td>
                                            <td>{port.service_product}</td>
                                        </tr>
                                    ))}

                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Host;