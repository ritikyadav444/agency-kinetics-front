import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Ticket.css";
import {
  deleteTicket,
  clearErrors,
  getTickets,
} from "../../actions/ticketAction";
import { DELETE_TICKET_RESET } from "../../constants/ticketConstants";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import NewTicket from "./NewTicket";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Container,
  CircularProgress,
  SvgIcon,
} from "@mui/material";
import CustomizedSnackbars from "../../snackbarToast";
import {
  createNotification,
  getAllNotifications,
} from "../../actions/notificationAction";
import UpdateTicket from "./UpdateTicket";
import InfoIcon from "@mui/icons-material/Info";
import {
  Fade,
  IconButton,
  Tooltip,
  Breadcrumbs,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DOMPurify from "dompurify";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditOffIcon from "@mui/icons-material/EditOff";
import AddIcon from "@mui/icons-material/Add";
import useSubscriptionDetails from "../../hooks/useSubscriptionDetails";
import { getClient } from "../../actions/clientAction";
import { getTeams } from "../../actions/teamAction";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 600,
  bgcolor: "rgb(245,245,245)",
  border: "2px solid rgb(127, 86, 217)",
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
  width: 800,
  height: 600,
  // backgroundColor: 'rgba(255, 255, 255, 0.9)',
  bgcolor: "rgb(245,245,245)",
  border: "2px solid rgb(127, 86, 217)",
  borderRadius: 5,
  boxShadow: 24,
  overflow: "auto",
  p: 4,
};

