import { useState, useEffect } from 'react';
import { postFetch } from '../utils/functions';
import cthulhuLogo from '../assets/img/dogs/image3.jpeg';
import Session from 'react-session-api'
import { useNavigate } from "react-router-dom";

Session.config(true, 60)

const Login = () => {
    const [token, setToken] = useState("");
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        console.log("Test")
        const res = await postFetch({
            username,
            password
        }, '/auth');
        const newToken = res.data.token
        if (newToken != undefined) {
            Session.set("token", newToken);
            Session.set("username", username);
            setToken(newToken)
        } else {
            console.log(res.error)
        }

    }
    
    //checkToken()
    let navigate = useNavigate();

    useEffect(() => {

        if(Session.get("username") != undefined && Session.get("token") != undefined){
            return navigate("/");
        }
        
    }, [token]);


    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-9 col-lg-12 col-xl-10">
                    <div className="card shadow-lg o-hidden border-0 my-5">
                        <div className="card-body p-0">
                            <div className="row">
                                <div className="col-lg-6 d-none d-lg-flex">
                                    <div className="flex-grow-1 bg-login-image" style={{ backgroundImage: `url(${cthulhuLogo})` }}></div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="p-5">
                                        <div className="text-center">
                                            <h4 className="text-dark mb-4">CTHULHU C&C</h4>
                                        </div>
                                        <form className="user" onSubmit={handleSubmit}>
                                            <div className="mb-3"><input className="form-control form-control-user" type="text" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Username" name="username" onChange={e => setUserName(e.target.value)} /></div>
                                            <div className="mb-3"><input className="form-control form-control-user" type="password" id="exampleInputPassword" placeholder="Password" name="password" onChange={e => setPassword(e.target.value)} /></div>
                                            <div className="mb-3">
                                                <div className="custom-control custom-checkbox small"></div>
                                            </div><button className="btn btn-primary d-block btn-user w-100" type="submit">Login</button>
                                            <hr />
                                        </form>
                                        <div className="text-center"><p>Forgot Password ? Please contact your administrator</p></div>
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
export default Login;