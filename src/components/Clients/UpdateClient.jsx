import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData";
import { UPDATE_CLIENT_RESET } from "../../constants/clientsConstants";
import {
  getClientDetails,
  clearErrors,
  updateClient,
  getClient,
} from "../../actions/clientAction";
import "./Client.css";
import {
  createNotification,
  getAllNotifications,
} from "../../actions/notificationAction";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { getUserDetails } from "../../actions/userAction";
import { baseURL } from "../../http";
import {
  Autocomplete,
  Button,
  Grid,
  InputLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UpdateClient = ({ handleUpdateClose, selectedClientId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    error: updateError,
    isUpdated,
  } = useSelector((state) => state.clientDU);
  const { error: clientDetailError, combined } = useSelector(
    (state) => state.clientDetails
  );
  const combinedLog = useSelector((state) => state.logMember.combined);

  const [isClient, setIsClient] = useState(true);
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImg, setProfileImg] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const superAdminId = combined?.superAdminId;

  useEffect(() => {
    if (selectedCountry) {
      const selectedCountryData = countriesList.find(
        (country) => country.label === selectedCountry.label
      );
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
    if (selectedState && selectedCountry) {
      const fetchCities = async () => {
        try {
          const response = await fetch(
            "https://countriesnow.space/api/v0.1/countries/state/cities",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                country: selectedCountry.label,
                state: selectedState.label,
              }),
            }
          );
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
          console.error("Error fetching cities:", error.message);
        }
      };
      fetchCities();
    } else {
      setCitiesList([]);
    }
  }, [selectedState, selectedCountry]);

  const clientId = selectedClientId;
  const [clientDetailsFetched, setClientDetailsFetched] = useState(false);
  const handleImageChange = (e) => {
    const profile_img = e.target.files[0];
    setProfileImg(profile_img);
  };

  useEffect(() => {
    if (clientDetailError) {
      dispatch(clearErrors);
    }
    dispatch(getClientDetails(clientId));
  }, [dispatch, clientId, clientDetailError]);

  useEffect(() => {
    if (combined && combined._id !== clientId) {
      dispatch(getClientDetails(clientId));
      setClientDetailsFetched(true);
    } else {
      setEmail(combined.email);
      setFname(combined.fname);
      setLname(combined.lname);
      setSelectedCountry({ label: combined.country });
      setSelectedState({ label: combined.state });
      setSelectedCity({ label: combined.city });
      setPostalCode(combined.postalCode);
      setProfileImg(combined.profile_img);
    }
    if (clientDetailError) {
      navigate("/clients", {
        state: {
          snackbar: {
            message: "Client Details Not Found",
            severity: "error",
          },
        },
      });
      dispatch(clearErrors());
    }
  }, [
    dispatch,
    clientDetailError,
    navigate,
    isUpdated,
    updateError,
    combined,
    clientId,
    clientDetailsFetched,
  ]);

  const updateClientSubmitHandler = async (e) => {
    e.preventDefault();
    const myForm = new FormData();
    myForm.set("fname", fname);
    myForm.set("lname", lname);
    myForm.set("country", selectedCountry ? selectedCountry.label : "");
    myForm.set("state", selectedState ? selectedState.label : "");
    myForm.set("city", selectedCity ? selectedCity.label : "");
    myForm.set("postalCode", postalCode);
    myForm.set("isClient", isClient);

    if (profileImg) {
      myForm.set("profile_img", profileImg);
    }

    const response = await dispatch(updateClient(clientId, myForm));
    if (response.success) {
      const id = response.client._id;
      // const routeLink = `http://dashboard.agencykinetics.com/client/${id}`
      const routeLink = `http://app.agencykinetics.com/client/${id}`;
      handleUpdateClose();
      navigate("/clients", {
        state: {
          snackbar: {
            message: "Client Updated Successfully",
            severity: "success",
          },
        },
      });
      dispatch({ type: UPDATE_CLIENT_RESET });
      dispatch(getUserDetails(combinedLog.user._id));
      dispatch(
        createNotification(
          combinedLog.user._id,
          `Client ${fname} ${lname} Details Updated Successfully`,
          routeLink
        )
      );
      if (combined.user && combined.user.role !== "SUPERADMIN") {
        dispatch(
          createNotification(
            superAdminId,
            `Client ${fname} ${lname} Details Updated Successfully By ${combined.user.fname} ${combined.user.lname}`,
            routeLink
          )
        );
      }
      dispatch(getClient()).then(() => {
        dispatch(getAllNotifications(combinedLog.user._id));
      });
    } else if (response.error) {
      handleUpdateClose();
      navigate("/clients", {
        state: {
          snackbar: {
            message: "Client Updation Failed",
            severity: "error",
          },
        },
      });
      dispatch({ type: UPDATE_CLIENT_RESET });
      dispatch(getClient());
      dispatch(clearErrors());
    }
  };

  return (
    <div>
      <form
        className="updateClientForm"
        encType="multipart/form-data"
        onSubmit={updateClientSubmitHandler}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InputLabel id="fname-label" style={{ marginTop: "20px" }}>
              First Name
            </InputLabel>
            <TextField
              type="text"
              label="First Name"
              placeholder="First Name"
              required
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              fullWidth
              variant="filled"
              margin="none"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel id="lname-label" style={{ marginTop: "20px" }}>
              Last Name
            </InputLabel>
            <TextField
              type="text"
              label="Last Name"
              placeholder="Last Name"
              required
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              fullWidth
              variant="filled"
              margin="none"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel id="country-label">Country</InputLabel>
            <Autocomplete
              id="country-select"
              options={countriesList}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.label === value?.label
              }
              value={selectedCountry}
              onChange={(event, newValue) => {
                setSelectedCountry(newValue);
                setSelectedState(null);
                setSelectedCity(null);
                setCountry(newValue ? newValue.label : "");
              }}
              renderInput={(params) => (
                <TextField {...params} label="Country" variant="filled" />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.iso3}>
                  {option.label}
                </li>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel id="state-label">State</InputLabel>
            <Autocomplete
              id="state-select"
              options={statesList}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.label === value?.label
              }
              value={selectedState}
              onChange={(event, newValue) => {
                setSelectedState(newValue);
                setSelectedCity(null);
                setState(newValue ? newValue.label : "");
              }}
              renderInput={(params) => (
                <TextField {...params} label="State" variant="filled" />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel id="city-label">City</InputLabel>
            <Autocomplete
              id="city-select"
              options={citiesList}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.label === value?.label
              }
              value={selectedCity}
              onChange={(event, newValue) => {
                setSelectedCity(newValue);
                setCity(newValue ? newValue.label : "");
              }}
              renderInput={(params) => (
                <TextField {...params} label="City" variant="filled" />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel id="pcode-label">Postal Code</InputLabel>
            <TextField
              type="number"
              label="Postal Code"
              placeholder="Postal Code"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              fullWidth
              variant="filled"
              margin="none"
            />
          </Grid>
        </Grid>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Button
            id="updateClientBtn"
            type="submit"
            // disabled={loading}
            variant="contained"
            color="primary"
            style={{ backgroundColor: "rgb(105, 56, 239)" }}
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateClient;
