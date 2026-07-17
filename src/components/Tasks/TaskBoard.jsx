import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Divider, CircularProgress, Container } from '@mui/material';
import {
  Box, Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, Modal, Typography,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import NewTask from './NewTask';
import TaskCard from './TaskCard';
import './Tasks.css';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, deleteTask, getTasks, updateTask } from '../../actions/taskAction';
import { DELETE_TASK_RESET } from '../../constants/taskConstants';
import UpdateTask from './UpdateTask';
import { getOrderDetails } from '../../actions/orderAction';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import { baseURL } from '../../http';

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
  overflow: 'auto',
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
  overflow: 'auto',
  p: 4,
};

const COLUMNS = [
  { id: 'To Do',      label: 'To Do',       color: '#ffa500' },
  { id: 'In Progress', label: 'In Progress', color: '#1e90ff' },
  { id: 'Done',       label: 'Done',         color: '#32cd32' },
];

const TaskBoard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { order, error: orderDetailError } = useSelector((state) => state.orderDetails);
  const { error, loading, tasks = [] } = useSelector((state) => state.tasks);
  const { error: deleteError, isDeleted } = useSelector((state) => state.taskDU);
  const combined = useSelector((state) => state.logMember.combined);

  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const assigneeTasks = localTasks.filter((task) => task.assigneeId === combined.user._id);

  let originalTasks;
  if (combined.user.role === 'ASSIGNEE') {
    originalTasks = assigneeTasks;
  } else {
    originalTasks = localTasks;
  }

  const toDoCount       = originalTasks.filter((t) => t.status === 'To Do').length;
  const inProgressCount = originalTasks.filter((t) => t.status === 'In Progress').length;
  const doneCount       = originalTasks.filter((t) => t.status === 'Done').length;

  const [openModal, setOpenModal] = useState(false);
  const [status, setStatus] = useState('');
  const handleOpen = (newStatus = 'In Progress') => { setStatus(newStatus); setOpenModal(true); };
  const handleClose = () => { setOpenModal(false); setStatus(''); };

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const handleUpdateOpen = (taskId) => { setSelectedTaskId(taskId); setOpenUpdateModal(true); };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const handleDeleteConfirmation = (taskId) => { setTaskIdToDelete(taskId); setOpenConfirmDialog(true); };
  const handleDeleteTask = () => {
    dispatch(deleteTask(taskIdToDelete, id));
    setTaskIdToDelete(null);
    setOpenConfirmDialog(false);
  };
  const handleCloseConfirmDialog = () => { setTaskIdToDelete(null); setOpenConfirmDialog(false); };

  const [assignedToNamesMap, setassignedToNamesMap] = useState({});
  const [serviceNamesMap, setServiceNamesMap] = useState({});
  const [clientNamesMap, setClientNamesMap] = useState({});

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/services`, { credentials: 'include' });
        if (!response.ok) throw new Error(`Failed to fetch services: ${response.status}`);
        const data = await response.json();
        const serviceMap = {};
        data.services.forEach((s) => { serviceMap[s._id] = s.service_name; });
        setServiceNamesMap(serviceMap);
      } catch (err) {
        console.error('Error fetching services:', err.message);
      }
    };
    fetchServiceData();
  }, []);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/combined/getAllClient`, { credentials: 'include' });
        if (!response.ok) throw new Error(`Failed to fetch clients: ${response.status}`);
        const data = await response.json();
        const clientMap = {};
        data.combined.forEach((c) => { clientMap[c._id] = c.fname; });
        setClientNamesMap(clientMap);
      } catch (err) {
        console.error('Error fetching clients:', err.message);
      }
    };
    fetchClientData();
  }, []);

  useEffect(() => {
    const fetchAssigneeData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/getAllExceptClient`, { credentials: 'include' });
        if (!response.ok) throw new Error(`Failed to fetch assignees: ${response.status}`);
        const data = await response.json();
        const assignedToMap = {};
        for (const c of data.combined) {
          assignedToMap[c._id] = {
            name: `${c.fname} ${c.lname}`,
            profile_img: c.profile_img || null,
          };
        }
        setassignedToNamesMap(assignedToMap);
      } catch (err) {
        console.error('Error fetching assignees:', err.message);
      }
    };
    fetchAssigneeData();
  }, []);

  useEffect(() => {
    if (error) dispatch(clearErrors());
    if (deleteError) dispatch(clearErrors());
    if (isDeleted) {
      navigate(`/task/order/${id}`);
      dispatch({ type: DELETE_TASK_RESET });
    }
    dispatch(getTasks(id));
  }, [dispatch, error, id, isDeleted, deleteError, navigate]);

  useEffect(() => {
    if (orderDetailError) dispatch(clearErrors());
    dispatch(getOrderDetails(id));
    dispatch(getTasks(id));
  }, [dispatch, id, orderDetailError]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTaskId, setMenuTaskId] = useState(null);

  const handleMenuOpen = useCallback((event, taskId) => {
    if (anchorEl && menuTaskId !== taskId) { setAnchorEl(null); setMenuTaskId(null); }
    setAnchorEl(event.currentTarget);
    setMenuTaskId(taskId);
  }, [anchorEl, menuTaskId]);

  const handleMenuClose = useCallback(() => { setAnchorEl(null); setMenuTaskId(null); }, []);

  const handleInfo = (taskId) => navigate(`/task/${taskId}`);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    const previousTasks = localTasks;

    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await dispatch(updateTask(draggableId, id, { status: newStatus }));
    } catch {
      setLocalTasks(previousTasks);
    }
  };

  const cardProps = {
    assignedToNamesMap,
    combined,
    anchorEl,
    menuTaskId,
    handleMenuOpen,
    handleMenuClose,
    handleUpdateOpen,
    handleDeleteConfirmation,
    handleInfo,
  };

  return (
    <div>
      <Modal open={openModal} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center' }}>
            Create New Task
          </Typography>
          <NewTask handleClose={handleClose} orderId={id} status={status} setStatus={setStatus} />
        </Box>
      </Modal>

      <Modal open={openUpdateModal} onClose={handleUpdateClose}>
        <Box sx={updateStyle}>
          <Typography variant="h6" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center' }}>
            Update Task
          </Typography>
          <UpdateTask handleUpdateClose={handleUpdateClose} selectedTaskId={selectedTaskId} orderId={id} />
        </Box>
      </Modal>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle style={{ color: '#d11a2a' }}>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this task?</DialogContent>
        <DialogActions>
          <Button style={{ color: 'black' }} onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleDeleteTask} variant="contained" color="error" style={{ backgroundColor: '#d11a2a', color: 'white' }}>
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
        {originalTasks.length === 0 ? (
          <Grid item xs={9} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Container style={{ marginTop: '50px', textAlign: 'center' }}>
              <div style={{
                width: '75px', height: '75px', borderRadius: '50%',
                backgroundColor: '#f5f5f5', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
              }}>
                <AssignmentIcon style={{ fontSize: '50px', color: '#B0BEC5' }} />
              </div>
              <Typography variant="h5">No Tasks yet</Typography>
            </Container>
          </Grid>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            {COLUMNS.map(({ id: colId, label, color }) => {
              const colTasks = originalTasks.filter((t) => t.status === colId);
              const count = { 'To Do': toDoCount, 'In Progress': inProgressCount, 'Done': doneCount }[colId];
              return (
                <Grid item xs={3} key={colId} style={{ borderRadius: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                      borderRadius: '12px', backgroundColor: color, color: '#ffffff',
                      padding: '3px 12px', display: 'inline-flex', alignItems: 'center',
                      fontSize: '0.78rem', fontWeight: 500,
                    }}>
                      {label}
                    </div>
                    <div style={{ marginLeft: '10px', color, fontWeight: 'bold' }}>{count}</div>
                  </div>

                  <Droppable droppableId={colId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          minHeight: '60px',
                          borderRadius: '10px',
                          transition: 'background-color 0.2s ease',
                          backgroundColor: snapshot.isDraggingOver ? `${color}22` : 'transparent',
                          padding: '4px',
                        }}
                      >
                        <Grid container spacing={1}>
                          {colTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <Grid
                                  item
                                  xs={12}
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                >
                                  <TaskCard
                                    task={task}
                                    {...cardProps}
                                    style={{
                                      opacity: dragSnapshot.isDragging ? 0.85 : 1,
                                      boxShadow: dragSnapshot.isDragging
                                        ? '0 8px 24px rgba(0,0,0,0.18)'
                                        : undefined,
                                      transform: dragSnapshot.isDragging ? 'rotate(1.5deg)' : undefined,
                                    }}
                                  />
                                </Grid>
                              )}
                            </Draggable>
                          ))}
                        </Grid>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div style={{ marginTop: '10px' }}>
                    <IconButton style={{ color, padding: '4px' }} onClick={() => handleOpen(colId)}>
                      <AddIcon style={{ fontSize: '25px' }} />
                    </IconButton>
                  </div>
                </Grid>
              );
            })}
          </DragDropContext>
        )}

        <Divider />

        <Grid item xs={3}>
          <div style={{ textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom style={{ color: 'rgb(127, 86, 217)' }}>
              Order Details
            </Typography>
          </div>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Quantity:</Typography>
            <Typography variant="body1">{order.quantity}</Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Status:</Typography>
            <Typography variant="body1">{order.status}</Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Budget:</Typography>
            <Typography variant="body1">{order.budget}</Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Order ID:</Typography>
            <Typography variant="body1">{order.orderId}</Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Service Name:</Typography>
            <Typography variant="body1">{serviceNamesMap[order.serviceId] || '-'}</Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Client Name:</Typography>
            <Typography variant="body1">{clientNamesMap[order.clientId] || '-'}</Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Total Cost:</Typography>
            <Typography variant="body1">{order.budget * order.quantity}</Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>Kick-Off Date:</Typography>
            <Typography variant="body1">
              {new Date(order.kick_off_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>End Date:</Typography>
            <Typography variant="body1">
              {new Date(order.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default TaskBoard;
