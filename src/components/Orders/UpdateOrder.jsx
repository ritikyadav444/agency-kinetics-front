import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { UPDATE_SERVICE_RESET } from '../../constants/serviceConstant';
import MetaData from '../layout/MetaData';
import { clearErrors, getOrderDetails, getOrders, updateOrder } from '../../actions/orderAction';
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants';
import CustomizedSnackbars from "../../snackbarToast";
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Button, FormControl, InputLabel, MenuItem, Select, TextField, Grid } from '@mui/material';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';


const UpdateOrder = ({handleUpdateClose, selectedOrderId}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const {loading, updateError, isUpdated} = useSelector((state)=>state.orderDU)
  const { error:orderDetailError, order } = useSelector((state) => state.orderDetails);
  // console.log("or",order)
  const [status , setStatus]=useState("");
  const [quantity, setquantity] = useState('');
  const [budget, setbudget ] = useState('');
  const [subject, setsubject] = useState(''); 

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

  const orderId = selectedOrderId;
  // console.log(orderId)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('');

  const [selectedClientFromOrder, setselectedClientFromOrder] = useState('')
  const getClientId = async (orderId) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/order/${orderId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Orders data:', data);
      // setselectedOrderName(data.order.orderId)
      setselectedClientFromOrder(data.order.clientId)

    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };
  getClientId(selectedOrderId)
  
  const superAdminId = combined?.superAdminId;

  useEffect(() => {
    if(orderDetailError){
     dispatch(clearErrors)
  }
      
  dispatch(getOrderDetails(orderId));
}, [dispatch, orderId, orderDetailError]);

  useEffect(() => {
    if(order && order._id !==orderId){
      dispatch(getOrderDetails(orderId));
    }else{
        setStatus(order.status);
        setbudget(order.budget)
        setquantity(order.quantity)
        setsubject(order.subject)
    }
      
    if (orderDetailError) {
      navigate("/orders", {
        state: {
          snackbar: {
            message: "Order Details Not Found",
            severity: "error"
          }
        }
      });
      dispatch(clearErrors());
    }
    
  }, [dispatch, orderDetailError, navigate, isUpdated, updateError, order, orderId]);

  const updateOrderSubmitHandler = async (e) => {
    e.preventDefault();

    const myForm = new FormData();
    myForm.set('quantity', quantity);
    myForm.set('budget', budget);
    myForm.set('subject', subject);
    myForm.set("status", status);
    const response = await dispatch(updateOrder( orderId,myForm));
    ;
    if (response.success) {
        const id = response.order._id; 
        const orderId = response.order.orderId; 
        // console.log(id, orderId)
        handleUpdateClose()
        navigate("/orders", {
          state: {
            snackbar: {
              message: "Order Updated Successfully",
              severity: "success"
            }
          }
        })
        // const routeLink = `http://dashboard.agencykinetics.com/order/${id}`
        const routeLink = `http://app.agencykinetics.com/order/${id}`

        dispatch({ type: UPDATE_ORDER_RESET });


        dispatch(createNotification(combined.user._id, `Order ${order.orderId} Updated to ${status} Successfully`, routeLink));
        dispatch(createNotification(selectedClientFromOrder, `Order ${order.orderId} Updated to ${status}  By ${role}: ${name}`, routeLink));
        if (combined.user.role !== 'SUPERADMIN'){
          // console.log(" SuperadminUpdateOder", superAdminId)
          dispatch(createNotification(superAdminId?._id, `Order ${order.orderId} Updated Successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
        dispatch(getOrders()).then(() => {
          dispatch(getAllNotifications(combined.user._id));
        });

    } else if (response.error) {
        handleUpdateClose(); 
        navigate("/orders", {
          state: {
            snackbar: {
              message: "Order Updation Failed",
              severity: "error"
            }
          }
        });
        dispatch({ type: UPDATE_ORDER_RESET });
      dispatch(getOrders());
        dispatch(clearErrors());
        
    }
  };

  return (
    <div>
      <div style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
        {loading && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <CircularProgress />
            </div>
          )}
        <CustomizedSnackbars
          open={snackbarOpen}
          handleClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          severity={severity}
        />
          <form
            encType="multipart/form-data"
            onSubmit={updateOrderSubmitHandler}
          >
          <Grid container spacing={3}>
            <Grid item xs={6}>
                <InputLabel id="quantity-label" style={{marginTop:'20px'}}>Quantity</InputLabel>

                  <TextField
                    type="number"
                    label="Quantity"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setquantity(e.target.value)}
                    fullWidth
                    variant="filled"
                    margin="none"
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                <InputLabel id="budget-label" style={{marginTop:'20px'}}>Budget</InputLabel>

                  <TextField
                    type="number"
                    label="Budget"
                    placeholder="Budget"
                    value={budget}
                    onChange={(e) => setbudget(e.target.value)}
                    fullWidth
                    required
                    variant="filled"
                    margin="none"
                  />
                </Grid>

                <Grid item xs={12}>

                  <InputLabel id="status-label">Status</InputLabel>

                 <Autocomplete
                  fullWidth
                  disablePortal
                  value={status || null} 
                  onChange={(event, newValue) => {
                    setStatus(newValue);
                  }}
                  id="controllable-states-demo"
                  options={["Review", "Ongoing", "Cancelled", "Completed"]}
                  noOptionsText="Select Status"
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth label="Status" variant="filled" />
                  )}
                />

                  </Grid>
            
                <Grid item xs={12}>
                <InputLabel id="subject-label">Note</InputLabel>

                  <TextField
                    type="text"
                    label="Subject"
                    placeholder="Subject"
                    required
                    value={subject}
                    onChange={(e) => setsubject(e.target.value)}
                    fullWidth
                    variant="filled"
                    margin="none"
                  />
                </Grid>
            </Grid>

              <div style={{ textAlign: 'center', marginTop: '75px' }}>
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


export default UpdateOrder