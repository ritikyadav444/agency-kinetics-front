import{useSelector, useDispatch} from "react-redux";
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { clearErrors, deleteTeam, getTeams } from "../../actions/teamAction.jsx";
import { DELETE_TEAM_RESET } from "../../constants/teamConstants.jsx";
import "./Team.css"
import NewTeam from "./NewTeam.jsx";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Container, Breadcrumbs } from '@mui/material';
import UpdateTeam from "./UpdateTeam.jsx";
import { resetState } from "../../reducers/teamReducer.jsx";
import {createNotification, getAllNotifications } from "../../actions/notificationAction.jsx";
import { Fade, IconButton, Tooltip } from "@mui/material";
import PendingActionsSharpIcon from '@mui/icons-material/PendingActionsSharp';
import CustomizedSnackbars from "../../snackbarToast.jsx";
import empty from '../../Images/empty-folder.png'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { baseURL } from "../../http.js";
import { fetchSubscriptionDetails } from "../../actions/subscriptionAction.jsx";
import AddIcon from '@mui/icons-material/Add';

const updateStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  height: 400,
  // boxShadow: '5px 5px 5px 5px rgba(255, 177, 0, 0.9)',
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  borderRadius: 5, 
  overflow:'auto',
  p: 4,
  
};
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  height: 500,
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  // boxShadow: '5px 5px 5px 5px rgba(255, 177, 0, 0.9)',
  borderRadius: 5, // Set border radius to 0 for rectangular border
  overflow:'auto',
  p: 4,
};

