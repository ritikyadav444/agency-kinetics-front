
import React from 'react';
import { Container, Typography, Button, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import AgencyKineticsLogo from '../Images/agencyKineticsLogo.svg'
const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  content: {
    textAlign: 'center',
  },
  logo: {
    marginBottom: theme.spacing(2),
    width: '100px', // Adjust the width as needed
  },
  message: {
    marginBottom: theme.spacing(2),
  },
  button: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const VerifyingFP = () => {
  const classes = useStyles();

  return (
    <Container className={classes.container} style={{alignContent:'center'}}>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <div className={classes.content}>
            <img src={AgencyKineticsLogo} alt="AgencyKinetics Logo" className={classes.logo} />
            <Typography variant="h5" component="div" className={classes.message}>
              Reset Your Password
            </Typography>
            <Typography variant="body1" component="div">
              Please click on the link received in your email we sent - check spam just in case.
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VerifyingFP;