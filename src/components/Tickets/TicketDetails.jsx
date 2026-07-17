import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, deleteTicket, getTicketDetails, getTickets } from "../../actions/ticketAction.jsx";
import { createNotification, getAllNotifications } from "../../actions/notificationAction.jsx";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Divider from '@mui/material/Divider';
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Breadcrumbs, Typography, Box, Modal, Grid, Card, CardHeader, Tooltip, Fade, CardContent } from '@mui/material';
import UpdateTicket from "./UpdateTicket.jsx";
import { DELETE_TICKET_RESET } from "../../constants/ticketConstants.jsx";
import DOMPurify from 'dompurify';
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
  // backgroundColor: 'rgba(255, 255, 255, 0.9)',
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  borderRadius: 5,
  boxShadow: 24,
  overflow:'auto',
  p: 4,
  
};

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { ticket, error:ticketDetailError } = useSelector(state => state.ticketDetails);
  const {error} = useSelector((state)=>state.tickets)
  const { deleteError, isDeleted } = useSelector((state) => state.ticketDU);
  // console.log(ticket)
  const combined = useSelector((state) => state.logMember.combined);
  const name = combined.user.fname + ' ' + combined.user.lname
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
  const role = formatRole(combined.user.role)
  // console.log(role) 

  const [teamNamesMap, setTeamNamesMap] = useState({});
  const [orderNamesMap, setOrderNamesMap] = useState({});
  const [clientNamesMap, setClientNamesMap] = useState({});

  const handleBreadcrumbClick = () => {
    navigate('/tickets');
  };

  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const handleUpdateOpen = (ticketId) => {
    // Store the selected ticketId in the state or perform any other actions you need
    setSelectedTicketId(ticketId);

    // Open the update modal
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);


  const superAdminId = combined?.superAdminId;

  const [selectedClientFromTicket, setselectedClientFromTicket] = useState('')

  const getName = async (ticketId) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/ticket/${ticketId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Tickets data:', data);
      setselectedClientFromTicket(data.ticket.client_name)

    } catch (error) {
      console.error('Error fetching tickets:', error.message);
    }
  };

  const [deletedTicket, setDeletedTicket] = useState(null);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [ticketIdToDelete, setTicketIdToDelete] = useState(null);



  const handleDeleteConfirmation = (ticketId) => {
    setTicketIdToDelete(ticketId);
    setOpenConfirmDialog(true);
    setDeletedTicket(ticketId)
    getName(ticketId)
  };

  const handleDeleteTicket = () => {
    dispatch(deleteTicket(ticketIdToDelete));
    setTicketIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setTicketIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const [loadingAssigneeDetails, setLoadingAssigneeDetails] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const fetchTeamData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/getAllExceptClient`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch teams: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Teams data:', data);

        const teamMap = {};
          data.combined.forEach((combined) => {
            const fname = combined.fname || '';
            const lname = combined.lname || '';
            const fullName = fname && lname ? `${fname} ${lname}` : '';
            teamMap[combined._id] = fullName;
          });

        // console.log(clientMap)
        setTeamNamesMap(teamMap);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching teams:', error.message);
      } finally {
        setLoadingAssigneeDetails(false)
      }
    };
    fetchTeamData();
    return () => controller.abort();
  }, []);

  const [loadingClientDetails, setLoadingClientDetails] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const fetchClientData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/combined/getAllClient`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Clients data:', data);

        const clientMap = {};
        data.combined.forEach((combined) => {
          clientMap[combined._id] = combined.fname + ' ' + combined.lname;
        });
        // console.log(clientMap)
        setClientNamesMap(clientMap);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching clients:', error.message);
      } finally {
        setLoadingClientDetails(false)
      }
    };
    fetchClientData();
    return () => controller.abort();
  }, []);

  const [loadingOrderDetails, setLoadingOrderDetails] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/orders`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Orders data:', data);

        const orderMap = {};
        data.orders.forEach((order) => {
          orderMap[order._id] = order.orderId;
        });
        // console.log(orderMap)
        setOrderNamesMap(orderMap);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching clients:', error.message);
      } finally {
        setLoadingOrderDetails(false)
      }
    };
    fetchOrderData();
    return () => controller.abort();
  }, []);

  useEffect(() => {

    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/tickets", {
        state: {
          snackbar: {
            message: `Ticket Deletion Failed as: ${deleteError}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: DELETE_TICKET_RESET });
      dispatch(clearErrors());
    }

    if (isDeleted) {
      navigate("/tickets", {
        state: {
          snackbar: {
            message: "Ticket Deleted Successfully",
            severity: "success"
          }
        }
      });      
      dispatch({ type: DELETE_TICKET_RESET });
      dispatch(createNotification(combined.user._id, `Ticket #${deletedTicket.slice(-4)} Deleted Successfully`));
      dispatch(createNotification(selectedClientFromTicket, `Ticket #${deletedTicket.slice(-4)} Deleted By ${role}: ${name}`));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("SuperAdmin from UpdateTicket", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Ticket #${deletedTicket.slice(-4)} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`));
      }
    }

    dispatch(getTickets()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
  }, [dispatch, error, isDeleted, deleteError, navigate]);

  useEffect(() => {
    if(ticketDetailError){
      dispatch(clearErrors)
    }
    dispatch(getTicketDetails(id));
  }, [dispatch, id, ticketDetailError]);
  
  return (
    <div>

        <div className="btn">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none', color:'rgb(127, 86, 217)' }}>
            Tickets
            </Button>
            <Typography color="rgb(127, 86, 217)">Ticket Details</Typography>
          </Breadcrumbs>
        </div>

        <Modal
            open={openUpdateModal}
            onClose={handleUpdateClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={updateStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center'  }}>
                Update Ticket
              </Typography>
              <UpdateTicket handleUpdateClose={handleUpdateClose} selectedTicketId={selectedTicketId} />
            </Box>
          </Modal>

          <div id="specific-content">

          <Grid container spacing={2} style={{marginTop:'10px', marginLeft:'10px', paddingRight:'50px'}}>
        <Grid item xs={12}>
          <Card style={{backgroundColor:'rgb(245, 245, 245)'}}>
            <CardHeader
                title={<div style={{ display: 'flex', alignItems: 'center' }}>
                Ticket
                <div style={{ display: 'flex', justifyContent: "center", alignItems: 'center', paddingLeft: '10px' }}>
                  <div style={{
                    backgroundColor: ticket.status === "Hold" ? "#ff9800" :
                    ticket.status === "Open" ? "#ff0000" :
                    ticket.status === "Close" ? "#4caf50" :

                      "#000000",
                    color: "#ffffff",
                    borderRadius: '12px',
                    padding: '2px 6px', // Reduced padding
                    textAlign: 'center',
                    fontSize: '0.8em' 
                  }}>
                    {ticket.status}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: "center", alignItems: 'center', paddingLeft: '10px' }}>
                  <div style={{
                      backgroundColor: ticket.priority === "Lowest" ? "#E8EAF6" :
                      ticket.priority === "Low" ? "#E1F5FE" :
                      ticket.priority === "Normal" ? "#F1F8E9" :
                      ticket.priority === "High" ? "#FFF3E0" :
                      ticket.priority === "Highest" ? "#FFEBEE" :
                      "#000000",
                    color: ticket.priority === "Lowest" ? "#3949AB" :
                      ticket.priority === "Low" ? "#0277BD" :
                      ticket.priority === "Normal" ? "#558B2F" :
                      ticket.priority === "High" ? "#EF6C00" :
                      ticket.priority === "Highest" ? "#C62828" :
                      "#ffffff",
                        borderRadius: '12px',
                        padding: '2px 6px', // Reduced padding
                        textAlign: 'center',
                        fontSize: '0.8em' 
                    }}>
                      {ticket.priority}
                  </div>
                </div>

              </div>}
                action={
                  <>
                  {/* <Button style={{ backgroundColor: 'rgb(127, 86, 217)', marginRight: '8px' }} variant="contained" type="submit" 
                    onClick={printSpecificContent}
                    >
                    Download Page
                  </Button> */}

                  {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" ? (
                  <Tooltip
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                    placement="top" 
                    title={ticket.status === 'Close' ? `Can't Edit as Order is ${ticket.status}` : ''}

                  >
                    <span>
                    <Button startIcon={<EditIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleUpdateOpen(ticket._id)} variant="contained" type="submit" 
                    disabled={ticket.status === 'Close'}
                    >
                      Edit
                    </Button>
                    </span>
                  </Tooltip>
                      ) : null}

                </>
                }
              />
                
  
            <CardContent>
                <Grid container spacing={2} style={{ padding: '10px', paddingRight:'10px' }}>

                  
                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Order Id
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {loadingOrderDetails ? (
                        <span style={{ visibility: 'hidden' }}>Loading...</span>
                      ) : (
                        orderNamesMap[ticket.orderId] === undefined ? (
                          <span style={{ color: 'red' }}>Order Deleted</span>
                        ) : (orderNamesMap[ticket.orderId] === '') ? (
                          'Unnamed Order'
                        ) : (
                          orderNamesMap[ticket.orderId]
                        )
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginLeft: '5px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Created On
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
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

              <Grid item xs={3} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Client Name
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {loadingClientDetails ? (
                        <span style={{ visibility: 'hidden' }}>Loading...</span>
                      ) : (
                        clientNamesMap[ticket.client_name] === undefined ? (
                          <span style={{ color: 'red' }}>Client Deleted</span>
                        ) : (clientNamesMap[ticket.client_name] === '') ? (
                          'Unnamed client'
                        ) : (
                          clientNamesMap[ticket.client_name]
                        )
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Assignee Name
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {loadingAssigneeDetails ? (
                        <span style={{ visibility: 'hidden' }}>Loading...</span>
                      ) : (
                        teamNamesMap[ticket.assignee] === "" ? (
                          "Unnamed Assignee"
                        ) : (
                          teamNamesMap[ticket.assignee]
                        )
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Subject
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {ticket.subject ? ticket.subject : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Description
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                    <span
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ticket.description ? ticket.description : "-") }}
                      style={{ color: 'black' }}
                    />
                      {/* {ticket.description ? ticket.description : "-"} */}
                    </Typography>
                  </Grid>
                  </Grid>
                  {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" ? (

                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button startIcon={<DeleteIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleDeleteConfirmation(ticket._id)} variant="contained" type="submit">
                        Delete
                      </Button>

                    </div>
                  ) : null}

              </CardContent>
              

              <Divider></Divider>

              

          </Card>
        </Grid>
      </Grid>
      </div>

          <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle  style={{ color: '#d11a2a' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this ticket?
        </DialogContent>
        <DialogActions>
          <Button 
            style={{ color: 'black' }} onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteTicket}
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


export default TicketDetails