import React, { Fragment, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_PASSWORD_RESET } from "../constants/userConstant";
import { updatePassword, clearErrors } from "../actions/userAction";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Grid, IconButton, InputLabel, TextField, Typography } from "@mui/material";
import MetaData from "../components/layout/MetaData";
import { createNotification } from "../actions/notificationAction";

const UpdatePassword = ({ handleUpdateClose, combined }) => {
  const userId = combined.user._id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  const { error, isUpdated, loading } = useSelector((state) => state.userDU);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const updatePasswordSubmit = (e) => {
    e.preventDefault();

    let isValid = true;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;

    if (!passwordRegex.test(newPassword)) {
      setPasswordError("Password must be at least 7 characters long, include one uppercase letter, one number, and one special character.");
      isValid = false;
    } else {
      setPasswordError(""); // Clear any previous error
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError(""); // Clear any previous error
    }

    if (!isValid) return;

    const myForm = new FormData();
    myForm.set("oldPassword", oldPassword);
    myForm.set("newPassword", newPassword);
    myForm.set("confirmPassword", confirmPassword);

    dispatch(updatePassword(myForm));
  };

  useEffect(() => {
    if (error) {
      // console.log(error);
      handleUpdateClose();
      navigate("/profile", {
        state: {
          snackbar: {
            message: `Password Updation Failed as: ${error}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: UPDATE_PASSWORD_RESET });
      dispatch(clearErrors());
    }

    if (isUpdated) {
      handleUpdateClose();
      navigate("/profile", {
        state: {
          snackbar: {
            message: "Password Updated Successfully",
            severity: "success"
          }
        }
      });
      dispatch({ type: UPDATE_PASSWORD_RESET });
      dispatch(createNotification(userId, `Password Updated Successfully`));
    }
  }, [dispatch, error, navigate, isUpdated, userId, handleUpdateClose]);

  return (
    <div>
      <MetaData title="Update Password" />
      <form
        className="updatePasswordForm"
        encType="multipart/form-data"
        onSubmit={updatePasswordSubmit}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <InputLabel id="oldPassword-label" style={{ marginTop: '20px' }}>Old Password</InputLabel>
            <TextField
              label="Old Password"
              placeholder="Old Password"
              type={showOldPassword ? "text" : "password"}
              variant="filled"
              margin='none'
              required
              fullWidth
              style={{ marginBottom: "10px" }}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => togglePasswordVisibility('old')}>
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <InputLabel id="newPassword-label">New Password</InputLabel>
            <TextField
              label="New Password"
              placeholder="New Password"
              type={showNewPassword ? "text" : "password"}
              variant="filled"
              margin='none'
              required
              fullWidth
              style={{ marginBottom: "10px" }}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError('');
              }}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => togglePasswordVisibility('new')}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            {passwordError && (
              <Typography color="error" variant="body2" style={{ marginTop: "5px" }}>
                {passwordError}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={12}>
            <InputLabel id="confirmPassword-label">Confirm New Password</InputLabel>
            <TextField
              label="Confirm New Password"
              placeholder="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              variant="filled"
              margin='none'
              required
              fullWidth
              style={{ marginBottom: "10px" }}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError('');
              }}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => togglePasswordVisibility('confirm')}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            {confirmPasswordError && (
              <Typography color="error" variant="body2" style={{ marginTop: "5px" }}>
                {confirmPasswordError}
              </Typography>
            )}
          </Grid>
        </Grid>

        <div style={{ textAlign: 'center', marginTop: '20px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <Button
            id="updatePassBtn"
            type="submit"
            disabled={loading ? true : false}
            variant="contained"
            color="primary"
            style={{ backgroundColor: 'rgb(105, 56, 239)' }}
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;
