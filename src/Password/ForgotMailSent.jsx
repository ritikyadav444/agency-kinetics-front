import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography, useMediaQuery } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import agencyKineticsLogo from "../Images/agencyKineticsLogo.svg";

const ForgotMailSent = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Container
      maxWidth={false}
      disableGutters
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "450px",
          width: "100%",
        }}
      >
        <img
          src={agencyKineticsLogo}
          alt="AgencyKinetics"
          style={{ width: "50%", marginBottom: "20px" }}
        />

        <MarkEmailReadIcon
          style={{ fontSize: "64px", color: "rgb(127, 86, 217)", marginBottom: "16px" }}
        />

        <Typography variant="h5" style={{ marginBottom: "12px", fontWeight: 600 }}>
          Check Your Email
        </Typography>

        <Typography variant="body1" style={{ color: "#666", marginBottom: "32px" }}>
          We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          style={{ backgroundColor: "rgb(127, 86, 217)", marginBottom: "12px" }}
          onClick={() => navigate("/password/forgot")}
        >
          Resend Email
        </Button>

        <Button
          style={{ color: "rgb(127, 86, 217)" }}
          onClick={() => navigate("/login")}
        >
          Back to Login
        </Button>
      </Box>
    </Container>
  );
};

export default ForgotMailSent;
