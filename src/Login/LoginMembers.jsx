import React, { Fragment, useState, useEffect } from "react";
import Loader from "../components/layout/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, loginMember } from "../actions/loginAction";
import "./Login.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {TextField , Button, Typography, FormLabel, IconButton, useMediaQuery,} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Container, Divider, Grid, Paper } from '@mui/material';
import { makeStyles } from "@mui/styles";
import agencyKineticsLogo from '../Images/agencyKineticsLogo.svg'
import CustomizedSnackbars from "../snackbarToast";

const useStyles = makeStyles((theme) => ({
  divider: {
      // Theme Color, or use css color in quote
      background: 'rgb(255, 255, 255)',
  }

}));

const LoginMembers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)')
  const dispatch = useDispatch();
  const classes = useStyles();
  const { loading } = useSelector((state) => state.logMember);
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [workspace_name, setWorkspace_name] = useState("");

  const [readOnly, setReadOnly] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  useEffect(() => {
    const snackbar = location.state?.snackbar;
    if (snackbar) {
      setSnackbarMessage(snackbar.message);
      setSeverity(snackbar.severity);
      setSnackbarOpen(true);
    }
    // Clear the state to avoid showing the Snackbar again on subsequent renders
    navigate(location.pathname + location.search, { replace: true, state: undefined });

    const queryParams = new URLSearchParams(location.search);
    // console.log(location)
    const workspace = queryParams.get('workspace_name');
    // console.log(workspace, readOnly)
    if (workspace != null) {
      setWorkspace_name(workspace);
      setReadOnly(true);
    }

  }, [location.state, navigate]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };


  const Submit = async (e) => {
    e.preventDefault();

    // Dispatch the login action
    const response = await dispatch(loginMember(Email, Password, workspace_name));
    // console.log('resres',response)
    if (response.success) {
      const userRole = response.data.user.role;

      if (userRole === 'PROJECTMANAGER' || userRole === 'ASSIGNEE') {
        navigate('/services');
      } else {
        navigate('/dashboard');
      }

      navigate('/dashboard');

    } else if (response.error) {
      setSnackbarMessage(response.error);
      setSeverity('error');
      setSnackbarOpen(true);

      navigate('/login', {
        state: {
          snackbar: {
            message: `Login Failed: ${response.error}`,
            severity: 'error',
          },
        },
      });

      dispatch(clearErrors());
    }
  };

  return (
    <>
      {loading ? (
        <Loader message="Please wait while we load your dashboard..." />
      ) : (
        // <Container maxWidth={false} disableGutters style={{ padding: 0}}>
        //   <CustomizedSnackbars
        //     open={snackbarOpen}
        //     handleClose={handleCloseSnackbar}
        //     message={snackbarMessage}
        //     severity={severity}
        //   />
        //   <Grid container>
        //     {/* Left Section with Inputs */}
        //     <Grid item xs={12} md={5} style={{ display: 'flex', justifyContent: 'center' }}>
        //       <Box
        //         style={{
        //           padding: "20px",
        //           display: "flex",
        //           flexDirection: "column",
        //           // minHeight: "100vh",
        //           ...(isMobile ? {margin:'80px 0px 0px 0px'} : {margin:'80px 30px 0px 30px'}),
        //           alignItems: "center", // Center items horizontally
        //           justifyContent: "center",
        //           width:'100%',
        //           maxWidth:'400px'
        //         }}
        //       >
        //         <img
        //         src={agencyKineticsLogo}
        //         alt="AgencyKinetics"
        //         style={{  width:'50%',marginBottom: "10px" }}

        //       />
        //           <Paper
        //             elevation={3}
        //             style={{
        //               padding: "30px",
        //               borderRadius: "12px",
        //               width: "100%",
        //               maxWidth: "400px",
        //               display: "flex",
        //               flexDirection: "column",
        //               alignItems: "center",
        //             }}
        //           >

        //             <Typography variant="h5" style={{ color: "rgb(0, 0, 0)", marginBottom: "20px" }}>
        //               Login
        //             </Typography>

        //             {/* <GLogin/>
        //         <div style={{ marginBottom: "20px" }}></div> */}

        //             <form className="Form" onSubmit={Submit}>
        //               <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
        //                 Workspace Name
        //               </FormLabel>
        //               <TextField
        //                 hiddenLabel
        //                 variant="filled"
        //                 size="small"
        //                 required
        //                 fullWidth
        //                 style={{ marginTop: "10px", marginBottom: "10px" }}
        //                 value={workspace_name}
        //                 onChange={(e) => setWorkspace_name(e.target.value)}
        //                 inputProps={{ readOnly: readOnly }}
        //               />

        //               <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
        //                 Email Address
        //               </FormLabel>
        //               <TextField
        //                 hiddenLabel
        //                 variant="filled"
        //                 size="small"
        //                 type="email"
        //                 required
        //                 fullWidth
        //                 style={{ marginTop: "10px", marginBottom: "10px" }}
        //                 value={Email}
        //                 onChange={(e) => setEmail(e.target.value)}
        //               />

        //               <FormLabel style={{ color: "rgb(3, 2, 41)" }}>Password</FormLabel>
        //               <TextField
        //                 hiddenLabel
        //                 type={showPassword ? "text" : "password"}
        //                 variant="filled"
        //                 size="small"
        //                 required
        //                 fullWidth
        //                 style={{ marginTop: "10px", marginBottom: "10px" }}
        //                 value={Password}
        //                 onChange={(e) => setPassword(e.target.value)}
        //                 InputProps={{
        //                   endAdornment: (
        //                     <IconButton size="small" onClick={togglePasswordVisibility}>
        //                       {showPassword ? <VisibilityOff /> : <Visibility />}
        //                     </IconButton>
        //                   ),
        //                 }}
        //               />

        //               <Button
        //                 type="submit"
        //                 variant="contained"
        //                 color="primary"
        //                 fullWidth
        //                 style={{ backgroundColor: "rgb(127, 86, 217)", marginTop: "16px" }}
        //               >
        //                 Login
        //               </Button>

        //             </form>
        //             <Button style={{ color: 'rgb(127, 86, 217)' }} onClick={() => navigate(`/password/forgot`)}>Forgot Password</Button>
        //             <Button style={{ color: 'rgb(127, 86, 217)' }} onClick={() => navigate(`/signup`)}>New User? Sign Up</Button>

        //           </Paper>

        //       </Box>
        //     </Grid>
        //   </Grid>
        // </Container>

          <Container maxWidth={false} disableGutters style={{ padding: 0 }}>
            <CustomizedSnackbars
              open={snackbarOpen}
              handleClose={handleCloseSnackbar}
              message={snackbarMessage}
              severity={severity}
            />
            <Grid
              container
              style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid item xs={12} md={5} style={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: '100%',
                    maxWidth: '400px',
                  }}
                >
                  <img
                    src={agencyKineticsLogo}
                    alt="AgencyKinetics"
                    style={{ width: '50%', marginBottom: "25px" }}
                  />

                  <Paper
                    elevation={3}
                    style={{
                      padding: "30px",
                      borderRadius: "12px",
                      width: "100%",
                      maxWidth: "400px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      style={{ color: "#7501d4", marginBottom: "20px", fontWeight: "bold" }}
                    >
                      Login
                    </Typography>

                    <form className="Form" onSubmit={Submit} style={{ width: "100%" }}>
                      <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                        Workspace Name
                      </FormLabel>
                      <TextField
                        hiddenLabel
                        variant="filled"
                        size="small"
                        required
                        fullWidth
                        style={{ marginTop: "10px", marginBottom: "10px" }}
                        value={workspace_name}
                        onChange={(e) => setWorkspace_name(e.target.value)}
                        inputProps={{ readOnly: readOnly }}
                      />

                      <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                        Email Address
                      </FormLabel>
                      <TextField
                        hiddenLabel
                        variant="filled"
                        size="small"
                        type="email"
                        required
                        fullWidth
                        style={{ marginTop: "10px", marginBottom: "10px" }}
                        value={Email}
                        onChange={(e) => setEmail(e.target.value)}
                      />

                      <FormLabel style={{ color: "rgb(3, 2, 41)" }}>Password</FormLabel>
                      <TextField
                        hiddenLabel
                        type={showPassword ? "text" : "password"}
                        variant="filled"
                        size="small"
                        required
                        fullWidth
                        style={{ marginTop: "10px", marginBottom: "10px" }}
                        value={Password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <IconButton size="small" onClick={togglePasswordVisibility}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        style={{
                          backgroundColor: "#7501d4",
                          color: "#fff",
                          marginTop: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        Login
                      </Button>
                    </form>

                    <Button
                      style={{ color: "#7501d4", marginTop: "10px" }}
                      onClick={() => navigate(`/password/forgot`)}
                    >
                      Forgot Password
                    </Button>
                    <Button
                      style={{ color: "#7501d4" }}
                      onClick={() => navigate(`/signup`)}
                    >
                      New User? Sign Up
                    </Button>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Container>


      )}
    </>
  );
};

export default LoginMembers;
