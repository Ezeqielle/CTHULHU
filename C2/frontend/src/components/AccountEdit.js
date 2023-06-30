import { useParams } from "react-router-dom";
import { getFetch, postFetch } from '../utils/functions';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {ButtonGroup, ToggleButton} from 'react-bootstrap';
import Session from 'react-session-api'
Session.config(true, 60)

const AccountEdit = () => {

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");
  const [roleId, setRoleId] = useState("");
  const [userModified, setUserModified] = useState(false);

  const radios = [
    { name: 'Admin', value: 1 },
    { name: 'Reader', value: 2 },
    { name: 'Scan', value: 3 },
  ];

  let { searcheduser } = useParams();

  const getUserInfo = async () => {
    const userInfo = await getFetch({ reqUsername: Session.get("username"), reqToken: Session.get("token"), username: searcheduser }, "/getUserInfo")
    setFirstname(userInfo.data.user.user_firstname)
    setLastname(userInfo.data.user.user_lastname)
    setEmail(userInfo.data.user.user_email)
    setUsername(userInfo.data.user.user_name)
    setRoleId(userInfo.data.user.role_id)
  }

  const handleSubmit = () => {
    if(password == passwordVerify){
      postFetch({ reqUsername: Session.get("username"), reqToken: Session.get("token"), username, firstname, lastname, email, role: roleId, password: passwordVerify }, "/editUser")
      setUserModified(true)
    }else{
      console.log("Password and Password Verify do not match !")
    }
  }

  let navigate = useNavigate();

  useEffect(() => {

    if (Session.get("username") == undefined || Session.get("token") == undefined) {
      return navigate("/login");
    }

    getUserInfo()

  }, [userModified]);

  return (
    <div className="container-fluid">
      <h3 className="text-dark mb-4">Profile: {username}</h3>
      <div className="row mb-3">
        <div className="col-lg-8 col-xl-12">
          <div className="row mb-3 d-none">
            <div className="col">
              <div className="card textwhite bg-primary text-white shadow">
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col">
                      <p className="m-0">Peformance</p>
                      <p className="m-0"><strong>65.2%</strong></p>
                    </div>
                    <div className="col-auto"><i className="fas fa-rocket fa-2x"></i></div>
                  </div>
                  <p className="text-white-50 small m-0"><i className="fas fa-arrow-up"></i>&nbsp;5% since last month</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card textwhite bg-success text-white shadow">
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col">
                      <p className="m-0">Peformance</p>
                      <p className="m-0"><strong>65.2%</strong></p>
                    </div>
                    <div className="col-auto"><i className="fas fa-rocket fa-2x"></i></div>
                  </div>
                  <p className="text-white-50 small m-0"><i className="fas fa-arrow-up"></i>&nbsp;5% since last month</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 offset-lg-0">
              <div className="card shadow mb-3">
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">User Settings</p>
                </div>
                <div className="card-body">
                  <form>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3"><label className="form-label" htmlFor="first_name"><strong>First Name</strong></label><input className="form-control" type="text" id="first_name" placeholder="None" name="first_name" value={firstname==null ? "": firstname} onChange={e => setFirstname(e.target.value)}/></div>
                      </div>
                      <div className="col">
                        <div className="mb-3"><label className="form-label" htmlFor="last_name"><strong>Last Name</strong></label><input className="form-control" type="text" id="last_name" placeholder="None" name="last_name" value={lastname==null ? "": lastname} onChange={e => setLastname(e.target.value)}/></div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3"><label className="form-label" htmlFor="user_name"><strong>Username</strong></label><input className="form-control" type="text" id="user_name" placeholder="None" name="user_name" value={username==null ? "": username} onChange={e => setUsername(e.target.value)}/></div>
                      </div>
                      <div className="col">
                        <div className="mb-3"><label className="form-label" htmlFor="email"><strong>Email</strong></label><input className="form-control" type="text" id="email" placeholder="None" name="email" value={email==null ? "": email} onChange={e => setEmail(e.target.value)}/></div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3"><label className="form-label" htmlFor="password"><strong>Password</strong></label><input className="form-control" type="password" id="password" placeholder="None" name="password"  onChange={e => setPassword(e.target.value)}/></div>
                      </div>
                      <div className="col">
                        <div className="mb-3"><label className="form-label" htmlFor="password_verify"><strong>Password Verify</strong></label><input className="form-control" type="password" id="password_verify" placeholder="None" name="password_verify"  onChange={e => setPasswordVerify(e.target.value)}/></div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="card shadow">
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">Account type</p>
                </div>
                <div className="card-body">
                  <form>
                    <div className="row">
                      <div className="col">
                        <div className="text-primary mb-3">
                          <ButtonGroup>
                          {radios.map((radio, idx) => (
                            <div key={"div-"+idx} className="form-check"><ToggleButton
                              key={idx}
                              id={`radio-${idx}`}
                              type="radio"
                              variant="secondary"
                              name="radio"
                              value={radio.value}
                              checked={roleId === radio.value}
                              onChange={(e) => setRoleId(e.currentTarget.value)}
                            >
                              {radio.name}
                            </ToggleButton>
                            </div>
                          ))}
                          </ButtonGroup>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-100"></div>
      </div>
      <div className="card shadow mb-5">
        <button className="btn btn-primary d-block btn-user w-100" type="submit" onClick={handleSubmit}>Save</button>
      </div>
    </div>
  )
}
export default AccountEdit;