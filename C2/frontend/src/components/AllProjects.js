import { getFetch } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import Session from "react-session-api";

Session.config(true, 60);

const AllProjects = () => {
    const [allProjects, setAllPorjects] = useState([]);
    const [inputText, setInputText] = useState("");
    let inputHandler = (e) => {
        //convert input text to lower case
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
    };
    const getAllProjects = async () => {
        const projectInfo = await getFetch(
            { username: Session.get("username"), token: Session.get("token") },
            "/getAllProjects"
        );
        setAllPorjects(projectInfo.data.projects);
    };

    let navigate = useNavigate();

    useEffect(() => {
        
        if (Session.get("username") == undefined || Session.get("token") == undefined) {
            return navigate("/login");
        }

        getAllProjects();
    }, []);

    return (
        <div className="container-fluid">
            <h3 className="text-dark mb-4">All Projects</h3>
            <div className="card shadow">
                <div className="card-header py-3">
                    <p className="text-primary m-0 fw-bold">Project List</p>
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
                                    <th>Name</th>
                                    <th>Creation Date</th>
                                    <th className="text-center">Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProjects.filter(post => {
                                    if (inputText === '') {
                                        return post;
                                    } else if (post.report_name.toLowerCase().includes(inputText)) {
                                        return post;
                                    }
                                }).map((project, i) => (
                                    <tr key={i}>
                                        <td> {project.report_name}</td>
                                        <td>{project.report_date}</td>
                                        <td className="text-center">
                                            <Link to={"/projectdashboard/" + project.report_id}>
                                                <BoxArrowUpRight />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProjects;