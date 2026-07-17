import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState, useMemo } from "react";
import MetaData from "../layout/MetaData";
import { useNavigate, useLocation, Link } from "react-router-dom";
// import "./Quote.css"
import {
  deleteQuote,
  clearErrors,
  getQuote,
  updateQuote,
} from "../../actions/quoteAction";
import { DELETE_QUOTE_RESET } from "../../constants/quoteConstants";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import NewQuote from "./NewQuote";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
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
  Chip,
  IconButton,
  Tooltip,
  Fade,
  TableFooter,
  TablePagination,
  Container,
  CircularProgress,
  SvgIcon,
} from "@mui/material";
import {
  createNotification,
  getAllNotifications,
} from "../../actions/notificationAction";
import UpdateQuote from "./UpdateQuote";
import InfoIcon from "@mui/icons-material/Info";
import { Breadcrumbs } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CustomizedSnackbars from "../../snackbarToast";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import empty from "../../Images/empty-folder.png";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditOffIcon from "@mui/icons-material/EditOff";
import { baseURL } from "../../http";
import { getClient } from "../../actions/clientAction";
import { getService } from "../../actions/serviceAction";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import useSubscriptionDetails from "../../hooks/useSubscriptionDetails";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  height: 650,
  bgcolor: "rgb(245,245,245)",
  border: "2px solid rgb(127, 86, 217)",
  boxShadow: "5px 5px 5px 5px rgba(255, 177, 0, 0.9)",
  borderRadius: 5, // Set border radius to 0 for rectangular border
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
  boxShadow: "5px 5px 5px 5px rgba(255, 177, 0, 0.9)",
  bgcolor: "rgb(245,245,245)",
  border: "2px solid rgb(127, 86, 217)",
  borderRadius: 5,
  boxShadow: 24,
  overflow: "auto",
  p: 4,
};

