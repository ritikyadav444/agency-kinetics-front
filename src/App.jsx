import React, { useEffect, useState, lazy, Suspense } from "react";
import Home from "./components/layout/Home";
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from "../src/Login/ProtectedRoute.jsx";
import LoginMembers from "./Login/LoginMembers.jsx";
import AppLayout from './AppLayout';
import { useDispatch, useSelector } from "react-redux";
import 'semantic-ui-css/semantic.min.css';
import { logoutMember } from "./actions/loginAction.jsx";
import { SET_AUTHENTICATION, SET_SIDEBAR_VISIBILITY } from "./constants/loginConstants.jsx";
import { fetchSubscriptionDetails } from "./actions/subscriptionAction.jsx";
import useSessionManager from "./actions/sessionManager.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/styles";
import { createTheme } from "@mui/material/styles";

const Service = lazy(() => import("./components/Service/Service"));
const ServiceDetails = lazy(() => import("./components/Service/ServiceDetails"));
const NewService = lazy(() => import("./components/Service/NewService"));
const UpdateService = lazy(() => import("./components/Service/UpdateService"));
const Invoices = lazy(() => import("./components/Invoices/Invoices"));
const Client = lazy(() => import("./components/Clients/Client"));
const Order = lazy(() => import("./components/Orders/Order"));
const Quotes = lazy(() => import("./components/Quote/Quotes"));
const QuoteDetails = lazy(() => import("./components/Quote/QuoteDetails"));
const InvoiceDetails = lazy(() => import("./components/Invoices/InvoiceDetails"));
const Ticket = lazy(() => import("./components/Tickets/Ticket"));
const TicketDetails = lazy(() => import("./components/Tickets/TicketDetails"));
const UserDetails = lazy(() => import("./components/User/UserDetails"));
const OrderDetails = lazy(() => import("./components/Orders/OrderDetails"));
const ClientDetails = lazy(() => import("./components/Clients/ClientDetails"));
const UpdateQuote = lazy(() => import("./components/Quote/UpdateQuote"));
const UpdateTicket = lazy(() => import("./components/Tickets/UpdateTicket"));
const UpdateOrder = lazy(() => import("./components/Orders/UpdateOrder"));
const UpdateInvoice = lazy(() => import("./components/Invoices/UpdateInvoice"));
const NewOrder = lazy(() => import("./components/Orders/NewOrder"));
const NewQuote = lazy(() => import("./components/Quote/NewQuote.jsx"));
const NewTicket = lazy(() => import("./components/Tickets/NewTicket.jsx"));
const NewUser = lazy(() => import("./components/User/NewUser.jsx"));
const Team = lazy(() => import("./components/Teams/Team.jsx"));
const UpdateTeam = lazy(() => import("./components/Teams/UpdateTeam.jsx"));
const NewTeam = lazy(() => import("./components/Teams/NewTeam.jsx"));
const NewClient = lazy(() => import("./components/Clients/NewClient.jsx"));
const ClientLogin = lazy(() => import("./components/Clients/ClientLogin.jsx"));
const UpdateClient = lazy(() => import("./components/Clients/UpdateClient.jsx"));
const NewInvoice = lazy(() => import("./components/Invoices/NewInvoice.jsx"));
const UserProfile = lazy(() => import("./components/User/UserProfile.jsx"));
const VerifyingPage = lazy(() => import("./components/User/VerifyingPage.jsx"));
const Tasks = lazy(() => import("./components/Tasks/Tasks.jsx"));
const Dashboard = lazy(() => import("./DashBoard/dashboard.jsx"));
const NewTask = lazy(() => import("./components/Tasks/NewTask.jsx"));
const UpdateTask = lazy(() => import("./components/Tasks/UpdateTask.jsx"));
const Teamcompletion = lazy(() => import("./components/Teams/TeamCompletion.jsx"));
const UpdatePassword = lazy(() => import("./Password/UpdatePassword.jsx"));
const ForgotPassword = lazy(() => import("./Password/ForgotPassword.jsx"));
const ForgotMailSent = lazy(() => import("./Password/ForgotMailSent.jsx"));
const ResetPassword = lazy(() => import("./Password/ResetPassword.jsx"));
const VerifyingFP = lazy(() => import("./Password/VerifyingFP.jsx"));
const ClientDashboard = lazy(() => import("./DashBoard/ClientDashboard.jsx"));
const TaskComment = lazy(() => import("./components/Tasks/TaskComment.jsx"));
const PaymentSuccess = lazy(() => import("./components/Payment/PaymentSuccess.jsx"));
const PaymentFailure = lazy(() => import("./components/Payment/PaymentFailure.jsx"));
const OnboardButton = lazy(() => import("./components/Payment/Onboard.jsx"));
const SubscriptionCheckout = lazy(() => import("./components/Payment/SubscriptionCheckout.jsx"));
const PaymentInvoices = lazy(() => import("./components/Payment/PaymentandInvoicesDetails.jsx"));

const theme = createTheme();

