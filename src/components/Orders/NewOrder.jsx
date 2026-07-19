import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';
import { NEW_ORDER_RESET } from '../../constants/orderConstants';
import { clearErrors, createOrder, getOrders } from '../../actions/orderAction';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "./Order.css"
import { TextField, Button, Typography, FormLabel, Input, Icon, IconButton, Card, Box, Container, Divider, Grid, Paper } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Autocomplete } from '@mui/material';
import CustomizedSnackbars from '../../snackbarToast'
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';


const NewOrder = ({ handleClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.newOrder);
  // console.log(success)
  const [clientId, setclientId] = useState(null);
  const [serviceId, setserviceId] = useState(null);
  const [project_manager, setproject_manager] = useState('');  //Optional
  const [note, setnote] = useState('');   //Optional
  const [quantity, setquantity] = useState('');
  const [budget, setbudget ] = useState('');
  // const [kickoff_date, setkickoff_date] = useState(Date.now);
  // const [end_date, setend_date] = useState('');
  const [serviceIdsList, setServiceIdsList] = useState([]);
  const [clientIdsList, setClientIdsList] = useState([]);
  const [showKickoffCalendar, setShowKickoffCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const [assignee, setassignee] = useState(null);
  const [subject, setsubject] = useState('');
  const [teamIdsList, setTeamIdsList] = useState([]);

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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('');

  const [selectedKickOffDate, setSelectedKickOffDate] = useState(dayjs());
  const [selectedEndDate, setSelectedEndDate] = useState(dayjs());


  const handleKickOffDateChange = (date) => {
    setSelectedKickOffDate(date);
  };
  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const superAdminId = combined?.superAdminId;

  useEffect(() => {
    const controller = new AbortController();
    const fetchServiceIds = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/services`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch service IDs: ${response.status}`);
        }
        const data = await response.json();

        // Log the entire data object
        // console.log('Service IDs data:', data);

        setServiceIdsList(data.services || []); // Ensure that data is an array or set it to an empty array
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching service IDs:', error.message);
      }
    };

    fetchServiceIds();
    return () => controller.abort();
  }, []);


  useEffect(() => {
    const controller = new AbortController();
    const fetchClientIds = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/combined/getAllClient`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch client IDs: ${response.status}`);
        }
        const data = await response.json();

        // Log the entire data object
        // console.log('Client IDs data:', data);

        setClientIdsList(data.combined || []); // Ensure that data is an array or set it to an empty array
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching client IDs:', error.message);
      }
    };

    fetchClientIds();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTeamIds = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/getAllExceptClient`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch team IDs: ${response.status}`);
        }
        const data = await response.json();
        const filteredTeamIds = data.combined.filter(item => item.verified === true);

        setTeamIdsList(filteredTeamIds);


        // Find the superAdmin and set as default assignee
        const superAdmin = data.combined.find((member) => member.role === 'SUPERADMIN');
        if (superAdmin) {
          setassignee(superAdmin);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching team IDs:', error.message);
      }
    };

    fetchTeamIds();
    return () => controller.abort();
  }, []);



  const createOrderSubmitHandler = async (e) => {
    e.preventDefault();
    // console.log(selectedEndDate, selectedKickOffDate)
    const myForm = new FormData();
    myForm.set('clientId', clientId._id);
    myForm.set('quantity', quantity);
    myForm.set('serviceId', serviceId._id);
    myForm.set('budget', budget);
    myForm.set('kick_off_date', selectedKickOffDate);
    myForm.set('end_date', selectedEndDate);
    myForm.set('subject', subject);
    myForm.set('assignee', assignee._id);
    // console.log([...myForm])


    const response = await dispatch(createOrder(myForm));
    if (response?.success) {
        const id = response.order._id;
        const orderId = response.order.orderId;

        handleClose();
        navigate("/orders", {
            state: {
                snackbar: {
                    message: "New Order Created Successfully",
                    severity: "success"
                }
            }
        });
        // const routeLink = `http://dashboard.agencykinetics.com/order/${id}`
        const routeLink = `http://app.agencykinetics.com/order/${id}`
        // Create notifications based on user roles
        if (combined.user._id !== "CLIENT") {
            dispatch(createNotification(combined.user._id, `New Order Created Successfully with ID: ${orderId}`, routeLink));
            dispatch(createNotification(clientId._id, `New Order Created Successfully with ID: ${orderId}`, routeLink));
        }

        if (combined.user.role !== 'SUPERADMIN') {
            dispatch(createNotification(superAdminId?._id, `New Order Created Successfully By ${combined.user.fname} ${combined.user.lname} with ID: ${orderId}`));
        }

        dispatch(getAllNotifications(combined.user._id));
        dispatch({ type: NEW_ORDER_RESET });
        dispatch(getOrders());

    } else if (response?.error) {
        handleClose();
        navigate("/orders", {
            state: {
                snackbar: {
                    message: `New Order Creation Failed as: ${response.error}`,
                    severity: "error"
                }
            }
        });
        dispatch({ type: NEW_ORDER_RESET });
        dispatch(getOrders());
        dispatch(clearErrors());
    }
    dispatch(getOrders());

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
          className="createOrderForm"
          encType="multipart/form-data"
          onSubmit={createOrderSubmitHandler}
        >

              <Grid container spacing={3}>
                <Grid item xs={12}>
                <InputLabel id="service-label" style={{marginTop:'20px'}}>Service</InputLabel>

                <Autocomplete
                  fullWidth
                  disablePortal
                  value={serviceId}
                  onChange={(event, newValue) => {
                    setserviceId(newValue);
                  }}
                  id="serviceId"
                  options={serviceIdsList}
                  noOptionsText="Select Service"
                  getOptionLabel={(option) => option.service_name}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      {option.service_name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      label="Select Service"
                      variant="filled"
                    />
                  )}
                />
                </Grid>

                <Grid item xs={6} sm={6}>
                  <InputLabel id="client-label">Client</InputLabel>
                  {role === 'Client' ? (
                    <TextField
                    type="text"
                    required
                    disable
                    value={name}
                    onChange={(e) => setclientId(combined.user._id)}
                    fullWidth
                    variant="filled"
                    margin="none"
                    inputProps={{
                      style: {
                        padding: '16px 12px' // Adjust padding to center text
                      }
                    }}
                  />

                  ) : (
                    <Autocomplete
                      fullWidth
                      disablePortal
                      value={clientId}
                      onChange={(event, newValue) => {
                        setclientId(newValue);
                      }}
                      id="clientId"
                      options={clientIdsList}
                      getOptionLabel={(option) => option.fname + " " + option.lname}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText="Select Client"
                      renderOption={(props, option) => (
                        <li {...props} key={option._id}>
                          {option.fname} {option.lname}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          label="Select Client"
                          variant="filled"
                        />
                      )}
                    />
                  )}
                </Grid>


                <Grid item xs={6} sm={6}>
                  <InputLabel id="assignee-label">Assignee</InputLabel>
                  <Autocomplete
                    fullWidth
                    disablePortal
                    value={assignee}
                    onChange={(event, newValue) => {
                      setassignee(newValue);
                    }}
                    id="assignee"
                    options={teamIdsList}
                    getOptionLabel={(option) =>
                      option.fname && option.lname
                        ? `${option.fname} ${option.lname}`
                        : 'No Name - Pending To Join'
                    }
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    noOptionsText="Select Member"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        label="Select Member"
                        variant="filled"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6}>
                <InputLabel id="quantity-label">Quantity</InputLabel>

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
                <InputLabel id="budget-label">Budget</InputLabel>

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


                <Grid item xs={12} sm={6}>
                  <InputLabel id="kickoffDate-label">Kick-Off Date</InputLabel>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                    // label="Kick-Off Date"
                      value={selectedKickOffDate}
                      onChange={handleKickOffDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={{width: '100%'}}
                          onClick={handleKickOffDateChange}
                          fullWidth
                          required
                          variant="filled"
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InputLabel id="endDate-label">End Date</InputLabel>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                    // label="End Date"
                      value={selectedEndDate}
                      onChange={handleEndDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onClick={handleEndDateChange}
                          fullWidth
                          required
                          variant="filled"
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>



              <div style={{ textAlign: 'center', marginTop: '15px' }}>
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


          <CustomizedSnackbars
          open={snackbarOpen}
          handleClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          severity={severity}
        />
        </form>
      </div>
      </div>
  );
};

export default NewOrder
