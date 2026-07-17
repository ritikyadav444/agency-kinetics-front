import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useRef, useState, useMemo } from "react";
import MetaData from "../layout/MetaData";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Invoices.css";
import {
  deleteInvoice,
  clearErrors,
  getInvoice,
} from "../../actions/invoiceAction";
import { DELETE_INVOICE_RESET } from "../../constants/invoicesConstants";
import NewInvoice from "./NewInvoice";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
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
  Breadcrumbs,
  Container,
  CircularProgress,
  SvgIcon,
} from "@mui/material";
import UpdateInvoice from "./UpdateInvoice";
import {
  createNotification,
  getAllNotifications,
} from "../../actions/notificationAction";
import InfoIcon from "@mui/icons-material/Info";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CustomizedSnackbars from "../../snackbarToast";
import empty from "../../Images/empty-folder.png";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditOffIcon from "@mui/icons-material/EditOff";
import DownloadIcon from "@mui/icons-material/Download";
import ReactToPrint from "react-to-print";
import PrintFromInvoice from "./PrintFromInvoice";
import { baseURL } from "../../http";
import { getClient } from "../../actions/clientAction";
import { getService } from "../../actions/serviceAction";
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';
import PaymentIcon from "@mui/icons-material/Payment";
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

const Invoices = () => {
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const combined = useSelector((state) => state.logMember.combined);
  const { deleteError, isDeleted } = useSelector((state) => state.invoiceDU);
  const { error, loading, invoices } = useSelector((state) => state.invoices);
  // console.log(invoices)
  const clientInvoices =
    invoices?.filter((invoice) => invoice.client_name === combined.user._id) ||
    [];
  const name = combined.user.fname + " " + combined.user.lname;
  const { subscriptionDetails, isLoading, isExpired } = useSubscriptionDetails(
    combined?.user?._id
  );

  let serviceCurrency = "";

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
  // console.log(role, role)

  const { combined: clients, loading: loadingClientDetails } = useSelector((state) => state.clients);
  const { services, loading: loadingOSDetails } = useSelector((state) => state.services);
  const { orders } = useSelector((state) => state.orders);

  const clientNamesMap = useMemo(() => {
    const map = {};
    (clients || []).forEach(c => {
      map[c._id] = {
        name: `${c.fname} ${c.lname}`,
        country: c.country || "",
        state: c.state || "",
        city: c.city || "",
        postalCode: c.postalCode || "",
      };
    });
    return map;
  }, [clients]);

  const ordersMap = useMemo(() => {
    const map = {};
    (orders || []).forEach(o => {
      map[o._id] = { orderId: o.orderId, serviceId: o.serviceId, quantity: o.quantity, unitPrice: o.budget };
    });
    return map;
  }, [orders]);

  const servicesMap = useMemo(() => {
    const map = {};
    (services || []).forEach(s => {
      map[s._id] = { service_name: s.service_name, currency: s.currency || "" };
    });
    return map;
  }, [services]);
  const printRef = useRef();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const [invoiceIdToDelete, setInvoiceIdToDelete] = useState(null);
  const [selectedInvoiceID, setselectedInvoiceID] = useState("");
  const [selectedClientFromInvoiceID, setselectedClientFromInvoiceID] =
    useState("");

  useEffect(() => {
    if (!clients?.length) dispatch(getClient());
    if (!services?.length) dispatch(getService());
  }, []);

  const handleDeleteConfirmation = (invoiceId) => {
    setInvoiceIdToDelete(invoiceId);
    const invoice = invoices.find(inv => inv._id === invoiceId);
    if (invoice) {
      setselectedInvoiceID(invoice.invoiceId);
      setselectedClientFromInvoiceID(invoice.client_name);
    }
    setOpenConfirmDialog(true);
  };

  const handleDeleteInvoice = () => {
    dispatch(deleteInvoice(invoiceIdToDelete));
    setInvoiceIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setInvoiceIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleBreadcrumbClick = () => {
    navigate("/invoices");
  };

  const [breadcrumbs, setBreadcrumbs] = React.useState([
    <Button
      color="inherit"
      href="/invoices"
      onClick={() => navigate("/invoices")}
    >
      Invoices
    </Button>,
  ]);

  const handleInfoClick = (id) => {
    navigate(`/invoice/${id}`);
    setBreadcrumbs([
      <Button
        onClick={handleBreadcrumbClick}
        style={{ background: "none", boxShadow: "none", textTransform: "none" }}
      >
        Invoices
      </Button>,
      <Typography color="textPrimary">Invoice Details</Typography>,
    ]);
  };

  var originalRows;
  if (role === "Client") {
    originalRows = clientInvoices;
  } else {
    originalRows = invoices;
  }
  // console.log(originalRows)

  const handleInvoicePayment = async (id) => {
    const userEmail = combined.user.email;
    const response = await fetch(
      `${baseURL}/api/v1/invoice/pay/${id}`,
      {
        method: "POST",
        credentials: 'include',

        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userEmail }),
      }
    );

    const data = await response.json();
    if (data.success && data.url) {
      window.location.href = data.url;
    } else {
      alert("Failed to initiate payment");
    }
  };

  const columns = [
    { field: 'invoiceId', headerName: 'Invoice ID', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'orderId', headerName: 'Order IDs', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        const values = params.value.split(", ").map((val) => val.trim());
        if (loadingOSDetails) return <div style={{ textAlign: "center" }}></div>;
        return (
          <div style={{ textAlign: "center" }}>
            {values.map((val, index) => <div key={index} style={{ color: val === "Order Deleted" ? "red" : "inherit" }}>{val}</div>)}
          </div>
        );
      },
    },
    {
      field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingClientDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Client Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    { field: 'amount', headerName: 'Amount', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Open" ? "#BBDEFB" : params.value === "Paid" ? "#C8E6C9" : params.value === "Draft" ? "#FFF9C4" : params.value === "Void" ? "#E0E0E0" : params.value === "Uncollectable" ? "#FFD8CC" : "#000000",
            color: params.value === "Open" ? "#1976D2" : params.value === "Paid" ? "#388E3C" : params.value === "Draft" ? "#FBC02D" : params.value === "Void" ? "#616161" : params.value === "Uncollectable" ? "#E64A19" : "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    { field: 'createdAt', headerName: 'Issued At', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const canDelete = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER";
        const canEdit = combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER";
        const isPaidOrVoid = params.row.status === "Paid" || params.row.status === "Void";
        return (
          <>
            <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Invoice Information"}>
              <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick(params.row.id)}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={isPaidOrVoid ? `Can't Edit as Invoice is ${params.row.status}` : "Edit Invoice"}>
                <span>
                  <IconButton style={{ color: "#ffb66b", backgroundColor: "#f4f4f4" }} onClick={() => handleUpdateOpen(params.row.id)} disabled={isPaidOrVoid || loading}>
                    {isPaidOrVoid ? <EditOffIcon /> : <EditIcon />}
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
    { field: 'invoiceId', headerName: 'Invoice ID', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'orderId', headerName: 'Order IDs', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        const values = params.value.split(", ").map((val) => val.trim());
        if (loadingOSDetails) return <div style={{ textAlign: "center" }}></div>;
        return (
          <div style={{ textAlign: "center" }}>
            {values.map((val, index) => <div key={index} style={{ color: val === "Order Deleted" ? "red" : "inherit" }}>{val}</div>)}
          </div>
        );
      },
    },
    {
      field: 'clientName', headerName: 'Client Name', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => {
        if (loadingClientDetails) return <div style={{ textAlign: "center" }}></div>;
        return <div style={{ textAlign: "center", color: params.value === "Client Deleted" ? "red" : "inherit" }}>{params.value}</div>;
      },
    },
    { field: 'amount', headerName: 'Amount', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.value === "Open" ? "#BBDEFB" : params.value === "Paid" ? "#C8E6C9" : params.value === "Draft" ? "#FFF9C4" : params.value === "Void" ? "#E0E0E0" : params.value === "Uncollectable" ? "#FFD8CC" : "#000000",
            color: params.value === "Open" ? "#1976D2" : params.value === "Paid" ? "#388E3C" : params.value === "Draft" ? "#FBC02D" : params.value === "Void" ? "#616161" : params.value === "Uncollectable" ? "#E64A19" : "#ffffff",
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    { field: 'createdAt', headerName: 'Issued At', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'actions', headerName: 'Actions', flex: 1, headerAlign: 'center', align: 'center', sortable: false, filterable: false,
      renderCell: (params) => {
        const isOpen = params.row.status === "Open";
        return (
          <>
            <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Invoice Information"}>
              <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInfoClick(params.row.id)}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            {isOpen && (
              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top" title={"Pay Amount"}>
                <IconButton style={{ color: "rgb(127, 86, 217)", backgroundColor: "#f4f4f4" }} onClick={() => handleInvoicePayment(params.row.id)}>
                  <PaymentIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
        );
      },
    },
  ];

  const rows = originalRows.map((row) => {
    const orderNames = row.orderIds
      .map((orderId) => {
        const order = ordersMap[orderId];
        const serviceDetails = order ? servicesMap[order.serviceId] : null;
        serviceCurrency = serviceDetails ? serviceDetails.currency : "";
        if (!order) {
          return "Order Deleted";
        }
        return order.orderId || "Unnamed Order";
      })
      .join(", "); // Join multiple order names into a single string

    const clientDetails = clientNamesMap[row.client_name];
    return {
      id: row._id,
      invoiceId: row.invoiceId,
      orderId: orderNames || "", // Display order names or a fallback string
      clientName: clientDetails
        ? clientDetails.name || "Unnamed Client"
        : "Client Deleted",
      country: clientDetails ? clientDetails.country || "" : "",
      state: clientDetails ? clientDetails.state || "" : "",
      city: clientDetails ? clientDetails.city || "" : "",
      postalCode: clientDetails ? clientDetails.postalCode || "" : "",
      amount: `${row.amount} ${serviceCurrency}` || "", // Assuming 'amount' is directly available
      status: row.status,
      createdAt: new Date(row.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };
  });


  const superAdminId = combined?.superAdminId;

  // useEffect(() => {
  //     const fetchClientData = async () => {
  //       try {
  //  //         const response = await fetch(`${baseURL}/api/v1/combined/getAllClient`, {
  //           headers: {
  //             'Authorization': `Bearer ${token}`
  //           }
  //         });
  //         if (!response.ok) {
  //           throw new Error(`Failed to fetch clients: ${response.status}`);
  //         }
  //         const data = await response.json();
  //         // console.log('Clients data:', data);
  //         const clientMap = {};
  //         data.combined.forEach((combined) => {
  //           clientMap[combined._id] = {
  //             name: combined.fname + " " + combined.lname,
  //             country: combined.country,
  //             city: combined.city,
  //             state: combined.state,
  //             postalCode: combined.postalCode}
  //         });
  //         // console.log("Client Map:", clientMap);
  //         setClientNamesMap(clientMap);
  //       } catch (error) {
  //         console.error('Error fetching clients:', error.message);
  //       }
  //     };
  //     fetchClientData();
  //   }, []);

  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  useEffect(() => {
    // console.log("here",loading, invoices, error)
  }, [loading]);

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
    dispatch(getInvoice()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/invoices", {
        state: {
          snackbar: {
            message: `Invoice Deletion Failed as: ${deleteError}`,
            severity: "error",
          },
        },
      });
      dispatch({ type: DELETE_INVOICE_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      dispatch({ type: DELETE_INVOICE_RESET });
      dispatch(getInvoice());
      dispatch(
        createNotification(
          selectedClientFromInvoiceID,
          `Invoice ${selectedInvoiceID} Deleted Successfully By ${role}: ${name}`
        )
      );
      dispatch(
        createNotification(
          combined.user._id,
          `Invoice ${selectedInvoiceID} Deleted Successfully`
        )
      );
      if (combined.user.role !== "SUPERADMIN") {
        dispatch(
          createNotification(
            superAdminId,
            `Invoice ${selectedInvoiceID} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`
          )
        );
      }

      setSnackbarMessage("Invoice Deleted Successfully");
      setSeverity("success");
      setSnackbarOpen(true);
    }
  }, [error, isDeleted, deleteError]);

  return (
    <div>
      <div className="invoice-dashboard-container">
        <CustomizedSnackbars
          open={snackbarOpen}
          handleClose={handleCloseSnackbar}
          message={snackbarMessage}
          severity={severity}
        />
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
              <Typography color="rgb(127, 86, 217)">Invoices</Typography>
            </Button>
          </Breadcrumbs>

          {combined.user.role === "SUPERADMIN" ||
          combined.user.role === "ADMIN" ||
          combined.user.role === "PROJECTMANAGER" ? (
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
              Create Invoice
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
              Create New Invoice
            </Typography>
            <NewInvoice handleClose={handleClose} />
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
              Update Invoice
            </Typography>
            <UpdateInvoice
              handleUpdateClose={handleUpdateClose}
              selectedInvoiceId={selectedInvoiceId}
            />
          </Box>
        </Modal>

        {loading || loadingClientDetails || loadingOSDetails ? (
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
            {rows.length === 0 && clientNamesMap && ordersMap && servicesMap ? (
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
                    viewBox="0 0 384 512"
                    style={{ color: "#B0BEC5", fontSize: "40px" }}
                  >
                    <g clipPath="url(#clip0_699_6)">
                      <path d="M377 105L279.1 7C274.6 2.5 268.5 0 262.1 0H256V128H384V121.9C384 115.6 381.5 109.5 377 105ZM224 136V0H24C10.7 0 0 10.7 0 24V488C0 501.3 10.7 512 24 512H360C373.3 512 384 501.3 384 488V160H248C234.8 160 224 149.2 224 136ZM64 72C64 67.58 67.58 64 72 64H152C156.42 64 160 67.58 160 72V88C160 92.42 156.42 96 152 96H72C67.58 96 64 92.42 64 88V72ZM64 152V136C64 131.58 67.58 128 72 128H152C156.42 128 160 131.58 160 136V152C160 156.42 156.42 160 152 160H72C67.58 160 64 156.42 64 152ZM208 415.88V440C208 444.42 204.42 448 200 448H184C179.58 448 176 444.42 176 440V415.71C164.71 415.13 153.73 411.19 144.63 404.36C140.73 401.43 140.53 395.59 144.06 392.22L155.81 381.01C158.58 378.37 162.7 378.25 165.94 380.28C169.81 382.7 174.2 384 178.76 384H206.87C213.37 384 218.67 378.08 218.67 370.81C218.67 364.86 215.06 359.62 209.9 358.08L164.9 344.58C146.31 339 133.32 321.16 133.32 301.19C133.32 276.67 152.37 256.75 175.99 256.12V232C175.99 227.58 179.57 224 183.99 224H199.99C204.41 224 207.99 227.58 207.99 232V256.29C219.28 256.87 230.26 260.8 239.36 267.64C243.26 270.57 243.46 276.41 239.93 279.78L228.18 290.99C225.41 293.63 221.29 293.75 218.05 291.72C214.18 289.29 209.79 288 205.23 288H177.12C170.62 288 165.32 293.92 165.32 301.19C165.32 307.14 168.93 312.38 174.09 313.92L219.09 327.42C237.68 333 250.67 350.84 250.67 370.81C250.67 395.34 231.62 415.25 208 415.88Z" />
                    </g>
                    <defs>
                      <clipPath id="clip0_699_6">
                        <rect width="384" height="512" fill="white" />
                      </clipPath>
                    </defs>
                  </SvgIcon>
                </div>
                <Typography variant="h5" style={{ marginBottom: "10px" }}>
                  No invoices generated
                </Typography>
                <Typography
                  variant="body1"
                  style={{ marginBottom: "20px", color: "#607D8B" }}
                >
                  Create your first invoice to start billing clients
                </Typography>
              </Container>
            ) : (
              <>
                {role === "Super Admin" ||
                role === "Admin" ||
                role === "Project Manager" ? (
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
            Are you sure you want to delete this invoice?
          </DialogContent>
          <DialogActions>
            <Button
              style={{ color: "black" }}
              onClick={handleCloseConfirmDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteInvoice}
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
export default Invoices;
