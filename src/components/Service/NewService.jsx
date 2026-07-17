import React, {useEffect, useState} from 'react'
import {  useDispatch, useSelector } from 'react-redux'
import { clearErrors, createService, getService } from '../../actions/serviceAction'
import { NEW_SERVICE_RESET } from '../../constants/serviceConstant';
import MetaData from '../layout/MetaData';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { useNavigate } from 'react-router-dom';
import { Box, Slider, Autocomplete, Button, FormControl, Grid, Input, InputAdornment, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import { Editor } from 'primereact/editor';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
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

const NewService = ({handleClose}) => {
const dispatch = useDispatch();
const navigate = useNavigate()
const {loading, error, success} = useSelector((state)=>state.newService)
// console.log("su", success)

const [service_name , setService_name]=useState("");
const [value, setValue] = useState('')
const [unit, setUnit] = useState('Days')

const [service_desc , setService_desc]=useState("");
const [isServiceDescValid, setIsServiceDescValid] = useState(true);
const [service_amount , setService_amount]=useState("");
const [service_pricing_type , setService_pricing_type]=useState("One-Time");
const [service_cover_img, setService_cover_img] = useState(null);

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

  const [sliderValue, setSliderValue] = useState({ min: 1, max: 100000 }); // Initial slider values as an object

  // Handle slider change
  const handleSliderChange = (event, newValue) => {
    setSliderValue({ min: newValue[0], max: newValue[1] });
  };

  // Handle input change for the left (minimum) value
  const handleLeftInputChange = (event) => {
    const newValue = Number(event.target.value);
    setSliderValue({ ...sliderValue, min: newValue });
  };

  // Handle input change for the right (maximum) value
  const handleRightInputChange = (event) => {
    const newValue = Number(event.target.value);
    setSliderValue({ ...sliderValue, max: newValue });
  };

  const role = formatRole(combined.user.role)
  // console.log(role) 

  const superAdminId = combined?.superAdminId;

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

  const currencies = [
    {
      value: 'USD',
      label: '$ - United States Dollar (USD)',
    },
    {
      value: 'EUR',
      label: '€ - Euro (EUR)',
    },
    {
      value: 'GBP',
      label: '£ - British Pound Sterling (GBP)',
    },
    {
      value: 'JPY',
      label: '¥ - Japanese Yen (JPY)',
    },
    {
      value: 'CAD',
      label: '$ - Canadian Dollar (CAD)',
    },
    {
      value: 'AUD',
      label: '$ - Australian Dollar (AUD)',
    },
    {
      value: 'CHF',
      label: 'CHF - Swiss Franc (CHF)',
    },
    {
      value: 'CNY',
      label: '¥ - Chinese Yuan (CNY)',
    },
    {
      value: 'SEK',
      label: 'kr - Swedish Krona (SEK)',
    },
    {
      value: 'NZD',
      label: '$ - New Zealand Dollar (NZD)',
    },
    {
      value: 'ZAR',
      label: 'R - South African Rand (ZAR)',
    },
    {
      value: 'INR',
      label: '₹ - Indian Rupee (INR)',
    },
    {
      value: 'BRL',
      label: 'R$ - Brazilian Real (BRL)',
    },
    {
      value: 'RUB',
      label: '₽ - Russian Ruble (RUB)',
    },
    {
      value: 'MXN',
      label: '$ - Mexican Peso (MXN)',
    },
    {
      value: 'SGD',
      label: '$ - Singapore Dollar (SGD)',
    },
    {
      value: 'HKD',
      label: '$ - Hong Kong Dollar (HKD)',
    },
    {
      value: 'NOK',
      label: 'kr - Norwegian Krone (NOK)',
    },
    {
      value: 'KRW',
      label: '₩ - South Korean Won (KRW)',
    },
    {
      value: 'TRY',
      label: '₺ - Turkish Lira (TRY)',
    },
  ];

  const [selectedCurrency, setSelectedCurrency] = useState('');

  const handleChange = (event) => {
    setSelectedCurrency(event.target.value);
  };



  const createServiceSubmitHandler = async (e) => {
    e.preventDefault();
    // console.log(service_cover_img, typeof(service_cover_img))
    if (service_desc.trim() === '') {
      setIsServiceDescValid(false);
      return;
    }
    setIsServiceDescValid(true);
    const serviceData = {
      service_name,
      service_amount: { min: sliderValue.min, max: sliderValue.max },
      service_desc,
      service_pricing_type,
      value,
      unit,
      currency: selectedCurrency, 
      service_cover_img: service_cover_img ? {
          url: service_cover_img.url,
          name: service_cover_img.name
      } : null
  };
    const response = await dispatch(createService(serviceData));
    if (response.success) {
        const id = response.service._id; 
        // const routeLink = `http://dashboard.agencykinetics.com/service/${id}`
        const routeLink = `http://app.agencykinetics.com/service/${id}`
        handleClose()
      navigate("/services", {
        state: {
          snackbar: {
            message: "New Service Created Successfully",
            severity: "success"
          }
        }
      });
      dispatch({ type: NEW_SERVICE_RESET });

      dispatch(createNotification(combined.user._id, `New Service ${service_name} Created Successfully`, routeLink));
      if (combined.user.role !== 'SUPERADMIN'){
        // console.log("INHEFERE", superAdminId)
        dispatch(createNotification(superAdminId?._id, `New Service ${service_name} Created Successfully By ${combined.user.fname} ${combined.user.lname}`, routeLink));

      }
      dispatch(getService()).then(() => {
        dispatch(getAllNotifications(combined.user._id));
      });
        
    } else if (response.error) {
      handleClose()
      navigate("/services", {
        state: {
          snackbar: {
            message: `New Service Creation Failed as: ${error}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: NEW_SERVICE_RESET });
      dispatch(getService());
      dispatch(clearErrors());
    }
};
  

  const handleImageChange = (e) => {
    const service_cover_img = e.target.files[0];
    const reader = new FileReader()
    reader.onloadend = () => {
      setService_cover_img({
        url: reader.result,
        name: service_cover_img.name
    }); // Set base64 string to state
    };
  
    if (service_cover_img) {
      reader.readAsDataURL(service_cover_img); // Convert image file to base64 string
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
            className="createServiceForm"
            encType="multipart/form-data"
            onSubmit={createServiceSubmitHandler}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12}>
                <InputLabel id="serviceName-label" style={{marginTop:'20px'}}>Service Name</InputLabel>

                  <TextField
                    type="text"
                    label="Service Name"
                    placeholder="Service Name"
                    required
                    value={service_name}
                    onChange={(e) => setService_name(e.target.value)}
                    fullWidth
                    variant="filled"
                    margin="none"
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <InputLabel id="serviceAmount-label">Amount</InputLabel>

                  <Box sx={{ width: '480px' }}>
                    <Slider
                      style={{ color: 'rgb(127, 86, 217)' }}
                      value={[sliderValue.min, sliderValue.max]} // Use the object values for the slider
                      onChange={handleSliderChange}
                      min={1}
                      max={100000}
                      valueLabelDisplay="auto"
                      sx={{ marginBottom: 2 }}
                    />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, marginTop: 2 }}>
                      <TextField
                        required
                        label="Min"
                        value={sliderValue.min} // Use the object value for the min input
                        onChange={handleLeftInputChange}
                        inputProps={{ type: 'number', min: 1, max: sliderValue.max }}
                        fullWidth
                      />
                      <TextField
                        required
                        label="Max"
                        value={sliderValue.max} // Use the object value for the max input
                        onChange={handleRightInputChange}
                        inputProps={{ type: 'number', min: sliderValue.min, max: 100000 }}
                        fullWidth
                      />
                      <TextField
                        required
                        select
                        label="Currency"
                        value={selectedCurrency}
                        onChange={handleChange}
                        fullWidth
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              style: {
                                maxHeight: 200, // Adjust the maxHeight as needed
                              },
                            },
                          },
                        }}
                      >
                        {currencies
                          .slice()
                          .sort((a, b) => {
                            const labelA = a.label.split(' - ')[1].toLowerCase();
                            const labelB = b.label.split(' - ')[1].toLowerCase();
                            return labelA.localeCompare(labelB);
                          })
                          .map((option) => (
                            <MenuItem key={option.value} value={option.value + option.label.split(' - ')[0]}>
                              {option.label}
                            </MenuItem>
                          ))}
                      </TextField>

                    </Box>
                  {/* </Box> */}
                </Grid>


              <Grid item xs={12} sm={6}>
                <InputLabel id="service-price-type">Select Pricing Type</InputLabel>
                <Autocomplete  
                  fullWidth
                  disablePortal
                  value={service_pricing_type}
                  onChange={(event, newValue) => {
                    setService_pricing_type(newValue);
                  }}
                  id="service_pricing_type"
                  options={['One-Time', 'Recurring']}
                  noOptionsText="Select Pricing Type"
                  getOptionLabel={(option) => option}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      label="Select Pricing Type"
                      variant="filled"
                    />
                  )}
                />
                </Grid>

                <Grid item xs={6} sm={6}>
                  <InputLabel id="timeframe">Timeframe</InputLabel>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
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
                    <Grid item xs={6}>
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
                <InputLabel id="service-cover-img">Service Cover Image</InputLabel>

                <Button
                fullWidth
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon style={{color:'white'}} />}
                  endIcon={service_cover_img ? <FileDownloadDoneIcon style={{color:'white'}}/> : null}
                  style={{ backgroundColor: 'rgb(105, 56, 239)' }}

                >
                   <Tooltip title={service_cover_img ? "Image uploaded" : ""} placement="top">
                   <span style={{color:'white'}}>{service_cover_img ? "Uploaded Image" : "Upload Image"}</span>
                  </Tooltip>
                  <VisuallyHiddenInput type="file" accept='image/*' onChange={handleImageChange}   />
                </Button>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <InputLabel id="serviceDesc-label" required>
                    Description
                  </InputLabel>
                  <Editor required value={service_desc} onTextChange={(e) => setService_desc(e.htmlValue)} headerTemplate={header} style={{ height: '320px' }} />

                  {!isServiceDescValid && (
                    <div style={{ color: 'red', marginTop: '8px' }}>
                      Description is required.
                    </div>
                  )}
                </Grid>

                
              

              </Grid>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button
                  id="createOrderBtn"
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
  )
}

export default NewService