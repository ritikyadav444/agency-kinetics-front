import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, deleteService, getService, getServiceDetails } from "../../actions/serviceAction.jsx";
import MetaData from "../layout/MetaData.jsx";
import { createNotification, getAllNotifications } from "../../actions/notificationAction.jsx";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate, useParams } from "react-router-dom";
import { DELETE_SERVICE_RESET } from "../../constants/serviceConstant.jsx";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Box, Breadcrumbs, Button, CardContent, CardHeader, Dialog, DialogActions, DialogContent, Divider, Grid, Modal } from "@mui/material";
import { Card, DialogTitle, Typography } from "@mui/material";
import UpdateService from "./UpdateService.jsx";
import { CircularProgress } from '@mui/material';
import DOMPurify from 'dompurify';
import service_cover from "../../Images/service_dummy.png"
import { baseURL } from "../../http.js";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const updateStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  height: 600,
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid #000',
  borderRadius: 5, // Set border radius to 0 for rectangular border
  boxShadow: 24,
  overflow:'auto',
  p: 4,
  
};

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const combined = useSelector((state) => state.logMember.combined);

  const { service, error:serviceDetailError } = useSelector(state => state.serviceDetails);
  const { error, services } = useSelector((state) => state.services);
  const { deleteError, isDeleted } = useSelector((state) => state.serviceDU);
  // console.log(service)
  
  const handleBreadcrumbClick = () => {
    navigate('/services');
  };

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (serviceId) => {
    setSelectedServiceId(serviceId);
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);


  const [selectedServiceName, setselectedServiceName] = useState('')
  const getName = async (serviceId) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/get/service/${serviceId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Services data:', data);
      setselectedServiceName(data.service.service_name)
      // console.log(selectedServiceName)
    } catch (error) {
      console.error('Error fetching services:', error.message);
    }
  };

  const handleDeleteConfirmation = (serviceId) => {
    setServiceIdToDelete(serviceId);
    setOpenConfirmDialog(true);
    getName(serviceId)

  };

  const handleDeleteService = () => {
    dispatch(deleteService(serviceIdToDelete));
    setServiceIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setServiceIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const superAdminId = combined?.superAdminId;



  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/services", {
        state: {
          snackbar: {
            message: `Service Deletion Failed as: ${deleteError}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: DELETE_SERVICE_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      navigate("/services", {
        state: {
          snackbar: {
            message: "Service Deleted Successfully",
            severity: "success"
          }
        }
      });      
      dispatch({ type: DELETE_SERVICE_RESET });
      dispatch(createNotification(combined.user._id, `Service ${selectedServiceName} Deleted Successfully`));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("INHEFERE", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Service ${selectedServiceName} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`));

      }
    }

    
    dispatch(getService()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
    
  }, [dispatch, error, isDeleted, navigate, deleteError, services.service_cover_img]);

  useEffect(() => {
      if(serviceDetailError){
       dispatch(clearErrors())
    }
    dispatch(getServiceDetails(id));
  }, [dispatch, id, serviceDetailError]);


  function formatToK(value) {
    return value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 2)}K` : value;
  }


  return (
    <div>
        <div className="btn">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none', color:'rgb(127, 86, 217)' }}>
            Services
            </Button>
            <Typography style={{color:"rgb(127, 86, 217)"}}>Service Details</Typography>
          </Breadcrumbs>
          
        </div>

        <Modal
            open={openUpdateModal}
            onClose={handleUpdateClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={updateStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Update Service
              </Typography>
              <UpdateService handleUpdateClose={handleUpdateClose} selectedServiceId={selectedServiceId} />
            </Box>
          </Modal>

          <Grid container spacing={2} style={{marginTop: '0px', marginLeft: '10px', paddingRight: '50px', marginBottom: '10px' }}>
          <Grid item xs={12} >
      
          <Card style={{backgroundColor:'rgb(245, 245, 245)'}}>
          <CardHeader
            title={'Service'}
            subheader={service.service_name}
            action={
              <>
              {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" ? (
              <Button startIcon={<EditIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)', marginRight:'8px' }} onClick={() => handleUpdateOpen(service._id)} variant="contained" type="submit"  
                >
                  Edit
                </Button>
              ) : null}
            </>
            }
          />


          <CardContent>
          <Grid container spacing={2} style={{ padding: ' 0px 20px 10px 10px', height:'430px'}}>
              {/* Left section with image */}
              <Grid item xs={5} style={{  borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '0px', display: 'flex',
                justifyContent: 'center', // Horizontally center
                alignItems: 'center', }}>
              {service && service.service_cover_img ? (
              <LazyLoadImage
                    src={service.service_cover_img}
                    alt={service.service_name}
                    effect="blur"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                  
              ):(
                <img
                        src={service_cover}
                        alt="AgencyKinetics"
                        height={140}
                        style={{ objectFit: 'cover', height: '140px', width: '100%' }}
                      />
              )}

                  </Grid>


                  <Grid
                    item
                    xs={6}
                    style={{
                      backgroundColor: 'rgb)',
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
                      <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }} >
                        Service Name
                      </Typography>
                      <Typography variant="body1" component="div" style={{ overflowWrap: 'break-word' }}>
                        {service.service_name}
                      </Typography>
                    </div>
                    <Divider overlap="rectangular" flexItem style={{ background: 'rgb(255, 255, 255)' }} />
                    <div style={{ flex: '1' }}>
                      <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                        Created On
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {new Date(service.service_createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </Typography>
                    </div>
                    <Divider overlap="rectangular" flexItem style={{ background: 'rgb(255, 255, 255)' }} />
                    <div style={{ flex: '1' }}>
                      <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                        Amount
                      </Typography>
                      {service.service_amount && service.service_amount.min && service.service_amount.max? (
                        <Typography variant="body2" style={{ marginRight: '20px', fontSize: '1rem' }}>
                        {formatToK(service.service_amount.min)} - {formatToK(service.service_amount.max)} {service.currency ? service.currency : ''}
                      </Typography>
                      ) : 
                      <Typography variant="body2" style={{ marginRight: '20px', fontSize: '1.2rem' }}>
                      {service.service_amount} {service.currency ? service.currency : ''}
                    </Typography>
                      }               
                    </div>
                    <Divider overlap="rectangular" flexItem style={{ background: 'rgb(255, 255, 255)' }} />
                    <div style={{ flex: '1' }}>
                      <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                        Duration
                      </Typography>
                      <Typography variant="body1" gutterBottom>{service.value} {service.unit}</Typography>
                    </div>
                  </Grid>
                  <Grid 
                    xs={12} 
                    style={{
                      padding: '10px',
                      marginBottom: '5px',
                      color: 'black',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ flex: '1' }}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        style={{ color: 'black', fontWeight: 'bold' }}
                      >
                        Description
                      </Typography>
                      <Typography 
                        gutterBottom 
                        variant="body2" 
                        style={{
                          maxHeight: '200px',  
                          overflowY: 'auto',   
                          overflowX: 'auto',   
                          paddingRight: '10px' 
                        }}
                      >
                        <span 
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(service.service_desc) 
                          }} 
                        />
                      </Typography>
                    </div>
                  </Grid>

                  </Grid>
                  {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER"  ? (
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button startIcon={<DeleteIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleDeleteConfirmation(service._id)} variant="contained" type="submit">
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
          Are you sure you want to delete this service?
        </DialogContent>
        <DialogActions>
          <Button 
            style={{ color: 'black' }} onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteService}
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

export default ServiceDetails;
