import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData.jsx";
import { clearErrors, deleteInvoice, getInvoice, getInvoiceDetails } from "../../actions/invoiceAction.jsx";
import { DELETE_INVOICE_RESET } from "../../constants/invoicesConstants.jsx";
import { createNotification, getAllNotifications } from "../../actions/notificationAction.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Breadcrumbs, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, Grid, Modal, Tooltip, Typography } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import UpdateInvoice from "./UpdateInvoice.jsx";
import { baseURL } from "../../http.js";
import ReactToPrint from 'react-to-print';
import PrintInvoice from './PrintInvoice';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const updateStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  height: 600,
  boxShadow: '5px 5px 5px 5px rgba(255, 177, 0, 0.9)',
  bgcolor: 'rgb(245,245,245)',
  border: '2px solid rgb(127, 86, 217)',
  borderRadius: 5,
  boxShadow: 24,
  overflow:'auto',
  p: 4,
 
};


const InvoiceDetails = () => {
  const printRef = useRef();
  const navigate = useNavigate()
  const { id } = useParams()
  const dispatch = useDispatch();
  const { invoice, error:invoiceDetailError } = useSelector(state => state.invoiceDetails);
  const {error, loading,invoices} = useSelector((state)=>state.invoices)
  const { deleteError, isDeleted } = useSelector((state) => state.invoiceDU);
  const combined = useSelector((state) => state.logMember.combined);
  const name = combined.user.fname + ' ' + combined.user.lname


  let serviceCurrency = ""
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
  const role = formatRole(combined.user.role)
  // console.log(role)
  const handleBreadcrumbClick = () => {
    navigate('/invoices');
  };

  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setOpenUpdateModal(true);
  };

  const handleUpdateClose = () => setOpenUpdateModal(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [invoiceIdToDelete, setInvoiceIdToDelete] = useState(null);

  const handleDeleteConfirmation = (invoiceId) => {
    setInvoiceIdToDelete(invoiceId);
    setOpenConfirmDialog(true);
    getName(invoiceId)
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

  const superAdminId = combined?.superAdminId;


  const [selectedInvoiceID, setselectedInvoiceID] = useState('')
  const [selectedClientFromInvoiceID, setselectedClientFromInvoiceID] = useState('')

  const getName = async (invoiceId) => {
    // console.log(invoiceId);
    try {
      const response = await fetch(`${baseURL}/api/v1/invoice/${invoiceId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Invoices data:', data);
      setselectedInvoiceID(data.invoice.invoiceId);
      setselectedClientFromInvoiceID(data.invoice.client_name);


      // console.log(selectedInvoiceID);
    } catch (error) {
      console.error('Error fetching invoices:', error.message);
    }
  };


  const [clientNamesMap, setClientNamesMap]=useState({});
  const [ordersMap, setOrdersMap] = useState({});
  const [servicesMap, setServicesMap] = useState({});

  const [loadingOSDetails, setLoadingOSDetails] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const fetchOrdersAndServices = async () => {
      try {
        const ordersResponse = await fetch(`${baseURL}/api/v1/orders`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!ordersResponse.ok) {
          throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
        }
        const ordersData = await ordersResponse.json();

        const ordersDataMap = {};
        ordersData.orders.forEach((order) => {
          ordersDataMap[order._id] = {
            orderId: order.orderId,
            serviceId: order.serviceId,
            quantity: order.quantity,
            unitPrice: order.budget
          };
        });
        setOrdersMap(ordersDataMap);

        const servicesResponse = await fetch(`${baseURL}/api/v1/services`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!servicesResponse.ok) {
          throw new Error(`Failed to fetch services: ${servicesResponse.status}`);
        }
        const servicesData = await servicesResponse.json();

        const servicesDataMap = {};
        servicesData.services.forEach((service) => {
          servicesDataMap[service._id] = {
            service_name: service.service_name,
            currency: service.currency
          }
        });
        setServicesMap(servicesDataMap);
        // console.log(ordersDataMap, servicesDataMap)

      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching data:', error.message);
      } finally {
        setLoadingOSDetails(false)
      }
    };
    fetchOrdersAndServices();
    return () => controller.abort();
  }, []);

  const [loadingClientDetails, setLoadingClientDetails] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const fetchClientData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/combined/getAllClient`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Clients data:', data);
        const clientMap = {};
        data.combined.forEach((combined) => {
          clientMap[combined._id] = {
            name: combined.fname + " " + combined.lname,
            country: combined.country,
            city: combined.city,
            state: combined.state,
            postalCode: combined.postalCode}
        });
        // console.log("Client Map:", clientMap);
        setClientNamesMap(clientMap);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching clients:', error.message);
      } finally {
        setLoadingClientDetails(false)
      }
    };
    fetchClientData();
    return () => controller.abort();
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
            severity: "error"
          }
        }
      });      
      dispatch({ type: DELETE_INVOICE_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      navigate("/invoices", {
        state: {
          snackbar: {
            message: "Invoice Deleted Successfully",
            severity: "success"
          }
        }
      });  
      dispatch({ type: DELETE_INVOICE_RESET });
      dispatch(createNotification(selectedClientFromInvoiceID, `Invoice ${selectedInvoiceID} Deleted Successfully By ${role}: ${name}`));
      dispatch(createNotification(combined.user._id, `Invoice ${selectedInvoiceID} Deleted Successfully`));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("SuperAdmin from UpdateInvoice", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Invoice ${selectedInvoiceID} Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`));
      }
      
      dispatch(getInvoice());
      dispatch(getAllNotifications(combined.user._id))
    }
  }, [dispatch, error, isDeleted, deleteError, navigate]);

  useEffect(() => {
      if(invoiceDetailError){
       dispatch(clearErrors)
    }
    dispatch(getInvoiceDetails(id));
  }, [dispatch, id, invoiceDetailError]);

  return (
    <div>
        <div className="btn">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none', color:'rgb(127, 86, 217)' }}>
            Invoices
            </Button>
            <Typography color="rgb(127, 86, 217)">Invoice Details</Typography>
          </Breadcrumbs>
          </div>


          <Modal
            open={openUpdateModal}
            onClose={handleUpdateClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={updateStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ color: 'rgb(127, 86, 217)', textAlign: 'center'  }}>
                Update Invoice
              </Typography>
              <UpdateInvoice handleUpdateClose={handleUpdateClose} selectedInvoiceId={selectedInvoiceId} />
            </Box>
          </Modal>


          <Grid container spacing={2} style={{marginTop:'10px', marginLeft:'10px', paddingRight:'50px', paddingBottom:'10px'}}>
              <Grid item xs={12}>
                <Card style={{backgroundColor:'rgb(245, 245, 245)'}}>
                  <CardHeader
                      title={<div style={{ display: 'flex', alignItems: 'center' }}>
                      Invoice
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft:'10px' }}>
                        <div style={{
                           backgroundColor: invoice.status === "Open" ? "#BBDEFB" :
                           invoice.status === "Paid" ? "#C8E6C9" :
                           invoice.status === "Draft" ? "#FFF9C4" :
                           invoice.status === "Void" ? "#E0E0E0" :
                           invoice.status === "Uncollectable" ? "#FFD8CC" :
                           "#000000",
                         color: invoice.status === "Open" ? "#1976D2" :
                           invoice.status === "Paid" ? "#388E3C" :
                           invoice.status === "Draft" ? "#FBC02D" :
                           invoice.status === "Void" ? "#616161" :
                           invoice.status === "Uncollectable" ? "#E64A19" :
                           "#ffffff",
                            borderRadius: '12px',
                            padding: '2px 6px', // Reduced padding
                            textAlign: 'center',
                            fontSize: '0.8em'
                        }}>
                          {invoice.status}
                        </div>
                      </div>
                    </div>}
                      subheader={invoice.invoiceId}
                      action={
                        <>
                        <ReactToPrint
                            trigger={() => <Button startIcon={<DownloadIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)', marginRight: '8px' }} variant="contained">
                              Download Invoice
                            </Button>}
                            content={() => printRef.current}
                          />
                          <div style={{ display: 'none' }}>
                            <PrintInvoice
                              ref={printRef}
                              invoice={invoice}
                              clientNamesMap={clientNamesMap}
                              ordersMap={ordersMap}
                              servicesMap={servicesMap}
                              superAdminId={superAdminId}
                            />
                          </div>


                        {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" ? (
                          <Tooltip
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            placement="top"
                            title={invoice.status === 'Paid' || invoice.status === 'Void' ? `Can't Edit as Invoice is ${invoice.status}` : ''}


                          >
                            <span>
                            <Button startIcon={<EditIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleUpdateOpen(invoice._id)} variant="contained" type="submit"
                            disabled={invoice.status === 'Paid' || invoice.status === 'Void'}
                            >
                              Edit
                            </Button>
                            </span>
                          </Tooltip>
                        ) : null}
                      </>
                      }
                    />
                     
       
                  <CardContent>


                      <Grid container spacing={2} style={{ padding: '10px', paddingRight:'10px' }}>
                       
                      <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px' }}>
                        <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight: 'bold' }}>
                          Order Ids and Services
                        </Typography>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                          {loadingOSDetails ? (
                            <span style={{ visibility: 'hidden' }}>Loading...</span>
                          ) : (
                            invoice.orderIds && invoice.orderIds.length > 0 ? (
                              invoice.orderIds.map((orderId, index) => {
                                const order = ordersMap[orderId];
                                const serviceDetails = order ? servicesMap[order.serviceId] : null;
                                const serviceName = serviceDetails ? serviceDetails.service_name : 'Unknown Service';
                                serviceCurrency = serviceDetails ? serviceDetails.currency : '';

                                const displayText = order === undefined
                                  ? 'Order Deleted'
                                  : (order === '')
                                    ? 'Unnamed Order'
                                    : `${order.orderId} (${serviceName})`;

                                return (
                                  <React.Fragment key={index}>
                                    <span style={{ color: displayText.includes('Order Deleted') ? 'red' : 'black' }}>
                                      {displayText}
                                    </span>
                                    {index < invoice.orderIds.length - 1 && ', '}
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              '-'
                            )
                          )}
                        </div>
                      </Grid>


                        <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginLeft: '5px'}}>
                          <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                            Created On
                          </Typography>
                          <Typography variant="body1" component="div" style={{ color: 'black' }}>
                            {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </Typography>
                        </Grid>


                      </Grid>
                     
                    </CardContent>

                  <Divider></Divider>

                  <CardHeader
                  title={'To'}
                  />
                  <CardContent>
                  <Grid container spacing={2} style={{ padding: '10px', paddingRight: '10px' }}>
                      <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                        <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight: 'bold' }}>
                          Client Name
                        </Typography>
                        <Typography variant="body1" component="div" style={{ color: 'black' }}>
                          {loadingClientDetails ? (
                            <span style={{ visibility: 'hidden' }}>Loading...</span>
                          ) : (
                            clientNamesMap[invoice.client_name] === undefined ? (
                              <span style={{ color: 'red' }}>Client Deleted</span>
                            ) : (clientNamesMap[invoice.client_name].name === '') ? (
                              'Unnamed client'
                            ) : (
                              clientNamesMap[invoice.client_name].name
                            )
                          )}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                        <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight: 'bold' }}>
                          Address
                        </Typography>
                        <Typography variant="body1" component="div" style={{ color: 'black' }}>
                          {loadingClientDetails ? (
                            <span style={{ visibility: 'hidden' }}>Loading...</span>
                          ) : (
                            [clientNamesMap[invoice.client_name]?.city, 
                            clientNamesMap[invoice.client_name]?.state, 
                            clientNamesMap[invoice.client_name]?.country]
                            .filter(Boolean)
                            .join(", ")
                          )}
                        </Typography>

                      </Grid>
                    </Grid>

                    </CardContent>
                

                    <Divider></Divider>
                 


                  <CardHeader
                      title={'Amount Details'}  
                  />
                  <CardContent >
                  <Grid
                    container
                    spacing={2}
                    style={{
                      borderRadius: '10px',
                      paddingRight: '60px',
                      marginRight: '5px',
                      marginBottom: '5px',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: 'rgb()',
                        borderRadius: '10px',
                        padding: '10px',
                        marginLeft: '10px',
                        width: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black', fontWeight:'bold' }}
                        >
                          Amount
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black' }}
                        >
                          {invoice.amount} {serviceCurrency}


                        </Typography>
                      </div>
                      {invoice.discount_percentage ? (
                              <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black', fontWeight:'bold' }}
                        >
                          Discount Percentage
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black' }}
                        >
                          {invoice.discount_percentage} %
                        </Typography>
                      </div>
           
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black', fontWeight:'bold' }}
                        >
                          Discounted Amount
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black' }}
                        >
                          {invoice.discount_amount ? invoice.discount_amount.toFixed(2): ''}
                        </Typography>
                      </div>
                      </>
                      )
                      : (null)
                      }


                      {invoice.tax_percentage ?
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black', fontWeight:'bold' }}
                        >
                          Tax Percentage
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black' }}
                        >
                          {invoice.tax_percentage ? invoice.tax_percentage.toFixed(2) : ''}
                        </Typography>
                      </div>
                      : null
                      }
                      {invoice.tax_amount ?
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black', fontWeight:'bold' }}
                        >
                          Tax Amount
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black' }}
                        >
                          { invoice.tax_amount ? invoice.tax_amount.toFixed(2) : ''}
                        </Typography>
                      </div>
                        : null
                      }
                      <Divider />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black', fontWeight:'bold' }}
                        >
                          Total Amount
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          style={{ color: 'black' }}
                        >
                          {invoice.total_amount ? invoice.total_amount.toFixed(2) : ''} {serviceCurrency}


                        </Typography>
                      </div>


                    </div>
                  </Grid>


                  {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" ? (
                 
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button startIcon={<DeleteIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleDeleteConfirmation(invoice._id)} variant="contained" type="submit">
                      Delete
                    </Button>
                    </div>
                  ) : null}


                  </CardContent>
                </Card>
              </Grid>
            </Grid>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle style={{ color: '#d11a2a' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this invoice?
        </DialogContent>
        <DialogActions>
          <Button
            style={{ color: 'black' }} onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteInvoice}
            variant="contained"
            color="error"
            style={{ backgroundColor: '#d11a2a', color: 'white' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default InvoiceDetails;
