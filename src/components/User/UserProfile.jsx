import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Box, Button, CardContent, CardHeader, Divider, Grid, Modal } from "@mui/material";
import { Card, Typography } from "@mui/material";
import { logoutMember } from '../../actions/loginAction';
import DOMPurify from 'dompurify';
import default_img from "../../Images/default_image-removebg-preview.png";
import default_company_img from "../../Images/default_company_image.jpg"
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import UpdatePassword from "../../Password/UpdatePassword.jsx";
import CustomizedSnackbars from "../../snackbarToast.jsx";
import UpdateUser from "./UpdateUser.jsx";
import { SET_AUTHENTICATION, SET_SIDEBAR_VISIBILITY } from "../../constants/loginConstants.jsx";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';

const updateStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  height: 600,
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  borderRadius: 5,
  boxShadow: 24,
  overflow:'auto',
  p: 4,
  
};

const UserProfile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const { combined} = useSelector((state) => state.logMember);
    // console.log("user logged", combined)
  
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

  const name = combined.user.fname + ' ' + combined.user.lname
  const role = formatRole(combined.user.role)
  const loggedInid = combined.user._id
  // console.log(loggedInid)
  const createdOn = new Date(combined.user.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });

  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('');
  

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedId, setSelectedId] = useState('')
  const handleUpdateOpen = () => {
    setOpenUpdateModal(true);
  
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [openUpdateProfileModal, setOpenUpdateProfileModal] = useState(false);
  const handleUpdateProfile = (loggedin_id) => {
    setSelectedId(loggedin_id);
    // console.log(loggedin_id, selectedId)
    setOpenUpdateProfileModal(true);
  };
  const handleUpdateProfileClose = () => setOpenUpdateProfileModal(false);

  const [openDialog, setOpenDialog] = useState(false);

  const handleLogoutClick = () => {
    setOpenDialog(true); // Open the confirmation dialog
    // handleProfileMenuClose();

  };

  const handleLogoutConfirmed = () => {
    setOpenDialog(false); // Close the confirmation dialog
    handleLogout(); // Call logout function
  };

  const handleLogoutCancelled = () => {
    setOpenDialog(false); 
  };
  
  const handleLogout = async () => {
    dispatch({ type: SET_SIDEBAR_VISIBILITY, payload: false })
    dispatch({ type: SET_AUTHENTICATION, payload: false })
    dispatch(logoutMember());
    navigate('/login')
  };


  const superAdminId = combined?.superAdminId;



  useEffect(() => {
    const snackbar = location.state?.snackbar;
    if (snackbar) {
      setSnackbarMessage(snackbar.message);
      setSeverity(snackbar.severity);
      setSnackbarOpen(true);
    }
    // Clear the state to avoid showing the Snackbar again on subsequent renders
    navigate(location.pathname + location.search, { replace: true, state: undefined });
  }, [location.pathname, location.search, location.state, navigate]);

  

  
  return (
    <div>

        <CustomizedSnackbars
          open={snackbarOpen}
          handleClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          severity={severity}
        />

          <Modal
            open={openUpdateProfileModal}
            onClose={handleUpdateProfileClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={updateStyle}>
                  <Typography id="modal-modal-title" variant="h6" component="h2" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center' }}>
                    Update Your Details
                  </Typography>
                  <UpdateUser handleUpdateClose={handleUpdateProfileClose} selectedUserId={selectedId} />
              </Box>
          </Modal>

        <Modal
            open={openUpdateModal}
            onClose={handleUpdateClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={updateStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center'}}>
                Update Password
              </Typography>

              <UpdatePassword handleUpdateClose={handleUpdateClose} combined={combined} />
            </Box>
          </Modal>
          <Grid container spacing={2} style={{ marginTop: '0px', marginLeft: '10px', paddingRight: '50px', marginBottom: '10px' }}>
          <Grid item xs={12}>
            <Card style={{ backgroundColor: 'rgb(245, 245, 245)', height: '600px' }}>
              <CardHeader
                title={'User'}
                action={
                  <>
                    <Button
                      startIcon={<EditIcon />}
                      style={{ backgroundColor: 'rgb(127, 86, 217)', marginRight: '8px' }}
                      onClick={() => handleUpdateProfile(loggedInid)}
                      variant="contained"
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<LogoutIcon />}
                      style={{ backgroundColor: 'rgb(127, 86, 217)' }}
                      variant="contained"
                      onClick={handleLogoutClick}
                    >
                      Logout
                    </Button>
                  </>
                }
              />
              <CardContent>
                <Grid container spacing={2} style={{ padding: '0px 20px 10px 10px', height: '250px' }}>
                  {/* Left section with image and user details */}
                  <Grid item xs={8} style={{ borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                    
                  <Grid item xs={5} style={{  borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '0px', display: 'flex',
                    justifyContent: 'center', // Horizontally center
                    alignItems: 'center', }}>
                {combined.user && combined.user.profile_img? (
                      <LazyLoadImage
                        src={combined.user.profile_img}
                        alt={combined.user.fname}
                        effect="blur"
                        style={{ objectFit: 'cover', maxWidth: '250px', maxHeight: '250px', justifyContent: 'center', borderRadius:'50%', height:'100%', width:'100%' }}
                      />
                      
                    ) : (
                      <img
                        src={default_img}
                        alt="AgencyKinetics"
                        // style={{ objectFit: 'cover', height: '140px', width: '100%' }}
                        style={{ objectFit: 'cover', maxWidth: '250px', maxHeight: '200px', justifyContent: 'center' }}

                      />
                    )}

                      </Grid>

                      <Grid
                        item
                        xs={6}
                        style={{
                          backgroundColor: '',
                          borderRadius: '10px',
                          padding: '10px',
                          marginLeft: '5px',
                          marginBottom: '5px',
                          color: 'black',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <div style={{ flex: '1' }}>
                          <Typography variant="subtitle1" component="div" style={{fontWeight:'bold'}} >
                            Name
                          </Typography>
                          <Typography variant="body1" component="div" style={{ overflowWrap: 'break-word' }}>
                            {name}
                          </Typography>
                        </div>
                        <Divider overlap="rectangular" flexItem style={{ background: 'rgb(255, 255, 255)' }} />
                        <div style={{ flex: '1' }}>
                        <Typography variant="subtitle1" component="div" style={{fontWeight:'bold'}}>
                            Created On
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {createdOn}
                          </Typography>
                        </div>
                        <Divider overlap="rectangular" flexItem style={{ background: 'rgb(255, 255, 255)' }} />
                        <div style={{ flex: '1' }}>
                          <Typography variant="subtitle1" component="div" style={{fontWeight:'bold'}}>
                            Role
                          </Typography>
                          <Typography variant="body1" gutterBottom>{role}</Typography>
                        </div>
                        
                      </Grid>
                  </Grid>

                  {/* Right section with company image and name */}
                  <Grid item xs={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  {superAdminId && superAdminId.company_img ? (
                      <LazyLoadImage
                        src={superAdminId.company_img}
                        alt="Company Logo"
                        effect="blur"
                        style={{ objectFit: 'cover', height: '150px', width: '100%', maxWidth:'200px'}}
                      />
                    ) : (
                      <img
                        src={default_company_img} // Replace with your default company image path
                        alt="Please add your company name and logo"
                        style={{ objectFit: 'fill', maxHeight: '150px', maxWidth: '250px' }}
                      />
                    )}
                    <div style={{ marginTop: '10px', textAlign: 'center', maxWidth: '250px' }}>
                      <Typography variant="subtitle1" component="div" style={{ fontWeight: 'bold' }}>
                        Company Name
                      </Typography>
                      <Typography variant="body1" component="div" style={{ overflowWrap: 'break-word' }}>
                        {superAdminId?.company_SuperName || 'Please add your company name'}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </CardContent>

              <CardHeader
                title={'Credentials'}
                action={
                  <>
                  <Button startIcon={<ChangeCircleIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)', marginRight:'8px' }} onClick={() => handleUpdateOpen(combined._id)} variant="contained" type="submit"  
                    >
                      Change Password
                    </Button>
                </>
                }
              />

              <CardContent>
                <Grid container spacing={2} style={{ padding: '0px 20px 10px 10px' }}>
                  <Grid
                    item
                    xs={12}
                    style={{
                      borderRadius: '10px',
                      padding: '10px',
                      marginLeft: '5px',
                      marginBottom: '5px',
                      color: 'black',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: '150px'
                    }}
                  >
                    <div style={{ flex: '1' }}>
                      <Typography variant="subtitle1" style={{fontWeight:'bold'}}>Email</Typography>
                      <Typography variant="body1" gutterBottom>
                        {combined.user ? combined.user.email : 'N/A'}
                      </Typography>
                    </div>
                    <Divider style={{ background: 'rgb(255, 255, 255)' }} />
                    <div style={{ flex: '1' }}>
                      <Typography variant="subtitle1" style={{fontWeight:'bold'}}>Workspace Name</Typography>
                      <Typography gutterBottom variant="body1">
                        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(combined.workspace_name) }} />
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

    <Dialog open={openDialog} onClose={handleLogoutCancelled}>
        <DialogTitle style={{ color: '#d11a2a' }}>Confirm Logout</DialogTitle>
        <DialogContent>
        <DialogContentText style={{color:'black'}}>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button style={{color:'black'}} onClick={handleLogoutCancelled} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirmed} variant="contained"
            color="error"
            style={{ backgroundColor: '#d11a2a', color: 'white' }}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
     
    </div>
  );
};



export default UserProfile;