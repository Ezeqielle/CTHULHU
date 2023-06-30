import { getFetch } from "../utils/functions";
import { useState, useEffect } from "react";
import Session from "react-session-api";
import { Binoculars, PcDisplay } from "react-bootstrap-icons";
import { useNavigate, Link } from "react-router-dom";

Session.config(true, 60);

const AllAgents = () => {
    const [agents, setAgents] = useState([]);

    const [inputText, setInputText] = useState("");
    let inputHandler = (e) => {
        //convert input text to lower case
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
    };

    const getAllAgents = async () => {
        const allUsers = await getFetch(
            { username: Session.get("username"), token: Session.get("token") },
            "/getAllAgents"
        );

        setAgents(allUsers.data.agents);
    };

    let navigate = useNavigate();

    useEffect(() => {
        if (Session.get("username") === undefined || Session.get("token") === undefined) {
            return navigate("/login");
        }

        getAllAgents()
    }, []);

    return (
        <div className="container-fluid">
            <h3 className="text-dark mb-4">Agents view</h3>
            <div className="card shadow">
                <div className="card-header py-3">
                    <p className="text-primary m-0 fw-bold">Agents</p>
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
                                    <th>Host</th>
                                    <th>Os</th>
                                    <th>Hooked User</th>
                                    <th>ip</th>
                                    <th className="text-center">View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    agents.filter(agent => {
                                        if (inputText === '') {
                                            return agent;
                                        } else if (agent.versionOS.toLowerCase().includes(inputText) || agent.hookUser.toLowerCase().includes(inputText) || agent.ip.toLowerCase().includes(inputText) || agent.host.toLowerCase().includes(inputText)) {
                                            return agent;
                                        }
                                    }).map((agent, i) => (
                                        <tr key={i}>
                                            <td>
                                                <PcDisplay /> {agent.host}
                                            </td>
                                            <td>{agent.versionOS}</td>
                                            <td>{agent.hookUser}</td>
                                            <td>{agent.ip}</td>
                                            <td className="text-center">
                                                <Link to={"/agentview/" + agent.agentID}>
                                                    <Binoculars />
                                                </Link>
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
    );
};

export default AllAgents;