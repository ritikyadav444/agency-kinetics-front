import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState, useMemo } from "react";
import MetaData from "../layout/MetaData";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Order.css";
import {
  deleteOrder,
  clearErrors,
  getOrders,
  fetchOrders,
} from "../../actions/orderAction";
import { DELETE_ORDER_RESET } from "../../constants/orderConstants";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import NewOrder from "./NewOrder";
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
  Tooltip,
  Fade,
  TablePagination,
  IconButton,
  TableFooter,
  Breadcrumbs,
  CircularProgress,
  Container,
} from "@mui/material";
import CustomizedSnackbars from "../../snackbarToast";
import { DragHandle } from "@mui/icons-material";
import UpdateOrder from "./UpdateOrder";
import {
  createNotification,
  getAllNotifications,
} from "../../actions/notificationAction";
import InfoIcon from "@mui/icons-material/Info";
import ListIcon from "@mui/icons-material/List";
import { getTasks } from "../../actions/taskAction";
import { getClient } from "../../actions/clientAction";
import { getTeams } from "../../actions/teamAction";
import { getService } from "../../actions/serviceAction";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import empty from "../../Images/empty-folder.png";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditOffIcon from "@mui/icons-material/EditOff";
import { baseURL } from "../../http";
import { Inbox as InboxIcon } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
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
  width: 700,
  height: 500,
  // backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: "5px 5px 5px 5px rgba(255, 177, 0, 0.9)",
  bgcolor: "rgb(245,245,245)",
  border: "2px solid rgb(127, 86, 217)",
  borderRadius: 5,
  boxShadow: 24,
  overflow: "auto",
  p: 4,
};

