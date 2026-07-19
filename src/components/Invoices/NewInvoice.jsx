import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';
import './Invoices.css'
import { NEW_INVOICE_RESET } from '../../constants/invoicesConstants';
import { createInvoice ,clearErrors, getInvoice} from '../../actions/invoiceAction';
// import Select from 'react-select';
import { Grid, Button } from '@mui/material';
import { Chip, FormControl, InputLabel, Select, MenuItem, OutlinedInput, CardContent, Autocomplete, TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';

const NewInvoice = ({ handleClose }) => {
  const combined = useSelector((state) => state.logMember.combined);
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.newInvoice);
  const navigate = useNavigate()
  const [client_name, setclient_name] = useState(null);
  const [status, setStatus] = useState('Draft');
  const [amount, setamount] = useState(0);
  const [terms, setterms] = useState("Please make the payment within 15 days from the creation date.");

  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [taxAmount, setTaxAmount] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [orderIdsList, setOrderIdsList] = useState([]);
  const [clientIdsList, setClientIdsList] = useState([]);
  const superAdminId = combined?.superAdminId;


  useEffect(() => {
    const calculateAmounts = () => {
      const discountAmount = (amount * discountPercentage) / 100;
      const discountedTotal = amount - discountAmount;
      const taxAmount = (discountedTotal * taxPercentage) / 100;
      const totalAmount = discountedTotal + taxAmount;
      // console.log(discountAmount)
      setDiscountAmount(discountedTotal);
      setTaxAmount(taxAmount);
      setTotalAmount(totalAmount);
    };
 
    calculateAmounts();
  }, [amount, discountPercentage, taxPercentage]); // Include taxPercentage here


  useEffect(() => {
    const controller = new AbortController();
    const fetchClientIds = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/combined/getAllClient`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch client IDs: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Client IDs data:', data);
        setClientIdsList(data.combined || []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching client IDs:', error.message);
      }
    };
    fetchClientIds();
    return () => controller.abort();
  }, []);


  const fetchOrderIds = async (clientId) => {
    try {
      // console.log(clientId)
      const response = await fetch(`${baseURL}/api/v1/ordersForAClient?clientId=${clientId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch order IDs: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Order IDs data:', data);
      setOrderIdsList(data.orders || []);
    } catch (error) {
      setOrderIdsList([]);
      setSelectedOrders([]);
      console.error('Error fetching order IDs:', error.message);
    }
  };
 
  useEffect(() => {
    if (client_name && client_name._id) {
      fetchOrderIds(client_name._id);
    }
  }, [client_name]);


  useEffect(() => {
    const totalAmount = selectedOrders.reduce((acc, order) => {
      return acc + (order.budget * order.quantity);
    }, 0);
    setamount(totalAmount);
  }, [selectedOrders]);
 


  const createInvoiceSubmitHandler = async (e) => {
    e.preventDefault();
    const invoiceData = {
      client_name: client_name._id,
      orderIds: selectedOrders.map(order => order._id), // Assuming each order has an `_id` field
      status: status,
      amount: amount,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      tax_percentage: taxPercentage,
      tax_amount: taxAmount,
      terms:terms
    };
    const invoiceDataJson = JSON.stringify(invoiceData);
    
    const response = await dispatch(createInvoice(invoiceDataJson));
    if (response?.success) {
        const id = response.invoice._id;  
        const invoiceId = response.invoice.invoiceId
        // const routeLink = `http://dashboard.agencykinetics.com/invoice/${id}`
        const routeLink = `http://app.agencykinetics.com/invoice/${id}`
        handleClose()
      navigate("/invoices", {
        state: {
          snackbar: {
            message: "New Invoice Created Successfully",
            severity: "success"
          }
        }
      });
      dispatch({ type: NEW_INVOICE_RESET });
      dispatch(createNotification(combined.user._id, `New Invoice Created Successfully with ID: ${invoiceId}`, routeLink));
      dispatch(createNotification(client_name._id, `New Invoice Created Successfully with ID: ${invoiceId}`, routeLink));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("SuperAdmin from UpdateInvoice", superAdminId)
        dispatch(createNotification(superAdminId?._id, `New Invoice Created Successfully with ID: ${invoiceId} By ${combined.user.fname} ${combined.user.lname}`, routeLink));
      }
      dispatch(getInvoice()).then(() => {
        dispatch(getAllNotifications(combined.user._id));
      });

    } else if (response?.error) {
      handleClose()
      navigate("/invoices", {
        state: {
          snackbar: {
            message: `New Invoice Creation Failed as: ${error}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: NEW_INVOICE_RESET });
      dispatch(getInvoice());
      dispatch(clearErrors());
    }
  };


  return (
    <div>
      <div style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
      {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </div>
        )}


      <form className="createTicketForm" encType="multipart/form-data" onSubmit={createInvoiceSubmitHandler}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <InputLabel id="client-label" style={{ marginTop: '20px' }}>Client</InputLabel>
            <Autocomplete
              fullWidth
              disablePortal
              value={client_name}
              onChange={(event, newValue) => {
                setclient_name(newValue);
                setSelectedOrders([]); // Reset selected orders when the client changes
              }}
              id="serviceId"
              options={clientIdsList}
              noOptionsText="Select Client"
              getOptionLabel={(option) => option.fname + " " + option.lname}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {option.fname + " " + option.lname}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  label="Select Client"
                  variant="filled"
                />
              )}
            />
          </Grid>


          <Grid item xs={12} sm={12}>
            <InputLabel id="order-label">Order ID</InputLabel>
            <Autocomplete
              multiple
              fullWidth
              disablePortal
              value={selectedOrders}
              onChange={(event, newValue) => {
                setSelectedOrders(newValue);
                // console.log(selectedOrders);
              }}
              id="orderId"
              options={orderIdsList}
              noOptionsText="Select Order"
              getOptionLabel={(option) => String(option.orderId)} // Convert orderId to a string
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {String(option.orderId)}
                </li>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    size='small'
                    label={String(option.orderId)}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required={selectedOrders.length === 0}
                  label="Select Orders"
                  variant="filled"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
          <InputLabel id="status-label">Status</InputLabel>
            <Autocomplete 
                  fullWidth
                  disablePortal
                  value={status}
                  onChange={(event, newValue) => {
                    setStatus(newValue);
                  }}
                  id="status"
                  options={['Draft', 'Open', 'Paid', 'Uncollectable', 'Void']}
                  noOptionsText="Select Status"
                  getOptionLabel={(option) => option}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      label="Select Status"
                      variant="filled"
                    />
                  )}
                />
          </Grid>


              <Grid item xs={12} sm={12} >
                    <InputLabel id="amountDetails-label" style={{ marginTop: '20px' }}>Amount Details</InputLabel>
                    <Grid container spacing={2} >
                      <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center" >
                          <Grid item xs={3}>
                            <InputLabel style={{ marginTop: '20px' }}>Amount</InputLabel>
                          </Grid>
                          <Grid item xs={9} style={{ marginTop: '20px' }}>
                            <TextField
                              placeholder="Amount"
                              value={amount}
                              onChange={(e) => setamount(e.target.value)}
                              hiddenLabel
                              variant="filled"
                              size="small"
                              type="number"
                              required
                              fullWidth
                              margin="none"
                              InputProps={{
                                readOnly:true
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>


                      <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3}>
                            <InputLabel required>Discount Percentage</InputLabel>
                          </Grid>
                          <Grid item xs={9}>
                            <TextField
                              placeholder="Discount Percentage"
                              value={discountPercentage}
                              onChange={(e) => setDiscountPercentage(e.target.value)}
                              hiddenLabel
                              variant="filled"
                              size="small"
                              type="number"
                              required
                              fullWidth
                              inputProps={{ min: 0, max: 100 }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>


                      <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3}>
                            <InputLabel>Discounted Amount</InputLabel>
                          </Grid>
                          <Grid item xs={9}>
                            <TextField
                              placeholder="Discounted Amount"
                              value={discountAmount}
                              hiddenLabel
                              variant="filled"
                              size="small"
                              type="number"
                              required
                              fullWidth
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>


                      <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3}>
                            <InputLabel required>Tax Percentage</InputLabel>
                          </Grid>
                          <Grid item xs={9}>
                            <TextField
                              placeholder="Tax Percentage"
                              value={taxPercentage}
                              onChange={(e) => setTaxPercentage(Number(e.target.value))}
                              hiddenLabel
                              variant="filled"
                              size="small"
                              type="number"
                              required
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      </Grid>


                      <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3}>
                            <InputLabel>Tax Amount</InputLabel>
                          </Grid>
                          <Grid item xs={9}>
                            <TextField
                              placeholder="Tax Amount"
                              value={taxAmount}
                              InputProps={{
                                readOnly: true,
                              }}
                              onChange={(e) => setTaxAmount(Number(e.target.value))}
                              hiddenLabel
                              variant="filled"
                              size="small"
                              type="number"
                              required
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      </Grid>


                    
                      <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3}>
                            <InputLabel>Total Amount</InputLabel>
                          </Grid>
                          <Grid item xs={9}>
                            <TextField
                              placeholder="Total Amount"
                              value={totalAmount}
                              InputProps={{
                                readOnly: true,
                              }}
                              hiddenLabel
                              variant="filled"
                              size="small"
                              type="number"
                              required
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12} >
                        <InputLabel id="lname-label">Terms & Condition</InputLabel>
                        <TextField
                          type="text"
                          label="Terms & Condition"
                          placeholder=" "
                          value={terms}
                          onChange={(e) => setterms(e.target.value)}
                          fullWidth
                          variant="filled"
                          margin="none"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
            </Grid>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button
                  id="createOrderBtn"
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  color="primary"
                  style={{ backgroundColor: 'rgb(105, 56, 239)' }}
                >
                  Create
                </Button>
              </div>
      </form>
      </div>
      </div>
  );
};


export default NewInvoice
