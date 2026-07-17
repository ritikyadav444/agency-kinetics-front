import React, { Fragment, useState, useEffect } from "react";
import "./ResetPassword.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { resetPassword, clearErrors } from "../actions/userAction";
import login from "../Images/login.png";
import agencyKineticsLogo from "../Images/agencyKineticsLogo.svg";

import {
  TextField,
  Button,
  Typography,
  FormLabel,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Container, Divider, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Loader from "../components/layout/Loader/Loader";
import { RESET_PASSWORD_RESET } from "../constants/userConstant";
import { useNavigate, useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  divider: {
    background: "rgb(255, 255, 255)",
  },
}));

const ResetPassword = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  const { resetToken } = useParams();

  const dispatch = useDispatch();
  const classes = useStyles();
  const { error, success, loading } = useSelector(
    (state) => state.forgotpassword
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetPasswordSubmit = (e) => {
    e.preventDefault();

    // const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;

    if (!password || !confirmPassword) {
      return;
    }
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 7 characters long, include one uppercase letter, one number, and one special character."
      );
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    dispatch(resetPassword(resetToken, { password, confirmPassword }));
  };

  useEffect(() => {
    if (error) {
      navigate("/login");
      dispatch({ type: RESET_PASSWORD_RESET });
    }
    if (success) {
      toast.success("Password Updated Successfully");
      navigate("/");
      dispatch({ type: RESET_PASSWORD_RESET });
    }
  }, [dispatch, error, navigate, success]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Container maxWidth={false} disableGutters style={{ padding: 0 }}>
          <Grid container>
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
                  // minHeight: "100vh",
                  ...(isMobile
                    ? { margin: "80px 0px 0px 0px" }
                    : { margin: "80px 30px 0px 30px" }),
                  alignItems: "center", // Center items horizontally
                  justifyContent: "center",
                  width: "100%",
                  maxWidth: "400px",
                }}
              >
                <img
                  src={agencyKineticsLogo}
                  alt="AgencyKinetics"
                  style={{ width: "50%", marginBottom: "10px" }}
                />
                <Typography
                  variant="h5"
                  style={{ color: "rgb(0, 0, 0)", marginBottom: "20px" }}
                >
                  Set New Password
                </Typography>

                <form className="Form" onSubmit={resetPasswordSubmit}>
                  <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                    New Password
                  </FormLabel>
                  <TextField
                    type={showPassword ? "text" : "password"}
                    variant="filled"
                    size="small"
                    required
                    fullWidth
                    style={{ marginTop: "10px", marginBottom: "10px" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                    helperText={passwordError}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />

                  <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                    Confirm Password
                  </FormLabel>
                  <TextField
                    type={showPassword ? "text" : "password"}
                    variant="filled"
                    size="small"
                    required
                    fullWidth
                    style={{ marginTop: "10px", marginBottom: "10px" }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!confirmPasswordError}
                    helperText={confirmPasswordError}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{
                      backgroundColor: "rgb(127, 86, 217)",
                      marginTop: "16px",
                    }}
                  >
                    Confirm
                  </Button>
                </form>
              </Box>
            </Grid>

            {!isMobile && (
              <Divider
                orientation="vertical"
                flexItem
                style={{ height: "auto", alignSelf: "stretch" }}
              />
            )}

            <Grid
              item
              xs={12}
              md={6}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                style={{
                  // padding: "20px",
                  display: "flex",
                  flexDirection: "column",

                  ...(isMobile
                    ? { minHeight: "10vh" }
                    : { minHeight: "100vh" }),
                  ...(isMobile
                    ? { alignItems: "center" }
                    : { alignItems: "flex-end" }),
                  // alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={login}
                  alt="Login"
                  style={{ maxWidth: "75%", maxHeight: "75%" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      )}
    </Fragment>
  );
};

export default ResetPassword;
