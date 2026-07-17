import React from 'react';
import {
  Avatar, Card, CardContent, CardHeader, IconButton,
  Menu, MenuItem, MenuList, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DOMPurify from 'dompurify';

const priorityBg = {
  Lowest: '#E8EAF6', Low: '#E1F5FE', Normal: '#F1F8E9',
  High: '#FFF3E0', Highest: '#FFEBEE',
};
const priorityColor = {
  Lowest: '#3949AB', Low: '#0277BD', Normal: '#558B2F',
  High: '#EF6C00', Highest: '#C62828',
};

const TaskCard = ({
  task,
  assignedToNamesMap,
  combined,
  anchorEl,
  menuTaskId,
  handleMenuOpen,
  handleMenuClose,
  handleUpdateOpen,
  handleDeleteConfirmation,
  handleInfo,
  style: extraStyle = {},
}) => {
  const canEdit =
    combined.user.role === 'SUPERADMIN' ||
    combined.user.role === 'ADMIN' ||
    combined.user.role === 'PROJECTMANAGER' ||
    combined.user.role === 'CLIENT' ||
    combined.user.role === 'ASSIGNEE';

  const assignee = assignedToNamesMap[task.assigneeId];

  return (
    <Card
      onClick={() => handleInfo(task._id)}
      style={{
        maxWidth: '100%',
        height: '100%',
        backgroundColor: 'rgb(245, 245, 245)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        ...extraStyle,
      }}
    >
      <CardHeader
        title={
          <Typography style={{ fontWeight: 'bold', color: 'black', fontSize: '1.25rem' }}>
            {task.task_name}
          </Typography>
        }
        action={
          canEdit ? (
            <>
              <IconButton
                style={{ color: 'black' }}
                onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, task._id); }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl) && menuTaskId === task._id}
                onClose={handleMenuClose}
                sx={{
                  '& .MuiPaper-root': {
                    boxShadow: 'none',
                    borderRadius: '15px',
                    backgroundColor: '#E0DBE4',
                  },
                  '& .MuiMenuItem-root': {
                    padding: '5px 10px',
                    minHeight: '30px',
                    lineHeight: '1.3',
                  },
                }}
              >
                <MenuList>
                  <MenuItem
                    key="edit"
                    onClick={(e) => { e.stopPropagation(); handleUpdateOpen(task._id); handleMenuClose(); }}
                  >
                    <EditIcon style={{ marginRight: '8px' }} /> Edit
                  </MenuItem>
                  <MenuItem
                    key="delete"
                    onClick={(e) => { e.stopPropagation(); handleDeleteConfirmation(task._id); handleMenuClose(); }}
                  >
                    <DeleteIcon style={{ marginRight: '8px' }} /> Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : null
        }
      />

      <CardContent style={{ flex: 1, marginTop: '-30px' }}>
        <div style={{ height: '50px' }}>
          <Typography style={{ color: 'black', display: 'flex', alignItems: 'center' }}>
            {assignee ? (
              <>
                <Avatar
                  alt={assignee.name}
                  src={assignee.profile_img || ''}
                  style={{
                    width: '30px',
                    height: '30px',
                    marginRight: '5px',
                    backgroundColor: assignee.profile_img ? undefined : '#cfcfcf',
                  }}
                />
                <span>{assignee.name}</span>
              </>
            ) : (
              <span>Assignee Not Found</span>
            )}
          </Typography>

          <Typography style={{ overflowWrap: 'break-word', color: 'black', marginTop: '10px', overflow: 'auto', maxHeight: '50px' }}>
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }} />
          </Typography>
        </div>

        {task.priority && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '40px' }}>
            <div
              style={{
                backgroundColor: priorityBg[task.priority] || '#000',
                color: priorityColor[task.priority] || '#fff',
                borderRadius: '12px',
                padding: '2px 6px',
                textAlign: 'center',
                fontSize: '0.8em',
                width: 'auto',
              }}
            >
              {task.priority}
            </div>
            <Typography style={{ color: 'black' }}>
              {task.end_date
                ? new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                : ''}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
