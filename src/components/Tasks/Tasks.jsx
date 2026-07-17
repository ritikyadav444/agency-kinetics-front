import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Modal, Typography, Breadcrumbs } from '@mui/material';
import NewTask from './NewTask';
import './Tasks.css'
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, getTasks } from '../../actions/taskAction';
import { DELETE_TASK_RESET } from '../../constants/taskConstants';
import { useNavigate, useLocation } from 'react-router-dom';
import UpdateTask from './UpdateTask';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ListIcon from '@mui/icons-material/List';
import AppsIcon from '@mui/icons-material/Apps';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TaskBoard from './TaskBoard';
import TaskList from './TaskList';
import { baseURL } from '../../http';
import CustomizedSnackbars from '../../snackbarToast';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(127, 86, 217)', // Set your custom color here
    },
  },
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  height: 600,
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  borderRadius: 10,
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
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  borderRadius: 10,
  boxShadow: 24,
  overflow:'auto',
  p: 4,
  
};

const Tasks = () => {
  // Get the id from the URL parameter
  const { id } = useParams();
// console.log(id)
const dispatch = useDispatch()
  const navigate = useNavigate()
  const {error} = useSelector((state)=>state.tasks)
  // console.log(tasks)
  const { deleteError, isDeleted } = useSelector((state) => state.taskDU);
  const combined = useSelector((state) => state.logMember.combined);


  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('')

  const handleUpdateClose = () => setOpenUpdateModal(false);

  const handleBreadcrumbClick = () => {
    navigate('/orders');
  };

  // Fetch tasks based on the id
  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     try {
  //       const response = await fetch(`${baseURL}/api/v1/task/order/${id}`);
  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch tasks: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       console.log('Tasks data:', data);
  //       setTasks(data.tasks);
  //     } catch (error) {
  //       console.error('Error fetching tasks:', error.message);
  //     }
  //   };

  //   fetchTasks();
  // }, [id]);

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };




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
    }

    dispatch(getTasks(id));
  }, [dispatch, error, isDeleted, deleteError, navigate]);

  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  
  useEffect(() => {
    const snackbar = location.state?.snackbar;
    if (snackbar) {
      setSnackbarMessage(snackbar.message);
      setSeverity(snackbar.severity);
      setSnackbarOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const [status, setStatus] = useState('In Progress')
  return (
    <div>
      <CustomizedSnackbars
            open={snackbarOpen}
            handleClose={handleCloseSnackbar}
            message={snackbarMessage}
            severity={severity}
          />
      <div className="task-dashboard-container">
          <div className='btn'>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
             <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none', color: 'rgb(127, 86, 217)'}}>
             Orders
             </Button>
             <Typography style={{ color: 'rgb(127, 86, 217)' }}>Tasks</Typography>

           </Breadcrumbs>

           <ThemeProvider theme={theme}>
             <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="none"
              textColor="primary"
              variant="fullWidth" // Ensure tabs fill the container
              sx={{
                height:'50px',
                alignItems:'center',
                display:'flex',
                justifyContent:'center',
                borderRadius: '10px', // Apply border-radius to all sides of the tabs
                overflow: 'hidden', // Hide overflow to prevent content from leaking out
               
              }}
            >
              
              <Tab
                label="BOARD"
                icon={<AppsIcon />}
                iconPosition="start"
                sx={{
                  '&.Mui-selected': {
                    background: theme.palette.primary.main, // Change color of selected tab
                    color: 'white', // Change text color of selected tab
                  },
                  minWidth: 'none', // Adjust tab width
                  minHeight: '30px', // Adjust tab height
                  height:'40px',
                  borderRadius:'10px'
                }}
              />
              <Tab
                label="LIST"
                icon={<ListIcon />}
                iconPosition="start"
                sx={{
                  '&.Mui-selected': {
                    background: theme.palette.primary.main, // Change color of selected tab
                    color: 'white', // Change text color of selected tab
                  },
                  minWidth: 'none', // Adjust tab width
                  minHeight: '30px', // Adjust tab height
                  // height:'40px',
                  borderRadius:'10px'
                }}
              />
            </Tabs>
        </ThemeProvider>

        {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "CLIENT" ? (
        <Button style={{ backgroundColor: 'rgb(127, 86, 217)', marginLeft: 'auto', color: 'white' }} onClick={handleOpen} variant="contained" type="submit">
             Create Task
          </Button>
        ) : null}

          </div>

        {tabValue === 0 ? <TaskBoard /> : <TaskList />}


        
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
              <NewTask handleClose={handleClose} orderId={id} status={status} setStatus={setStatus}/>
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
 
      </div>
    </div>


  )

};

export default Tasks;
