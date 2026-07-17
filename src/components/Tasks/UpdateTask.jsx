import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CustomizedSnackbars from "../../snackbarToast";
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Button, InputLabel, TextField, Typography } from '@mui/material';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { getTaskDetails, clearErrors, updateTask, getTasks } from '../../actions/taskAction';
import { UPDATE_TASK_RESET } from '../../constants/taskConstants';
import { Editor } from 'primereact/editor';
import { Grid } from '@mui/material';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';

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

const UpdateTask = ({handleUpdateClose, selectedTaskId, orderId}) => {
const dispatch = useDispatch();
const navigate = useNavigate()
const {loading, updateError, isUpdated} = useSelector((state)=>state.taskDU)
const combined = useSelector((state) => state.logMember.combined);

const { error:taskDetailError, task } = useSelector((state) => state.taskDetails);
// console.log("tt",task)
const [status , setStatus]=useState("");
const [priority, setPriority] = useState("");
  const [description, setdescription] = useState(''); 
  const taskId = selectedTaskId;
  // console.log(taskId)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage] = useState('');
  const [severity] = useState('');
  const [assigneeId, setassigneeId] = useState("");


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


  const superAdminId = combined?.superAdminId;

  const [selectedClientFromOrder, setselectedClientFromOrder] = useState('')

  useEffect(() => {
    const controller = new AbortController();
    const fetchOrderName = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/order/${orderId}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }
        const data = await response.json();
        setselectedClientFromOrder(data.order.clientId);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching orders:', error.message);
      }
    };
    fetchOrderName();
    return () => controller.abort();
  }, [orderId]);
  
  useEffect(() => {
    if(taskDetailError){
     dispatch(clearErrors)
  }
  dispatch(getTaskDetails(taskId));
}, [dispatch, taskId, taskDetailError]);

  useEffect(() => {
    if(task && task._id !==taskId){
        dispatch(getTaskDetails(taskId));
    }else{
        setStatus(task.status);
        setPriority(task.priority)
        setdescription(task.description)
        setassigneeId(task.assigneeId)

    }
    
    if (taskDetailError) {
      dispatch(clearErrors());
    }
     if (updateError) {
      
    }

    if (isUpdated) {
      
    }

  }, [dispatch, taskDetailError, isUpdated, updateError, task, taskId]);

  const updateTaskSubmitHandler = async (e) => {
    e.preventDefault();

    const myForm = new FormData();
    myForm.set('assigneeId', assigneeId);
    myForm.set("status", status);
    myForm.set("priority", priority);
    myForm.set('description', description);

    const response = await dispatch(updateTask( taskId, orderId, myForm));
    ;
    if (response.success) {
        const assigneeId = response.task.assigneeId;
        // const routeLink = `http://dashboard.agencykinetics.com/task/order/${orderId}`
        const routeLink = `http://app.agencykinetics.com/task/order/${orderId}`

        handleUpdateClose()
        navigate(`/task/order/${orderId}`, {
          state: {
            snackbar: {
              message: "Task Updated Successfully",
              severity: "success"
            }
          }
        });
        dispatch({ type: UPDATE_TASK_RESET });
        dispatch(createNotification(combined.user._id, `Task ${task.task_name} Updated successfully`, routeLink));
        dispatch(createNotification(selectedClientFromOrder, `Task ${task.task_name} Updated successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        
        if (combined.user.role !== 'SUPERADMIN'){
          // console.log("SuperAdmin from UpdateTeam", superAdminId)
          dispatch(createNotification(superAdminId?._id, `Task ${task.task_name} Updated successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
        if (combined.user._id !== assigneeId){
          dispatch(createNotification(assigneeId,`Task ${task.task_name} Updated successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
  
        dispatch(getTasks(orderId)).then(() => {
          dispatch(getAllNotifications(combined.user._id));
        });
  

    } else if (response.error) {
      handleUpdateClose()
      navigate(`/task/order/${orderId}`, {
        state: {
          snackbar: {
            message: "Task Updation Failed",
            severity: "error"
          }
        }
      });
      dispatch(clearErrors());
    }
  };

  const [errorDesc, setErrorDesc] = useState('');

  const handleTextChange = (e) => {
    const plainText = e.htmlValue.replace(/<[^>]*>?/gm, ''); // Remove HTML tags to count characters
    if (plainText.length > 60) {
      setErrorDesc('Description cannot exceed 60 characters.');
    } else {
      setErrorDesc('');
      setdescription(e.htmlValue);
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
        {/* <div className="newProductContainer"> */}
        <CustomizedSnackbars
          open={snackbarOpen}
          handleClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          severity={severity}
        />
          <form
            encType="multipart/form-data"
            onSubmit={updateTaskSubmitHandler}
          >
            <Grid container spacing={2}>

              <Grid item xs={12}>
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
                  getOptionLabel={(option) => assignedToNamesMap[option] || ''}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      {assignedToNamesMap[option]}
                    </li>
                  )}
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
              <InputLabel id="status-label" style={{marginTop:'20px'}}>Status</InputLabel>

                <Autocomplete
                  fullWidth
                  disablePortal
                  value={status}
                  onChange={(event, newValue) => setStatus(newValue)}
                  id="status"
                  options={["Done", "In Progress", "To Do"]}
                  noOptionsText="Select Status"
                  renderInput={(params) => <TextField {...params} fullWidth label="Select Status" variant="filled" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <InputLabel id="priority-label" style={{marginTop:'20px'}}>Priority</InputLabel>

                <Autocomplete
                  fullWidth
                  disablePortal
                  value={priority}
                  onChange={(event, newValue) => setPriority(newValue)}
                  id="priority"
                  options={['Low', 'Lowest', 'Normal', 'High', 'Highest']}
                  noOptionsText="Select Priority"
                  renderInput={(params) => <TextField {...params} fullWidth label="Select Priority" variant="filled" />}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <InputLabel id="description-label">Description</InputLabel>
                <Editor 
                  value={description} 
                  onTextChange={handleTextChange} 
                  headerTemplate={header} 
                  style={{ height: '320px' }} 
                />
                {errorDesc && <Typography color="error">{errorDesc}</Typography>}
              </Grid>

              </Grid>                
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Button
                  id="createOrderBtn"
                  type="submit"
                  disabled={errorDesc}
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


export default UpdateTask