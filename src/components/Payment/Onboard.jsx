import React from 'react';
import { makeStyles } from '@mui/styles';
import { Button, SvgIcon } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useSelector } from 'react-redux';
import { baseURL } from '../../http';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    justifyContent: 'left',
    width: '400px',
    height: '150px',
    // border: '2px solid #000',
    borderRadius: '10px',
    
    padding: theme.spacing(1),
    textAlign: 'left',
    backgroundColor: 'rgb(245, 245, 245)',
    boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
    marginTop: '20px',
    marginLeft:'20px'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  description: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: theme.spacing(1),
  },
  button: {
    width: '150px',
    height: '35px',
    fontSize: '1rem',
    backgroundColor: 'rgb(127, 86, 217)',
    color: '#fff',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgb(127, 86, 217)', 
      color: '#fff', 
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      color: '#666',
    },
  },
  checkIcon: {
    color: 'green',
    marginLeft: theme.spacing(1),
  },
}));

const OnboardButton = () => {
  const classes = useStyles();
  const combined = useSelector((state) => state.logMember.combined);
  const active = combined.user.stripeAccountId;

  const handleOnboardClick = async () => {
    try {
      const response = await fetch(`${baseURL}/api/v1/create-account-link`, {
        method: 'POST',
        credentials: 'include',

        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe onboarding link
      }
    } catch (error) {
      console.error('Error onboarding to Stripe:', error);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.title}>Stripe</div>
      <div className={classes.description}>
        Connect your Stripe account or create a new one to start accepting online payments immediately.
      </div>
      <Button
        className={classes.button}
        onClick={handleOnboardClick}
        // disabled={active}
        disabled

      >
        {active ? (
          <>
            Connected <CheckIcon className={classes.checkIcon} />
          </>
        ) : (
          'Connect to Stripe'
        )}
      </Button>
    </div>
  );
};

export default OnboardButton;