const Quotes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleBreadcrumbClick = () => {
    navigate("/quotes");
  };

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

  const { error, loading, quotes } = useSelector((state) => state.quotes);
  const clientQuotes = quotes.filter(
    (quote) => quote.clientId === combined.user._id
  );

  // console.log('QQQ', quotes, clientQuotes)

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (quoteId) => {
    setSelectedQuoteId(quoteId);
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const { combined: clients, loading: loadingClientDetails } = useSelector((state) => state.clients);
  const { services, loading: loadingServiceDetails } = useSelector((state) => state.services);

  const clientNamesMap = useMemo(() => {
    const map = {};
    (clients || []).forEach(c => { map[c._id] = `${c.fname} ${c.lname}`; });
    return map;
  }, [clients]);

  const serviceNamesMap = useMemo(() => {
    const map = {};
    (services || []).forEach(s => { map[s._id] = s.service_name; });
    return map;
  }, [services]);

  const { deleteError, isDeleted } = useSelector((state) => state.quoteDU);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [quoteIdToDelete, setQuoteIdToDelete] = useState(null);
  const handleDeleteConfirmation = (quoteId) => {
    setQuoteIdToDelete(quoteId);
    setOpenConfirmDialog(true);
  };

  const handleDeleteQuote = () => {
    dispatch(deleteQuote(quoteIdToDelete));
    setQuoteIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setQuoteIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const [breadcrumbs, setBreadcrumbs] = React.useState([
    <Link
      color="inherit"
      href="/quotes"
      onClick={() => navigate("/quotes")}
    >
      Quotes
    </Link>,
  ]);

  const handleInfoClick = (id) => {
    navigate(`/quote/${id}`);
    setBreadcrumbs([
      <Button
        onClick={handleBreadcrumbClick}
        style={{ background: "none", boxShadow: "none", textTransform: "none" }}
      >
        Quotes
      </Button>,
      <Typography color="textPrimary">Quote Details</Typography>,
    ]);
  };

  const handleStatusUpdate = (quoteId, status) => {
    const quoteData = { selected: status };

    dispatch(updateQuote(quoteId, quoteData))
      .then(() => {
        dispatch(getQuote());
      })
      .catch((error) => {
        console.error("Failed to update quote:", error);
      });
  };

  var originalRows;
  if (role === "Client") {
    originalRows = clientQuotes;
  } else {
    originalRows = quotes;
  }

  const columns = [
    { field: 'proposalId', headerName: 'Proposal ID', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'service', headerName: 'Service Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingServiceDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Service Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        const [leftValue] = params.value.split("-");
        if (loadingClientDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: leftValue === "Client Deleted" ? "red" : "inherit" }}>{leftValue.trim()}</div>;
      },
    },
    {
      field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Pending" ? "#FFF5E1" : params.value === "Accepted" ? "#E6F9E6" : params.value === "Rejected" ? "#FFE6E6" : "#000000",
            color: params.value === "Pending" ? "#FFA500" : params.value === "Accepted" ? "#32CD32" : params.value === "Rejected" ? "#FF4500" : "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    { field: 'budget', headerName: 'Budget', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'createdAt', headerName: 'Created At', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'attachment', headerName: 'Attachment', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => (
        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={params.value !== "No attachment" ? "Download Attachment" : "Attachment not available"}>
          <span>
            <IconButton style={{ color: "#7ed957" }} onClick={() => handleDownloadClick(params.value)} disabled={params.value === "No attachment"}>
              {params.value !== "No attachment" ? <DownloadIcon /> : <FileDownloadOffIcon />}
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const canDelete = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER";
        const canEdit = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "CLIENT";
        const isRejectedorAccepted = params.row.status === "Rejected" || params.row.status === "Accepted";
        return (
          <>
            <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Proposal Information"}>
              <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick(params.row.id)}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={isRejectedorAccepted ? `Can't Edit as Proposal is ${params.row.status}` : "Edit Proposal"}>
                <span>
                  <IconButton style={{ color: "#ffb66b", backgroundColor: "#f4f4f4" }} onClick={() => handleUpdateOpen(params.row.id)} disabled={isRejectedorAccepted || loading}>
                    {isRejectedorAccepted ? <EditOffIcon /> : <EditIcon />}
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
    { field: 'proposalId', headerName: 'Proposal ID', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'service', headerName: 'Service Name', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        const [leftValue] = params.value.split("-");
        return <div style={{ textAlign: "center", color: leftValue === "Client Deleted" ? "red" : "inherit" }}>{leftValue.trim()}</div>;
      },
    },
    {
      field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Pending" ? "#FFF5E1" : params.value === "Accepted" ? "#E6F9E6" : params.value === "Rejected" ? "#FFE6E6" : "#000000",
            color: params.value === "Pending" ? "#FFA500" : params.value === "Accepted" ? "#32CD32" : params.value === "Rejected" ? "#FF4500" : "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    { field: 'budget', headerName: 'Budget', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'createdAt', headerName: 'Created At', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'attachment', headerName: 'Attachment', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => (
        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={params.value !== "No attachment" ? "Download Attachment" : "Attachment not available"}>
          <span>
            <IconButton style={{ color: "#7ed957" }} onClick={() => handleDownloadClick(params.value)} disabled={params.value === "No attachment"}>
              {params.value !== "No attachment" ? <DownloadIcon /> : <FileDownloadOffIcon />}
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const canEdit = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "CLIENT";
        const isRejectedorAccepted = params.row.status === "Rejected" || params.row.status === "Accepted";
        const [, rightValue] = params.row.clientName.split("-");
        const savedRightValue = rightValue ? rightValue.trim() : "";
        const createdByClient = combined.user._id == savedRightValue;
        return (
          <>
            {canEdit && !isRejectedorAccepted && !createdByClient && (
              <>
                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Accept Proposal"}>
                  <span>
                    <IconButton style={{ color: "green" }} onClick={() => handleStatusUpdate(params.row.id, "Accepted")}>
                      <CheckIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Reject Proposal"}>
                  <span>
                    <IconButton style={{ color: "red" }} onClick={() => handleStatusUpdate(params.row.id, "Rejected")}>
                      <ClearIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
            <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Proposal Information"}>
              <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick(params.row.id)}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </>
        );
      },
    },
  ];

  const rows = originalRows.map((row, index) => ({
    rowIndex: index,
    id: row._id,
    proposalId: row.quoteId,
    service:
      serviceNamesMap[row.serviceId] === undefined
        ? "Service Deleted"
        : serviceNamesMap[row.serviceId] === ""
        ? "Unnamed Service"
        : serviceNamesMap[row.serviceId],
    clientName:
      clientNamesMap[row.clientId] === undefined
        ? "Client Deleted"
        : clientNamesMap[row.clientId] === ""
        ? "Unnamed Client"
        : `${clientNamesMap[row.clientId]}-${row.createdBy}`,
    status: row.selected,
    budget: row.budget,
    attachment: row.attachment ? row.attachment : "No attachment",
    createdAt: new Date(row.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    clientId: row.clientId,
  }));


  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const handleDownloadClick = (value) => {
    // console.log(value)
    if (value) {
      const link = document.createElement("a");
      link.href = value;
      link.setAttribute("download", `${value}`);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    } else {
      // console.log('Document not available');
    }
  };

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

  const superAdminId = combined?.superAdminId;

  useEffect(() => {
    dispatch(getQuote()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
    if (!clients?.length) dispatch(getClient());
    if (!services?.length) dispatch(getService());
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }

    if (deleteError) {
      navigate("/quotes", {
        state: {
          snackbar: {
            message: `Proposal Deletion Failed as: ${deleteError}`,
            severity: "error",
          },
        },
      });
      dispatch({ type: DELETE_QUOTE_RESET });
      dispatch(clearErrors());
    }

    if (isDeleted) {
      dispatch({ type: DELETE_QUOTE_RESET });
      dispatch(getQuote());
      dispatch(
        createNotification(combined.user._id, `Proposal Deleted Successfully`)
      );
      if (combined.user.role !== "SUPERADMIN") {
        dispatch(
          createNotification(
            superAdminId,
            `Proposal Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`
          )
        );
      }

      setSnackbarMessage("Proposal Deleted Successfully");
      setSeverity("success");
      setSnackbarOpen(true);
    }
  }, [error, isDeleted, deleteError]);
  return (
    <div>
      <div>
        <CustomizedSnackbars
          open={snackbarOpen}
          handleClose={handleCloseSnackbar}
          message={snackbarMessage}
          severity={severity}
        />
      </div>
      <div className="quote-dashboard-container">
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
              <Typography color="rgb(127, 86, 217)">Proposals</Typography>
            </Button>
          </Breadcrumbs>
          {/* <Link to="/new/quote" className="createbtn">Create</Link> */}
          {combined.user.role === "SUPERADMIN" ||
          combined.user.role === "ADMIN" ||
          combined.user.role === "PROJECTMANAGER" ||
          combined.user.role === "CLIENT" ? (
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
              Create Proposal
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
              Create New Proposal
            </Typography>
            <NewQuote handleClose={handleClose} />
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
              Update Proposal
            </Typography>
            <UpdateQuote
              handleUpdateClose={handleUpdateClose}
              selectedQuoteId={selectedQuoteId}
            />
          </Box>
        </Modal>

        {loading || loadingClientDetails || loadingServiceDetails ? (
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
            {rows.length === 0 && !loading ? (
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
                    width="40px"
                    height="40px"
                    viewBox="0 0 24 24"
                    style={{ color: "#B0BEC5", fontSize: "40px" }}
                  >
                    <g fill="none">
                      <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
                      <path
                        fill="currentColor"
                        d="M17 3a3 3 0 0 1 2.995 2.824L20 6v4.35l.594-.264c.614-.273 1.322.15 1.4.798L22 11v8a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19v-8c0-.672.675-1.147 1.297-.955l.11.041l.593.264V6a3 3 0 0 1 2.824-2.995L7 3zm0 2H7a1 1 0 0 0-1 1v5.239l6 2.667l6-2.667V6a1 1 0 0 0-1-1m-5 3a1 1 0 0 1 .117 1.993L12 10h-2a1 1 0 0 1-.117-1.993L10 8z"
                      ></path>
                    </g>
                  </SvgIcon>
                </div>

                <Typography variant="h5">No proposals created</Typography>
                <Typography
                  variant="subtitle1"
                  style={{ marginTop: "10px", color: "#757575" }}
                >
                  Start creating professional proposals for your clients
                </Typography>
              </Container>
            ) : (
              <>
                {(role === "Super Admin" ||
                  role === "Admin" ||
                  role === "Project Manager") &&
                !loading ? (
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
                  role === "Client" && (
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
                  )
                )}
              </>
            )}
          </>
        )}

        <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
          <DialogTitle style={{ color: "#d11a2a" }}>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this proposal?
          </DialogContent>
          <DialogActions>
            <Button
              style={{ color: "black" }}
              onClick={handleCloseConfirmDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteQuote}
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

export default Quotes;