function App() {
  const showSidebar = useSelector((state) => state.logMember.showSidebar);
  const combined = useSelector((state) => state.logMember.combined);

  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch({ type: SET_SIDEBAR_VISIBILITY, payload: false });
    dispatch({ type: SET_AUTHENTICATION, payload: false });
    dispatch(logoutMember()).then(() => {
      window.location.href = '/login';
    });
  };

  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  useEffect(() => {
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
  }, [combined?.user?._id]);

  const isTrialExpired = subscriptionDetails?.subscription?.plans.length === 1 && subscriptionDetails?.subscription?.plans[0].status === "expire";
  const expiresAt = localStorage.getItem('expiresAt');
  const { showWarning, handleExtend, handleLogout: handleSessionLogout } = useSessionManager(expiresAt);

  const suspenseFallback = (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress style={{ color: "rgb(127, 86, 217)" }} />
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        {showSidebar === false || showSidebar === undefined ? (
          <Suspense fallback={suspenseFallback}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login/:workspace_name?" element={<LoginMembers />} />
            <Route path="/signup" element={<NewUser />} />
            <Route path="/verifyingPage" element={<VerifyingPage />} />
            <Route path="/combined/verifyTeam/:token?" element={<Teamcompletion />} />
            <Route path="/password/reset/:resetToken" element={<ResetPassword />} />
            <Route path="/password/forgot" element={<ForgotPassword />} />
            <Route path="/forgotMailSent" element={<ForgotMailSent />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
          </Suspense>
        ) : (
          <AppLayout>
            <Routes>
              {isTrialExpired ? (
                <>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/subscription-plans" element={<SubscriptionCheckout />} />
                    <Route path="/profile" element={<UserProfile />} />
                  </Route>
                  <Route path="*" element={<SubscriptionCheckout />} />
                </>
              ) : (
                <>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/password/update" element={<UpdatePassword />} />
                    <Route path="/login" element={<Navigate replace to="/dashboard" />} />
                    <Route path="/dashboard" element={
                      combined.user.role === 'CLIENT' ? (
                        <ClientDashboard />
                      ) : combined.user.role === 'SUPERADMIN' || combined.user.role === 'ADMIN' ? (
                        <Dashboard />
                      ) : null
                    } />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoice/:id" element={<InvoiceDetails />} />
                    <Route path="/invoice/update/:id" element={<UpdateInvoice />} />
                    <Route path="/new/invoice" element={<NewInvoice />} />
                    <Route path="/clients" element={<Client />} />
                    <Route path="/client/:id" element={<ClientDetails />} />
                    <Route path="/combined/newClient" element={<NewClient />} />
                    <Route path="/client/update/:id" element={<UpdateClient />} />
                    <Route path="/orders" element={<Order />} />
                    <Route path="/order/:id" element={<OrderDetails />} />
                    <Route path="/order/update/:id" element={<UpdateOrder />} />
                    <Route path="/new/order" element={<NewOrder />} />
                    <Route path="/task/order/:id" element={<Tasks />} />
                    <Route path="/task/new" element={<NewTask />} />
                    <Route path="/task/:id" element={<TaskComment />} />
                    <Route path="/task/update/:id" element={<UpdateTask />} />
                    <Route path="/quotes" element={<Quotes />} />
                    <Route path="/quote/:id" element={<QuoteDetails />} />
                    <Route path="/quote/update/:id" element={<UpdateQuote />} />
                    <Route path="/new/quote" element={<NewQuote />} />
                    <Route path="/tickets" element={<Ticket />} />
                    <Route path="/ticket/:id" element={<TicketDetails />} />
                    <Route path="/ticket/update/:id" element={<UpdateTicket />} />
                    <Route path="/new/ticket" element={<NewTicket />} />
                    <Route path="/services" element={<Service />} />
                    <Route path="/service/:id" element={<ServiceDetails />} />
                    <Route path="/new/service" element={<NewService />} />
                    <Route path="/service/update/:id" element={<UpdateService />} />
                    <Route path="/teams" element={<Team />} />
                    <Route path="/combined/newTeam" element={<NewTeam />} />
                    <Route path="/team/update/:id" element={<UpdateTeam />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/subscription-plans" element={<SubscriptionCheckout />} />
                    <Route path="/success" element={<PaymentSuccess />} />
                    <Route path="/cancel" element={<PaymentFailure />} />
                    <Route path="/onboard" element={<OnboardButton />} />
                    <Route path="/payments-and-invoices-details" element={<PaymentInvoices />} />
                  </Route>
                  <Route element={<ProtectedRoute isAdmin />}>
                    <Route path="/user/:id" element={<UserDetails />} />
                  </Route>
                  <Route path="/login/client" element={<ClientLogin />} />
                </>
              )}
            </Routes>
          </AppLayout>
        )}
      </Router>

      <Dialog open={showWarning} disableEscapeKeyDown>
        <DialogTitle>Session Expiring Soon</DialogTitle>
        <DialogContent>
          Your session is about to expire. Do you want to stay logged in?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSessionLogout} color="error">
            Log Out
          </Button>
          <Button onClick={handleExtend} variant="contained" style={{ backgroundColor: "rgb(127, 86, 217)" }}>
            Stay Logged In
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
