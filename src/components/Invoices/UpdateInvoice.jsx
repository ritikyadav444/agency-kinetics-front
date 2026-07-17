import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MetaData from '../layout/MetaData';
import { UPDATE_INVOICE_RESET } from '../../constants/invoicesConstants';
import { updateInvoice , clearErrors, getInvoiceDetails, getInvoice, } from '../../actions/invoiceAction';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Button, Chip, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Grid, InputAdornment } from '@mui/material';
import { baseURL } from '../../http';


const UpdateInvoice = ({handleUpdateClose, selectedInvoiceId}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {loading, updateError, isUpdated} = useSelector((state)=>state.invoiceDU)
  const { invoice, error:invoiceDetailError } = useSelector(state => state.invoiceDetails);
  const combined = useSelector((state) => state.logMember.combined);

  // console.log("or",invoice)
  const [status , setStatus]=useState({});
  const [amount, setamount] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(null);
  const [paidAmount, setPaidAmount] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [dueAmount, setDueAmount] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [client_name, setclient_name] = useState(null);
  const [taxAmount, setTaxAmount] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [taxPercentage, setTaxPercentage] = useState(null);
  const [orderIds, setOrderIds] = useState([]);



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

  const [clientNamesMap, setClientNamesMap] = useState({});
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
        const clientData = data.combined || [];

        const clientMap = {};
        clientData.forEach((client) => {
          clientMap[client._id] = client.fname + " " + client.lname;
        });
        // console.log(clientMap)
        setClientNamesMap(clientMap);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching clients:', error.message);
      }
    };

    fetchClientData();
    return () => controller.abort();
  }, []);

  const fetchOrderIds = async (clientId) => {
    try {
      // console.log(clientId);
      const response = await fetch(`${baseURL}/api/v1/ordersForAClient?clientId=${clientId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch order IDs: ${response.status}`);
      }
      const data = await response.json();
      // console.log('Order I/Ds data:', data);
      setOrderIdsList(data.orders || []);
      
      // Assuming invoice.orderIds is an array of IDs
      const invoiceOrderIds = orderIds; 
  
      // Filter and extract orderId values
      const filteredOrders = data.orders.filter(order => invoiceOrderIds.includes(order._id));
      // const orderIds_invoice = filteredOrders.map(order => order.orderId); 
      // console.log(invoiceOrderIds, filteredOrders)
  
      setSelectedOrders(filteredOrders);
    } catch (error) {
      setOrderIdsList([]);
      setSelectedOrders([]);
      console.error('Error fetching order IDs:', error.message);
    }
  };
  
  
  useEffect(() => {
    if (client_name) {
      fetchOrderIds(client_name);
    }
  }, [client_name]);

  useEffect(() => {
    const totalAmount = selectedOrders.reduce((acc, order) => {
      return acc + (order.budget * order.quantity);
    }, 0);
    setamount(totalAmount);
  }, [selectedOrders]);
  


  useEffect(() => {
    if(invoiceDetailError){
     dispatch(clearErrors)
  }
  dispatch(getInvoiceDetails(selectedInvoiceId));
}, [dispatch, selectedInvoiceId, invoiceDetailError]);

  useEffect(() => {
    // console.log(invoice, invoice._id !==invoiceId)
    if(invoice && invoice._id !==selectedInvoiceId){
        dispatch(getInvoiceDetails(selectedInvoiceId));
    }else{
        setSelectedOrders(invoice.orderIds)
        setclient_name(invoice.client_name)
        setTaxPercentage(invoice.tax_percentage)
        setTaxAmount(invoice.tax_amount)
        setStatus(invoice.status);
        setamount(invoice.amount)
        setSelectedCurrency(invoice.currency)
        setDiscountAmount(invoice.discount_amount)
        setDiscountPercentage(invoice.discount_percentage)
        setTotalAmount(invoice.total_amount)
        setOrderIds(invoice.orderIds)
        // console.log(client_name, selectedOrders)

    }

    if (invoiceDetailError) {
      navigate("/invoices", {
        state: {
          snackbar: {
            message: "Invoice Details Not Found",
            severity: "error"
          }
        }
      });
      dispatch(clearErrors());
    }

  }, [dispatch, invoiceDetailError, navigate, isUpdated, updateError, invoice, selectedInvoiceId]);

  const updateInvoiceSubmitHandler = async (e) => {
    e.preventDefault();

    const invoiceData = {
      client_name: client_name,
      orderIds: selectedOrders.map(order => order._id), // Assuming each order has an _id field
      status: status,
      amount: amount,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      tax_percentage: taxPercentage, 
      tax_amount: taxAmount,
    };

    const invoiceDataJson = JSON.stringify(invoiceData);
    const response = await dispatch(updateInvoice(invoice._id,invoiceDataJson));
    ;
    if (response.success) {
        const id = response.invoice._id; 
        const invoiceId = response.invoice.invoiceId; 
        // const routeLink = `http://dashboard.agencykinetics.com/invoice/${id}`
        const routeLink = `http://app.agencykinetics.com/invoice/${id}`

        handleUpdateClose()
      navigate("/invoices", {
        state: {
          snackbar: {
            message: "Invoice Updated Successfully",
            severity: "success"
          }
        }
      });
      dispatch({ type: UPDATE_INVOICE_RESET });
      

      dispatch(createNotification(combined.user._id, `Invoice ${invoiceId} Updated to ${status} Successfully`, routeLink));
      dispatch(createNotification(client_name, `Invoice ${invoiceId} Updated to ${status} By ${combined.user.role}: ${combined.user.fname} ${combined.user.lname}`, routeLink));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("SuperAdmin from UpdateInvoice", superAdminId)
        dispatch(createNotification(superAdminId?._id, `Invoice ${invoiceId} Updated to ${status} Successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
      }
      dispatch(getInvoice()).then(() => {
        dispatch(getAllNotifications(combined.user._id));
      });

    } else if (response.error) {
      handleUpdateClose()
      navigate("/invoices", {
        state: {
          snackbar: {
            message: "Invoice Updation Failed",
            severity: "error"
          }
        }
      });
      dispatch({ type: UPDATE_INVOICE_RESET });
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
          <form
            encType="multipart/form-data"
            onSubmit={updateInvoiceSubmitHandler}
          >
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
              options={Object.keys(clientNamesMap)}
              getOptionLabel={(option) => clientNamesMap[option] || ""}
              isOptionEqualToValue={(option, value) => option === value}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {clientNamesMap[option]}
                </li>
              )}
              noOptionsText="Select Client"
              // isOptionEqualToValue={(option, value) => option._id === value._id}
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
                        <InputLabel>Discount Percentage</InputLabel>
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
                        <InputLabel>Tax Percentage</InputLabel>
                      </Grid>
                      <Grid item xs={9}>
                        <TextField
                          placeholder="Tax Percentage"
                          value={taxPercentage}
                          onChange={(e) => setTaxPercentage(e.target.value)}
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
                </Grid>
              </Grid>
        </Grid>
                
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Button
                  id="createOrderBtn"
                  type="submit"
                  // disabled={loading}
                  variant="contained"
                  color="primary"
                  style={{ backgroundColor: 'rgb(105, 56, 239)' }}
                >
                  Update
                </Button>
              </div>

          </form>
        </div>
     </div>
  )
}



export default UpdateInvoice