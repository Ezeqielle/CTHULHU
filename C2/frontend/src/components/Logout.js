import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Session from 'react-session-api'
Session.config(true, 60)

const Logout = () => {

    Session.remove("token");
    Session.remove("username");

    let navigate = useNavigate();
    useEffect(() => {

        return navigate("/login");
        
    }, []);

    return (<></>);
    
}

export default Logout;