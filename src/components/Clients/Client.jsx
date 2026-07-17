import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import {
  deleteClient,
  clearErrors,
  getClient,
  getClientDetails,
} from "../../actions/clientAction";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { DELETE_CLIENT_RESET } from "../../constants/clientsConstants";
import "./Client.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import NewClient from "./NewClient";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  createNotification,
  getAllNotifications,
} from "../../actions/notificationAction";
import InfoIcon from "@mui/icons-material/Info";
import ListIcon from "@mui/icons-material/List";
import {
  Breadcrumbs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableFooter,
  TablePagination,
  Tooltip,
  Fade,
  CircularProgress,
  Container,
  SvgIcon,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import empty from "../../Images/empty-folder.png";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";

import UpdateClient from "./UpdateClient";
import CustomizedSnackbars from "../../snackbarToast";
import { baseURL } from "../../http";
import useSubscriptionDetails from "../../hooks/useSubscriptionDetails";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 600,
  bgcolor: "rgb(245,245,245)",
  border: "2px solid rgb(127, 86, 217)",
  boxShadow: "5px 5px 5px 5px rgba(255, 177, 0, 0.9)",
  borderRadius: 5,
  boxShadow: 24,
  overflow: "auto",
  p: 4,
};

const updateStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  height: 500,
  boxShadow: "5px 5px 5px 5px rgba(255, 177, 0, 0.9)",
  bgcolor: "rgb(245,245,245)",
  border: "2px solid rgb(127, 86, 217)",
  borderRadius: 5,
  boxShadow: 24,
  overflow: "auto",
  p: 4,
};

