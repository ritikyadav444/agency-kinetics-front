import React, {useEffect, useState} from 'react'
import {  useDispatch, useSelector } from 'react-redux'
import MetaData from '../layout/MetaData';
import { NEW_CLIENT_RESET, NEW_RESET } from '../../constants/clientsConstants';
import { clearErrors, createClient, getClient } from '../../actions/clientAction';
import { Grid, Button, TextField, InputLabel } from '@mui/material';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { useNavigate } from 'react-router-dom';
import { IconButton, Typography, Autocomplete } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CustomizedSnackbars from '../../snackbarToast';
import { baseURL } from '../../http';
import { CircularProgress } from '@mui/material';

const NewClient = ({handleClose}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const {loading, error, success, combined} = useSelector((state)=>state.newClient)
  // console.log("su", success, combined)

  const combinedLog = useSelector((state) => state.logMember.combined);
  const name = combinedLog.user.fname + ' ' + combinedLog.user.lname
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
  const role = formatRole(combinedLog.user.role)
  // console.log(role) 


  const [isClient , setisClient]=useState(true);
  const [email , setemail]=useState("");
  const [fname , setfname]=useState("");
  const [lname , setlname]=useState("");
  const [password , setpassword]=useState("");
  const [country , setcountry]=useState("");
  const [state , setstate]=useState("");
  const [city , setcity]=useState("");
  const [postalCode , setpostalCode]=useState("");
  const [companyname , setcompanyname]=useState("");
  const [passwordError, setPasswordError] = useState("");
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);


  const [showPassword, setShowPassword] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const superAdminId = combined?.superAdminId;

  useEffect(() => {
    const controller = new AbortController();
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.status}`);
        }
        const data = await response.json();
        const formattedCountries = data.data.map((country) => ({
          value: country.iso3,
          label: country.name,
          states: country.states,
        }));
        setCountriesList(formattedCountries);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching countries:', error.message);
      }
    };

    fetchCountries();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const selectedCountryData = countriesList.find(country => country.label === selectedCountry.label);
      if (selectedCountryData && selectedCountryData.states) {
        const formattedStates = selectedCountryData.states.map((state) => ({
          value: state.state_code,
          label: state.name,
        }));
        setStatesList(formattedStates);
      } else {
        setStatesList([]);
      }
    } else {
      setStatesList([]);
    }
  }, [selectedCountry, countriesList]);

  useEffect(() => {
    const controller = new AbortController();
    if (selectedState && selectedCountry) {
      const fetchCities = async () => {
        try {
          const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              country: selectedCountry.label,
              state: selectedState.label,
            }),
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch cities: ${response.status}`);
          }
          const data = await response.json();
          if (data.data) {
            const formattedCities = data.data.map((city) => ({
              value: city,
              label: city,
            }));
            setCitiesList(formattedCities);
          } else {
            setCitiesList([]);
          }
        } catch (error) {
          if (error.name === 'AbortError') return;
          console.error('Error fetching cities:', error.message);
        }
      };

      fetchCities();
    } else {
      setCitiesList([]);
    }
    return () => controller.abort();
  }, [selectedState, selectedCountry]);



  const createClientSubmitHandler = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("Password must be at least 7 characters long, include one uppercase letter, one number, and one special character.");
      return;
    }
    const response = await dispatch(createClient({ email, password, fname, lname, country, state, city, postalCode, companyname, isClient }));
    if (response.success) {
        const id = response.combined._id; 
        // const routeLink = `http://dashboard.agencykinetics.com/client/${id}`
        const routeLink = `http://app.agencykinetics.com/client/${id}`
        handleClose()
        navigate("/clients", {
          state: {
            snackbar: {
              message: "New Client Created Successfully",
              severity: "success"
            }
          }
        });
        dispatch({ type: NEW_CLIENT_RESET });
    
        dispatch(createNotification(combinedLog.user._id, `New Client ${fname} ${lname} Created Successfully`, routeLink));
        dispatch(getClient()).then(() => {
          dispatch(getAllNotifications(combinedLog.user._id));
        });

    } else if (response.error) {
      handleClose()
      navigate("/clients", {
        state: {
          snackbar: {
            message: `New Client Creation Failed as: ${error}`,
            severity: "error"
          }
        }
      });
      dispatch({ type: NEW_CLIENT_RESET });
      dispatch(getClient());

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
          className="createClientForm"
          encType="multipart/form-data"
          onSubmit={createClientSubmitHandler}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <InputLabel id="company-label" style={{marginTop:'20px'}}>Company Name</InputLabel>

                  <TextField
                  type="text"
                  label="Company Name"
                  placeholder="Company Name"
                  required
                  value={companyname}
                  onChange={(e) => setcompanyname(e.target.value)}
                  fullWidth
                  variant="filled"
                  margin="none"
                />
              </Grid>

            <Grid item xs={12} sm={6}>
            <InputLabel id="fname-label">First Name</InputLabel>

              <TextField
                type="text"
                label="First Name"
                placeholder="First Name"
                required
                value={fname}
                onChange={(e) => setfname(e.target.value)}
                fullWidth
                variant="filled"
                margin="none"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
            <InputLabel id="lname-label">Last Name</InputLabel>

              <TextField
                type="text"
                label="Last Name"
                placeholder="Last Name"
                required
                value={lname}
                onChange={(e) => setlname(e.target.value)}
                fullWidth
                variant="filled"
                margin="none"
              />
            </Grid>

            <Grid item xs={12}>
            <InputLabel id="email-label">Email</InputLabel>

              <TextField
                type="email"
                label="Email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setemail(e.target.value)}
                fullWidth
                variant="filled"
                margin="none"
              />
              
            </Grid>
            
            <Grid item xs={12}>
              <InputLabel id="password-label">Password</InputLabel>
              <TextField
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => {
                  setpassword(e.target.value);
                  setPasswordError(""); // Clear any previous error when user starts typing
                }}
                fullWidth
                variant="filled"
                margin="none"
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={togglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              {passwordError && (
                <Typography color="error" variant="body2" style={{ marginTop: "5px" }}>
                  {passwordError}
                </Typography>
              )}
            </Grid>


            <Grid item xs={12} sm={6}>
              <InputLabel id="country-label">Country</InputLabel>
              <Autocomplete
                id="country-select"
                options={countriesList}
                getOptionLabel={(option) => option.label}
                value={selectedCountry}
                onChange={(event, newValue) => {
                  setSelectedCountry(newValue);
                  setSelectedState(null);
                  setSelectedCity(null);
                  setcountry(newValue ? newValue.label : "");
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Country" variant="filled" />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.iso3}>
                    {option.label}
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.label === value.label}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel id="state-label">State</InputLabel>
              <Autocomplete
                id="state-select"
                options={statesList}
                getOptionLabel={(option) => option.label}
                value={selectedState}
                onChange={(event, newValue) => {
                  setSelectedState(newValue);
                  setSelectedCity(null);
                  setstate(newValue ? newValue.label : "");
                }}
                renderInput={(params) => (
                  <TextField {...params} label="State" variant="filled" />
                )}
                isOptionEqualToValue={(option, value) => option.label === value.label}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel id="city-label">City</InputLabel>
              <Autocomplete
                id="city-select"
                options={citiesList}
                getOptionLabel={(option) => option.label}
                value={selectedCity}
                onChange={(event, newValue) => {
                  setSelectedCity(newValue);
                  setcity(newValue ? newValue.label : "");
                }}
                renderInput={(params) => (
                  <TextField {...params} label="City" variant="filled" />
                )}
                isOptionEqualToValue={(option, value) => option.label === value.label}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel id="postalcode-label">Postal Code</InputLabel>
              <TextField
                type="number"
                label="Postal Code"
                placeholder="Postal Code"
                required
                value={postalCode}
                onChange={(e) => setpostalCode(e.target.value)}
                fullWidth
                variant="filled"
                margin="none"
              />
            </Grid>
          </Grid>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              id="createClientBtn"
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

export default NewClient;