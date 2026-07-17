import React, { useEffect, useState, Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { styled, useTheme, Box, Typography, IconButton } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector } from 'react-redux';
import AppBarComponent from './components/layout/DrawerAppBar/Appbar1';
import DrawerComponent from './components/layout/DrawerAppBar/Drawer1';
import { useNavigate, useLocation } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { fetchSubscriptionDetails } from './actions/subscriptionAction';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const contentFallback = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <CircularProgress style={{ color: 'rgb(127, 86, 217)' }} />
  </div>
);

export default function AppLayout({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const combined = useSelector((state) => state.logMember.combined);

  // Condition for showing the trial banner
  // const showTrialBanner = combined.user?.plans[0] && !combined.user.plans[0].playRecursion;
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const location = useLocation();

  // Check if the variable was passed
  useEffect(() => {
    if (location.state?.subscriptionUpdated) {
        // Use the passed subscription details directly
        setSubscriptionDetails(location.state.subscriptionUpdated);
    } else {
        // Fallback to fetch the details
        const getSubscription = async () => {
            if (combined?.user?._id) {
                try {
                    const details = await fetchSubscriptionDetails(combined.user._id);
                    setSubscriptionDetails(details);
                } catch (error) {
                    console.error("Failed to fetch subscription details:", error.message);
                }
            }
        };

        getSubscription();
    }
}, [location.state, combined?.user?._id]);

const showTrialBanner = (subscriptionDetails?.subscription?.plans[0].status === 'active' ||  subscriptionDetails?.subscription?.plans[0].status === 'trial') && (!subscriptionDetails?.subscription?.plans[0].playRecursion)
// console.log(subscriptionDetails, showTrialBanner)

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/subscription-plans');
    };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />

      {/* Trial Banner with conditional margin to align with drawer */}
      {showTrialBanner && (
        <Box
            bgcolor='rgb(127, 86, 217)'
            color="primary.contrastText"
            p={1}
            position="fixed"
            top={0}
            left={open ? '200px' : '60px'}
            width={`calc(100% - ${open ? 200 : 60}px)`}
            zIndex={theme.zIndex.drawer + 2}
            transition="left 0.3s ease, width 0.3s ease"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >

            {/* Centered Free Trial Text */}
            <Typography variant="body1">
                Free Trial - {subscriptionDetails?.subscription?.plans[0].days} Day{subscriptionDetails?.subscription?.plans[0].days === 1 ? '' : 's'} Left
            </Typography>

            {/* Clickable Text with IconButton on the Far Right */}
            <Box 
                display="flex" 
                alignItems="center" 
                style={{ position: 'absolute', right: '1rem', cursor: 'pointer' }}
                onClick={handleRedirect}
            >
                <Typography variant="body1" style={{ color: 'primary.contrastText', marginRight: '0.5rem' }}>
                    Checkout our plans
                </Typography>
                <IconButton size="small" style={{ padding: 0 }}>
                    <OpenInNewIcon style={{ color: 'white' }} />
                </IconButton>
            </Box>
        </Box>


      )}

      {/* AppBar Component */}
      <AppBarComponent open={open} onToggle={() => setOpen(o => !o)} trialOn={showTrialBanner} />

      {/* Drawer and Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, mt: showTrialBanner ? '48px' : 0 }}>
        <DrawerComponent open={open} onClose={handleDrawerClose} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <DrawerHeader />
          <Suspense fallback={contentFallback}>
            {children}
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
