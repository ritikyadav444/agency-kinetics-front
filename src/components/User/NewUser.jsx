import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, createUser } from "../../actions/userAction";
import { NEW_USER_RESET } from "../../constants/userConstant";
import {
  TextField,
  Button,
  Typography,
  FormLabel,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Container, Grid, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import agencyKineticsLogo from "../../Images/agencyKineticsLogo.svg";

import Loader from "../../components/layout/Loader/Loader";
import CustomizedSnackbars from "../../snackbarToast";
import { useNavigate, useLocation } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  divider: {
    // Theme Color, or use css color in quote
    background: "rgb(255, 255, 255)",
  },
}));

const NewUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.newUser);
  // console.log("su", success)

  const [fname, setfname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleCheckboxChange = () => {
    setAgreeTerms(!agreeTerms);
  };
  const location = useLocation();

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSeverity("error");
      setSnackbarOpen(true);

      navigate("/signup", {
        state: {
          snackbar: {
            message: `Signup Failed: ${error}`,
            severity: "error",
          },
        },
      });
      dispatch(clearErrors());
    }
    if (success) {
      navigate("/verifyingPage");

      dispatch({ type: NEW_USER_RESET });
    }
  }, [dispatch, error, navigate, success]);

  const NewUserSubmitHandler = (e) => {
    e.preventDefault();
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 7 characters long, include one uppercase letter, one number, and one special character."
      );
      return;
    }
    dispatch(createUser({ fname, lname: '', email, password, workspace_name: workspace }));
    // console.log([...myForm])
    // alert.success('Verification Mail Sent')
    // history.push('/verifyingPage')
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  useEffect(() => {
    const snackbar = location.state?.snackbar;
    if (snackbar) {
      setSnackbarMessage(snackbar.message);
      setSeverity(snackbar.severity);
      setSnackbarOpen(true);
    }
    // Clear the state to avoid showing the Snackbar again on subsequent renders
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, navigate]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <Fragment>
        {loading ? (
          <Loader message="Please wait..." />
        ) : (
          // <Container maxWidth={false} disableGutters style={{ padding: 0 }}>
          //   <CustomizedSnackbars
          //     open={snackbarOpen}
          //     handleClose={handleCloseSnackbar}
          //     message={snackbarMessage}
          //     severity={severity}
          //   />
          //   <Grid container spacing={2}>
          //     <Grid
          //       item
          //       xs={12}
          //       md={5}
          //       style={{ display: "flex", justifyContent: "center" }}
          //     >
          //       <Box
          //         style={{
          //           padding: "20px",
          //           display: "flex",
          //           flexDirection: "column",
          //           alignItems: "center",
          //           justifyContent: "center",
          //           width: "100%",
          //           maxWidth: "400px",
          //         }}
          //       >
          //         <img
          //           src={agencyKineticsLogo}
          //           alt="AgencyKinetics"
          //           style={{ height: "50%", width: "50%", marginBottom: "5px" }}
          //         />

          //         <Typography
          //           variant="h5"
          //           style={{ color: "rgb(0, 0, 0)", marginBottom: "20px" }}
          //         >
          //           Sign Up
          //         </Typography>

          //         <form
          //           className="Form"
          //           onSubmit={NewUserSubmitHandler}
          //           style={{ width: "100%" }}
          //         >
          //           <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
          //             Full Name
          //           </FormLabel>
          //           <TextField
          //             variant="filled"
          //             size="small"
          //             hiddenLabel
          //             required
          //             fullWidth
          //             style={{ marginTop: "10px", marginBottom: "10px" }}
          //             value={fname}
          //             onChange={(e) => setfname(e.target.value)}
          //           />

          //           {/* <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
          //             Last Name
          //           </FormLabel>
          //           <TextField
          //             hiddenLabel
          //             variant="filled"
          //             size="small"
          //             required
          //             fullWidth
          //             style={{ marginTop: "10px", marginBottom: "10px" }}
          //             value={lname}
          //             onChange={(e) => setlname(e.target.value)}
          //           /> */}

          //           <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
          //             Email
          //           </FormLabel>
          //           <TextField
          //             variant="filled"
          //             size="small"
          //             required
          //             fullWidth
          //             hiddenLabel
          //             style={{ marginTop: "10px", marginBottom: "10px" }}
          //             value={email}
          //             onChange={(e) => setemail(e.target.value)}
          //           />

          //           <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
          //             Password
          //           </FormLabel>
          //           <TextField
          //             type={showPassword ? "text" : "password"}
          //             variant="filled"
          //             size="small"
          //             required
          //             hiddenLabel
          //             fullWidth
          //             style={{ marginTop: "10px", marginBottom: "10px" }}
          //             value={password}
          //             onChange={(e) => {
          //               setpassword(e.target.value);
          //               setPasswordError("");
          //             }}
          //             InputProps={{
          //               endAdornment: (
          //                 <IconButton
          //                   size="small"
          //                   onClick={togglePasswordVisibility}
          //                 >
          //                   {showPassword ? <VisibilityOff /> : <Visibility />}
          //                 </IconButton>
          //               ),
          //             }}
          //           />
          //           {passwordError && (
          //             <Typography
          //               color="error"
          //               variant="body2"
          //               style={{ marginTop: "5px" }}
          //             >
          //               {passwordError}
          //             </Typography>
          //           )}

          //           <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
          //             Workspace Name
          //           </FormLabel>
          //           <TextField
          //             variant="filled"
          //             size="small"
          //             required
          //             fullWidth
          //             hiddenLabel
          //             style={{ marginTop: "10px", marginBottom: "10px" }}
          //             value={workspace}
          //             onChange={(e) => setWorkspace(e.target.value)}
          //             InputProps={{
          //               endAdornment: (
          //                 <InputAdornment position="end">
          //                   @agencykinetics
          //                 </InputAdornment>
          //               ),
          //             }}
          //           />
          //             <FormControlLabel
          //               control={
          //                 <Checkbox
          //                   checked={agreeTerms}
          //                   onChange={handleCheckboxChange}
          //                   inputProps={{
          //                     "aria-label": "agree to terms and conditions",
          //                   }}
          //                   style={{ color: "rgb(127, 86, 217)" }}
          //                 />
          //               }
          //               label={
          //                 <span>
          //                   I agree to the{" "}
          //                   <a
          //                     href="https://agencykinetics.com/terms-conditions/"
          //                     target="_blank"
          //                     rel="noopener noreferrer"
          //                     style={{ color: "rgb(127, 86, 217)", textDecoration: "underline" }}
          //                   >
          //                     Terms and Conditions
          //                   </a>
          //                 </span>
          //               }
          //             />


          //           <Button
          //             type="submit"
          //             variant="contained"
          //             fullWidth
          //             disabled={!agreeTerms}
          //             style={{
          //               backgroundColor: "rgb(127, 86, 217)",
          //               marginTop: "16px",
          //             }}
          //           >
          //             Sign Up
          //           </Button>
          //         </form>
          //         <Button
          //           style={{ color: "rgb(127, 86, 217)" }}
          //           onClick={() => history.push("/login")}
          //         >
          //           Already Registered? Sign In
          //         </Button>
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
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid
            item
            xs={12}
            md={5}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Box
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "400px",
              }}
            >
              <img
                src={agencyKineticsLogo}
                alt="AgencyKinetics"
                style={{ height: "50%", width: "50%", marginBottom: "25px" }}
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
                style={{ color: "#7501d4", marginBottom: "20px" }}
              >
                Sign Up
              </Typography>

              <form
                className="Form"
                onSubmit={NewUserSubmitHandler}
                style={{ width: "100%" }}
              >
                <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                  Full Name
                </FormLabel>
                <TextField
                  variant="filled"
                  size="small"
                  hiddenLabel
                  required
                  fullWidth
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                  value={fname}
                  onChange={(e) => setfname(e.target.value)}
                />

                <FormLabel style={{ color: "rgb(3, 2, 41)" }}>Email</FormLabel>
                <TextField
                  variant="filled"
                  size="small"
                  required
                  fullWidth
                  hiddenLabel
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                />

                <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                  Password
                </FormLabel>
                <TextField
                  type={showPassword ? "text" : "password"}
                  variant="filled"
                  size="small"
                  required
                  hiddenLabel
                  fullWidth
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                  value={password}
                  onChange={(e) => {
                    setpassword(e.target.value);
                    setPasswordError("");
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton size="small" onClick={togglePasswordVisibility}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                {passwordError && (
                  <Typography
                    color="error"
                    variant="body2"
                    style={{ marginTop: "5px" }}
                  >
                    {passwordError}
                  </Typography>
                )}

                <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                  Workspace Name
                </FormLabel>
                <TextField
                  variant="filled"
                  size="small"
                  required
                  fullWidth
                  hiddenLabel
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        @agencykinetics
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeTerms}
                      onChange={handleCheckboxChange}
                      inputProps={{
                        "aria-label": "agree to terms and conditions",
                      }}
                      style={{ color: "rgb(127, 86, 217)" }}
                    />
                  }
                  label={
                    <span>
                      I agree to the{" "}
                      <a
                        href="https://agencykinetics.com/terms-conditions/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "rgb(127, 86, 217)",
                          textDecoration: "underline",
                        }}
                      >
                        Terms and Conditions
                      </a>
                    </span>
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!agreeTerms}
                  style={{
                    backgroundColor: "rgb(127, 86, 217)",
                    marginTop: "16px",
                  }}
                >
                  Sign Up
                </Button>
              </form>

              <Button
                style={{ color: "rgb(127, 86, 217)", marginTop: "10px" }}
                onClick={() => navigate("/login")}
              >
                Already Registered? Sign In
              </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>

        )}
      </Fragment>
    </div>
  );
};
export default NewUser;
