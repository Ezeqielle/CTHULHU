import { postFetch } from '../utils/functions';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import Session from 'react-session-api'
Session.config(true, 60)

const ScanCreation = () => {

    const [scanName, setScanName] = useState("");
    const [scanTarget, setScanTarget] = useState("");
    const [scanType, setScanType] = useState(2);

    const radios = [
        { name: 'Normal', value: 2 },
        { name: 'Aggressive', value: 1 }
    ];

    let { projectId } = useParams();
    let navigate = useNavigate();

    const handleSubmit = async () => {
        const res = await postFetch({ username: Session.get("username"), token: Session.get("token"), scanName, scanTarget, scanType, reportId: parseInt(projectId) }, "/createScan")

        return navigate(`/scan/${res.data.scanId}`);
    }

    useEffect(() => {

        if (Session.get("username") == undefined || Session.get("token") == undefined) {
            return navigate("/login");
        }

    });

    return (
        <div className="container-fluid">
            <div className="d-sm-flex justify-content-between align-items-center mb-4">
                <h3 className="text-dark mb-0">Scan Creation</h3>
            </div>
            <div className="row">
                <div className="col-lg-7 col-xl-12">
                    <div className="card shadow mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="text-primary fw-bold m-0">Scan configuration</h6>
                            <div className="dropdown no-arrow"><button className="btn btn-link btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button"><i className="fas fa-ellipsis-v text-gray-400"></i></button>
                                <div className="dropdown-menu shadow dropdown-menu-end animated--fade-in">
                                    <p className="text-center dropdown-header">dropdown header:</p><a className="dropdown-item" href="#">&nbsp;Action</a><a className="dropdown-item" href="#">&nbsp;Another action</a>
                                    <div className="dropdown-divider"></div><a className="dropdown-item" href="#">&nbsp;Something else here</a>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col">
                                    <div className="mb-3"><label className="form-label" htmlFor="scanname"><strong>Scan name</strong><br /></label><input className="form-control" type="text" id="scanname-1" placeholder="Name" name="scanname" onChange={e => setScanName(e.target.value)} /></div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <div className="mb-3"><label className="form-label" htmlFor="target"><strong>target (IP or Network)</strong><br /></label><input className="form-control" type="text" id="target-1" placeholder="192.168.1.1 or 192.168.1.0/24" name="target" onChange={e => setScanTarget(e.target.value)} /></div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <div className="mb-3"><label className="form-label" htmlFor="first_name"><strong>Type of scan</strong></label>
                                        <ButtonGroup>
                                            {radios.map((radio, idx) => (
                                                <div key={"div-" + idx} className="form-check"><ToggleButton
                                                    key={idx}
                                                    id={`radio-${idx}`}
                                                    type="radio"
                                                    variant="secondary"
                                                    name="radio"
                                                    value={radio.value}
                                                    checked={scanType === radio.value}
                                                    onChange={(e) => setScanType(e.currentTarget.value)}
                                                >
                                                    {radio.name}
                                                </ToggleButton>
                                                </div>
                                            ))}
                                        </ButtonGroup>
                                    </div>
                                </div>
                                <div className="col-xl-12 offset-xl-0"><button className="btn btn-primary d-block btn-user w-100" type="submit" onClick={handleSubmit}>Create Scan</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScanCreation;