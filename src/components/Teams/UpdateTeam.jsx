import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTeamDetails ,clearErrors, updateTeam, getTeams} from '../../actions/teamAction';
import { UPDATE_TEAM_RESET } from '../../constants/teamConstants';
import { Autocomplete, Button, InputLabel, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { CircularProgress } from '@mui/material';


const UpdateTeam = ({handleUpdateClose, selectedTeamId}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const {loading, error:updateError, isUpdated} = useSelector((state)=>state.teamDU)
    const { error:teamDetailError, combined } = useSelector((state) => state.teamDetails);
    // console.log("orcombined",combined)
    const [role , setrole] = useState("");

    const combinedLog = useSelector((state) => state.logMember.combined);
    const formatRole = (role) => {
      switch (role) {
        case 'ASSIGNEE':
          return 'Assignee';
        case 'PROJECTMANAGER':
          return 'Project Manager';
        case 'ADMIN':
          return 'Admin';
        case 'SUPERADMIN':
          return 'Super Admin';
          case 'CLIENT':
            return 'Client';
        default:
          return role;
      }
    };
    const userRole = formatRole(combinedLog.user.role)
    // console.log(userRole) 

  const superAdminId = combined?.superAdminId;
  
  const teamId = selectedTeamId;
  useEffect(() => {
    if(teamDetailError){
     dispatch(clearErrors())
  }
      
  dispatch(getTeamDetails(teamId));
}, [dispatch, teamId, teamDetailError]);


  useEffect(() => {
    // if(combined && combined._id !==teamId){
    //     dispatch(getTeamDetails(teamId));
    // }else{
      var combinedRole = combined.role
      if (combinedRole === 'ASSIGNEE'){
        combinedRole = 'Assignee'
      }
      else if (combinedRole === 'PROJECTMANAGER'){
        combinedRole = 'Project Manager'
      } 
      else if (combinedRole === 'ADMIN'){
        combinedRole = 'Admin'
      }
      
        setrole(combinedRole);


    // }
    if (teamDetailError) {
      navigate("/teams", {
        state: {
          snackbar: {
            message: "Member Details Not Found",
            severity: "error"
          }
        }
      });
      dispatch(clearErrors());
    }
     if (updateError) {
      handleUpdateClose()
      // alert.success("Client Created Successfully");
      // navigate("/clients");
      navigate("/teams", {
        state: {
          snackbar: {
            message: "Member Updation Failed",
            severity: "error"
          }
        }
      });
      dispatch({ type: UPDATE_TEAM_RESET });
      dispatch(getTeams());

      dispatch(clearErrors());
    }

    if (isUpdated) {
      handleUpdateClose()
      // alert.success("Team Updated Successfully");
      navigate("/teams", {
        state: {
          snackbar: {
            message: "Member Updated Successfully",
            severity: "success"
          }
        }
      });
      dispatch({ type: UPDATE_TEAM_RESET });
      // history.push("/teams");


      dispatch(createNotification(combinedLog.user._id, `Member ${combined.email} Updated Successfully to ${role}`));
      // console.log(combined, userRole)
      if (userRole !== 'SUPERADMIN'){
        // console.log("SuperAdmin from UpdateTeam", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Member ${combined.email} Updated Successfully to ${role} By ${combinedLog.user.fname} ${combinedLog.user.lname}`));
      }
      dispatch(getTeams()).then(() => {
        dispatch(getAllNotifications(combinedLog.user._id));
      });

    }
  }, [dispatch, teamDetailError, isUpdated, updateError, combined, teamId]);

  const updateTeamSubmitHandler = (e) => {
    e.preventDefault();

    const myForm = new FormData();

    myForm.set("role", role.toUpperCase().replace(/\s/g, ''));


    dispatch(updateTeam( teamId,myForm));
  };
  return (
    <div>
    <div style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
      {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </div>
        )}
      {/* <div className="newProductContainer"> */}
        <form
          // className="createProductForm"
          encType="multipart/form-data"
          onSubmit={updateTeamSubmitHandler}
        >
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


          <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Button
                  id="createOrderBtn"
                  type="submit"
                  // disabled={loading}
                  variant="contained"
                  color="primary"
                  style={{ backgroundColor: 'rgb(105, 56, 239)' }}
                >
                  Update
                </Button>
              </div>
        </form>
      </div>
     </div>
  )
}




export default UpdateTeam