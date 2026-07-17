import React, { Fragment, useState, useEffect } from "react";
import "./ForgotPassword.css";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearErrors } from "../actions/userAction";
import login from "../Images/login.png";
import agencyKineticsLogo from "../Images/agencyKineticsLogo.svg";

import {
  TextField,
  Button,
  Typography,
  FormLabel,
  Input,
  Icon,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Container, Divider, Grid, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Loader from "../components/layout/Loader/Loader";
import { FORGOT_PASSWORD_RESET } from "../constants/userConstant";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  divider: {
    // Theme Color, or use css color in quote
    background: "rgb(255, 255, 255)",
  },
}));

const ForgotPassword = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();

  const classes = useStyles();

  const dispatch = useDispatch();

  const { error, message, loading } = useSelector(
    (state) => state.forgotpassword
  );
  // console.log("message", message)
  const [email, setEmail] = useState("");
  const [workspace_name, setWorkspaceName] = useState("");

  const forgotPasswordSubmit = (e) => {
    e.preventDefault();

    dispatch(forgotPassword({ email, workspace_name }));
  };

  useEffect(() => {
    if (error) {
      // console.log(error)
      dispatch(clearErrors());
    }

    if (message) {
      // alert.success(message);
      navigate("/forgotMailSent");
      dispatch({ type: FORGOT_PASSWORD_RESET });
    }
  }, [dispatch, error, message]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Container maxWidth={false} disableGutters style={{ padding: 0 }}>
          <Grid container>
            {/* Left Section with Inputs */}
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
                  style={{ color: "rgb(0, 0, 0)", marginBottom: "40px" }}
                >
                  Forgot Password
                </Typography>

                <form
                  className="Form"
                  onSubmit={forgotPasswordSubmit}
                  style={{ width: "100%" }}
                >
                  <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                    Workspace Name
                  </FormLabel>
                  <TextField
                    type="text"
                    variant="filled"
                    size="small"
                    required
                    fullWidth
                    hiddenLabel
                    style={{ marginTop: "10px", marginBottom: "10px" }}
                    value={workspace_name}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />

                  <FormLabel style={{ color: "rgb(3, 2, 41)" }}>
                    Email Address
                  </FormLabel>
                  <TextField
                    type="email"
                    variant="filled"
                    size="small"
                    required
                    fullWidth
                    hiddenLabel
                    style={{ marginTop: "10px", marginBottom: "10px" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    style={{
                      backgroundColor: "rgb(127, 86, 217)",
                      marginTop: "16px",
                    }}
                  >
                    Send Mail
                  </Button>
                </form>

                <Button
                  style={{ color: "rgb(127, 86, 217)", marginTop: "20px" }}
                  onClick={() => navigate("/login")}
                >
                  Back
                </Button>
              </Box>
            </Grid>

            {!isMobile && (
              <Divider
                orientation="vertical"
                flexItem
                style={{ height: "auto", alignSelf: "stretch" }}
              />
            )}

            {/* Right Section with Image */}
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

export default ForgotPassword;