const Client = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    error,
    loading,
    combined: clients,
  } = useSelector((state) => state.clients);
  const { error: deleteError, isDeleted } = useSelector(
    (state) => state.clientDU
  );
  // console.log(clients)
  const combined = useSelector((state) => state.logMember.combined);
  const name = combined.user.fname + " " + combined.user.lname;
  const { subscriptionDetails, isLoading, isExpired } = useSubscriptionDetails(
    combined?.user?._id
  );

  const formatRole = (role) => {
    switch (role) {
      case "ASSIGNEE":
        return "Assignee";
      case "PROJECTMANAGER":
        return "Project Manager";
      case "ADMIN":
        return "Admin";
      case "SUPERADMIN":
        return "Super Admin";
      case "CLIENT":
        return "Client";
      default:
        return role;
    }
  };
  const role = formatRole(combined.user.role);
  // console.log(role)

  const [selectedClientName, setselectedClientName] = useState("");
  const getName = async (clientId) => {
    try {
      const response = await fetch(
        `${baseURL}/api/v1/get/client/${clientId}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch client: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Client data:', data);
      setselectedClientName(data.combined.fname + " " + data.combined.lname);
      // console.log(selectedClientName)
    } catch (error) {
      console.error("Error fetching Client:", error.message);
    }
  };

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");

  const handleUpdateOpen = (clientId) => {
    setSelectedClientId(clientId);

    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);

  const handleDeleteConfirmation = (clientId) => {
    // console.log(clientId)
    setClientIdToDelete(clientId);
    setOpenConfirmDialog(true);
    getName(clientId);
  };

  const handleDeleteClient = () => {
    dispatch(deleteClient(clientIdToDelete));
    setClientIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setClientIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleBreadcrumbClick = () => {
    navigate("/clients");
  };

  const [breadcrumbs, setBreadcrumbs] = React.useState([
    <Button
      color="inherit"
      href="/clients"
      onClick={() => navigate("/clients")}
    >
      Clients
    </Button>,
  ]);

  const handleInfoClick = (id) => {
    navigate(`/client/${id}`);
    setBreadcrumbs([
      <Button
        onClick={handleBreadcrumbClick}
        style={{ background: "none", boxShadow: "none", textTransform: "none" }}
      >
        Clients
      </Button>,
      <Typography color="textPrimary">Client Details</Typography>,
    ]);
  };

  const originalRows = clients;

  const columns = [
    { field: 'clientId', headerName: 'Client ID', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'clientEmail', headerName: 'Client Email', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'address', headerName: 'Address', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'createdAt', headerName: 'Created On', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const canDelete = combined.user.role === "SUPERADMIN";
        const canViewInfo = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "ASSIGNEE" || combined.user.role === "CLIENT";
        const isCancelledorCompleted = params.row.address === "Cancelled" || params.row.address === "Completed";
        const canEdit = combined.user.role === "SUPERADMIN" || combined.user.role === "CLIENT";
        return (
          <>
            {canViewInfo && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Client Information"}>
                <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick(params.row.id)}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Edit Client"}>
                <IconButton style={{ color: "#ffb66b", backgroundColor: "#f4f4f4" }} onClick={() => handleUpdateOpen(params.row.id)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton style={{ color: "#d11a2a", backgroundColor: "#f4f4f4" }} onClick={() => handleDeleteConfirmation(params.row.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
        );
      },
    },
  ];

  const rows = originalRows.map((row, index) => ({
    id: row._id,
    clientId: `#${row._id.slice(-4)}`,
    clientEmail: row.email,
    clientName: row.fname + " " + row.lname,
    address:
      [row.city, row.state, row.country].filter(Boolean).join(", ") || "",

    createdAt: new Date(row.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  }));

  const superAdminId = combined?.superAdminId;

  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");

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
    dispatch(getClient()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/clients", {
        state: {
          snackbar: {
            message: `Client Deletion Failed as: ${deleteError}`,
            severity: "error",
          },
        },
      });
      dispatch({ type: DELETE_CLIENT_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      dispatch({ type: DELETE_CLIENT_RESET });
      dispatch(getClient());
      dispatch(
        createNotification(
          combined.user._id,
          `Client ${selectedClientName} Deleted Successfully`
        )
      );
      if (combined.user.role !== "SUPERADMIN") {
        dispatch(
          createNotification(
            superAdminId,
            `Client ${selectedClientName} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`
          )
        );
      }
      setSnackbarMessage("Client Deleted Successfully");
      setSeverity("success");
      setSnackbarOpen(true);
    }
  }, [error, isDeleted, deleteError]);

  return (
    <div>
      <CustomizedSnackbars
        open={snackbarOpen}
        handleClose={handleCloseSnackbar}
        message={snackbarMessage}
        severity={severity}
      />

      <div className="client-container">
        <div className="btn">
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Button
              onClick={handleBreadcrumbClick}
              style={{
                background: "none",
                boxShadow: "none",
                textTransform: "none",
              }}
            >
              <Typography color="rgb(127, 86, 217)">Clients</Typography>
            </Button>
          </Breadcrumbs>

          {combined.user.role === "SUPERADMIN" ? (
            <Button
              startIcon={<AddIcon />}
              style={{
                backgroundColor: "rgb(127, 86, 217)",
                marginLeft: "auto",
              }}
              onClick={handleOpen}
              variant="contained"
              type="submit"
              disabled={isExpired}
            >
              Create Client
            </Button>
          ) : null}
        </div>

        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              style={{ color: "rgb(127, 86, 217)", textAlign: "center" }}
              component="h2"
            >
              Create New Client
            </Typography>
            <NewClient handleClose={handleClose} />
          </Box>
        </Modal>

        <Modal
          open={openUpdateModal}
          onClose={handleUpdateClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={updateStyle}>
            <Typography
              id="modal-modal-title"
              style={{ color: "rgb(127, 86, 217)", textAlign: "center" }}
              variant="h6"
              component="h2"
            >
              Update Client
            </Typography>
            <UpdateClient
              handleUpdateClose={handleUpdateClose}
              selectedClientId={selectedClientId}
            />
          </Box>
        </Modal>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <>
            {rows.length === 0 ? (
              <Container style={{ marginTop: "150px", textAlign: "center" }}>
                <div
                  style={{
                    width: "75px",
                    height: "75px",
                    borderRadius: "50%",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px auto",
                  }}
                >
                  <SvgIcon
                    width="1em"
                    height="1em"
                    viewBox="0 0 28 28"
                    style={{ fontSize: "40px", color: "#B0BEC5" }}
                  >
                    <path d="M15.114 25.719A7.48 7.48 0 0 1 13 20.5c0-1.688.558-3.247 1.5-4.5H5a3 3 0 0 0-3 3v.715C2 23.433 6.21 26 12 26a17 17 0 0 0 3.114-.281M18 8A6 6 0 1 0 6 8a6 6 0 0 0 12 0m2.5 19a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13m0-11a.5.5 0 0 1 .5.5V20h3.5a.5.5 0 0 1 0 1H21v3.5a.5.5 0 0 1-1 0V21h-3.5a.5.5 0 0 1 0-1H20v-3.5a.5.5 0 0 1 .5-.5"></path>
                  </SvgIcon>
                </div>
                <Typography variant="h5" style={{ marginBottom: "10px" }}>
                  No clients yet
                </Typography>
                <Typography
                  variant="body1"
                  style={{ marginBottom: "20px", color: "#607D8B" }}
                >
                  Add your first client to start managing customer relationships
                </Typography>
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
          <DialogTitle style={{ color: "#d11a2a" }}>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this Client?
          </DialogContent>
          <DialogActions>
            <Button
              style={{ color: "black" }}
              onClick={handleCloseConfirmDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteClient}
              variant="contained"
              color="error"
              style={{ backgroundColor: "#d11a2a", color: "white" }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Client;
