import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';


import { TextField, Button, Typography, FormLabel, Input, Icon, IconButton, Card, Box, Container, Divider, Grid, Paper } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, CardContent, Autocomplete } from '@mui/material';

import CustomizedSnackbars from '../../snackbarToast'
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { CLEAR_ERRORS, NEW_TASK_RESET } from '../../constants/taskConstants';
import { clearErrors, createTask, getTasks } from '../../actions/taskAction';
import { Editor } from 'primereact/editor';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';

const NewTask = ({ handleClose, orderId, status, setStatus }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { loading, error, success } = useSelector((state) => state.newTask);
  // console.log(success)
  const combined = useSelector((state) => state.logMember.combined);
  const [assigneeId, setassigneeId] = useState(null);
  const [order_Id, setorder_Id] = useState(null);
  const [priority, setpriority] = useState('Normal');
  const [kickoffDateCalendar, setKickoffDateCalendar] = useState(new Date());
  const [endDateCalendar, setEndDateCalendar] = useState(new Date());
  const [taskName, settaskName] = useState('');  
  // const [status, setstatus] = useState(status);   
  const [desc, setdesc] = useState('');   

  const renderHeader = () => {
    return (
      <>
      <span class="ql-formats">
      <select class="ql-font"></select>
      <select class="ql-size"></select>
      
    </span>
    <span class="ql-formats">
      <button class="ql-bold"></button>
      <button class="ql-italic"></button>
      <button class="ql-underline"></button>
    </span>
    <span class="ql-formats">
      <select class="ql-color"></select>
      <select class="ql-background"></select>
    </span>
    <span class="ql-formats">
      <button class="ql-script" value="sub"></button>
      <button class="ql-script" value="super"></button>
    </span>
    <span class="ql-formats">
      <button class="ql-list" value="ordered"></button>
      <button class="ql-list" value="bullet"></button>
      <button class="ql-indent" value="-1"></button>
      <button class="ql-indent" value="+1"></button>
    </span>
    <span class="ql-formats">
      <select class="ql-align"></select>
    </span>
    </>
    );
  };
  
  const header = renderHeader();

  const [selectedOrderName, setselectedOrderName] = useState('')
  const [selectedClientFromOrder, setselectedClientFromOrder] = useState('')

  useEffect(() => {
    const controller = new AbortController();
    const fetchOrderName = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/order/${orderId}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);
        const data = await response.json();
        setselectedOrderName(data.order.orderId);
        setselectedClientFromOrder(data.order.clientId);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching orders:', error.message);
      }
    };
    fetchOrderName();
    return () => controller.abort();
  }, [orderId]);

  const superAdminId = combined?.superAdminId;
  
  const [assignedToNamesMap, setassignedToNamesMap] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    const fetchAssigneeData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/getAllExceptClient`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch members: ${response.status}`);
        }
        const data = await response.json();
        const filteredTeamIds = data.combined.filter(item => item.verified === true);
        // console.log(filteredTeamIds)

        const assignedToMap = {};
        filteredTeamIds.forEach((combined) => {
          assignedToMap[combined._id] = combined.fname + " " + combined.lname;
        });

        setassignedToNamesMap(assignedToMap);
        // console.log(assignedToMap)
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching clients:', error.message);
      }
    };

    fetchAssigneeData();
    return () => controller.abort();
  }, []);

  const [selectedKickOffDate, setSelectedKickOffDate] = useState(dayjs());
  const [selectedEndDate, setSelectedEndDate] = useState(dayjs());
  const handleKickOffDateChange = (date) => {
    setSelectedKickOffDate(date);
  };
  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const [errorDesc, setErrorDesc] = useState('');

  const handleTextChange = (e) => {
    const plainText = e.htmlValue.replace(/<[^>]*>?/gm, ''); // Remove HTML tags to count characters
    if (plainText.length > 60) {
      setErrorDesc('Description cannot exceed 60 characters.');
    } else {
      setErrorDesc('');
      setdesc(e.htmlValue);
    }
  };
  
  
  const createTaskSubmitHandler = async (e) => {
    e.preventDefault();

    const myForm = new FormData();
    myForm.set('assigneeId', assigneeId);
    myForm.set('orderId', orderId);
    myForm.set('task_name', taskName);
    myForm.set('description', desc);
    myForm.set('status', status);
    myForm.set('priority', priority);
    myForm.set('kick_off_date', selectedKickOffDate);
    myForm.set('end_date', selectedEndDate);
    
    const response = await dispatch(createTask(myForm, orderId));
    if (response?.success) {
        const id = response.task._id; 
        const task_name = response.task.task_name; 
        const orderId = response.task.orderId; 
        // const routeLink = `http://dashboard.agencykinetics.com/task/order/${orderId}`
        const routeLink = `http://app.agencykinetics.com/task/order/${orderId}`
        // console.log("linking",routeLink)
        handleClose()
        navigate(`/task/order/${orderId}`, {
          state: {
            snackbar: {
              message: "New Task Created",
              severity: "success"
            }
          }
        });
        dispatch({ type: NEW_TASK_RESET });
        dispatch(createNotification(combined.user._id, `New Task ${task_name} under Order: ${selectedOrderName} Created successfully`, routeLink));
        if (combined.user._id !== assigneeId){
          dispatch(createNotification(assigneeId, `New Task ${task_name} under Order: ${selectedOrderName} Created successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
        
        dispatch(createNotification(selectedClientFromOrder, `New Task ${task_name} under Order: ${selectedOrderName} Created successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        
        if (combined.user.role !== 'SUPERADMIN'){
          // console.log("SuperAdmin from UpdateTeam", superAdminId)
          dispatch(createNotification(superAdminId?._id, `New Task ${task_name} under Order: ${selectedOrderName} Created successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
      // console.log(snackbarSeverity)
      dispatch(getTasks(orderId)).then(() => {
        dispatch(getAllNotifications(combined.user._id));
      });
    } else if (response?.error) {
      handleClose()
      navigate(`/task/order/${orderId}`, {
        state: {
          snackbar: {
            message: `New Task Creation Failed as: ${error}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: NEW_TASK_RESET });
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
          className="createTaskForm"
          encType="multipart/form-data"
          onSubmit={createTaskSubmitHandler}
        >

        <Grid container spacing={3}>
          {/* Add new form fields */}
          <Grid item xs={12} sm={6}>
            <InputLabel id="assigneeId-label" style={{marginTop:'20px'}}>Assignee</InputLabel>
            <Autocomplete
              fullWidth
              disablePortal
              value={assigneeId}
              onChange={(event, newValue) => {
                setassigneeId(newValue);
              }}
              id="assigneeId"
              options={Object.keys(assignedToNamesMap)}
              getOptionLabel={(option) => assignedToNamesMap[option]}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  label="Select Assignee"
                  variant="filled"
                />
              )}
            />
          </Grid>

          
   
          <Grid item xs={12} sm={6}>
            <InputLabel id="taskName-label" style={{marginTop:'20px'}}>Task Name</InputLabel>
            <TextField
              type="text"
              label="Task Name"
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => settaskName(e.target.value)}
              fullWidth
              required
              variant="filled"
              margin="none"
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
          
          <Grid item xs={12} sm={6}>
            <InputLabel id="status-label">Status</InputLabel>
            <Autocomplete
              fullWidth
              disablePortal
              value={status}
              onChange={(event, newValue) => {
                setStatus(newValue);
              }}
              id="status"
              options={['Done', 'In Progress', 'To Do']}
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
                  <InputLabel id="kickoffDate-label">Kick-Off Date</InputLabel>
   
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
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

                <Grid item xs={12} sm={12}>
                    <InputLabel id="description-label">Description</InputLabel>
                    <Editor 
                      value={desc} 
                      onTextChange={handleTextChange} 
                      headerTemplate={header} 
                      style={{ height: '320px' }} 
                    />
                    {errorDesc && <Typography color="error">{errorDesc}</Typography>}
                  </Grid>

        </Grid>
             
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <Button
                  id="createTaskBtn"
                  type="submit"
                  disabled={errorDesc}
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

export default NewTask