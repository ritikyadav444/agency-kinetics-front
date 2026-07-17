import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MetaData from '../layout/MetaData';
import { NEW_QUOTE_RESET } from '../../constants/quoteConstants';
import { clearErrors, createQuote, getQuote } from '../../actions/quoteAction';
import { TextField, Button, Grid, Input } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, CardContent, Autocomplete, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { Editor } from 'primereact/editor';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const NewQuote = ({ handleClose }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.newQuote);
  const navigate = useNavigate()
  const [quantity, setquantity] = useState('');
  const [selected, setselected] = useState('Pending');

  const [budget, setbudget] = useState('');
  const [order_brief, setorder_brief] = useState('');
  const [isOrderBriefValid, setIsOrderBriefValid] = useState(true);

  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(null);
  const [attachment, setattachment] = useState('');
  const [serviceId, setserviceId] = useState(null);
  const [serviceIdsList, setServiceIdsList] = useState([]);
  const [clientId, setclientId] = useState(null);
  const [clientIdsList, setClientIdsList] = useState([]);

  const combined = useSelector((state) => state.logMember.combined);
  const name = combined.user.fname + ' ' + combined.user.lname
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

  const handlefileChange = (e) => {
    const attachmentfile = e.target.files[0];
    if (attachmentfile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setattachment({
              url: reader.result,
              name: attachmentfile.name,
              type: attachmentfile.type
          });
      };
      reader.readAsDataURL(attachmentfile); // Convert file to base64 string
  }
  };


  const renderHeader = () => {
    return (
      <>
      <span class="ql-formats">
      <select class="ql-font"></select>
      <select class="ql-size"></select>
      
    </span>
    <span class="ql-formats">
      <button class="ql-bold"></button>
      <button class="ql-italic"></button>
      <button class="ql-underline"></button>
    </span>
    <span class="ql-formats">
      <select class="ql-color"></select>
      <select class="ql-background"></select>
    </span>
    <span class="ql-formats">
      <button class="ql-script" value="sub"></button>
      <button class="ql-script" value="super"></button>
    </span>
    <span class="ql-formats">
      <button class="ql-list" value="ordered"></button>
      <button class="ql-list" value="bullet"></button>
      <button class="ql-indent" value="-1"></button>
      <button class="ql-indent" value="+1"></button>
    </span>
    <span class="ql-formats">
      <select class="ql-align"></select>
    </span>
    </>
    );
  };
  
  const header = renderHeader();

  const superAdminId = combined?.superAdminId;

  useEffect(() => {
    const controller = new AbortController();
    const fetchServiceIds = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/services`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch service IDs: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Service IDs data:', data);

        setServiceIdsList(data.services || []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching service IDs:', error.message);
      }
    };

    fetchServiceIds();
    return () => controller.abort();
  }, []);

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

        // Log the entire data object
        // console.log('Client IDs data:', data);

        setClientIdsList(data.combined || []); // Ensure that data is an array or set it to an empty array
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching client IDs:', error.message);
      }
    };

    fetchClientIds();
    return () => controller.abort();
  }, []);


  const createQuoteSubmitHandler = async (e) => {
    e.preventDefault();

    if (order_brief.trim() === '') {
      setIsOrderBriefValid(false);
      return;
    }

    setIsOrderBriefValid(true);

    const quoteData = {
      quantity,
      order_brief: order_brief,
      budget,
      value,
      unit,
      selected,
      serviceId: serviceId._id,
      clientId: role === 'Client' ? combined.user._id : clientId._id,
      attachment: attachment
        ? {
            url: attachment.url,
            name: attachment.name,
            type: attachment.type,
          }
        : null,
    };

    const response = await dispatch(createQuote(quoteData));

    if (response.success) {
        const id = response.quote._id; 
        const quoteId = response.quote.quoteId

        // const routeLink = `http://dashboard.agencykinetics.com/quote/${id}`
        const routeLink = `http://app.agencykinetics.com/quote/${id}`
        handleClose()
        navigate("/quotes", {
          state: {
            snackbar: {
              message: "New Proposal Created Successfully",
              severity: "success"
            }
          }
        });
        dispatch({ type: NEW_QUOTE_RESET });

        dispatch(createNotification(combined.user._id, `New Proposal Created Successfully with ID: ${quoteId}`, routeLink));
        if (combined.user.role !== 'SUPERADMIN'){
          // console.log("SuperAdmin from Quote", superAdminId)
          dispatch(createNotification(superAdminId?._id, `New Proposal Created Successfully with ID: ${quoteId} By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
        dispatch(getQuote()).then(() => {
          dispatch(getAllNotifications(combined.user._id));
        });
        
    } else if (response.error) {
      handleClose()
      navigate("/quotes", {
        state: {
          snackbar: {
            message: `Proposal Creation Failed as: ${error}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: NEW_QUOTE_RESET });
      dispatch(getQuote());

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
          className="createQuoteForm"
          encType="multipart/form-data"
          onSubmit={createQuoteSubmitHandler}
        >

          <Grid container spacing={3}>
            <Grid item xs={6}>
            <InputLabel id="service-label" style={{marginTop:'20px'}}>Service</InputLabel>

              <Autocomplete 
                fullWidth
                disablePortal
                value={serviceId}
                onChange={(event, newValue) => {
                  setserviceId(newValue);
                }}
                id="serviceId"
                options={serviceIdsList}
                noOptionsText="Select Service"
                getOptionLabel={(option) => option.service_name}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    {option.service_name}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    label="Select Service"
                    variant="filled"
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} sm={6}>
                <InputLabel id="client-label" style={{ marginTop: '20px' }}>Client</InputLabel>
                {role === 'Client' ? (
                  <TextField
                  type="text"
                  required
                  disable
                  value={name}
                  onChange={(e) => setclientId(combined.user._id)}
                  fullWidth
                  variant="filled"
                  margin="none"
                  inputProps={{
                    style: {
                      padding: '16px 12px' // Adjust padding to center text
                    }
                  }}
                /> 
              
                ) : (
                  <Autocomplete
                    fullWidth
                    disablePortal
                    value={clientId}
                    onChange={(event, newValue) => {
                      setclientId(newValue);
                    }}
                    id="clientId"
                    options={clientIdsList}
                    getOptionLabel={(option) => option.fname + " " + option.lname}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    noOptionsText="Select Client"
                    renderOption={(props, option) => (
                      <li {...props} key={option._id}>
                        {option.fname} {option.lname}
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
                )}
              </Grid>


            <Grid item xs={12}>
              <InputLabel id="status-label">Status</InputLabel>

              <TextField
                type="text"
                required
                disable
                value={selected}
                onChange={(e) => setselected("Pending")}
                fullWidth
                variant="filled"
                margin="none"
                inputProps={{
                  style: {
                    padding: '16px 12px' // Adjust padding to center text
                  }
                }}
              /> 
              </Grid>

           
          

            <Grid item xs={12} sm={6}>
            <InputLabel id="quantity-label">Quantity</InputLabel>

              <TextField
                type="number"
                label="Quantity"
                placeholder="Quantity"
                required
                value={quantity}
                onChange={(e) => setquantity(e.target.value)}
                fullWidth
                variant="filled"
                margin="none"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
            <InputLabel id="budget-label">Budget</InputLabel>

              <TextField
                type="number"
                label="Budget"
                placeholder="Budget"
                required
                value={budget}
                onChange={(e) => setbudget(e.target.value)}
                fullWidth
                variant="filled"
                margin="none"
              />
            </Grid>

            <Grid item xs={12}>
                <InputLabel id="timeframe">Timeframe</InputLabel>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <TextField
                        type="number"
                        label="Select Value"
                        placeholder="Value"
                        required
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        fullWidth
                        variant="filled"
                        margin="none"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Autocomplete
                        fullWidth
                        disablePortal
                        value={unit}
                        onChange={(event, newValue) => setUnit(newValue)}
                        id="service_unit"
                        options={['Days', 'Months', 'Weeks']}
                        noOptionsText="No units"
                        getOptionLabel={(option) => option}
                        isOptionEqualToValue={(option, value) => option === value}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            label="Select Unit"
                            variant="filled"
                          />
                        )}
                        
                      />
                    </Grid>
                  </Grid>

            </Grid>

            <Grid item xs={12} sm={12}>
              <InputLabel id="attachment">Attachment</InputLabel>

              <Button
                fullWidth
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon style={{color:'white'}} />}
                  endIcon={attachment ? <FileDownloadDoneIcon style={{color:'white'}}/> : null}
                  style={{ backgroundColor: 'rgb(105, 56, 239)' }}

                >
                   <Tooltip title={attachment ? "File uploaded" : ""} placement="top">
                   <span style={{color:'white'}}>{attachment ? "Uploaded File": "Upload File"}</span>
                  </Tooltip>
                  <VisuallyHiddenInput type="file" accept='.docx,.csv,.pdf' onChange={handlefileChange}   />
              </Button>

            </Grid>

            <Grid item xs={12} sm={12}>
              <InputLabel id="orderBrief-label" required>
                Order Brief
              </InputLabel>
              <Editor
                value={order_brief}
                onTextChange={(e) => setorder_brief(e.htmlValue)}
                headerTemplate={header}
                style={{ height: '320px' }}
              />
              {!isOrderBriefValid && (
                <div style={{ color: 'red', marginTop: '8px' }}>
                  Order Brief is required.
                </div>
              )}
            </Grid>

          </Grid>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              id="createProductBtn"
              type="submit"
              // disabled={loading}
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

export default NewQuote;