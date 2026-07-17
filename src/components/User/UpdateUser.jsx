import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { useNavigate } from 'react-router-dom';
import { Button, Grid, InputLabel, TextField, Tooltip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { clearErrors, getUser, getUserDetails, updateUserLoggedIn } from '../../actions/userAction';
import { UPDATE_USER_RESET } from '../../constants/userConstant';
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


const UpdateUser = ({handleUpdateClose, selectedUserId}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  // console.log(handleUpdateClose, selectedUserId)
  const {loading, error:updateError, isUpdated} = useSelector((state)=>state.userDU)
  const { error:userDetailError, combined } = useSelector((state) => state.userDetails);
  // console.log("UC for User",combined)

  const combinedLog = useSelector((state) => state.logMember.combined);
  const profile_img_filename = combinedLog.user.profile_img ? combinedLog.user.profile_img.split('/').pop().split('_')[0] : '';
  const company_img_filename = combinedLog.user.company_img? combinedLog.user.company_img.split('/').pop().split('_')[0] : '';

  const [isUser] = useState(true);
  const [fname , setFname]=useState("");
  const [lname , setLname]=useState("");
  const [profileImg , setProfileImg]=useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyImg, setCompanyImg] = useState("");


  const userId = selectedUserId;
  // console.log(userId, combined)
  const [userDetailsFetched] = useState(false);

  const handleImageChange = (e) => {
    const profile_img = e.target.files[0];
    // setService_cover_img(service_cover_img);

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImg({
        url: reader.result,
        name: profile_img.name
    }); // Set base64 string to state
    };
  
    if (profile_img) {
      reader.readAsDataURL(profile_img); // Convert image file to base64 string
    }
  };
  const handleCompanyImageChange = (e) => {
    const image = e.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyImg({
        url: reader.result,
        name: image.name
      }); // Set base64 string to state
    };

    if (image) {
      reader.readAsDataURL(image); // Convert image file to base64 string
    }
  };

  useEffect(() => {
    if(userDetailError){
     dispatch(clearErrors)
  }
  dispatch(getUserDetails(userId));
}, [dispatch, userId, userDetailError]);

  useEffect(() => {
    if (combined && combined._id !== userId) {
      dispatch(getUserDetails(userId));
  //     setUserDetailsFetched(true);
  } else  {
      setFname(combinedLog.user.fname);
      setLname(combinedLog.user.lname);
      setProfileImg(combinedLog.user.profile_img);
      setCompanyName(combinedLog.user.company_SuperName || ""); // Set initial company name if available
      setCompanyImg(combinedLog.user.company_img || ""); // Set initial company image if available

  }
    if (userDetailError) {
      navigate("/profile", {
        state: {
          snackbar: {
            message: "User Details Not Found",
            severity: "error"
          }
        }
      });
      dispatch(clearErrors());
    }
     if (updateError) {
      handleUpdateClose()
      navigate("/profile", {
        state: {
          snackbar: {
            message: "User Details Updation Failed",
            severity: "error"
          }
        }
      });
      dispatch({ type: UPDATE_USER_RESET });
      dispatch(getUser());


      dispatch(clearErrors());
    }

    if (isUpdated) {
      handleUpdateClose()
      navigate("/profile", {
        state: {
          snackbar: {
            message: "Details Updated Successfully and Will be Rendered After Fresh Log-in",
            severity: "success"
          }
        }
      });
      dispatch({ type: UPDATE_USER_RESET });
      dispatch(getUser());
      dispatch(getUserDetails(combinedLog.user._id));
      dispatch(createNotification(combinedLog.user._id, `Details Updated Successfully and Will be Rendered After Fresh Log-in`));
      dispatch(getAllNotifications(combinedLog.user._id))

    }

  }, [dispatch, userDetailError, navigate, isUpdated, updateError, combinedLog, userId, userDetailsFetched]);
  const updateUserSubmitHandler = (e) => {
    e.preventDefault();
    const profileData = {
      fname: fname, 
      lname: '', 
      isUser: isUser, 
      profile_img: profileImg ? {
        url: profileImg.url,
        name: profileImg.name
      } : null,
      company_SuperName: companyName,
      company_img: companyImg ? {
        url: companyImg.url,
        name: companyImg.name
      } : null
    }
    // console.log(profileData)

    dispatch(updateUserLoggedIn( userId,profileData));
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
          className="updateClientForm"
          encType="multipart/form-data"
          onSubmit={updateUserSubmitHandler}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
            <InputLabel id="fname-label" style={{marginTop:'20px'}}>First Name</InputLabel>
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

            {/* <Grid item xs={12} sm={6}>
            <InputLabel id="lname-label" style={{marginTop:'20px'}}>Last Name</InputLabel>

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
            </Grid> */}
            <Grid item xs={12} sm={12}>
                <InputLabel id="profile-img">Profile Image</InputLabel>
                <Button
                fullWidth
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  endIcon={profileImg ? <FileDownloadDoneIcon /> : null}
                  style={{ backgroundColor: 'rgb(105, 56, 239)' }}

                >
                   <Tooltip title={profileImg ? "Image uploaded" : "Upload"} placement="top">
                   <span>{profileImg ? "Uploaded Image " + profile_img_filename  : "Upload Image"}</span>
                  </Tooltip>
                  <VisuallyHiddenInput type="file" accept='image/*' onChange={handleImageChange}   />
                </Button>

                </Grid>

                <Grid item xs={12} sm={12}>
                  <InputLabel id="company-name-label" style={{ marginTop: '20px' }}>Company Name</InputLabel>
                  <TextField
                    type="text"
                    label="Company Name"
                    placeholder="Company Name"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    fullWidth
                    variant="filled"
                    margin="none"
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <InputLabel id="company-img">Company Logo</InputLabel>
                  <Button
                    fullWidth
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    endIcon={companyImg ? <FileDownloadDoneIcon /> : null}
                    style={{ backgroundColor: 'rgb(105, 56, 239)' }}
                  >
                    <Tooltip title={companyImg ? "Image uploaded" : "Upload"} placement="top">
                      <span>{companyImg ? "Uploaded Image " + company_img_filename : "Upload Image"}</span>
                    </Tooltip>
                    <VisuallyHiddenInput type="file" accept='image/*' onChange={handleCompanyImageChange} />
                  </Button>
                </Grid>

          </Grid>
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <Button
              id="updateClientBtn"
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




export default UpdateUser
