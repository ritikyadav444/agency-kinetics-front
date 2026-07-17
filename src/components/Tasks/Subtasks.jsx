import React, { useState, useEffect, useRef } from 'react';
import { MenuList, Box, Typography, IconButton, TextField, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Icon } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { clearErrors, createSubtask, deleteSubtask, updateSubtask } from '../../actions/taskCommentAction';
import { useDispatch, useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DELETE_SUBTASK_RESET, UPDATE_SUBTASK_RESET, CREATE_SUBTASK_FAIL } from '../../constants/taskCommentConstants';

const Subtasks = ({ subtasks, taskId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSubtask, setCurrentSubtask] = useState(null);
  const [editedSubtask, setEditedSubtask] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const { errorSubtask, isSubtaskDeleted, isSubtaskUpdated } = useSelector((state) => state.subtask);
  const { error: createError } = useSelector((state) => state.createSubtask || {});
  const dispatch = useDispatch();
  const addSubtaskRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addSubtaskRef.current && !addSubtaskRef.current.contains(event.target)) {
        setIsAdding(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddClick = () => setIsAdding(true);

  const handleInputChange = (event) => setNewSubtask(event.target.value);

  const handleSubmit = () => {
    if (newSubtask.trim()) {
      dispatch(createSubtask(taskId, newSubtask.trim()));
      setNewSubtask('');
      setIsAdding(false);
    }
  };

  const handleMenuClick = (event, subtask) => {
    setAnchorEl(event.currentTarget);
    setCurrentSubtask(subtask);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleEditClick = () => {
    setEditedSubtask(currentSubtask.subtask_name);
    setEditedStatus(currentSubtask.status);
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    dispatch(deleteSubtask(taskId, currentSubtask._id));
    handleMenuClose();
  };

  const handleEditModalClose = () => setEditModalOpen(false);

  const handleEditSubmit = () => {
    if (editedSubtask.trim()) {
      dispatch(updateSubtask(taskId, currentSubtask._id, { subtask_name: editedSubtask, status: editedStatus }));
      setEditModalOpen(false);
    }
  };

  const handleStatusToggle = (e, subtaskId, currentStatus) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'In Progress' ? 'Completed' : 'In Progress';
    dispatch(updateSubtask(taskId, subtaskId, { status: newStatus }));
  };

  useEffect(() => {
    if (errorSubtask) {
      alert(errorSubtask);
      dispatch(clearErrors());
    }
    if (isSubtaskDeleted || isSubtaskUpdated) {
      dispatch({ type: UPDATE_SUBTASK_RESET });
      dispatch({ type: DELETE_SUBTASK_RESET });
    }
  }, [dispatch, isSubtaskDeleted, isSubtaskUpdated, errorSubtask, taskId]);

  useEffect(() => {
    if (createError) {
      alert(`Failed to create subtask: ${createError}`);
      dispatch({ type: CREATE_SUBTASK_FAIL, payload: null });
    }
  }, [createError, dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)', marginTop: '10px' }}>
        Sub-tasks {subtasks ? `(${subtasks.filter(s => s.status === "Completed").length}/${subtasks.length})` : '0/0'}
      </Typography>

      <Box sx={{ flex: 1, overflowY: 'auto', marginTop: '10px', padding: '10px', boxSizing: 'border-box' }}>
        {subtasks && subtasks.length > 0 ? (
          subtasks.map((subtask) => (
            <Box key={subtask._id} sx={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
              <Icon
                size="small"
                style={{ marginRight: '10px', cursor: 'pointer' }}
                onClick={(e) => handleStatusToggle(e, subtask._id, subtask.status)}
                title={subtask.status === 'In Progress' ? 'Mark complete' : 'Mark in progress'}
              >
                {subtask.status === 'In Progress' ? (
                  <HourglassEmptyIcon style={{ color: 'orange' }} />
                ) : (
                  <DoneIcon style={{ color: 'green' }} />
                )}
              </Icon>
              <Typography
                variant="body2"
                style={{ flexGrow: 1, textDecoration: subtask.status === 'Completed' ? 'line-through' : 'none', color: subtask.status === 'Completed' ? '#999' : 'inherit' }}
              >
                {subtask.subtask_name}
              </Typography>
              <IconButton size="small" onClick={(e) => handleMenuClick(e, subtask)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          ))
        ) : (
          <Typography variant="body2" style={{ marginTop: '5px' }}>No subtasks available.</Typography>
        )}

        {/* Single Menu outside the map — avoids N mounted components */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            '& .MuiPaper-root': { boxShadow: 'none', borderRadius: '15px', backgroundColor: '#E0DBE4' },
            '& .MuiMenuItem-root': { padding: '5px 10px', minHeight: '30px', lineHeight: '1.3' },
          }}
        >
          <MenuList>
            <MenuItem onClick={handleEditClick}>
              <EditIcon style={{ marginRight: '8px' }} /> Edit
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon style={{ marginRight: '8px' }} /> Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <Box ref={addSubtaskRef} sx={{ display: 'flex', alignItems: 'center', marginTop: '10px', padding: '10px' }}>
        {isAdding ? (
          <>
            <TextField
              value={newSubtask}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter sub-task name"
              variant="outlined"
              size="small"
              autoFocus
              sx={{ marginRight: '10px', flexGrow: 1 }}
            />
            <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
          </>
        ) : (
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'rgb(127, 86, 217)', background: 'none' }}
            onClick={handleAddClick}
          >
            <IconButton size="small">
              <AddIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>Add sub-task</Typography>
          </Box>
        )}
      </Box>

      <Dialog open={editModalOpen} onClose={handleEditModalClose} sx={{ '& .MuiPaper-root': { borderRadius: '20px' } }}>
        <DialogTitle align='center' style={{ color: 'rgb(127, 86, 217)' }}>Edit Sub-task</DialogTitle>
        <DialogContent style={{ margin: '20px' }}>
          <TextField
            margin="dense"
            label="Sub-task Name"
            type="text"
            fullWidth
            value={editedSubtask}
            onChange={(e) => setEditedSubtask(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)} label="Status">
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditModalClose} color="error">Cancel</Button>
          <Button onClick={handleEditSubmit} style={{ backgroundColor: 'rgb(127, 86, 217)', color: 'white' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subtasks;
