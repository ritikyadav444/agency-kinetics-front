import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState, useCallback } from "react";
import MetaData from "../layout/MetaData";
import { getService } from "../../actions/serviceAction.jsx";
// import ServiceCard from "./ServiceCard.jsx";
import { useNavigate, Link } from "react-router-dom";
import { clearErrors, deleteService } from "../../actions/serviceAction";
import { DELETE_SERVICE_RESET } from "../../constants/serviceConstant";
import service_cover from "../../Images/service_dummy.png";
import NewService from "./NewService.jsx";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Breadcrumbs,
  CardHeader,
  Fade,
  IconButton,
  Tooltip,
  Container,
  CardMedia,
  Menu,
  MenuItem,
  SvgIcon,
} from "@mui/material";
import {
  createNotification,
  getAllNotifications,
} from "../../actions/notificationAction.jsx";
import UpdateService from "./UpdateService.jsx";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CustomizedSnackbars from "../../snackbarToast.jsx";
import { useLocation } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DOMPurify from "dompurify";
import empty from "../../Images/empty-folder.png";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { baseURL } from "../../http.js";
import useSubscriptionDetails from "../../hooks/useSubscriptionDetails.js";

const style = {
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

const Service = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading, services = [] } = useSelector((state) => state.services);
  const { deleteError, isDeleted } = useSelector((state) => state.serviceDU);
  const [openModal, setOpenModal] = useState(false);
  const combined = useSelector((state) => state.logMember.combined);
  // console.log(combined.workspace_name)
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
  const superAdminId = combined?.superAdminId;

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null);

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (serviceId) => {
    setSelectedServiceId(serviceId);
    setOpenUpdateModal(true);
  };
  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [selectedServiceName, setselectedServiceName] = useState("");
  const getName = async (serviceId) => {
    try {
      const response = await fetch(
        `${baseURL}/api/v1/get/service/${serviceId}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Services data:', data);
      setselectedServiceName(data.service.service_name);
      // console.log(selectedServiceName)
    } catch (error) {
      console.error("Error fetching services:", error.message);
    }
  };

  const handleDeleteConfirmation = (serviceId) => {
    setServiceIdToDelete(serviceId);
    setOpenConfirmDialog(true);
    getName(serviceId);
  };

  const handleDeleteService = () => {
    dispatch(deleteService(serviceIdToDelete));
    setServiceIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setServiceIdToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleBreadcrumbClick = () => {
    navigate("/services");
  };

  const [breadcrumbs, setBreadcrumbs] = React.useState([
    <Button
      color="inherit"
      href="/services"
      onClick={() => navigate("/services")}
    >
      Services
    </Button>,
  ]);

  const handleLearnMore = (id) => {
    // console.log("row", id);
    navigate(`/service/${id}`);
    setBreadcrumbs([
      <Button
        onClick={handleBreadcrumbClick}
        style={{ background: "none", boxShadow: "none", textTransform: "none" }}
      >
        Services
      </Button>,
      <Typography color="textPrimary">Quote Details</Typography>,
    ]);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuServiceId, setMenuServiceId] = useState(null);

  const handleMenuOpen = useCallback(
    (event, serviceId) => {
      // Close any open menu if it's different from the clicked one
      if (anchorEl && menuServiceId !== serviceId) {
        setAnchorEl(null);
        setMenuServiceId(null);
      }

      // Open the new menu
      setAnchorEl(event.currentTarget);
      setMenuServiceId(serviceId);
    },
    [anchorEl, menuServiceId]
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setMenuServiceId(null);
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
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Fetch on mount only
  useEffect(() => {
    dispatch(getService()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
  }, []);

  // React to delete/error outcomes
  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/services", {
        state: {
          snackbar: {
            message: `Service Deletion Failed as: ${deleteError}`,
            severity: "error",
          },
        },
      });
      dispatch({ type: DELETE_SERVICE_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      dispatch({ type: DELETE_SERVICE_RESET });
      dispatch(getService());
      dispatch(
        createNotification(
          combined.user._id,
          `Service ${selectedServiceName} Deleted Successfully`
        )
      );
      if (combined.user.role !== "SUPERADMIN") {
        dispatch(
          createNotification(
            superAdminId,
            `Service ${selectedServiceName} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`
          )
        );
      }
      setSnackbarMessage(`Service Deleted Successfully`);
      setSeverity("success");
      setSnackbarOpen(true);
    }
  }, [error, isDeleted, deleteError]);

  const getChipStyle = (type) => ({
    backgroundColor: type === "Recurring" ? "#D81B60" : "#9850DB",
    color: "white",
  });

  function formatToK(value) {
    return value >= 1000
      ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 2)}K`
      : value;
  }

  return (
    <div>
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
            <Typography color="rgb(127, 86, 217)">Services</Typography>
          </Button>
        </Breadcrumbs>
        {combined.user.role === "SUPERADMIN" ||
        combined.user.role === "ADMIN" ||
        combined.user.role === "PROJECTMANAGER" ? (
          <Button
            startIcon={<AddIcon />}
            style={{ backgroundColor: "rgb(127, 86, 217)", marginLeft: "auto" }}
            onClick={handleOpen}
            variant="contained"
            type="submit"
            disabled={isExpired}
          >
            Create Service
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
            Create New Service
          </Typography>
          <NewService handleClose={handleClose} />
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
            Update Service
          </Typography>
          <UpdateService
            handleUpdateClose={handleUpdateClose}
            selectedServiceId={selectedServiceId}
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
          {services.length === 0 && !loading ? (
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
                  viewBox="0 0 48 48"
                  style={{ color: "#B0BEC5", fontSize: "40px" }}
                >
                  <defs>
                    <mask id="ipSMallBag0">
                      <g fill="none" strokeLinejoin="round" strokeWidth="4">
                        <path
                          fill="#fff"
                          stroke="#fff"
                          d="M6 12.6V41a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V12.6z"
                        />
                        <path
                          stroke="#fff"
                          strokeLinecap="round"
                          d="M42 12.6L36.333 5H11.667L6 12.6v0"
                        />
                        <path
                          stroke="#000"
                          strokeLinecap="round"
                          d="M31.555 19.2c0 4.198-3.382 7.6-7.555 7.6s-7.556-3.402-7.556-7.6"
                        />
                      </g>
                    </mask>
                  </defs>
                  <path
                    fill="currentColor"
                    d="M0 0h48v48H0z"
                    mask="url(#ipSMallBag0)"
                  />
                </SvgIcon>
              </div>
              <Typography variant="h5">No services listed</Typography>
              <Typography
                variant="subtitle1"
                style={{ marginTop: "10px", color: "#757575" }}
              >
                Create your first service to showcase your offerings
              </Typography>
            </Container>
          ) : (
            <>
              <div className="main-content">
                <Grid
                  container
                  spacing={4}
                  style={{
                    paddingLeft: "20px",
                    paddingTop: "20px",
                    paddingRight: "20px",
                    paddingBottom: "20px",
                  }}
                >
                  {services &&
                    services.map((service) => (
                      <Grid item key={service._id} xs={12} sm={6} md={4} lg={3}>
                        <Card
                          sx={{
                            maxWidth: 345,
                            backgroundColor: "#F5E9FF",
                            borderRadius: 5,
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-10px) scale(1.05)",
                              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                            },
                          }}
                        >
                          <CardMedia
                            style={{
                              objectFit: "cover",
                              height: "200px",
                              width: "100%",
                            }}
                            component="img"
                            // alt={service.service_name}
                            height="200"
                            image={service.service_cover_img || service_cover}
                          />
                          <CardContent>
                            <Typography
                              gutterBottom
                              variant="h5"
                              component="div"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              {service.service_name.length > 20
                                ? `${service.service_name.slice(0, 15)}...`
                                : service.service_name}
                              <IconButton
                                onClick={(e) => handleMenuOpen(e, service._id)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Typography>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "10px",
                              }}
                            >
                              {service.service_amount &&
                              service.service_amount.min &&
                              service.service_amount.max ? (
                                <div style={{ textAlign: "left" }}>
                                  <Typography
                                    variant="body2"
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "black",
                                    }}
                                  >
                                    Starting At
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{
                                      fontSize: "1.2rem",
                                      color: "#d81b60",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {formatToK(service.service_amount.min)}{" "}
                                    {service.currency ? service.currency : ""}
                                  </Typography>
                                </div>
                              ) : (
                                <Typography
                                  variant="body2"
                                  style={{ fontSize: "1.2rem" }}
                                >
                                  {service.service_amount}{" "}
                                  {service.currency ? service.currency : ""}
                                </Typography>
                              )}
                              <Chip
                                label={service.service_pricing_type}
                                style={getChipStyle(
                                  service.service_pricing_type
                                )}
                              />
                            </div>
                          </CardContent>
                          <Menu
                            anchorEl={anchorEl}
                            keepMounted
                            open={
                              Boolean(anchorEl) && menuServiceId === service._id
                            }
                            onClose={handleMenuClose}
                            sx={{
                              "& .MuiPaper-root": {
                                boxShadow: "none",
                                borderRadius: "15px",
                                backgroundColor: "#E0DBE4",
                              },
                            }}
                          >
                            {(combined.user.role === "SUPERADMIN" ||
                              combined.user.role === "ADMIN" ||
                              combined.user.role === "PROJECTMANAGER") && [
                              <MenuItem
                                key="edit"
                                onClick={() => {
                                  handleUpdateOpen(service._id);
                                  handleMenuClose();
                                }}
                              >
                                <EditIcon style={{ marginRight: "10px" }} />{" "}
                                Edit
                              </MenuItem>,
                              <MenuItem
                                key="delete"
                                onClick={() => {
                                  handleDeleteConfirmation(service._id);
                                  handleMenuClose();
                                }}
                              >
                                <DeleteIcon style={{ marginRight: "10px" }} />{" "}
                                Delete
                              </MenuItem>,
                            ]}
                            <MenuItem
                              key="info"
                              onClick={() => {
                                handleLearnMore(service._id);
                                handleMenuClose();
                              }}
                            >
                              <InfoIcon style={{ marginRight: "10px" }} /> Info
                            </MenuItem>
                          </Menu>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </div>
            </>
          )}
        </>
      )}

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle style={{ color: "#d11a2a" }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this service?
        </DialogContent>
        <DialogActions>
          <Button style={{ color: "black" }} onClick={handleCloseConfirmDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteService}
            variant="contained"
            color="error"
            style={{ backgroundColor: "#d11a2a", color: "white" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Service;