const Team = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const {error, loading, combined: teams = []} = useSelector((state)=>state.teams)
  const { error: deleteError, isDeleted } = useSelector((state) => state.teamDU);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

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
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  useEffect(() => {
      const getSubscription = async () => {
          if (combined?.user?._id) {
              try {
                  const details = await fetchSubscriptionDetails(combined.user._id);
                  setSubscriptionDetails(details);
              } catch (error) {
                  console.error("Failed to fetch subscription details:", error.message);
              }
          }
      };

      getSubscription();
  }, []);


  const maxTeamMembers = Math.max(
    ...(subscriptionDetails?.subscription?.plans || [])
      .filter(plan => plan.status === "active" || plan.status === "trial")  // Only filter active or trial plans
      .map(plan => plan.maxTeamMembers)  // Get maxTeamMembers
  );
  
  // console.log(maxTeamMembers);
    
  
  

  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (teamId) => {
    setSelectedTeamId(teamId);
    setOpenUpdateModal(true);
  };

  const handleUpdateClose = () => {
    setSelectedTeamId(null);
    setOpenUpdateModal(false);
  };

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [teamIdToDelete, setTeamIdToDelete] = useState(null);

  const [selectedTeamName, setselectedTeamName] = useState('')
  const getName = async (teamId) => {
    try {
      const response = await fetch(`${baseURL}/api/v1/get/team/${teamId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch team: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Team data:', data);
      setselectedTeamName(data.combined.email)
      // console.log(selectedTeamName)
    } catch (error) {
      console.error('Error fetching team:', error.message);
    }
  };

  const handleDeleteConfirmation = (teamId) => {
    setTeamIdToDelete(teamId);
    setOpenConfirmDialog(true);
    getName(teamId)

  };

  const handleDeleteMember = () => {
    dispatch(deleteTeam(teamIdToDelete));
    setTeamIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setTeamIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleBreadcrumbClick = () => {
    navigate('/teams');
  };

  const originalRows = teams

  const columns = [
    {
      field: 'teamId',
      headerName: 'Team ID',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'memberEmail',
      headerName: 'Member Email',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'memberName',
      headerName: 'Member Name',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div style={{ textAlign: 'center', color: params.value === 'Pending to Join' ? 'rgb(127, 86, 217)' : 'inherit' }}>
          {params.value}
        </div>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const value = params.value;
        const displayValue = {
          SUPERADMIN: "Super Admin",
          PROJECTMANAGER: "Project Manager",
          ADMIN: "Admin",
          ASSIGNEE: "Assignee"
        }[value] || value;
        return (
          <Chip
            label={displayValue}
            size="small"
            sx={{
              backgroundColor: value === "SUPERADMIN" ? "#E6F9E6" :
                value === "ADMIN" ? "#E1F0FF" :
                value === "PROJECTMANAGER" ? "#FFF7E1" :
                value === "ASSIGNEE" ? "#FFEBEE" :
                "#000000",
              color: value === "SUPERADMIN" ? "#2E7D32" :
                value === "ADMIN" ? "#01579B" :
                value === "PROJECTMANAGER" ? "#FFA500" :
                value === "ASSIGNEE" ? "#D81B60" :
                "#ffffff",
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const canDelete = combined.user.role === "SUPERADMIN";
        const canEdit = combined.user.role === "SUPERADMIN";
        const verified = params.row.verified;
        return (
          <>
            {canEdit && (
              <Tooltip
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement="top"
                title={'Edit Role'}
              >
                <IconButton
                  style={{ color: '#ffb66b', backgroundColor: '#f4f4f4' }}
                  onClick={() => handleUpdateOpen(params.row.id)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton
                  style={{ color: '#d11a2a', backgroundColor: '#f4f4f4' }}
                  onClick={() => handleDeleteConfirmation(params.row.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
            {verified === false && (
              <Tooltip
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement="top"
                title={'Pending To Join'}
              >
                <span>
                  <IconButton disabled style={{ color: 'rgb(127, 86, 217)', backgroundColor: '#f4f4f4' }}>
                    <PendingActionsSharpIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </>
        );
      },
    },
  ];

  const rows = originalRows.map((row) => ({
    id: row._id,
    verified: row.verified,
    teamId: `#${row._id.slice(-4)}`,
    memberEmail: row.email || '',
    memberName: `${row.fname || row.lname ? `${row.fname} ${row.lname}` : 'Pending to Join'}`,
    role: row.role || '',
    createdOn: new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  })).sort((a, b) => (b.role === 'SUPERADMIN' ? 1 : -1) - (a.role === 'SUPERADMIN' ? 1 : -1));



  const superAdminId = combined?.superAdminId;

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
      navigate(location.pathname + location.search, { replace: true, state: undefined });
    }
  }, [location.state]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    dispatch(getTeams()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/teams", {
        state: {
          snackbar: {
            message: `Member Deletion Failed as: ${deleteError}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: DELETE_TEAM_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      dispatch({ type: DELETE_TEAM_RESET });
      dispatch(getTeams());
      dispatch(createNotification(combined.user._id, `Member ${selectedTeamName} Deleted Successfully`));
      if (combined.user.role !== 'SUPERADMIN'){
        dispatch(createNotification(superAdminId?._id, `Member ${selectedTeamName} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`));
      }

      setSnackbarMessage("Member Deleted Successfully");
      setSeverity('success');
      setSnackbarOpen(true);
    }
    dispatch(resetState());
  }, [error, isDeleted, deleteError]);

  return (
    <div>
      <CustomizedSnackbars
          open={snackbarOpen}
          handleClose={handleCloseSnackbar}
          message={snackbarMessage}
          severity={severity}
        />
        <div className="teams-dashboard-container">
          <div className="btn">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none' }}>
              <Typography color="rgb(127, 86, 217)">Teams</Typography>
            </Button>
          </Breadcrumbs>
          
          {(combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER") ? (
              <Tooltip 
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                  placement="bottom" 
                  title={subscriptionDetails && maxTeamMembers <= rows.length - 1 ? "Max limit reached" : `Maximum ${maxTeamMembers}`}
                  arrow
              >
                  <Button
                      style={{ backgroundColor: 'rgb(127, 86, 217)', marginLeft: 'auto', pointerEvents:'auto' }}
                      onClick={handleOpen}
                      variant="contained"
                      type="submit"
                      disabled={subscriptionDetails && maxTeamMembers <= rows.length - 1}
                      startIcon={<AddIcon/>}
                  >
                      Create Team Member
                  </Button>
              </Tooltip>
          ) : null}
          
          </div>

          <Modal
              open={openModal}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center'  }}>
                  Create New Team
                </Typography>
                <NewTeam handleClose={handleClose} />
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
                  Update Team Member
                </Typography>
                <UpdateTeam handleUpdateClose={handleUpdateClose} selectedTeamId={selectedTeamId} />
              </Box>
            </Modal>

          {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
              </div>
            ) : (
              <>
                {rows.length === 0 ? (
                  <Container style={{ marginTop: '150px', textAlign: 'center' }}>
                    <img
                      src={empty}
                      alt="Empty Folder"
                      style={{ width: "150px", height: "150px", marginBottom: "10px" }}
                    />
                    <Typography variant="h5">Please Add A Member</Typography>
                  </Container>
                ) : (
                  <DataGrid
                    rows={rows}
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
                )}
              </>
            )}

       

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle style={{ color: '#d11a2a' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this member?
        </DialogContent>
        <DialogActions>
          <Button 
              style={{ color: 'black' }} onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteMember}
            variant="contained"
            color="error"
            style={{ backgroundColor: '#d11a2a', color: 'white' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    </div>
  )
}

export default Team;

