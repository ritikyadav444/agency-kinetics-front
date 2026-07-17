import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Divider, CircularProgress, Container } from '@mui/material';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Fade, Grid, IconButton, Modal, Tooltip, Typography } from '@mui/material';
import NewTask from './NewTask';
import './Tasks.css'
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, deleteTask, getTasks } from '../../actions/taskAction';
import { DELETE_TASK_RESET } from '../../constants/taskConstants';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import UpdateTask from './UpdateTask';
import { getOrderDetails } from '../../actions/orderAction';
import DOMPurify from 'dompurify';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { baseURL } from '../../http';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import AssignmentIcon from '@mui/icons-material/Assignment';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  height: 600,
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  // boxShadow: '5px 5px 5px 5px rgba(255, 177, 0, 0.9)',
  borderRadius: 25, // Set border radius to 0 for rectangular border
  boxShadow: 24,
  overflow:'auto',
  p: 4,
  
};

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
  borderRadius: 10,
  boxShadow: 24,
  overflow:'auto',
  p: 4,
  
};

const TaskList = ({match}) => {
  // Get the id from the URL parameter
  const { id } = useParams();
// console.log(id)
const { order, error:orderDetailError } = useSelector(state => state.orderDetails);
  // console.log(order)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // const [tasks, setTasks] = useState([]);
  const {error, loading, tasks = []} = useSelector((state)=>state.tasks)
  // console.log(tasks)
  const combined = useSelector((state) => state.logMember.combined);

  const assigneeTasks = tasks.filter(task => task.assigneeId === combined.user._id);
  // console.log(assigneeTasks)

  var originalTasks
  if (combined.user.role === 'CLIENT') {
     originalTasks = tasks
  }
  else if (combined.user.role === 'ASSIGNEE') {
     originalTasks = assigneeTasks
  }
  else{
    originalTasks = tasks
  }

  // console.log(originalTasks)

  const { error: deleteError, isDeleted } = useSelector((state) => state.taskDU);

  const [assignedToNamesMap, setassignedToNamesMap] = useState({});


  const [openModal, setOpenModal] = useState(false);
  const handleClose = () => setOpenModal(false);

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('')

  const handleUpdateOpen = (taskId) => {
    setSelectedTaskId(taskId);
  
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [taskNameToDelete, setTaskNameToDelete] = useState(null);
  const [assignee, setassigneeId] = useState(null);


  const handleDeleteConfirmation = (task) => {
    setTaskIdToDelete(task[0]);
    setTaskNameToDelete(task[1]);
    setassigneeId(task[2]);
    setOpenConfirmDialog(true);
  };

  const handleDeleteTask = () => {
    dispatch(deleteTask(taskIdToDelete, id));
    setTaskIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setTaskIdToDelete(null);
    setOpenConfirmDialog(false);
  };


  const columns = [
    {
      field: 'task_name',
      headerName: 'Task Name',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'assigneeId',
      headerName: 'Assigned To',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => assignedToNamesMap[params.value] || '',
    },
    {
      field: 'kickOffDate',
      headerName: 'Start Date',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "To Do" ? "rgb(237, 108, 2)" :
              params.value === "In Progress" ? "rgb(25, 118, 210)" :
              params.value === "Done" ? "rgb(46, 125, 50)" :
              "#000000",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Lowest" ? "#E8EAF6" :
              params.value === "Low" ? "#E1F5FE" :
              params.value === "Normal" ? "#F1F8E9" :
              params.value === "High" ? "#FFF3E0" :
              params.value === "Highest" ? "#FFEBEE" :
              "#000000",
            color: params.value === "Lowest" ? "#3949AB" :
              params.value === "Low" ? "#0277BD" :
              params.value === "Normal" ? "#558B2F" :
              params.value === "High" ? "#EF6C00" :
              params.value === "Highest" ? "#C62828" :
              "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => {
        const value = params.value;
        if (value && value.length > 20) {
          return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`${value.slice(0, 20)}...`) }} />;
        }
        return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "CLIENT" || combined.user.role === "ASSIGNEE" ? (
            <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title="Edit Task">
              <IconButton style={{ color: '#ffb66b', backgroundColor: '#f4f4f4' }} onClick={() => handleUpdateOpen(params.row.id)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : null}
          {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" ? (
            <IconButton style={{ color: '#d11a2a', backgroundColor: '#f4f4f4' }} onClick={() => handleDeleteConfirmation([params.row.id, params.row.task_name, params.row.assigneeId])}>
              <DeleteIcon />
            </IconButton>
          ) : null}
        </>
      ),
    },
  ];

  const data = originalTasks.map((row, index) => ({
    id: row._id,
    task_name: row.task_name,
    status: row.status,
    assigneeId: row.assigneeId,
    kickOffDate: row.kick_off_date ? new Date(row.kick_off_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '',
    endDate: row.end_date ? new Date(row.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '',
    priority: row.priority ? row.priority : '',
    description: row.description ? row.description : ''
  }));





  const superAdminId = combined?.superAdminId;


  const [serviceNamesMap, setServiceNamesMap] = useState({});
  const [clientNamesMap, setClientNamesMap] = useState({});

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
      }
    };

    fetchServiceData();
    return () => controller.abort();
  }, []);

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
      }
    };

    fetchClientData();
    return () => controller.abort();
  }, []);


  useEffect(() => {
    const controller = new AbortController();
    const fetchAssigneeData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/getAllExceptClient`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Assigned To data:', data);

        const assignedToMap = {};
        data.combined.forEach((combined) => {
          assignedToMap[combined._id] = combined.fname + ' ' + combined.lname;
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

  useEffect(() => {

    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      dispatch(clearErrors());
    }
    if (isDeleted) {
      // alert('Team Member deleted successfully');
      navigate(`/task/order/${id}`);
      dispatch({ type: DELETE_TASK_RESET});
      dispatch(createNotification(combined.user._id, `Task ${taskNameToDelete} Deleted successfully`));
      dispatch(createNotification(assignee, `Task ${taskNameToDelete} Deleted By ${combined.user.fname} ${combined.user.lname}`));
      dispatch(createNotification(order.clientId, `Task ${taskNameToDelete} Deleted By ${combined.user.fname} ${combined.user.lname}`));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("SuperAdmin from UpdateTeam", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Task ${taskNameToDelete} Deleted By ${combined.user.fname} ${combined.user.lname}`));
      }
      dispatch(getAllNotifications(combined.user._id));

    }

    dispatch(getTasks(id));
  }, [dispatch, error, isDeleted, deleteError, navigate]);

  useEffect(() => {
    if(orderDetailError){
     dispatch(clearErrors())
  }
  dispatch(getOrderDetails(id));
}, [dispatch, id, orderDetailError]);

  return (
    <div>

        <Modal
            open={openModal}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2"  style={{ color: 'rgb(127, 86, 217)', textAlign: 'center'  }}>
                Create New Task
              </Typography>
              <NewTask handleClose={handleClose} orderId={id}/>
            </Box>
          </Modal>

          <Modal
            open={openUpdateModal}
            onClose={handleUpdateClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={updateStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center'  }}>
                Update Task
              </Typography>
              <UpdateTask handleUpdateClose={handleUpdateClose} selectedTaskId={selectedTaskId} orderId={id}/>
            </Box>
          </Modal>

        <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
          <DialogTitle style={{ color: '#d11a2a' }}>Confirm Delete</DialogTitle>
          <DialogContent >
            Are you sure you want to delete this task?
          </DialogContent>
          <DialogActions>
            <Button 
                style={{ color: 'black' }} onClick={handleCloseConfirmDialog}>Cancel</Button>
            <Button
              onClick={handleDeleteTask}
              variant="contained"
              color="error"
              style={{ backgroundColor: '#d11a2a', color: 'white' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </div>
          )}

        <Grid container spacing={3} style={{ paddingTop: '11px', marginBottom: '0px', marginLeft: '10px', marginRight: '10px' }}>
          {tasks.length === 0 ? ( // Check if tasks array is empty
             <Grid item xs={9} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Container style={{ marginTop: "50px", textAlign: "center" }}>
                <div
                    style={{
                      width: "75px",
                      height: "75px",
                      borderRadius: "50%",
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px auto",
                    }}
                  >

                  <AssignmentIcon style={{ fontSize: "50px", color: "#B0BEC5" }} />

                </div>
                
                <Typography variant="h5">
                  No Tasks yet
                </Typography>
              </Container>  

           </Grid>
          ) : (
            <>

            <Grid item xs={9}>
              <DataGrid
                rows={data}
                columns={columns}
                slots={{ toolbar: GridToolbar }}
                sx={{
                      '& .MuiDataGrid-toolbarContainer .MuiButton-root': { color: 'rgb(127, 86, 217)' },
                      '& .MuiDataGrid-toolbarContainer .MuiInputBase-root': { color: 'rgb(127, 86, 217)' },
                      '& .MuiDataGrid-toolbarContainer .MuiSvgIcon-root': { color: 'rgb(127, 86, 217)' },
                    }}
                slotProps={{ toolbar: { showQuickFilter: true } }}
                pageSizeOptions={[10, 20, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
                autoHeight
              />
            </Grid>

            </> 
          )}
          
          <Divider></Divider>
           <Grid item xs={3}>
              <div style={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom style={{ color: 'rgb(127, 86, 217)' }}>
                  Order Details
                </Typography>
              </div>
              {/* <Grid container spacing={2} style={{ height: '100%', backgroundColor: 'white', padding: '20px' }}> */}
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Quantity:</Typography>
                  <Typography variant="body1">{order.quantity}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Status:</Typography>
                  <Typography variant="body1">{order.status}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Budget:</Typography>
                  <Typography variant="body1">{order.budget}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Order ID:</Typography>
                  <Typography variant="body1">{order.orderId}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Service Name:</Typography>
                  <Typography variant="body1">{serviceNamesMap[order.serviceId] ? serviceNamesMap[order.serviceId] : '-'}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Client Name:</Typography>
                  <Typography variant="body1">{clientNamesMap[order.clientId] ? clientNamesMap[order.clientId] : '-'}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Total Cost:</Typography>
                  <Typography variant="body1">{order.budget * order.quantity}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Kick-Off Date:</Typography>
                  <Typography variant="body1">{new Date(order.kick_off_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop:'10px'}}>
                  <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>End Date:</Typography>
                  <Typography variant="body1">{new Date(order.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</Typography>
                </Grid>
              </Grid>
            </Grid>

                    {/* </Grid> */}
                    


    </div>
  );
};

export default TaskList;
