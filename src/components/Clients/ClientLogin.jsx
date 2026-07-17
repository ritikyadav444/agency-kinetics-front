import React, { Fragment,  useState, useEffect } from "react";
import Loader from "../layout/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import {clearErrors, loginClient } from "../../actions/clientAction";
import { useNavigate, useLocation } from "react-router-dom";

const ClientLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { error, loading, isAuthenticated } = useSelector(
    (state) => state.clientLog
  );



  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");

  const Submit = (e) => {
    e.preventDefault();
    dispatch(loginClient(Email, Password, workspace));
  };


  const redirect = location.search ? location.search.split("=")[1] : "/services";

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
       if (isAuthenticated) {
        // console.log("in", redirect)
      navigate(redirect);

    }
  }, [dispatch, error, navigate, isAuthenticated , redirect]);



  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
          <div className="SignUpContainer">
            <div className="SignUpBox">

              <form className="Form"  onSubmit={Submit}>
                  <div className="Email">
                  <input
                    type="workspace"
                    placeholder="workspace"
                    required
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                  />
                </div>

                <div className="Email">
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="Password">
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <input type="submit" value="" className="Btn" />
              </form>
            
            </div>
          </div>
      )}
    </Fragment>
  );
};




export default ClientLogin