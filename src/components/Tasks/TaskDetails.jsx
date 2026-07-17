import React from 'react';
import { Grid, Typography, Avatar } from '@mui/material';
import Subtasks from './Subtasks'; // Adjust the import path according to your project structure

const colorForStatus = {
  'To Do': '#ffa500',
  'In Progress': '#1e90ff',
  'Done': '#32cd32',
};

const colorForPriority = {
  'Lowest': '#B0B0B0',
  'Low': '#0097A7',
  'Normal': '#01579B',
  'High': '#FF6347',
  'Highest': '#FF4500',
};

const TaskDetails = ({ task, assignedToNamesMap, subtasks, taskId, orderId }) => {
  const getColorForStatus = (status) => colorForStatus[status] || '#000000';
  const getColorForPriority = (priority) => colorForPriority[priority] || '#000000';

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom style={{ color: 'rgb(127, 86, 217)', marginRight: '40px' }}>
          Task Details
        </Typography>
      </div>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography style={{ color: 'black', display: 'flex', alignItems: 'center' }}>
            {assignedToNamesMap[task.assigneeId] ? (
              <>
                {assignedToNamesMap[task.assigneeId].profile_img ? (
                  <Avatar
                    alt={assignedToNamesMap[task.assigneeId].name} 
                    src={assignedToNamesMap[task.assigneeId].profile_img} 
                    style={{ width: '30px', height: '30px', marginRight: '5px' }} 
                  />
                ) : (
                  <Avatar 
                    alt="User Avatar" 
                    src='' 
                    style={{ width: '30px', height: '30px', marginRight: '5px', backgroundColor: '#cfcfcf' }} 
                  />
                )}
                <span>{assignedToNamesMap[task.assigneeId].name}</span>
              </>
            ) : (
              <span>Assignee Not Found</span>
            )}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>
            Status:
          </Typography>
          <Typography variant="body1" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: getColorForStatus(task.status), 
              marginRight: '8px' 
            }}></span>
            {task.status}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>
            Priority:
          </Typography>
          <Typography variant="body1" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: getColorForPriority(task.priority), 
              marginRight: '8px' 
            }}></span>
            {task.priority}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>
            Start Date:
          </Typography>
          <Typography variant="body1">
            {new Date(task.kick_off_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" style={{ color: 'rgb(127, 86, 217)' }}>
            End Date:
          </Typography>
          <Typography variant="body1">
            {new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </Typography>
        </Grid>

        {/* Subtasks section */}
        <Grid item xs={12} style={{ maxHeight: '310px' }}>
          <Subtasks subtasks={subtasks} taskId={taskId} orderId={orderId} />
        </Grid>
      </Grid>
    </div>
  );
};

export default TaskDetails;
