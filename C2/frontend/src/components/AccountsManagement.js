import { getFetch } from "../utils/functions";
import { useState, useEffect } from "react";
import Session from "react-session-api";
import { PencilSquare, PersonCircle } from "react-bootstrap-icons";
import { useNavigate, Link } from "react-router-dom";

Session.config(true, 60);

const AccountManagement = () => {
    const [users, setUsers] = useState([]);

    const [inputText, setInputText] = useState("");
    let inputHandler = (e) => {
        //convert input text to lower case
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
        console.log(inputText)
    };
    const ROLES = ["Admin", "Reader", "Scan"];

    const getAllUsers = async () => {
        const allUsers = await getFetch(
            { username: Session.get("username"), token: Session.get("token") },
            "/getAllUsers"
        );

        setUsers(allUsers.data.users);
    };

    let navigate = useNavigate();

    useEffect(() => {
        if (Session.get("username") == undefined || Session.get("token") == undefined) {
            return navigate("/login");
        }
        getAllUsers();
    }, []);

    return (
        <div className="container-fluid">
            <h3 className="text-dark mb-4">Manage accounts</h3>
            <div className="card shadow">
                <div className="card-header py-3">
                    <p className="text-primary m-0 fw-bold">Employee Info</p>
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
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th className="text-center">Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    users.filter(post => {
                                        if (inputText === '') {
                                            console.log(post);
                                            return post;
                                        } else if (post.user_name.toLowerCase().includes(inputText)) {
                                            return post;
                                        }
                                    }).map((user, i) => (
                                        <tr key={i}>
                                            <td>
                                                <PersonCircle /> {user.user_name}
                                            </td>
                                            <td>{user.user_email}</td>
                                            <td>
                                                {ROLES[user.role_id - 1] != undefined
                                                    ? ROLES[user.role_id - 1]
                                                    : "None"}
                                            </td>
                                            <td className="text-center">
                                                <Link to={"/accountedit/" + user.user_name}>
                                                    <PencilSquare />
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

export default AccountManagement;