const Order = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const combined = useSelector((state) => state.logMember.combined);
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
  const { subscriptionDetails, isLoading, isExpired } = useSubscriptionDetails(
    combined?.user?._id
  );

  const { error, loading, orders = [] } = useSelector((state) => state.orders);
  // console.log(orders)

  // const [orders, setOrders] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  // useEffect(() => {
  //   const loadOrders = async () => {
  //     setLoading(true);
  //     try {
  //       const fetchedOrders = await fetchOrders();
  //       setOrders(fetchedOrders);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadOrders();
  // }, []);
  const clientOrders = orders.filter(
    (order) => order.clientId === combined.user._id
  );
  // console.log(clientOrders);
  const {
    error: taskError,
    loading: taskLoading,
    tasks = [],
  } = useSelector((state) => state.tasks);
  // console.log(tasks)
  const assigneeOrders = orders.filter(
    (order) => order.assignee === combined.user._id
  );
  // console.log(assigneeOrders)

  const { deleteError, isDeleted } = useSelector((state) => state.orderDU);
  const { combined: clients = [], loading: loadingClientDetails } = useSelector((state) => state.clients);
  const { services = [], loading: loadingServiceDetails } = useSelector((state) => state.services);
  const { combined: teamMembers = [], loading: loadingAssigneeDetails } = useSelector((state) => state.teams);

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

  const teamNamesMap = useMemo(() => {
    const map = {};
    (teamMembers || []).forEach(m => {
      const fname = m.fname || "";
      const lname = m.lname || "";
      map[m._id] = fname && lname ? `${fname} ${lname}` : "";
    });
    return map;
  }, [teamMembers]);

  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState(null);

  const [selectedOrderName, setselectedOrderName] = useState("");
  const [selectedClientFromOrder, setselectedClientFromOrder] = useState("");

  const handleDeleteConfirmation = (orderId) => {
    setOrderIdToDelete(orderId);
    const order = orders.find(o => o._id === orderId);
    if (order) {
      setselectedOrderName(order.orderId);
      setselectedClientFromOrder(order.clientId);
    }
    setOpenConfirmDialog(true);
  };

  const handleDeleteOrder = () => {
    dispatch(deleteOrder(orderIdToDelete));
    setOrderIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setOrderIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleBreadcrumbClick = () => {
    navigate("/orders");
  };
  const [breadcrumbs, setBreadcrumbs] = React.useState([
    <Button
      color="inherit"
      href="/orders"
      onClick={() => navigate("/orders")}
    >
      Orders
    </Button>,
  ]);

  const handleInfoClick = (id) => {
    navigate(`/order/${id}`);
    setBreadcrumbs([
      <Button
        onClick={handleBreadcrumbClick}
        style={{ background: "none", boxShadow: "none", textTransform: "none" }}
      >
        Orders
      </Button>,
      <Typography color="textPrimary">Order Details</Typography>,
    ]);
  };

  const handleTaskClick = (id) => {
    dispatch(getTasks(id));
    navigate(`/task/order/${id}`);
    {
      /*component={Link} to={/task/${order._id}}*/
    }
    setBreadcrumbs([
      <Button
        onClick={handleBreadcrumbClick}
        style={{ background: "none", boxShadow: "none", textTransform: "none" }}
      >
        Orders
      </Button>,
      <Typography color="textPrimary">Task Details</Typography>,
    ]);

    // console.log(order);
  };

  var originalRows;
  if (role === "Client") {
    originalRows = clientOrders;
  } else if (role === "Assignee") {
    originalRows = assigneeOrders;
  } else {
    originalRows = orders;
  }

  const columns = [
    { field: 'orderId', headerName: 'Order ID', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingClientDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Client Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'service', headerName: 'Service Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingServiceDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Service Deleted" ? "red" : "inherit" }}>{params.value}</div>;
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
      field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Ongoing" ? "#E1F0FF" : params.value === "Review" ? "#FFF7E1" : params.value === "Completed" ? "#E5F8E5" : params.value === "Cancelled" ? "#FFE5E5" : "#000000",
            color: params.value === "Ongoing" ? "#1E90FF" : params.value === "Review" ? "#FFBF00" : params.value === "Completed" ? "#228B22" : params.value === "Cancelled" ? "#FF6347" : "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    { field: 'kickOffDate', headerName: 'Start Date', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'endDate', headerName: 'End Date', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'tasks', headerName: 'Tasks', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => (
        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Tasks"}>
          <IconButton style={{ color: "rgb(127, 86, 217)" }} onClick={() => handleTaskClick(params.row.id)}>
            <ListIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const canDelete = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "CLIENT";
        const canViewInfo = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "ASSIGNEE" || combined.user.role === "CLIENT";
        const canEdit = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER";
        const isCancelledorCompleted = params.row.status === "Cancelled" || params.row.status === "Completed";
        return (
          <>
            {canViewInfo && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Order Information"}>
                <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick(params.row.id)}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={isCancelledorCompleted ? `Can't Edit as Order is ${params.row.assignedTo}` : "Edit Order"}>
                <span>
                  <IconButton style={{ color: "#ffb66b", backgroundColor: "#f4f4f4" }} onClick={() => handleUpdateOpen(params.row.id)} disabled={isCancelledorCompleted || loading}>
                    {isCancelledorCompleted ? <EditOffIcon /> : <EditIcon />}
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
    { field: 'orderId', headerName: 'Order ID', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingClientDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Client Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    {
      field: 'service', headerName: 'Service Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingServiceDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Service Deleted" ? "red" : "inherit" }}>{params.value}</div>;
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
      field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Ongoing" ? "#E1F0FF" : params.value === "Review" ? "#FFF7E1" : params.value === "Completed" ? "#E5F8E5" : params.value === "Cancelled" ? "#FFE5E5" : "#000000",
            color: params.value === "Ongoing" ? "#1E90FF" : params.value === "Review" ? "#FFBF00" : params.value === "Completed" ? "#228B22" : params.value === "Cancelled" ? "#FF6347" : "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    { field: 'kickOffDate', headerName: 'Start Date', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'endDate', headerName: 'End Date', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'tasks', headerName: 'Tasks', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => (
        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Tasks"}>
          <IconButton style={{ color: "rgb(127, 86, 217)" }} onClick={() => handleTaskClick(params.row.id)}>
            <ListIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const canDelete = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "CLIENT";
        const canViewInfo = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "ASSIGNEE" || combined.user.role === "CLIENT";
        return (
          <>
            {canViewInfo && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Order Information"}>
                <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick(params.row.id)}>
                  <InfoIcon />
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

  const data = originalRows.map((row, index) => ({
    id: row._id,
    orderId: row.orderId,
    clientName:
      clientNamesMap[row.clientId] === undefined
        ? "Client Deleted"
        : clientNamesMap[row.clientId] === ""
        ? "Unnamed Client"
        : clientNamesMap[row.clientId],
    service:
      serviceNamesMap[row.serviceId] === undefined
        ? "Service Deleted"
        : serviceNamesMap[row.serviceId] === ""
        ? "Unnamed Service"
        : serviceNamesMap[row.serviceId],
    assignedTo:
      teamNamesMap[row.assignee] === undefined
        ? "Assignee Deleted"
        : teamNamesMap[row.assignee] === ""
        ? "Unnamed Assignee"
        : teamNamesMap[row.assignee],
    status: row.status,
    kickOffDate: new Date(row.kick_off_date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    endDate: new Date(row.end_date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  }));

  const superAdminId = combined?.superAdminId;

  useEffect(() => {
    dispatch(getOrders()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
    if (!clients?.length) dispatch(getClient());
    if (!services?.length) dispatch(getService());
    if (!teamMembers?.length) dispatch(getTeams());
  }, []);

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

  useEffect(() => {
    // console.log('errorrere', error, loading, orders)
  }, [error, loading, orders]);

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/orders", {
        state: {
          snackbar: {
            message: `Order Deletion Failed`,
            severity: "error",
          },
        },
      });
      dispatch({ type: DELETE_ORDER_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      dispatch({ type: DELETE_ORDER_RESET });
      dispatch(getOrders());
      dispatch(
        createNotification(
          combined.user._id,
          `Order ${selectedOrderName} Deleted Successfully`
        )
      );
      dispatch(
        createNotification(
          selectedClientFromOrder,
          `Order ${selectedOrderName} Deleted By ${role}: ${name}`
        )
      );
      if (combined.user.role !== "SUPERADMIN") {
        dispatch(
          createNotification(
            superAdminId,
            `Order ${selectedOrderName} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`
          )
        );
      }

      setSnackbarMessage("Order Deleted Successfully");
      setSnackbarOpen(true);
      setSeverity("success");
    }
  }, [error, isDeleted, deleteError]);

  return (
    <div>
      <div className="order-dashboard-container">
        <div className="btn">
          {/* <Link to="/new/order" className="createbtn">Create</Link> */}

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
              <Typography color="rgb(127, 86, 217)">Orders</Typography>
            </Button>
          </Breadcrumbs>

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
              Create Order
            </Button>
          ) : null}
        </div>

        <CustomizedSnackbars
          open={snackbarOpen}
          handleClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          severity={severity}
        />

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
              Create New Order
            </Typography>
            <NewOrder handleClose={handleClose} />
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
              Update Order
            </Typography>
            <UpdateOrder
              handleUpdateClose={handleUpdateClose}
              selectedOrderId={selectedOrderId}
            />
          </Box>
        </Modal>

        {loading ||
        loadingAssigneeDetails ||
        loadingClientDetails ||
        loadingServiceDetails ? (
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
            {data.length === 0 ? (
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
                  <InboxIcon style={{ fontSize: "50px", color: "#B0BEC5" }} />
                </div>
                <Typography variant="h5" style={{ marginBottom: "10px" }}>
                  No orders yet
                </Typography>
                <Typography
                  variant="body1"
                  style={{ marginBottom: "20px", color: "#607D8B" }}
                >
                  Create your first order to start tracking your business
                  transactions
                </Typography>
              </Container>
            ) : (
              <>
                {role === "Super Admin" ||
                role === "Admin" ||
                role === "Project Manager" ||
                role === "Assignee" ? (
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
                ) : (
                  role === "Client" && (
                    <DataGrid
                      rows={data}
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
            Are you sure you want to delete this order?
          </DialogContent>
          <DialogActions>
            <Button
              style={{ color: "black" }}
              onClick={handleCloseConfirmDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteOrder}
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

export default Order;
