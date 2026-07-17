import React, { useEffect, useRef,useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors } from "../../actions/quoteAction.jsx";
import MetaData from "../layout/MetaData.jsx";
import { deleteQuote, getQuote, getQuoteDetails } from "../../actions/quoteAction.jsx";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { Box, Breadcrumbs, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Fade, IconButton, Modal, Tooltip } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate, useParams } from "react-router-dom";
import Divider from '@mui/material/Divider';
import UpdateQuote from "./UpdateQuote.jsx";
import {createNotification, getAllNotifications } from "../../actions/notificationAction.jsx";
import { DELETE_QUOTE_RESET } from "../../constants/quoteConstants.jsx";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import DOMPurify from 'dompurify';
import { baseURL } from "../../http.js";
import ReactToPrint from 'react-to-print';
import PrintQuote from "./PrintQuote.jsx";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
  borderRadius: 15,
  boxShadow: 24,
  overflow:'auto',
  p: 4,
  
};

const QuoteDetails = () => {
  const { id } = useParams();
  const handleDownloadPDF = async () => {
    if (printRef.current) {
      const canvas = await html2canvas(printRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save(`quote_${quote.quoteId}.pdf`);
    }
  };
  const printRef = useRef();
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { quote, error:quoteDetailError } = useSelector(state => state.quoteDetails);
  const {error, loading, quotes = []} = useSelector((state)=>state.quotes)
  const { deleteError, isDeleted } = useSelector((state) => state.quoteDU);
    // console.log('oiqeoipwei', quote)
  const handleBreadcrumbClick = () => {
    navigate('/quotes');
  };
  const combined = useSelector((state) => state.logMember.combined);

  const [selectedQuoteId, setSelectedQuoteId] = useState('')
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const handleUpdateOpen = (quoteId) => {
    setSelectedQuoteId(quoteId);
    setOpenUpdateModal(true);
  };

  const handleUpdateClose = () => setOpenUpdateModal(false);


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

  const handleDownloadClick = (attachment) => {
    if (attachment) {
      // console.log(attachment)
        const link = document.createElement('a');
        link.href = attachment;
        link.setAttribute('download', `proposal_attachment`);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
    } else {
        // console.log('Document not available');
    }
};
  const handlePreviewClick = (attachmentUrl) => {
    window.open(attachmentUrl, '_blank');
  };

  //print screen 
  const printSpecificContent = () => {
    const contentToPrint = document.getElementById('specific-content');
    if (contentToPrint) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(contentToPrint.innerHTML);
      printWindow.print();
    } else {
      console.error('Content not found!');
    }
  };



  const superAdminId = combined?.superAdminId;


  const [serviceNamesMap, setServiceNamesMap] = useState({})
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const fetchServiceData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/services`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Services data:', data);

        const serviceMap = {};
        data.services.forEach((service) => {
          serviceMap[service._id] = {
            service_name: service.service_name,
            currency: service.currency,
            service_desc: service.service_desc
          }
        });
        // console.log(serviceMap)
        setServiceNamesMap(serviceMap)
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching services:', error.message);
      } finally{
        setLoadingServiceDetails(false)
      }
    };

    fetchServiceData();
    return () => controller.abort();
  }, []);

  const [clientNamesMap, setClientNamesMap] = useState({})
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
            postalCode: combined.postalCode,
            companyname: combined.companyname}
        });
        // console.log("Client Map:", clientMap);
        setClientNamesMap(clientMap)
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
    if(quoteDetailError){
      dispatch(clearErrors());
    }
    dispatch(getQuoteDetails(id));
  }, [dispatch, id, quoteDetailError]);

  
  useEffect(() => {

    if (error) {
      dispatch(clearErrors());
    }
    if (deleteError) {
      navigate("/quotes", {
        state: {
          snackbar: {
            message: `Proposal Deletion Failed as: ${deleteError}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: DELETE_QUOTE_RESET });
      dispatch(clearErrors());
    }
    if (isDeleted) {
      navigate("/quotes", {
        state: {
          snackbar: {
            message: "Proposal Deleted Successfully",
            severity: "success"
          }
        }
      });
      dispatch({ type: DELETE_QUOTE_RESET });
      dispatch(createNotification(combined.user._id, `Proposal Deleted Successfully`));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("SuperAdmin from Quote", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Proposal Deleted Successfully By ${combined.user.fname} ${combined.user.lname}`));
      }
    }
    dispatch(getQuote()).then(() => {
      dispatch(getAllNotifications(combined.user._id));
    });
  }, [dispatch, error, isDeleted, deleteError, navigate]);

  

  
  return (
    <div>
        <div className="btn">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none', color:'rgb(127, 86, 217)' }}>
            Proposals
            </Button>
            <Typography color="rgb(127, 86, 217)">Proposal Details</Typography>
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
                Update Quote
              </Typography>
              <UpdateQuote handleUpdateClose={handleUpdateClose} selectedQuoteId={selectedQuoteId} />
            </Box>
          </Modal>

          <div id="specific-content">

        <Grid container spacing={2} style={{marginTop:'10px', marginLeft:'10px', paddingRight:'50px'}}>
        <Grid item xs={12}>
          <Card style={{backgroundColor:'rgb(245, 245, 245)'}}>
            <CardHeader
                title={<div style={{ display: 'flex', alignItems: 'center' }}>
                Proposal
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: '10px' }}>
                    <div style={{
                      backgroundColor: quote.selected === "Pending" ? "#FFF5E1" :
                        quote.selected === "Accepted" ? "#E6F9E6" :
                        quote.selected === "Rejected" ? "#FFE6E6" :
                        "#000000",
                      color: quote.selected === "Pending" ? "#FFA500" :
                        quote.selected === "Accepted" ? "#32CD32" :
                        quote.selected === "Rejected" ? "#FF4500" :
                        "#ffffff",
                      borderRadius: '12px',
                      padding: '2px 6px', 
                      textAlign: 'center',
                      fontSize: '0.8em' 
                    }}>
                      {quote.selected}
                    </div>
                </div>

              </div>}
                subheader={quote.quoteId}
                action={
                  <>
                  <Tooltip 
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                    placement="top" 
                    title={quote.attachment ? 'Preview Attachment' : 'Attachment not available'}
                  >
                    <span>
                    <IconButton 
                        style={{color:'rgb(127, 86, 217)'}} 
                        disabled={quote.attachment === null}
                        onClick={() =>
                            handlePreviewClick(quote.attachment)}
                      >
                        {quote.attachment  ? <Visibility /> : <VisibilityOff />}    
                      </IconButton>
                    </span>
                  </Tooltip>

                  <ReactToPrint
                      trigger={() => <Button startIcon={<DownloadIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)', marginRight: '8px' }} variant="contained" onClick={handleDownloadPDF}>
                        Download Proposal
                      </Button>}
                      content={() => printRef.current}
                    />
                    <div style={{ display: 'none' }}>
                      
                      <PrintQuote
                        ref={printRef}
                        quote={quote}
                        clientNamesMap={clientNamesMap}
                        serviceNamesMap={serviceNamesMap}
                        superAdminId={superAdminId}
                      />
                    </div>

                  {/* <Tooltip 
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                    // title={quote.attachment.data.data.length !== 0 ? 'Download Page' : 'Attachment not available'}
                    title={'Download Page'}
                    placement="top"
                  >
                    <span>
                      <Button 
                        style={{ backgroundColor: 'rgb(127, 86, 217)', marginRight: '8px' }} 
                        variant="contained" 
                        onClick={() => printSpecificContent()}
                        // disabled={quote.attachment.data.data.length === 0}
                      >
                        Download Page
                      </Button>
                    </span>
                  </Tooltip> */}

                  {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" || combined.user.role === "CLIENT" ? (

                  <Tooltip
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                    placement="top" 
                    title={quote.selected === 'Rejected' || quote.selected === 'Accepted' ? `Can't Edit as Proposal is ${quote.selected}` : ''}
                  >
                    <span>
                    <Button startIcon={<EditIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleUpdateOpen(quote._id)} variant="contained" type="submit" 
                    disabled={quote.selected === 'Rejected' || quote.selected === 'Accepted' }
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
                <Grid container spacing={2} style={{ padding: '10px', paddingRight:'20px' }}>
                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Service Name
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {loadingServiceDetails ? (
                        <span style={{ visibility: 'hidden' }}>Loading...</span>
                      ) : (
                        serviceNamesMap[quote.serviceId] === undefined ? (
                          <span style={{ color: 'red' }}>Service Deleted</span>
                        ) : (serviceNamesMap[quote.serviceId].service_name === '') ? (
                          'Unnamed Service'
                        ) : (
                          serviceNamesMap[quote.serviceId].service_name
                        )
                      )}
                    </Typography>
                  </Grid>
        
                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginRight: '5px', marginBottom: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Created On
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </Typography>
                  </Grid>

                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginTop: '5px',marginRight: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Client Name
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {loadingClientDetails ? (
                        <span style={{ visibility: 'hidden' }}>Loading...</span>
                      ) : (
                        clientNamesMap[quote.clientId] === undefined ? (
                          <span style={{ color: 'red' }}>Client Deleted</span>
                        ) : (clientNamesMap[quote.clientId].name === '') ? (
                          'Unnamed Client'
                        ) : (
                          clientNamesMap[quote.clientId].name
                        )
                      )}
                    </Typography>
                  </Grid>

                  <Grid item xs={5} style={{ backgroundColor: 'rgb()', borderRadius: '10px', padding: '10px', marginTop: '5px' }}>
                    <Typography variant="subtitle1" component="div" style={{ color: 'black', fontWeight:'bold' }}>
                      Duration
                    </Typography>
                    <Typography variant="body1" component="div" style={{ color: 'black' }}>
                      {quote.value} {quote.unit}
                    </Typography>
                  </Grid>

                </Grid>
                
              </CardContent>
            
            <Divider></Divider>
            <CardHeader
                title={'Order Brief'}  
            />
            <CardContent style={{marginLeft:'-10px'}}>
            <Grid
              container
              spacing={2}
              xs={9}
              style={{
                borderRadius: '10px',
                paddingRight: '60px',
                marginRight: '5px',
                marginLeft: '5px',
                marginBottom: '5px',
                backgroundColor: 'rgb()',

              }}
            >
              <div
                style={{
                  backgroundColor: 'rgb()',
                  borderRadius: '10px',
                  padding: '10px',
                  width: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowWrap: 'break-word'
                }}
              >
                <Typography variant="subtitle1"
                    component="div"
                    style={{ color: 'black' }}> <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(quote.order_brief) }} /></Typography>
              </div>
            </Grid>

          </CardContent>
            

            <Divider></Divider>

            <CardHeader
                title={'Payment Details'}  
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
                    Budget
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black' }}
                  >
                    {quote.budget}
                  </Typography>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black', fontWeight:'bold' }}
                  >
                    Quantity
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black' }}
                  >
                    {quote.quantity}
                  </Typography>
                </div>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black', fontWeight:'bold' }}
                  >
                    Total
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    style={{ color: 'black' }}
                  >
                    {quote.budget * quote.quantity}
                  </Typography>
                </div>
              </div>
            </Grid>

            {combined.user.role === "SUPERADMIN" || combined.user.role === "ADMIN" || combined.user.role === "PROJECTMANAGER" ? (
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button startIcon={<DeleteIcon/>} style={{ backgroundColor: 'rgb(127, 86, 217)' }} onClick={() => handleDeleteConfirmation(quote._id)} variant="contained" type="submit">
                      Delete
                    </Button>
            </div>
          ) : null}

            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </div>
    


      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle style={{ color: '#d11a2a' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this proposal?
        </DialogContent>
        <DialogActions>
          <Button 
 style={{ color: 'black' }} onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteQuote}
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

export default QuoteDetails;
