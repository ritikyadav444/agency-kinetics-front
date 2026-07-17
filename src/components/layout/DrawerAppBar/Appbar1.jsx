
import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Badge,
  Avatar,
  MenuItem,
  Menu,
  Typography,
  MenuList,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { Notifications, Close as CloseIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutMember } from '../../../actions/loginAction';
import { clearNotificationsForUser, deleteNotification, getAllNotifications, markAllNotificationsAsRead } from '../../../actions/notificationAction'; // Import notification actions
import { SET_AUTHENTICATION, SET_SIDEBAR_VISIBILITY } from "../../../constants/loginConstants";
import MenuIcon from '@mui/icons-material/Menu';

const useStyles = makeStyles({
  brandText: {},
  appBarItemsRight: {
    marginLeft: "auto",
    marginRight: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  appBarShift: (props) => ({
    backgroundColor: 'rgb(255, 255, 255)',
    color: 'rgb(0, 0, 0)',
    marginTop: props.trialOn ? '35px' : 0,  // Adjust the height based on trialOn
  }),
  avatar: {
    width: 30,
    height: 30,
    // marginLeft: 10
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between', // Align items to the end
    alignItems: 'center',
    
  },
  closeIcon: {
    marginLeft: 'auto', // Push the close icon to the far right
    cursor: 'pointer', // Change cursor to pointer on hover
  },
  roundedPaper: {
    borderRadius: '15px',
    marginTop: '40px', 
    marginLeft: 'auto'
  },
  roundedPaperProfile: {
    borderRadius: '12px',
    marginTop: '8px',
    marginLeft: 'auto'
  },
  
});

export default function AppBarComponent({open, onToggle, trialOn}) {
  
  const combined = useSelector((state) => state.logMember.combined);
  
  

  const name = combined.user.fname + ' '+ combined.user.lname;
  
  // console.log(combined.user._id, name)

  const classes = useStyles({ trialOn });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  // console.log('-------------', notifications)
  // const userNotifications = notifications.filter(notification => notification.userId === combined.user._id);
  // console.log(userNotifications)
  // const {notifications} = useSelector((state) => state.notifications); // Access notifications from Redux store
  const { notifications } = useSelector(state => state.getAllNotifications); // Adjust to match your reducer name



  // console.log(notifications)
  const userNotifications = notifications

  const [openDialog, setOpenDialog] = useState(false);

  const handleLogoutClick = () => {
    setOpenDialog(true); // Open the confirmation dialog
    handleProfileMenuClose();

  };

  const handleLogoutConfirmed = () => {
    setOpenDialog(false); // Close the confirmation dialog
    handleLogout(); // Call logout function
  };

  const handleLogoutCancelled = () => {
    setOpenDialog(false); // Close the confirmation dialog
    // Optionally handle cancellation
  };
 
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);

  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const openProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };
  const openSubscriptionDetails = () => {
    navigate('/subscription-plans');
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    // dispatch(setSidebarVisibility(false));
    // dispatch(setAuthentication(false));
    // dispatch(persistStateBeforeLogout());
    dispatch({ type: SET_SIDEBAR_VISIBILITY, payload: false })
    dispatch({ type: SET_AUTHENTICATION, payload: false })
    dispatch(logoutMember());
    // alert("Logout Successfully");
    navigate('/login');
  };

  const handlePaymentandInvoiceDetails = () => {
    navigate('/payments-and-invoices-details');
    handleProfileMenuClose();
  };

  // const handleNotificationClick = () => {
  //   setNotificationOpen(true);
  //   // dispatch(resetNotifications()); // Reset notifications count when clicked
  // };
  const [badgeContent, setBadgeContent] = useState(0);

  useEffect(() => {
    if (combined?.user?._id) {
      dispatch(getAllNotifications(combined.user._id));
    }
  }, [dispatch, combined.user._id]);

  useEffect(() => {
    setBadgeContent(userNotifications.filter(notification => !notification.markAsRead).length);
  }, [userNotifications]);

  const handleMarkAsRead = () => {
    dispatch(markAllNotificationsAsRead(combined.user._id)).then(() => {
      setBadgeContent(0); // Reset badge content to 0 after marking all as read
    });
    handleNotificationMenuClose()
  };

  const handleClearNotifications = () => {
    const userId = combined.user._id;
    dispatch(clearNotificationsForUser(userId)).then(() => {
      dispatch(getAllNotifications(userId));
      setBadgeContent(0); // Reset badge content
    });
    handleNotificationMenuClose();
  };

  const handleCloseNotification = (id) => {
    const userId = combined.user._id;
    dispatch(deleteNotification(id, userId)).then(() => {
      dispatch(getAllNotifications(userId));
      if (userNotifications.length === 1) {
        handleNotificationMenuClose();
      }
    });
  };


  return (
    <AppBar position="fixed" color="inherit" className={classes.appBarShift} open={open}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle sidebar"
          onClick={onToggle}
          style={{ marginLeft: open ? '200px' : '40px', transition: 'margin-left 0.3s' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography className={classes.brandText} style={{ marginLeft: '8px' }}>
          Welcome, {name}
        </Typography>

        {/* Notification Icon */}
        <Box className={classes.appBarItemsRight}>
          <IconButton color="inherit" aria-label="toggle dark mode" onClick={userNotifications.length > 0 ? handleNotificationMenuOpen : undefined}>
          <Badge badgeContent={badgeContent} max={50} color='primary' overlap="rectangular" >
              <Notifications />
            </Badge>
          </IconButton>

         {/* Notification Menu */}
        <Menu
            anchorEl={notificationAnchorEl}
            keepMounted
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            PaperProps={{
                className: classes.roundedPaper, // Custom style for the notification menu
            }}
        >
            {/* Fixed header for buttons */}
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="8px" padding="8px">
                <Button
                    color="inherit"
                    aria-label="mark as read"
                    onClick={handleMarkAsRead}
                    style={{ color: 'white', backgroundColor: 'rgb(127, 86, 217)' }}
                >
                    <Typography variant="button">Mark as Read</Typography>
                </Button>
                <Button
                    color="inherit"
                    aria-label="clear notifications"
                    onClick={handleClearNotifications}
                    style={{ color: 'white', backgroundColor: 'rgb(127, 86, 217)' }}
                >
                    <Typography variant="button">Clear Notifications</Typography>
                </Button>
            </Box>

            {/* Scrollable messages section */}
            <MenuList style={{ maxHeight: "300px", overflowY: "auto" }}>
                {userNotifications.length > 0 ? (
                    userNotifications.slice(0).reverse().map((notification, index) => (
                        <MenuItem key={index} className={classes.menuItem}>
                            <span
                                onClick={(e) => {
                                    // Only add onClick if routeLink exists
                                    if (notification.routeLink) {
                                        e.stopPropagation(); // Prevents closing the menu
                                        handleNotificationMenuClose(); // Close the notification menu

                                        // Extract the pathname from the routeLink
                                        const path = new URL(notification.routeLink).pathname;

                                        navigate(path);
                                    }
                                }}
                                style={{ cursor: notification.routeLink ? 'pointer' : 'default', display: 'flex', alignItems: 'center', width: '100%' }} // Flex to align items
                            >
                                <span className={classes.message}>
                                    {notification.message}
                                </span>
                                <span style={{ color: 'grey', marginLeft: '8px' }}>
                                    {new Date(notification.createdAt).toLocaleString('en-US', {
                                        timeZone: 'Asia/Kolkata', // IST timezone
                                        month: 'short',
                                        day: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false // 24-hour format
                                    })}
                                </span>
                            </span>
                            <CloseIcon
                                fontSize="small"
                                className={classes.closeIcon}
                                onClick={() => handleCloseNotification(notification._id, index)}
                            />
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>No notifications</MenuItem>
                )}
            </MenuList>
        </Menu>



          {/* User Profile Icon */}
          <Box display="flex" alignItems="center">
            {combined && combined.user ? (
              
              <IconButton color="inherit" aria-label="user profile" onClick={handleProfileMenuOpen}>
                <Avatar alt="User Avatar" src={combined?.user?.profile_img} className={classes.avatar} />
              </IconButton>
                ):(
                  <IconButton color="inherit" aria-label="user profile" onClick={handleProfileMenuOpen}>
                <Avatar alt="User Avatar" src='' className={classes.avatar} />
              </IconButton>
                )}

          </Box>

          {/* User Profile Menu */}
          <Menu
            anchorEl={profileAnchorEl}
            keepMounted
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{ // Use PaperProps to apply custom styles to the Paper component
              className: classes.roundedPaperProfile, // Apply the custom style to the Paper component
            }}
          >
            <MenuItem onClick={openProfile}>Profile</MenuItem>
            {combined?.user?.role === "SUPERADMIN" && (
              <MenuItem onClick={openSubscriptionDetails}>My Plans</MenuItem>
            )}
            <MenuItem onClick={handlePaymentandInvoiceDetails}>Payments and Invoices</MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <Dialog open={openDialog} onClose={handleLogoutCancelled}>
        <DialogTitle style={{ color: '#d11a2a' }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText style={{color:'black'}}>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button  style={{ color: 'black' }} onClick={handleLogoutCancelled} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirmed} variant="contained"
            // color="error"
            style={{ backgroundColor: '#d11a2a', color: 'white' }}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

    </AppBar>
  );
}