const Ticket = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const combined = useSelector((state) => state.logMember.combined);
  const { isExpired } = useSubscriptionDetails(
    combined?.user?._id
  );

  const { error, loading, tickets } = useSelector((state) => state.tickets);
  const clientTickets = tickets.filter(
    (ticket) => ticket.client_name === combined.user._id
  );
  const assigneeTickets = tickets.filter(
    (ticket) => ticket.assignee === combined.user._id
  );

  // console.log(assigneeTickets)

  const { deleteError, isDeleted } = useSelector((state) => state.ticketDU);
  const { combined: clients, loading: loadingClientDetails } = useSelector((state) => state.clients);
  const { combined: teamMembers, loading: loadingAssigneeDetails } = useSelector((state) => state.teams);
  const { orders, loading: loadingOrderDetails } = useSelector((state) => state.orders);

  const clientNamesMap = useMemo(() => {
    const map = {};
    (clients || []).forEach(c => { map[c._id] = `${c.fname} ${c.lname}`; });
    return map;
  }, [clients]);

  const teamNamesMap = useMemo(() => {
    const map = {};
    (teamMembers || []).forEach(m => {
      const fname = m.fname || "";
      const lname = m.lname || "";
      map[m._id] = fname && lname ? `${fname} ${lname}` : "";
    });
    return map;
  }, [teamMembers]);

  const orderNamesMap = useMemo(() => {
    const map = {};
    (orders || []).forEach(o => { map[o._id] = o.orderId; });
    return map;
  }, [orders]);

  const name = combined.user.fname + " " + combined.user.lname;
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

  const [selectedClientFromTicket, setselectedClientFromTicket] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const handleUpdateOpen = (ticketId) => {
    // Store the selected ticketId in the state or perform any other actions you need
    setSelectedTicketId(ticketId);

    // Open the update modal
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [ticketIdToDelete, setTicketIdToDelete] = useState(null);
  const [deletedTicket, setDeletedTicket] = useState(null);

  const handleDeleteConfirmation = (ticketId) => {
    setTicketIdToDelete(ticketId);
    setDeletedTicket(ticketId);
    const ticket = tickets.find(t => t._id === ticketId);
    if (ticket) setselectedClientFromTicket(ticket.client_name);
    setOpenConfirmDialog(true);
  };

  const handleDeleteTicket = () => {
    dispatch(deleteTicket(ticketIdToDelete));
    setTicketIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setTicketIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  // const deleteTicketHandler = (id) => {
  //   dispatch(deleteTicket(id));
  // };

  var originalRows;
  if (role === "Client") {
    originalRows = clientTickets;
  } else if (role === "Assignee") {
    originalRows = assigneeTickets;
  } else {
    originalRows = tickets;
  }

  const columns = [
    { field: 'ticketId', headerName: 'Ticket ID', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'subject', headerName: 'Subject', flex: 1, headerAlign: 'center', align: 'center', sortable: false },
    {
      field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingClientDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Client Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'assignedTo', headerName: 'Assigned To', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingAssigneeDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Assignee Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'orderId', headerName: 'Order ID', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingOrderDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Order Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Hold" ? "#ff9800" : params.value === "Open" ? "#ff0000" : params.value === "Close" ? "#4caf50" : "#000000",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'priority', headerName: 'Priority', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Lowest" ? "#E8EAF6" : params.value === "Low" ? "#E1F5FE" : params.value === "Normal" ? "#F1F8E9" : params.value === "High" ? "#FFF3E0" : params.value === "Highest" ? "#FFEBEE" : "#000000",
            color: params.value === "Lowest" ? "#3949AB" : params.value === "Low" ? "#0277BD" : params.value === "Normal" ? "#558B2F" : params.value === "High" ? "#EF6C00" : params.value === "Highest" ? "#C62828" : "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'desc', headerName: 'Description', flex: 1, headerAlign: 'center', align: 'center', sortable: false,
      renderCell: (params) => (
        <div style={{ textAlign: "center" }}>
          {params.value.length > 15 ? (
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(params.value.slice(0, 15) + "...") }} />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(params.value) }} />
          )}
        </div>
      ),
    },
    { field: 'issuedAt', headerName: 'Issued At', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const canDelete = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER";
        const canViewInfo = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "ASSIGNEE" || combined.user.role === "CLIENT";
        const canEdit = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER";
        const isClosed = params.row.status === "Close";
        return (
          <>
            {canViewInfo && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Ticket Information"}>
                <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick([params.row.id])}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={isClosed ? `Can't Edit as Ticket is Closed` : "Edit Ticket"}>
                <span>
                  <IconButton style={{ color: "#ffb66b", backgroundColor: "#f4f4f4" }} onClick={() => handleUpdateOpen(params.row.id)} disabled={isClosed || loading}>
                    {isClosed ? <EditOffIcon /> : <EditIcon />}
                  </IconButton>
                </span>
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

  const clientColumns = [
    { field: 'ticketId', headerName: 'Ticket ID', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'subject', headerName: 'Subject', flex: 1, headerAlign: 'center', align: 'center', sortable: false },
    {
      field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingClientDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Client Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'assignedTo', headerName: 'Assigned To', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingAssigneeDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Assignee Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'orderId', headerName: 'Order ID', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingOrderDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Order Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Hold" ? "#ff9800" : params.value === "Open" ? "#ff0000" : params.value === "Close" ? "#4caf50" : "#000000",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'priority', headerName: 'Priority', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Lowest" ? "#E8EAF6" : params.value === "Low" ? "#E1F5FE" : params.value === "Normal" ? "#F1F8E9" : params.value === "High" ? "#FFF3E0" : params.value === "Highest" ? "#FFEBEE" : "#000000",
            color: params.value === "Lowest" ? "#3949AB" : params.value === "Low" ? "#0277BD" : params.value === "Normal" ? "#558B2F" : params.value === "High" ? "#EF6C00" : params.value === "Highest" ? "#C62828" : "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'desc', headerName: 'Description', flex: 1, headerAlign: 'center', align: 'center', sortable: false,
      renderCell: (params) => (
        <div style={{ textAlign: "center" }}>
          {params.value.length > 15 ? (
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(params.value.substring(0, 15) + "...") }} />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(params.value) }} />
          )}
        </div>
      ),
    },
    { field: 'issuedAt', headerName: 'Issued At', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const canViewInfo = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "ASSIGNEE" || combined.user.role === "CLIENT";
        return (
          <>
            {canViewInfo && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Ticket Information"}>
                <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick([params.row.id])}>
                  <InfoIcon />
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
    ticketId: row.ticketId,
    subject:
      row.subject.length > 20 ? `${row.subject.slice(0, 20)}...` : row.subject,

    clientName:
      clientNamesMap[row.client_name] === undefined
        ? "Client Deleted"
        : clientNamesMap[row.client_name] === ""
        ? "Unnamed Client"
        : clientNamesMap[row.client_name],
    // clientName: clientNamesMap[row.client_name],
    assignedTo:
      teamNamesMap[row.assignee] === undefined
        ? "Assignee Deleted"
        : teamNamesMap[row.assignee] === ""
        ? "Unnamed Assignee"
        : teamNamesMap[row.assignee],
    // assignedTo: teamNamesMap[row.assignee] || '',
    orderId:
      orderNamesMap[row.orderId] === undefined
        ? "Order Deleted"
        : orderNamesMap[row.orderId] === ""
        ? "Unnamed Order"
        : orderNamesMap[row.orderId],
    // orderId: orderNamesMap[row.orderId] || '', // Map client name using client name map
    desc: row.description || "-",
    status: row.status,
    priority: row.priority,
    issuedAt: new Date(row.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  }));


  const superAdminId = combined?.superAdminId;

  const handleBreadcrumbClick = () => {
    navigate("/tickets");
  };

  const handleInfoClick = (row) => {
    const id = row[0];
    navigate(`/ticket/${id}`);
  };

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
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    dispatch(getTickets()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
    if (!clients?.length) dispatch(getClient());
    if (!teamMembers?.length) dispatch(getTeams());
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/tickets", {
        state: {
          snackbar: {
            message: `Ticket Deletion Failed as: ${deleteError}`,
            severity: "error",
          },
        },
      });
      dispatch({ type: DELETE_TICKET_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      dispatch({ type: DELETE_TICKET_RESET });
      dispatch(getTickets());
      dispatch(
        createNotification(
          combined.user._id,
          `Ticket #${deletedTicket.slice(-4)} Deleted Successfully`
        )
      );
      dispatch(
        createNotification(
          selectedClientFromTicket,
          `Ticket #${deletedTicket.slice(-4)} Deleted By ${role}: ${name}`
        )
      );
      if (combined.user.role !== "SUPERADMIN") {
        dispatch(
          createNotification(
            superAdminId,
            `Ticket #${deletedTicket.slice(-4)} Deleted Successfully By ${
              combined.user.fname
            } ${combined.user.lname}`
          )
        );
      }

      setSnackbarMessage("Ticket Deleted Successfully");
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
      <div className="ticket-dashboard-container">
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
              <Typography color="rgb(127, 86, 217)">Tickets</Typography>
            </Button>
          </Breadcrumbs>
          {/* <Link to="/new/ticket" className="createbtn">Create</Link> */}

          {combined.user.role === "SUPERADMIN" ||
          combined.user.role === "ADMIN" ||
          combined.user.role === "PROJECTMANAGER" ||
          combined.user.role === "CLIENT" ? (
            <Button
              style={{
                backgroundColor: "rgb(127, 86, 217)",
                marginLeft: "auto",
              }}
              onClick={handleOpen}
              variant="contained"
              type="submit"
              startIcon={<AddIcon />}
              disabled={isExpired}
            >
              Create Ticket
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
              component="h2"
              style={{ color: "rgb(127, 86, 217)", textAlign: "center" }}
            >
              Create New Ticket
            </Typography>
            <NewTicket handleClose={handleClose} />
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
              variant="h6"
              component="h2"
              style={{ color: "rgb(127, 86, 217)", textAlign: "center" }}
            >
              Update Ticket
            </Typography>
            <UpdateTicket
              handleUpdateClose={handleUpdateClose}
              selectedTicketId={selectedTicketId}
            />
          </Box>
        </Modal>

        {loading ||
        loadingAssigneeDetails ||
        loadingClientDetails ||
        loadingOrderDetails ? (
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
            {rows.length === 0 &&
            clientNamesMap &&
            teamNamesMap &&
            orderNamesMap ? (
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
                    viewBox="0 0 256 256"
                    style={{ color: "#B0BEC5", fontSize: "40px" }}
                  >
                    <path d="M240 52H16A12 12 0 0 0 4 64v128a12 12 0 0 0 12 12h224a12 12 0 0 0 12-12V64a12 12 0 0 0-12-12m-58.79 128H74.79A60.18 60.18 0 0 0 28 133.21v-10.42A60.18 60.18 0 0 0 74.79 76h106.42A60.18 60.18 0 0 0 228 122.79v10.42A60.18 60.18 0 0 0 181.21 180M228 97.94A36.23 36.23 0 0 1 206.06 76H228ZM49.94 76A36.23 36.23 0 0 1 28 97.94V76ZM28 158.06A36.23 36.23 0 0 1 49.94 180H28ZM206.06 180A36.23 36.23 0 0 1 228 158.06V180ZM128 88a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 56a16 16 0 1 1 16-16a16 16 0 0 1-16 16" />
                  </SvgIcon>
                </div>

                <Typography variant="h5">No support tickets</Typography>
                <Typography
                  variant="subtitle1"
                  style={{ marginTop: "10px", color: "#757575" }}
                >
                  Support tickets from your clients will appear here.
                </Typography>
              </Container>
            ) : (
              <>
                {role !== "Client" ? (
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
                ) : (
                  <DataGrid
                    rows={rows}
                    columns={clientColumns}
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
          </>
        )}

        <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
          <DialogTitle style={{ color: "#d11a2a" }}>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this ticket?
          </DialogContent>
          <DialogActions>
            <Button
              style={{ color: "black" }}
              onClick={handleCloseConfirmDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTicket}
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
export default Ticket;
