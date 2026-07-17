import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData.jsx";
import { getOrderDetails, clearErrors, deleteOrder, getOrders } from "../../actions/orderAction.jsx";
import { createNotification, getAllNotifications } from "../../actions/notificationAction.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Breadcrumbs, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, Grid, Modal, Tooltip, Typography } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { DELETE_ORDER_RESET } from "../../constants/orderConstants.jsx";
import UpdateOrder from "./UpdateOrder.jsx";
import { getTasks } from "../../actions/taskAction.jsx";
import { baseURL } from "../../http.js";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';

const updateStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  height: 500,
  // backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '5px 5px 5px 5px rgba(255, 177, 0, 0.9)',
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  borderRadius: 5, 
  boxShadow: 24,
  overflow:'auto',
  p: 4,
  
};

const OrderDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const dispatch = useDispatch();
  const { order, error:orderDetailError } = useSelector(state => state.orderDetails);
  // console.log(order)
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
  const { deleteError, isDeleted } = useSelector((state) => state.orderDU);
  const {error, loading, orders} = useSelector((state)=>state.orders)

  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (orderId) => {
    // Store the selected orderId in the state or perform any other actions you need
    setSelectedOrderId(orderId);
  
    // Open the update modal
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState(null);

  const handleDeleteConfirmation = (orderId) => {
    setOrderIdToDelete(orderId);
    setOpenConfirmDialog(true);
    getName(orderId)

  };

  const handleDeleteOrder = () => {
    dispatch(deleteOrder(orderIdToDelete));
    setOrderIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setOrderIdToDelete(null);
    setOpenConfirmDialog(false);
  };



  const handleTaskClick = (order) => {
    dispatch(getTasks(order._id))
    navigate(`/task/order/${order._id}`)
     {/*component={Link} to={/task/${order._id}}*/}

    // console.log(order);
  };

  const handleBreadcrumbClick = () => {
    navigate('/orders');
  };

  const superAdminId = combined?.superAdminId;

  const [selectedOrderName, setselectedOrderName] = useState('')
  const [selectedClientFromOrder, setselectedClientFromOrder] = useState('')

  const getName = async (orderId) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/order/${orderId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Orders data:', data);
      setselectedOrderName(data.order.orderId)
      setselectedClientFromOrder(data.order.clientId)

      // console.log(selectedOrderName)
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };

  const [serviceNamesMap, setServiceNamesMap] = useState({});
  const [clientNamesMap, setClientNamesMap] = useState({});
  const [teamNamesMap, setTeamNamesMap] = useState({});

  const [loadingServiceDetails, setLoadingServiceDetails] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const fetchServiceData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/services`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Services data:', data);

        const serviceMap = {};
        data.services.forEach((service) => {
          serviceMap[service._id] = service.service_name;
        });
        // console.log(serviceMap)
        setServiceNamesMap(serviceMap);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching services:', error.message);
      } finally {
        setLoadingServiceDetails(false)
      }
    };

    fetchServiceData();
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
          clientMap[combined._id] = combined.fname;
        });

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

  useEffect(() => {

    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/orders", {
        state: {
          snackbar: {
            message: `Order Deletion Failed`,
            severity: "error"
          }
        }
      });
      dispatch({ type: DELETE_ORDER_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {

      navigate("/orders", {
        state: {
          snackbar: {
            message: "Order Deleted Successfully",
            severity: "success"
          }
        }
      });  
 
      dispatch({ type: DELETE_ORDER_RESET });
      dispatch(createNotification(combined.user._id, `Order ${selectedOrderName} Deleted Successfully`));
      dispatch(createNotification(selectedClientFromOrder, `Order ${selectedOrderName} Deleted By ${role}: ${name}`));
      
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log(" SuperadminUpdateOder", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Order ${selectedOrderName} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`));
      }
    }

    dispatch(getOrders()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
  }, [dispatch, error, isDeleted, deleteError, navigate]);


  useEffect(() => {
      if(orderDetailError){
       dispatch(clearErrors())
    }
    dispatch(getOrderDetails(id));
  }, [dispatch, id, orderDetailError]);
  return (
    <div>
        <div className="btn">
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none', color:"rgb(127, 86, 217)" }}>
            Orders
            </Button>
            <Typography color="rgb(127, 86, 217)">Order Details</Typography>
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
                Update Order
              </Typography>
              <UpdateOrder handleUpdateClose={handleUpdateClose} selectedOrderId={selectedOrderId} />
            </Box>
          </Modal>


          <Grid container spacing={2} style={{marginTop:'10px', marginLeft:'10px', paddingRight:'50px', paddingBottom:'10px'}}>
        <Grid item xs={12}>
          <Card style={{backgroundColor:'rgb(245, 245, 245)'}}>
            <CardHeader
                title={<div style={{ display: 'flex', alignItems: 'center' }}>
                Order
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: '10px' }}>
                  <div style={{
                    backgroundColor: order.status === "Ongoing" ? "#E1F0FF" :
                      order.status === "Review" ? "#FFF7E1" :
                      order.status === "Completed" ? "#E5F8E5" :
                      order.status === "Cancelled" ? "#FFE5E5" :
                      "#000000",
                    color: order.status === "Ongoing" ? "#1E90FF" :
                      order.status === "Review" ? "#FFBF00" :
                      order.status === "Completed" ? "#228B22" :
                      order.status === "Cancelled" ? "#FF6347" :
                      "#ffffff",
                    borderRadius: '12px', 
                    padding: '2px 6px',
                    textAlign: 'center',
                    fontSize: '0.8em' 
                    }}>
                    {order.status}
                  </div>
                </div>
              </div>}
                subheader={order.orderId}
                action={
                  <>
                  <Tooltip TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            placement="top" 
                            title={'Tasks'}>
                              <Button startIcon={<AssignmentIcon/>} style={{backgroundColor:'rgb(127, 86, 217)', marginRight: '8px'}} onClick={() => handleTaskClick(order) } variant="contained" type="submit">
                              Tasks
                            </Button>
                            </Tooltip>

                          {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" ? (
                          
                          <Tooltip 
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            placement="top" 
                            title={order.status === 'Cancelled' || order.status === 'Completed' ? `Can't Edit as Order is ${order.status}` : ''}
                          >
                            <span>
                              <Button
                                startIcon={<EditIcon/>}
                              variant="contained" type="submit"
                                style={{ backgroundColor: 'rgb(127, 86, 217)' }}
                                onClick={() => handleUpdateOpen(order._id)}
                                disabled={order.status === 'Cancelled' || order.status === 'Completed' || loading}
                              >
                                Edit
                              </Button>
                            </span>
                          </Tooltip>
                        ) : null}

                </>
                }
              />
                
  
            <CardContent>
                <Grid container spacing={2} style={{ padding: '10px', paddingRight:'10px' }}>
                  
                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      For Service
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {loadingServiceDetails ? (
                        <span style={{ visibility: 'hidden' }}>Loading...</span> // You can use a placeholder or simply an empty span
                      ) : (
                        serviceNamesMap[order.serviceId] === undefined ? (
                          <span style={{ color: 'red' }}>Service Deleted</span>
                        ) : (serviceNamesMap[order.serviceId] === '') ? (
                          'Unnamed Service'
                        ) : (
                          serviceNamesMap[order.serviceId]
                        )
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginLeft: '5px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Created On
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                    {/* {order.kick_off_date?.replace(/(\d{2}) (\d{4})/, '$1, $2').slice(4, 16) ? order.kick_off_date.replace(/(\d{2}) (\d{4})/, '$1, $2').slice(4, 16) : '-'} */}
              {new Date(order.kick_off_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}

                    </Typography>
                  </Grid>
                  <Grid item xs={3} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginLeft: '5px'}}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Due
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                    {/* {order.end_date?.replace(/(\d{2}) (\d{4})/, '$1, $2').slice(4, 16) ? order.end_date.replace(/(\d{2}) (\d{4})/, '$1, $2').slice(4, 16) : '-'} */}
                    {new Date(order.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
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

                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Client Name
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {loadingClientDetails ? (
                        <span style={{ visibility: 'hidden' }}>Loading...</span> 
                      ) : (
                        clientNamesMap[order.clientId] === undefined ? (
                          <span style={{ color: 'red' }}>Client Deleted</span>
                        ) : (clientNamesMap[order.clientId] === '') ? (
                          'Unnamed client'
                        ) : (
                          clientNamesMap[order.clientId]
                        )
                      )}
                    </Typography>
                  </Grid>
                
                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Assignee Name
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {loadingAssigneeDetails ? (
                        <span style={{ visibility: 'hidden' }}>Loading...</span>
                      ) : (
                        teamNamesMap[order.assignee] === undefined ? (
                          <span style={{ color: 'red' }}>Assignee Deleted</span>
                        ) : (teamNamesMap[order.assignee] === '') ? (
                          'Unnamed client'
                        ) : (
                          teamNamesMap[order.assignee]
                        )
                      )}
                    </Typography>
                  </Grid>

                </Grid>
              </CardContent>
              

              <Divider></Divider>
            

            <CardHeader
                title={'Amount Details'}  
            />
            <CardContent >
            <Grid
              container
              spacing={2}
              style={{
                borderRadius: '10px',
                paddingRight: '60px',
                marginRight: '5px',
                marginBottom: '5px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgb()',
                  borderRadius: '10px',
                  padding: '10px',
                  marginLeft: '10px',
                  width: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black', fontWeight:'bold' }}
                  >
                    Budget
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black' }}
                  >
                    {order.budget}
                  </Typography>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black', fontWeight:'bold' }}
                  >
                    Quantity
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black' }}
                  >
                    {order.quantity} 
                  </Typography>
                </div>
                
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black', fontWeight:'bold' }}
                  >
                    Total
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black' }}
                  >
                    {order.budget * order.quantity} 
                  </Typography>
                </div>

              </div>
            </Grid>

            {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "CLIENT" ? (

            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button startIcon={<DeleteIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleDeleteConfirmation(order._id)} variant="contained" type="submit">
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
          Are you sure you want to delete this order?
        </DialogContent>
        <DialogActions>
          <Button style={{ color: 'black' }}onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteOrder}
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




export default OrderDetails