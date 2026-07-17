
import { styled } from '@mui/material/styles';
import { Container, Typography, Grid } from '@mui/material';
import AgencyKineticsLogo from '../../Images/agencyKinetics.jpg'; // Import your logo image here

const ContainerStyled = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
}));

const Logo = styled('img')(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100px',
}));

const Message = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));


const VerifyingPage = () => {
  return (
    <ContainerStyled>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <div style={{textAlign:'center'}}>
            <Logo src={AgencyKineticsLogo} alt="AgencyKinetics Logo" />
            <Message variant="h5">AgencyKinetics welcomes you!</Message>
            <Typography variant="body1">
              Please verify using the email we sent - check spam just in case.
            </Typography>
          </div>
        </Grid>
      </Grid>
    </ContainerStyled>
  );
};

export default VerifyingPage;
