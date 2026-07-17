import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData.jsx";
import { getClientDetails, clearErrors, deleteClient, getClient} from "../../actions/clientAction.jsx";
import "./Client.css";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Breadcrumbs, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, Grid, Modal, Tooltip, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { createNotification, getAllNotifications } from "../../actions/notificationAction.jsx";
import { DELETE_CLIENT_RESET } from "../../constants/clientsConstants.jsx";
import UpdateClient from "./UpdateClient.jsx";
import { baseURL } from "../../http.js";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const updateStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  height: 500,
  boxShadow: '5px 5px 5px 5px rgba(255, 177, 0, 0.9)',
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  borderRadius: 5, // Set border radius to 0 for rectangular border
  boxShadow: 24,
  overflow:'auto',
  p: 4,
 
};


const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { combined: client, error:clientDetailError } = useSelector(state => state.clientDetails);
  // console.log(client)
  const { error, loading, combined: clients } = useSelector((state) => state.clients);
  const { error: deleteError, isDeleted } = useSelector((state) => state.clientDU);
  const combined = useSelector((state) => state.logMember.combined);

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('')

  const handleUpdateOpen = (clientId) => {
    if (!clients.find(client => client._id === clientId)) {
      dispatch(getClientDetails(clientId));
    }
    setSelectedClientId(clientId);
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);


  const [selectedClientName, setselectedClientName] = useState('')
  const getName = async (clientId) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/get/client/${clientId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch client: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Client data:', data);
      setselectedClientName(data.combined.fname + ' ' + data.combined.lname)
      // console.log(selectedClientName)
    } catch (error) {
      console.error('Error fetching Client:', error.message);
    }
  };

  const superAdminId = combined?.superAdminId;

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);

  const handleDeleteConfirmation = (clientId) => {
    // console.log(clientId)
    setClientIdToDelete(clientId);
    setOpenConfirmDialog(true);
    getName(clientId)

  };

  const handleDeleteClient = () => {
    dispatch(deleteClient(clientIdToDelete));
    setClientIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setClientIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleBreadcrumbClick = () => {
    navigate('/clients');
  };

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/clients", {
        state: {
          snackbar: {
            message: `Client Deletion Failed as: ${deleteError}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: DELETE_CLIENT_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      navigate("/clients", {
        state: {
          snackbar: {
            message: "Client Deleted Successfully",
            severity: "success"
          }
        }
      });
      dispatch({ type: DELETE_CLIENT_RESET });
      dispatch(createNotification(combined.user._id, `Client ${selectedClientName} Deleted Successfully`));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("INHEFERE", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Client ${selectedClientName} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`));

      }
    }
    dispatch(getClient()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
  }, [dispatch, error, isDeleted, deleteError, navigate]);

  useEffect(() => {
      if(clientDetailError){
       dispatch(clearErrors())
    }
    dispatch(getClientDetails(id));
  }, [dispatch, id, clientDetailError]);

  return (
    <div>
        <div className="btn">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none', color:'rgb(127, 86, 217)' }}>
            Clients
            </Button>
            <Typography color="rgb(127, 86, 217)">Client Details</Typography>
          </Breadcrumbs>
          </div>

          <Modal
            open={openUpdateModal}
            onClose={handleUpdateClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={updateStyle}>
              <Typography id="modal-modal-title" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center'  }} variant="h6" component="h2">
                Update Client
              </Typography>
              <UpdateClient handleUpdateClose={handleUpdateClose} selectedClientId={selectedClientId} />
            </Box>
          </Modal>



      <Grid container spacing={2} style={{marginTop:'10px', marginLeft:'10px', paddingRight:'50px', paddingBottom:'10px'}}>
        <Grid item xs={12}>
          <Card style={{backgroundColor:'rgb(245, 245, 245)'}}>
            <CardHeader
                title={<div style={{ display: 'flex', alignItems: 'center' }}>
                Client
              </div>}
              subheader={client.companyname ? client.companyname : ""}
                action={
                  <>           
                    <Button startIcon={<EditIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleUpdateOpen(client._id)} variant="contained" type="submit" 
                    >
                      Edit
                    </Button>
                </>
                }
              />
                
            <CardContent>
                <Grid container spacing={2} style={{ padding: '10px', paddingRight:'10px' }}>
                  
                <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Name
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                    {client.fname} {client.lname}

                    </Typography>
                  </Grid>

                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginLeft: '5px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Email
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                    {client.email}

                    </Typography>
                  </Grid>
                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginTop: '5px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Created On
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </Typography>
                  </Grid>

                </Grid>
                
              </CardContent>


            <Divider></Divider>

            <CardHeader
            title={'To'}
            />
              <CardContent>
              <Grid container spacing={2} style={{ padding: '10px', paddingRight:'10px' }}>

                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Address
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                    {`${client.city ? client.city + ', ' : ''}`}
                    {`${client.state ? client.state + ', ' : ''}`}
                    {`${client.country ? client.country + ', ' : ''}`}
                    {`${client.postalCode ? client.postalCode : ''}`}
                    </Typography>
                  </Grid>
                  </Grid>
                 
                  {combined.user.role === "SUPERADMIN"  ? (
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button startIcon={<DeleteIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleDeleteConfirmation(client._id)} variant="contained" type="submit">
                      Delete
                    </Button>

                   </div>
                 ) : null}
                  
              </CardContent>
              

            

          </Card>
        </Grid>
      </Grid>
      
    <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle style={{ color: '#d11a2a' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this client?
        </DialogContent>
        <DialogActions>
          <Button 
            style={{ color: 'black' }} onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteClient}
            variant="contained"
            color="error"
            style={{ backgroundColor: '#d11a2a', color: 'white' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};
export default ClientDetails