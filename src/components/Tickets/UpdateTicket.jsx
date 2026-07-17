import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { UPDATE_TICKET_RESET } from '../../constants/ticketConstants';
import { getTicketDetails,clearErrors, updateTicket, getTickets } from '../../actions/ticketAction';
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { Autocomplete, Button, Grid, InputLabel, TextField } from '@mui/material';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';
import { Editor } from 'primereact/editor';


const UpdateTicket = ({handleUpdateClose, match, selectedTicketId}) => {
  const dispatch = useDispatch();

  const {loading, updateError, isUpdated} = useSelector((state)=>state.ticketDU)
  const { error:ticketDetailError, ticket } = useSelector((state) => state.ticketDetails);
  const [status , setStatus]=useState("");
  const [priority, setPriority] = useState("");
  const [description, setdescription] = useState('');
  const [subject, setsubject] = useState('');

  const navigate = useNavigate()

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

  const ticketId = selectedTicketId;

  const superAdminId = combined?.superAdminId;

  const [selectedClientFromTicket, setselectedClientFromTicket] = useState('')
  const getClientId = async (ticketId) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/ticket/${ticketId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Tickets data:', data);
      // setselectedOrderName(data.order.orderId)
      setselectedClientFromTicket(data.ticket.client_name)

    } catch (error) {
      console.error('Error fetching tickets:', error.message);
    }
  };
  getClientId(selectedTicketId)


  useEffect(() => {
    // console.log(ticket, ticket._id, ticketId)
    if(ticket && ticket._id !==ticketId){
        dispatch(getTicketDetails(ticketId));
    }else if (ticket) {
      setsubject(ticket.subject)
      setdescription(ticket.description)
      setStatus(ticket.status);
      setPriority(ticket.priority)

  }

    if (ticketDetailError) {
      navigate('/tickets', {
        pathname: "/tickets",
        state: {
          snackbar: {
            message: "Ticket Details Not Found",
            severity: "error"
          }
        }
      });
      dispatch(clearErrors());
    }

  }, [dispatch, ticketDetailError, navigate, isUpdated, updateError, ticket, ticketId]);

  const updateTicketSubmitHandler = async (e) => {
    e.preventDefault();

    const myForm = new FormData();

    myForm.set('subject', subject);
    myForm.set('description', description);
    myForm.set('status', status);
    myForm.set('priority', priority);
    
    const response = await dispatch(updateTicket( ticketId,myForm));
    ;
    if (response.success) {
        const id = response.ticket._id; 
        // const routeLink = `http://dashboard.agencykinetics.com/ticket/${id}`
        const routeLink = `http://app.agencykinetics.com/ticket/${id}`

        handleUpdateClose()
        navigate('/tickets', {
          state: {
            snackbar: {
              message: "Ticket Updated Successfully",
              severity: "success"
            }
          }
        });
        dispatch({ type: UPDATE_TICKET_RESET });
      dispatch(getTickets())
      
        dispatch(createNotification(combined.user._id, `Ticket #${ticket._id.slice(-4)} Updated to ${status} and ${priority} Successfully`, routeLink));
        dispatch(createNotification(selectedClientFromTicket, `Ticket #${ticket._id.slice(-4)} Updated to ${status} and ${priority} By ${role}: ${name}`, routeLink));
        // console.log(selectedClientFromTicket)
        if (combined.user.role !== 'SUPERADMIN'){
          // console.log("SuperAdmin from UpdateTicket", superAdminId)
          dispatch(createNotification(superAdminId?._id, `Ticket #${ticket._id.slice(-4)} Updated Successfully to ${status} and ${priority} By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
        dispatch(getTickets()).then(() => {
          dispatch(getAllNotifications(combined.user._id));
        });

    } else if (response.error) {
      handleUpdateClose()
      navigate('/tickets', {
        pathname: "/tickets",
        state: {
          snackbar: {
            message: "Ticket Updation Failed",
            severity: "error"
          }
        }
      });
      dispatch({ type: UPDATE_TICKET_RESET });
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
            encType="multipart/form-data"
            onSubmit={updateTicketSubmitHandler}
          >
            <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
            <InputLabel id="status-label" style={{marginTop:'20px'}}>Status</InputLabel>
            <Autocomplete
                    fullWidth
                    disablePortal
                    value={status}
                    onChange={(event, newValue) => {
                      setStatus(newValue);
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
            <InputLabel id="priority-label" style={{marginTop:'20px'}}>Priority</InputLabel>

              <Autocomplete 
                  fullWidth
                  disablePortal
                  value={priority}
                  onChange={(event, newValue) => {
                    setPriority(newValue);
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
            </Grid>

            <Grid item xs={12}  style={{marginTop:'20px'}}>
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

            <Grid item xs={12} sm={12}>
              <InputLabel id="ticket-desc">Description</InputLabel>
              <Editor value={description} onTextChange={(e) => setdescription(e.htmlValue)} style={{ height: '150px' }} />
            </Grid>

            <div style={{ textAlign: 'center', marginTop: '50px' }}>
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

export default UpdateTicket