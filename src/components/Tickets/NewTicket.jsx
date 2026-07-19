import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NEW_TICKET_RESET } from '../../constants/ticketConstants';
import './Ticket.css'
import { clearErrors, createTicket, getTickets } from '../../actions/ticketAction';
import { TextField, Button, Grid } from '@mui/material';
import { InputLabel, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { Editor } from 'primereact/editor';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';

const NewTicket = ({ handleClose }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.newTicket);
  const navigate = useNavigate();
  const [client_name, setclient_name] = useState(null);
  const [orderId, setorderId] = useState(null);
  const [assignee, setassignee] = useState(null);   
  const [subject, setsubject] = useState('');  
  const [description, setdescription] = useState('');
  const [status, setstatus ] = useState('Open');
  const [priority, setpriority] = useState('Normal');
  const [orderIdsList, setOrderIdsList] = useState([]);
  const [clientIdsList, setClientIdsList] = useState([]);
  const [teamIdsList, setTeamIdsList] = useState([]);


  const combined = useSelector((state) => state.logMember.combined);
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
  const role = formatRole(combined.user.role);

  const superAdminId = combined?.superAdminId;

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
        setClientIdsList(data.combined || []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching client IDs:', error.message);
      }
    };
    fetchClientIds();
    return () => controller.abort();
  }, []);

  const fetchOrderIds = async (clientId) => {
    try {
      // console.log(clientId)
      const response = await fetch(`${baseURL}/api/v1/ordersForAClient?clientId=${clientId}`, {
                credentials: 'include'
              });
      if (!response.ok) {
        throw new Error(`Failed to fetch order IDs: ${response.status}`);
      }
      const data = await response.json();
      setOrderIdsList(data.orders || []);
    } catch (error) {
      setOrderIdsList([]);
      console.error('Error fetching order IDs:', error.message);
    }
  };

  useEffect(() => {
    if (role === 'Client' && combined.user._id) {
      fetchOrderIds(combined.user._id);
    } else if (client_name && client_name._id) {
      fetchOrderIds(client_name._id);
    }
  }, [role, combined.user._id, client_name]);

  useEffect(() => {
    const fetchTeamIds = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/getAllExceptClient`, {
          credentials: 'include',
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
        console.error('Error fetching team IDs:', error.message);
      }
    };

    fetchTeamIds();
  }, []);


  const createTicketSubmitHandler = async (e) => {
    e.preventDefault();
    const myForm = new FormData();
    if (role === 'Client'){
      myForm.set('client_name', combined.user._id);
    }
    myForm.set('client_name', client_name._id); 
    myForm.set('orderId', orderId._id);
    myForm.set('subject', subject);
    myForm.set('assignee', assignee._id);
    myForm.set('description', description);
    myForm.set('status', status);
    myForm.set('priority', priority);
    
    const response = await dispatch(createTicket(myForm));
    if (response?.success) {
        const id = response.ticket._id; 
        const ticketId = response.ticket.ticketId; 
        // const routeLink = `http://dashboard.agencykinetics.com/ticket/${id}`
        const routeLink = `http://app.agencykinetics.com/ticket/${id}`
        handleClose();
        navigate("/tickets", {
          state: {
            snackbar: {
              message: "New Ticket Created Successfully",
              severity: "success"
            }
          }
        });
        dispatch({ type: NEW_TICKET_RESET });

        dispatch(createNotification(combined.user._id, `New Ticket Created Successfully with ID: ${ticketId}`, routeLink));
        dispatch(createNotification(client_name._id, `New Ticket Created Successfully with ID: ${ticketId}`, routeLink));
        if (combined.user.role !== 'SUPERADMIN'){
          // console.log("SuperAdmin from UpdateTicket", superAdminId)
          dispatch(createNotification(superAdminId?._id, `New Ticket Created Successfully with ID: ${ticketId} By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
        dispatch(getTickets()).then(() => {
          dispatch(getAllNotifications(combined.user._id));
        });

    } else if (response?.error) {
      handleClose();
      navigate("/tickets", {
        state: {
          snackbar: {
            message: `New Ticket Creation Failed as: ${error}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: NEW_TICKET_RESET });
      dispatch(getTickets());
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
      <form
        className="createTicketForm"
        encType="multipart/form-data"
        onSubmit={createTicketSubmitHandler}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InputLabel id="client-label" style={{marginTop:'20px'}}>Client Name</InputLabel>

            {role === 'Client' ? (
              
              <TextField
                fullWidth
                required
                label="Client"
                variant="filled"
                value={`${combined.user.fname} ${combined.user.lname}`}
                disabled
              />
            ) : (
              <Autocomplete
                fullWidth
                disablePortal
                value={client_name}
                onChange={(event, newValue) => {
                  setclient_name(newValue);
                  setOrderIdsList([]);
                }}
                id="clientId"
                options={clientIdsList}
                getOptionLabel={(option) => `${option.fname} ${option.lname}`}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                noOptionsText="Select Client"
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    {option.fname + " " + option.lname}
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

          <Grid item xs={12} sm={6}>
          <InputLabel id="orderId-label" style={{marginTop:'20px'}}>Order ID</InputLabel>

            <Autocomplete 
              fullWidth
              disablePortal
              value={orderId}
              onChange={(event, newValue) => {
                setorderId(newValue);
              }}
              id="orderId"
              options={orderIdsList}
              getOptionLabel={(option) => option.orderId.toString()}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              noOptionsText="Select Order"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  label="Select Order"
                  variant="filled"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
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
              // getOptionLabel={(option) => option.fname}
              getOptionLabel={(option) => 
                option.fname && option.lname 
                  ? `${option.fname} ${option.lname}` 
                  : 'No Name - Pending To Join'
              }
              isOptionEqualToValue={(option, value) => option._id === value._id}
              noOptionsText="Select Member"
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {option.fname + " " + option.lname}
                </li>
              )}
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

          <Grid item xs={12} sm={6}>
          <InputLabel id="subject-label">Subject</InputLabel>

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
          <InputLabel id="status-label">Status</InputLabel>

            <Autocomplete 
              fullWidth
              disablePortal
              value={status}
              onChange={(event, newValue) => {
                setstatus(newValue);
              }}
              id="status"
              options={['Open', 'Hold', 'Close']}
              getOptionLabel={(option) => option}
              noOptionsText="Select Status"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  label="Select Status"
                  variant="filled"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
          <InputLabel id="priority-label">Priority</InputLabel>

            <Autocomplete 
              fullWidth
              disablePortal
              value={priority}
              onChange={(event, newValue) => {
                setpriority(newValue);
              }}
              id="priority"
              options={['Low', 'Lowest', 'Normal', 'High', 'Highest']}
              getOptionLabel={(option) => option}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              noOptionsText="Select Priority"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  label="Select Priority"
                  variant="filled"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <InputLabel id="ticket-desc">Description</InputLabel>
            <Editor value={description} onTextChange={(e) => setdescription(e.htmlValue)} style={{ height: '100px' }} />
          </Grid>
        </Grid>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
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
  );
};
export default NewTicket;
