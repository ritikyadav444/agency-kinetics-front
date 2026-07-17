import React, {useEffect, useState} from 'react'
import {  useDispatch, useSelector } from 'react-redux'
import { createTeam,clearErrors, getTeams } from '../../actions/teamAction';
import { NEW_TEAM_RESET } from '../../constants/teamConstants';
import "./Team.css"
import { TextField, Button, Grid } from '@mui/material';
import { InputLabel, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { CircularProgress } from '@mui/material';


const NewTeam = ({ handleClose }) => {
  const dispatch = useDispatch();
  const {loading, error, success} = useSelector((state)=>state.newTeam)
  // console.log("su", success)
  const navigate = useNavigate()
  const [email , setemail]=useState("");
  const [role, setrole] = useState("");
  // const [workspace_name , setworkspace_name]=useState("");
  const workspace_name = useSelector((state) => state.logMember.workspace_name);


  const combined = useSelector((state) => state.logMember.combined);

  const superAdminId = combined?.superAdminId;
  
  useEffect(() => {
    if (error) {
      handleClose()
      // navigate("/clients");
      navigate("/teams", {
        state: {
          snackbar: {
            message: `New Member Creation Failed as: ${error}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: NEW_TEAM_RESET });
      dispatch(getTeams());

      dispatch(clearErrors());
    }

    if(success) {
      handleClose()
      // alert.success("Team Created Successfully");
      // navigate("/teams");
      navigate("/teams", {
        state: {
          snackbar: {
            message: "New Member Invited Successfully",
            severity: "success"
          }
        }
      });
      dispatch({ type: NEW_TEAM_RESET });

      dispatch(createNotification(combined.user._id, `New Member ${email} with Role ${role} Invited Successfully`));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("SuperAdmin from UpdateTeam", superAdminId)
        dispatch(createNotification(superAdminId?._id, `New Member ${email} with Role ${role} Invited Successfully By ${combined.user.fname} ${combined.user.lname}`));
      }
      dispatch(getTeams()).then(() => {
        dispatch(getAllNotifications(combined.user._id));
      });
    }
  }, [dispatch, error, navigate, success]);

  const createTeamMemberSubmitHandler = (e) => {
    e.preventDefault();

    dispatch(createTeam({ email, role: role.toUpperCase().replace(/\s/g, ''), workspace_name, isTeamMember: true }));
  };
  
  return (
    <div>
        <div style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
      {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </div>
        )}
          <form
            className="createTeamForm"
            encType="multipart/form-data"
            onSubmit={createTeamMemberSubmitHandler}
          >
            {/* <h1>Create Team</h1> */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
              <InputLabel id="email-label" style={{marginTop:'20px'}}>Email</InputLabel>

                  <TextField
                    type="email"
                    label="Email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setemail(e.target.value)}
                    fullWidth
                    variant="filled"
                    margin="none"
                    required
                  />
              </Grid>

              <Grid item xs={12}>
              <InputLabel id="role-label" style={{marginTop:'20px'}}>Role</InputLabel>
              <Autocomplete
                  fullWidth
                  disablePortal
                  value={role}
                  onChange={(event, newValue) => {
                    setrole(newValue);
                  }}
                  id="Role"
                  options={['Admin', 'Project Manager', 'Assignee']}
                  noOptionsText="Select Role"
                  getOptionLabel={(option) => option}
                  // isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      label="Select Role"
                      variant="filled"
                    />
                  )}
                />

          
              </Grid>

            </Grid>

            <div style={{ textAlign: 'center', marginTop: '80px' }}>
                <Button
                  id="createOrderBtn"
                  type="submit"
                  // disabled={loading}
                  variant="contained"
                  color="primary"
                  style={{ backgroundColor: 'rgb(105, 56, 239)' }}
                >
                  Create
                </Button>
              </div>
                                              
          </form>
        </div>
     </div>
  )
}

export default NewTeam