import { useState, useEffect } from 'react';
import { postFetch } from '../utils/functions';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Session from 'react-session-api'
import dogImage from '../assets/img/dogs/image2.jpeg';

Session.config(true, 60)

const Register = () => {
    const [token, setToken] = useState("");
    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordValidation, setPasswordValidation] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        if (password == passwordValidation) {
            const res = await postFetch({
                username,
                email,
                password
            }, '/createUser');
            const newToken = res.data.token
            if (newToken != undefined) {
                Session.set("token", newToken);
                Session.set("username", username);
                setToken(newToken)
            } else {
                console.log(res.error)
            }
        }else{
            console.log("Password and Password Verify do not match")
        }

    }

    let navigate = useNavigate();

    useEffect(() => {

        if (Session.get("username") != undefined && Session.get("token") != undefined) {
            return navigate("/");
        }

    }, [token]);


    return (
        <div className="container">
            <div className="card shadow-lg o-hidden border-0 my-5">
                <div className="card-body p-0">
                    <div className="row">
                        <div className="col-lg-5 d-none d-lg-flex">
                            <div className="flex-grow-1 bg-register-image" style={{ backgroundImage: `url(${dogImage})` }}></div>
                        </div>
                        <div className="col-lg-7">
                            <div className="p-5">
                                <div className="text-center">
                                    <h4 className="text-dark mb-4">Create an Account!</h4>
                                </div>
                                <p>Create your account and contact your administrator to be attached to your role.</p>
                                
                                <form className="user" onSubmit={handleSubmit}>
                                    <div className="mb-3"><input className="form-control form-control-user" type="text" id="exampleInputUsername" aria-describedby="emailHelp" placeholder="Username" name="username" onChange={e => setUserName(e.target.value)} /></div>
                                    <div className="mb-3"><input className="form-control form-control-user" type="email" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Email Address" name="email" onChange={e => setEmail(e.target.value)} /></div>
                                    <div className="row mb-3">
                                        <div className="col-sm-6 mb-3 mb-sm-0"><input className="form-control form-control-user" type="password" id="examplePasswordInput" placeholder="Password" name="password" onChange={e => setPassword(e.target.value)} /></div>
                                        <div className="col-sm-6"><input className="form-control form-control-user" type="password" id="exampleRepeatPasswordInput" placeholder="Repeat Password" name="password_repeat" onChange={e => setPasswordValidation(e.target.value)} /></div>
                                    </div><button className="btn btn-primary d-block btn-user w-100" type="submit">Register Account</button>
                                    <hr />
                                </form>
                                <div className="text-center"><Link to="/login" className="small">Already have an account? Login!</Link></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register;