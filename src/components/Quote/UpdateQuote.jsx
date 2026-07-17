import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getQuoteDetails, updateQuote, clearErrors, getQuote } from '../../actions/quoteAction';
import { UPDATE_QUOTE_RESET } from '../../constants/quoteConstants';
import { Autocomplete, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip, } from '@mui/material';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { useNavigate } from 'react-router-dom';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { Editor } from 'primereact/editor';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';


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

const UpdateQuote = ({ handleUpdateClose, match, selectedQuoteId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, updateError, isUpdated } = useSelector((state) => state.quoteDU);
  const { error:quoteDetailError, quote } = useSelector((state) => state.quoteDetails);
  // console.log("qt", quote);

  const [selected, setSelected] = useState('');
  const [quantity, setquantity] = useState('');
  const [budget, setbudget] = useState('');
  const [order_brief, setorder_brief] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(null);
  const [attachment, setattachment] = useState('');
  const attachment_filename = quote && quote.attachment ? quote.attachment.split('/').pop().split('_')[0] : ''

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

  // console.log(selectedQuoteId);
  const quoteId = selectedQuoteId;

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
      // console.log(attachment)
      reader.readAsDataURL(attachmentfile); // Convert file to base64 string
  }
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchQuoteDetails = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/quote/${selectedQuoteId}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch quote IDs: ${response.status}`);
        }
        const data = await response.json();

        // Log the entire data object
        // console.log('Quote IDs data:', data);
        setSelected(data.quote.selected)

        // setSuperAdminId(data.superadmin || null); // Ensure that data is an array or set it to an empty array
        // console.log(superAdminId)
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching Quote IDs:', error.message);
      }
    };

    fetchQuoteDetails();
    return () => controller.abort();
  }, []);

  const superAdminId = combined?.superAdminId;


  useEffect(() => {
    if (quote && quote._id !== quoteId) {
      dispatch(getQuoteDetails(quoteId));
    } else {
      setSelected(quote.selected);
      setValue(quote.value)
      setUnit(quote.unit)
      setbudget(quote.budget)
      setquantity(quote.quantity)
      setorder_brief(quote.order_brief)
      setattachment(quote.attachment)

      // console.log("selectedelse", quantity)
    }
    if (quoteDetailError) {
      navigate("/quotes", {
        state: {
          snackbar: {
            message: "Proposal Details Not Found",
            severity: "error"
          }
        }
      });
      dispatch(clearErrors());
    }
  }, [dispatch, quoteDetailError, navigate, isUpdated, updateError, quote, quoteId]);

  const updateQuoteSubmitHandler = async (e) => {
    e.preventDefault();

    const quoteData = {
      quantity: quantity,
      order_brief: order_brief,
      budget: budget,
      value: value,
      unit: unit,
      selected: selected,
      attachment: attachment
        ? {
            url: attachment.url,
            name: attachment.name,
            type: attachment.type,
          }
        : null,
    };
    const response = await dispatch(updateQuote(quoteId, quoteData));

    if (response.success) {
        const id = response.quote._id; 

        // const routeLink = `http://dashboard.agencykinetics.com/quote/${id}`
        const routeLink = `http://app.agencykinetics.com/quote/${id}`

        handleUpdateClose();
        navigate("/quotes", {
          state: {
            snackbar: {
              message: "Proposal Updated Successfully",
              severity: "success"
            }
          }
        });
        dispatch({ type: UPDATE_QUOTE_RESET });

        dispatch(createNotification(combined.user._id, `Proposal ${quote.quoteId} Updated to ${selected} Successfully`, routeLink));
        if (combined.user.role !== 'SUPERADMIN'){
          // console.log("SuperAdmin from Quote", superAdminId)
          dispatch(createNotification(superAdminId?._id, `Proposal ${quote.quoteId} Updated to ${selected} Successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));
        }
        dispatch(getQuote()).then(() => {
          dispatch(getAllNotifications(combined.user._id));
        });
        
    } else if (response.error) {
      handleUpdateClose()
      navigate("/quotes", {
        state: {
          snackbar: {
            message: "Proposal Updation Failed",
            severity: "error"
          }
        }
      });
      dispatch({ type: UPDATE_QUOTE_RESET });
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
            encType="multipart/form-data"
            onSubmit={updateQuoteSubmitHandler}
          >
            <Grid container spacing={3}>

              <Grid item xs={12} sm={6}>
                <InputLabel id="quantity-label"  style={{marginTop:'20px'}}>Quantity</InputLabel>

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
              <InputLabel id="budget-label" style={{marginTop:'20px'}}>Budget</InputLabel>

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

              <Grid item xs={12} >
                  <InputLabel id="selected-label">Status</InputLabel>
                  <Autocomplete 
                            fullWidth
                            disablePortal
                            value={selected}
                            onChange={(event, newValue) => {
                              setSelected(newValue);
                            }}
                            id="selected"
                            options={['Accepted', 'Pending', 'Rejected']}
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

            </Grid>

            <Grid item xs={12} style={{marginTop:'20px'}}>
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

            <Grid item xs={12} sm={12} style={{marginTop:'20px'}}>
              <InputLabel id="attachment">Attachment</InputLabel>

              <Button
                  fullWidth
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    endIcon={attachment ? <FileDownloadDoneIcon /> : null}
                    style={{ backgroundColor: 'rgb(105, 56, 239)' }}

                  >
                    <Tooltip title={attachment ? "File uploaded" : "Upload"} placement="top">
                    <span>{attachment ? "Uploaded file " + attachment_filename : "Upload file"}</span>
                    </Tooltip>
                    <VisuallyHiddenInput type="file" accept='.docx,.csv,.pdf,.pptx' onChange={handlefileChange}   />
                  </Button>

            </Grid>

            <Grid item xs={12} sm={12}  style={{marginTop:'20px'}}>
              <InputLabel id="orderBrief-label" required>Order Brief</InputLabel>
              <Editor value={order_brief} onTextChange={(e) => setorder_brief(e.htmlValue)} headerTemplate={header} style={{ height: '320px' }} required />

            </Grid>
       
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <Button
                id="createInvoiceBtn"
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
  );
};

export default UpdateQuote;
