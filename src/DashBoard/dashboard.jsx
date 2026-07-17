import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Grid, Container, Card, CardContent, Typography, Icon, FormControl, Select, MenuItem, SvgIcon, Avatar } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import { CardHeader, Table, TableCell, TableContainer, TableRow, TableBody, TableHead, CircularProgress } from '@mui/material';
import {
  Inbox as InboxIcon,
} from "@mui/icons-material";
import empty from '../Images/empty-folder.png';
import OrdersBarChart from './OrderBarChart';
import RevenueChart from './RevenueChart';
import { getOrders } from '../actions/orderAction';
import { getInvoice } from '../actions/invoiceAction';
import { getClient } from '../actions/clientAction';
import { getTickets } from '../actions/ticketAction';
import { getQuote } from '../actions/quoteAction';
import { baseURL, getConfig } from '../http';
import axios from 'axios';

const Dashboard = () => {

  const dispatch = useDispatch()
  const {combined: clients} = useSelector((state)=>state.clients);
  const { orders } = useSelector((state) => state.orders);
  const {invoices} = useSelector((state)=>state.invoices)
  const {tickets} = useSelector((state)=>state.tickets)
  const {quotes} = useSelector((state)=>state.quotes)
  // useEffect(() => {
  //   if (orders && orders.length > 0) {
  //     orders.forEach(order => {
  //       dispatch(getTasks(order._id));
  //     });
  //   }
  // }, [orders, dispatch]);

  // const {loading:loader, combined:teams} = useSelector((state)=>state.teams)

  // const verifiedTeams = teams.filter(team => team.verified)
  // console.log(verifiedTeams, teams)

  const [teams, setTeams] = useState([]);
  const [loader, setLoading] = useState(true);

  useEffect(() => {
      const fetchTeams = async () => {

          try {
              const config = getConfig();
              const { data } = await axios.get(`${baseURL}/api/v1/getAllExceptClientForDashboard`, config);
              // console.log(data)
              if (data.success) {
                  setTeams(data.combined);
              } else {
                  console.error('Failed to fetch teams:', data.message);
              }
          } catch (error) {
              console.error('Error fetching teams:', error.message);
          } finally {
              setLoading(false);
          }
      };

      fetchTeams();
  }, []);

  useEffect(() => {
    dispatch(getOrders());
    dispatch(getInvoice());
    dispatch(getClient());
    dispatch(getTickets());
    dispatch(getQuote());
  }, [dispatch]);

  const [chartType, setChartType] = useState('Orders');

  const handleChange = (event) => {
    setChartType(event.target.value);
  };

  const [clickedGrid, setClickedGrid] = useState('Revenue');
  const handleGridClick = (gridName) => {
    setClickedGrid(gridName);
    // console.log(`${gridName} clicked`);
  };

  // console.log("after login",error, loading, isAuthenticated, combined)
  // console.log(clients.length, services.length, orders.length, invoices.length, tickets.length)
  

  const orderStatusCounts = {
    Ongoing: orders.filter(order => order.status === 'Ongoing').length,
    Review: orders.filter(order => order.status === 'Review').length,
    Cancelled: orders.filter(order => order.status === 'Cancelled').length,
    Completed: orders.filter(order => order.status === 'Completed').length
  };
  const invoiceStatusCountsPie = {
    Open: invoices.filter(invoice => invoice.status === 'Open').length,
    Draft: invoices.filter(invoice => invoice.status === 'Draft').length,
    Paid: invoices.filter(invoice => invoice.status === 'Paid').length,
    Void: invoices.filter(invoice => invoice.status === 'Void').length,
    Uncollectable: invoices.filter(invoice => invoice.status === 'Uncollectable').length
  };

  const proposalStatusCounts = {
    Accepted: quotes.filter(proposal => proposal.selected === 'Accepted').length,
    Pending: quotes.filter(proposal => proposal.selected === 'Pending').length,
    Rejected: quotes.filter(proposal => proposal.selected === 'Rejected').length
  };

  const ticketStatusCounts = {
    Open: tickets.filter(ticket => ticket.status === 'Open').length,
    Hold: tickets.filter(ticket => ticket.status === 'Hold').length,
    Close: tickets.filter(ticket => ticket.status === 'Close').length
  };

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
      default:
        return role;
    }
  };
  
  

  //---------------------------------Revenue Line Chart----------------------------
  const monthlyOrders = orders.reduce((acc, order) => {
    const month = new Date(order.kick_off_date).toLocaleString('default', { month: 'long' }); // Get short month name (e.g., Jan, Feb)
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(1); // Assuming you want to count the number of orders per month
    return acc;
  }, {});
  
  const months = Object.keys(monthlyOrders);

  // Sort months month-wise
  const sortedMonths = months.sort((a, b) => {
    const monthsOrder = {
      "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
      "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
    };
    return monthsOrder[a] - monthsOrder[b];
  });

  // Calculate total value month-wise
  const chartData = sortedMonths.map((month) => {
  let totalValue = 0;

  orders.forEach((order) => {
    const orderMonth = new Date(order.kick_off_date).toLocaleString('default', { month: 'long' });
    if (orderMonth === month) {
      const quantity = order.quantity || 0;
      const budget = order.budget || 0;
      totalValue += quantity * budget;
      
    }
  });

  return {
    x: month,
    y: totalValue,
  };
});
  const revenue = chartData.reduce((total, data) => total + data.y, 0);

  //--------------------------------------------------------------------------------------

  //-----------------------------Client UI-----------------------
  const getClientData = (clientId) => {
    const clientOrders = orders.filter(order => order.clientId === clientId);
    const clientInvoices = invoices.filter(invoice => invoice.client_name === clientId);
    const clientTickets = tickets.filter(ticket => ticket.client_name === clientId);
    return { clientOrders, clientInvoices, clientTickets };
  };

  
  
  return (
    <div>
      {/* {loader ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
         ) : ( */}

          <Container maxWidth={false} style={{ marginTop: '20px', paddingLeft: '24px', paddingRight: '24px' }}>
            <Grid container spacing={2}>
              {/* First row */}
              <Grid item xs={3} style={{ maxHeight: '100px' }}>
          <Card style={{ borderRadius: '10px', height: '100%', backgroundColor: clickedGrid === 'Orders' ? 'rgb(127, 86, 217)' : 'rgb(245, 245, 245)' }} onClick={() => handleGridClick('Orders')}>
            <CardHeader style={{ paddingTop: '6px', paddingLeft: '6px' }} title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon style={{ color: clickedGrid === 'Orders' ? 'white' : 'inherit' }}>
                  <InboxIcon />
                </Icon>
                <Typography variant="h6" component="h4" style={{ marginLeft: '10px', color: clickedGrid === 'Orders' ? 'white' : 'inherit' }}>Orders</Typography>
              </div>
            } />
            <CardContent style={{ display: 'flex', alignItems: 'center', paddingTop: '6px', paddingLeft: '6px' }}>
              <Typography variant="body1" component="p" style={{ marginLeft: '10px', color: clickedGrid === 'Orders' ? 'white' : 'inherit' }}>{orders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={3} style={{ maxHeight: '100px' }}>
          <Card style={{ borderRadius: '10px', height: '100%', backgroundColor: clickedGrid === 'Revenue' ? 'rgb(127, 86, 217)' : 'rgb(245, 245, 245)' }} onClick={() => handleGridClick('Revenue')}>
            <CardHeader style={{ paddingTop: '6px', paddingLeft: '6px' }} title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SvgIcon style={{ color: clickedGrid === 'Revenue' ? 'white' : 'inherit' }} width="20" height="27" viewBox="0 0 20 27">
                <path d="M10 27C14.97 27 20 25.1451 20 21.6V5.4C20 1.8549 14.97 0 10 0C5.03 0 0 1.8549 0 5.4V21.6C0 25.1451 5.03 27 10 27ZM10 24.3C5.3475 24.3 2.5 22.5518 2.5 21.6V19.8882C4.42625 21.0195 7.22125 21.6 10 21.6C12.7788 21.6 15.5737 21.0195 17.5 19.8882V21.6C17.5 22.5518 14.6525 24.3 10 24.3ZM10 2.7C14.6525 2.7 17.5 4.44825 17.5 5.4C17.5 6.35175 14.6525 8.1 10 8.1C5.3475 8.1 2.5 6.35175 2.5 5.4C2.5 4.44825 5.3475 2.7 10 2.7ZM2.5 9.0882C4.42625 10.2195 7.22125 10.8 10 10.8C12.7788 10.8 15.5737 10.2195 17.5 9.0882V10.8C17.5 11.7517 14.6525 13.5 10 13.5C5.3475 13.5 2.5 11.7517 2.5 10.8V9.0882ZM2.5 14.4882C4.42625 15.6195 7.22125 16.2 10 16.2C12.7788 16.2 15.5737 15.6195 17.5 14.4882V16.2C17.5 17.1518 14.6525 18.9 10 18.9C5.3475 18.9 2.5 17.1518 2.5 16.2V14.4882Z"/>
                </SvgIcon>
                <Typography variant="h6" component="h4" style={{ marginLeft: '10px', color: clickedGrid === 'Revenue' ? 'white' : 'inherit' }}>Revenue</Typography>
              </div>
            } />
            <CardContent style={{ display: 'flex', alignItems: 'center', paddingTop: '6px', paddingLeft: '6px' }}>
              <Typography variant="body1" component="p" style={{ marginLeft: '10px', color: clickedGrid === 'Revenue' ? 'white' : 'inherit' }}>{revenue}</Typography>
            </CardContent>
          </Card>
        </Grid>


        <Grid item xs={3} style={{ maxHeight: '100px' }}>
          <Card style={{ borderRadius: '10px', height: '100%', backgroundColor: clickedGrid === 'Clients' ? 'rgb(127, 86, 217)' : 'rgb(245, 245, 245)' }} onClick={() => handleGridClick('Clients')}>
            <CardHeader style={{ paddingTop: '6px', paddingLeft: '6px' }} title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SvgIcon style={{ color: clickedGrid === 'Clients' ? 'white' : 'inherit' }} width="1em" height="1em" viewBox="0 0 28 28">
                  <path d="M15.114 25.719A7.48 7.48 0 0 1 13 20.5c0-1.688.558-3.247 1.5-4.5H5a3 3 0 0 0-3 3v.715C2 23.433 6.21 26 12 26a17 17 0 0 0 3.114-.281M18 8A6 6 0 1 0 6 8a6 6 0 0 0 12 0m2.5 19a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13m0-11a.5.5 0 0 1 .5.5V20h3.5a.5.5 0 0 1 0 1H21v3.5a.5.5 0 0 1-1 0V21h-3.5a.5.5 0 0 1 0-1H20v-3.5a.5.5 0 0 1 .5-.5"></path>
                </SvgIcon>
                <Typography variant="h6" component="h4" style={{ marginLeft: '10px', color: clickedGrid === 'Clients' ? 'white' : 'inherit' }}>Clients</Typography>
              </div>
            } />
            <CardContent style={{ display: 'flex', alignItems: 'center', paddingTop: '6px', paddingLeft: '6px' }}>
              <Typography variant="body1" component="p" style={{ marginLeft: '10px', color: clickedGrid === 'Clients' ? 'white' : 'inherit' }}>{clients.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

              <Grid item xs={3} style={{ maxHeight: '100px' }}>
              {/* Grid 4 with Card component */}
              <Card style={{ borderRadius: '10px', height: '275%', backgroundColor: 'rgb(245, 245, 245)' }}>
                <CardHeader
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <SvgIcon viewBox="0 0 20 20" width="20" height="20" >
              <path d="M12.5 4.5C12.5 5.16304 12.2366 5.79893 11.7678 6.26777C11.2989 6.73661 10.663 7 10 7C9.33696 7 8.70107 6.73661 8.23223 6.26777C7.76339 5.79893 7.5 5.16304 7.5 4.5C7.5 3.83696 7.76339 3.20107 8.23223 2.73223C8.70107 2.26339 9.33696 2 10 2C10.663 2 11.2989 2.26339 11.7678 2.73223C12.2366 3.20107 12.5 3.83696 12.5 4.5ZM17.5 5C17.5 5.53043 17.2893 6.03914 16.9142 6.41421C16.5391 6.78929 16.0304 7 15.5 7C14.9696 7 14.4609 6.78929 14.0858 6.41421C13.7107 6.03914 13.5 5.53043 13.5 5C13.5 4.46957 13.7107 3.96086 14.0858 3.58579C14.4609 3.21071 14.9696 3 15.5 3C16.0304 3 16.5391 3.21071 16.9142 3.58579C17.2893 3.96086 17.5 4.46957 17.5 5ZM4.5 7C5.03043 7 5.53914 6.78929 5.91421 6.41421C6.28929 6.03914 6.5 5.53043 6.5 5C6.5 4.46957 6.28929 3.96086 5.91421 3.58579C5.53914 3.21071 5.03043 3 4.5 3C3.96957 3 3.46086 3.21071 3.08579 3.58579C2.71071 3.96086 2.5 4.46957 2.5 5C2.5 5.53043 2.71071 6.03914 3.08579 6.41421C3.46086 6.78929 3.96957 7 4.5 7ZM6 9.25C6 8.56 6.56 8 7.25 8H12.75C13.44 8 14 8.56 14 9.25V14C14 15.0609 13.5786 16.0783 12.8284 16.8284C12.0783 17.5786 11.0609 18 10 18C8.93913 18 7.92172 17.5786 7.17157 16.8284C6.42143 16.0783 6 15.0609 6 14V9.25ZM5 9.25C5 8.787 5.14 8.358 5.379 8H3.25C2.56 8 2 8.56 2 9.25V13C1.99995 13.4281 2.09154 13.8513 2.2686 14.2411C2.44566 14.6309 2.7041 14.9782 3.02655 15.2599C3.34901 15.5415 3.728 15.7508 4.13807 15.8738C4.54813 15.9968 4.97978 16.0307 5.404 15.973C5.13691 15.3495 4.99945 14.6783 5 14V9.25ZM15 14C15 14.7 14.856 15.368 14.596 15.973C14.728 15.991 14.8627 16 15 16C15.7956 16 16.5587 15.6839 17.1213 15.1213C17.6839 14.5587 18 13.7956 18 13V9.25C18 8.56 17.44 8 16.75 8H14.621C14.861 8.358 15 8.787 15 9.25V14Z" />
            </SvgIcon>
                      <Typography variant="h6" component="h4" style={{ marginLeft: '10px' }}>Team Members</Typography>
                    </div>
                  }
                />
                  <CardContent style={{ display: 'flex', flexDirection: 'column', maxHeight: '80%', overflow: 'auto', zIndex: '1', position: 'relative' }}>
                      {/* Display team members */}
                      {loader ? (
                        <Container style={{ textAlign: 'center', marginTop: '50px' }}>
                            <CircularProgress />
                          </Container>
                        ) : (
                      
                      teams.length === 0 ? (
                        <Container style={{ textAlign: 'center' }}>
                          <img
                            src={empty}
                            alt="Empty Folder"
                            style={{ width: "75px", height: "75px", marginBottom: "10px" }}
                          />
                          <Typography variant="h5">No Members</Typography>
                        </Container>
                      ) : (
                      teams
                        .sort((a, b) => formatRole(b.role) === "Super Admin" ? 1 : -1)
                        .map((team, index) => (
                          <div key={index} style={{ borderRadius: '20px', marginBottom: '8px', padding: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {typeof team.profile_img === 'string' && team.profile_img ? (
                                <Avatar alt={`${team.fname} ${team.lname}`} src={team.profile_img} style={{ width: '30px', height: '30px' }} />
                              ) : (
                                <Avatar alt="User Avatar" src='' style={{ width: '30px', height: '30px' }} />
                              )}
                              <div style={{ flexGrow: 1, overflowX: 'hidden' }}>
                                <Typography variant="body1" component="p" style={{ marginRight: '8px', marginLeft: '8px', overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {`${team.fname} ${team.lname}`}
                                </Typography>
                              </div>
                              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'right', marginTop: '2px' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                  <div style={{
                                    backgroundColor: formatRole(team.role) === "Super Admin" ? "#E6F9E6" :
                                      formatRole(team.role) === "Admin" ? "#E1F0FF" :
                                      formatRole(team.role) === "Project Manager" ? "#FFF7E1" :
                                      formatRole(team.role) === "Assignee" ? "#FFEBEE" :
                                      "#000000",
                                    color: formatRole(team.role) === "Super Admin" ? "#2E7D32" :
                                      formatRole(team.role) === "Admin" ? "#01579B" :
                                      formatRole(team.role) === "Project Manager" ? "#FFA500" :
                                      formatRole(team.role) === "Assignee" ? "#D81B60" :
                                      "#ffffff",
                                    borderRadius: '12px',
                                    padding: '3px 10px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: '0.78rem',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {formatRole(team.role)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                        )
                      )}
                    </CardContent>



              </Card>
            </Grid>


              {/* Second row */}

              <Grid item xs={9}>
              {clickedGrid === 'Revenue' && (
                <RevenueChart orders={orders}/>
                )}

              {clickedGrid === 'Orders' && (
                <OrdersBarChart orders={orders} />
                )}

                {clickedGrid === 'Clients' && (
                  <Card style={{ height: '486px', borderRadius: '10px', padding: '10px', overflowY: 'auto', backgroundColor: 'rgb(245, 245, 245)' }}>
                    <CardHeader title="Clients" />
                    <CardContent>
                      {clients.length === 0 ? (
                        <Container style={{ marginTop: "75px", textAlign: "center" }}>
                        <div
                          style={{
                            width: "75px",
                            height: "75px",
                            borderRadius: "50%",
                            backgroundColor: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px auto",   
                          }}
                        >
                          <SvgIcon width="1em" height="1em" viewBox="0 0 28 28" style={{ fontSize: "40px", color: "#B0BEC5" }}>
                            <path d="M15.114 25.719A7.48 7.48 0 0 1 13 20.5c0-1.688.558-3.247 1.5-4.5H5a3 3 0 0 0-3 3v.715C2 23.433 6.21 26 12 26a17 17 0 0 0 3.114-.281M18 8A6 6 0 1 0 6 8a6 6 0 0 0 12 0m2.5 19a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13m0-11a.5.5 0 0 1 .5.5V20h3.5a.5.5 0 0 1 0 1H21v3.5a.5.5 0 0 1-1 0V21h-3.5a.5.5 0 0 1 0-1H20v-3.5a.5.5 0 0 1 .5-.5"></path>
                          </SvgIcon>
                        </div>
                        <Typography variant="h5" style={{ marginBottom: "10px" }}>
                          No clients yet
                        </Typography>
                        <Typography variant="body1" style={{ marginBottom: "20px", color: "#607D8B" }}>
                          Add your first client to start managing customer relationships
                        </Typography>
                      </Container>
                      ) : (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell style={{ fontWeight: 'bold' }}>Clients</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Orders</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Invoices</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Tickets</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {clients.map(client => (
                                <TableRow key={client._id}>
                                  <TableCell>{`${client.fname} ${client.lname}`}</TableCell>
                                  <TableCell>
                                    {getClientData(client._id).clientOrders.length > 0
                                      ? getClientData(client._id).clientOrders.map(order => order.orderId).join(', ')
                                      : 'None'}
                                  </TableCell>
                                  <TableCell>
                                    {getClientData(client._id).clientInvoices.length > 0
                                      ? getClientData(client._id).clientInvoices.map(invoice => invoice.invoiceId).join(', ')
                                      : 'None'}
                                  </TableCell>
                                  <TableCell>
                                    {getClientData(client._id).clientTickets.length > 0
                                      ? getClientData(client._id).clientTickets.map(ticket => ticket._id.slice(-4)).join(', ')
                                      : 'None'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                )}

              </Grid>


              <Grid item xs={3}>
                  <Card style={{ borderRadius: '10px', height: '70%', marginTop:'145px', backgroundColor: 'rgb(245, 245, 245)' }}>
                    <CardHeader
                      title={chartType}
                      action={
                        <FormControl style={{ minWidth: '120px', textAlign:'center' }}>
                          <Select
                            labelId="chart-type-label"
                            id="chart-type"
                            value={chartType}
                            onChange={handleChange}
                          >
                            <MenuItem value="Orders">Orders</MenuItem>
                            <MenuItem value="Proposals">Proposals</MenuItem>
                            <MenuItem value="Invoices">Invoices</MenuItem>
                            <MenuItem value="Tickets">Tickets</MenuItem>
                          </Select>
                        </FormControl>
                      }
                    />
                    <CardContent style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      {chartType === 'Orders' && (
                        orders.length === 0 ? (
                          <Container style={{ marginTop: "50px", textAlign: "center" }}>
                            <div
                              style={{
                                width: "75px",
                                height: "75px",
                                borderRadius: "50%",
                                backgroundColor: "#f5f5f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 0 auto",
                              }}
                            >
                              <InboxIcon style={{ fontSize: "50px", color: "#B0BEC5" }} />
                            </div>
                            <Typography variant="h5" style={{ marginBottom: "10px" }}>
                              No orders yet
                            </Typography>
                      </Container>
                        ) : (
                          <PieChart
                            colors={['#1E90FF', '#FFBF00' , '#FF6347' , '#228B22' ]} 
                            series={[{ data: Object.entries(orderStatusCounts).map(([status, count]) => ({ label: status, value: count })) }]}
                            width={400}
                            height={200}
                          />
                        )
                      )}
                      {chartType === 'Proposals' && (
                        quotes.length === 0 ? (
                          <Container style={{ marginTop: "50px", textAlign: "center" }}>
                            <div
                                    style={{
                                      width: "75px",
                                      height: "75px",
                                      borderRadius: "50%",
                                      backgroundColor: "#f5f5f5",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      margin: "0 auto 0 auto",
                                    }}
                                  >

                            <SvgIcon width="40px" height="40px" viewBox="0 0 24 24" style={{ color: "#B0BEC5", fontSize:'40px' }}>
                                <g fill="none"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M17 3a3 3 0 0 1 2.995 2.824L20 6v4.35l.594-.264c.614-.273 1.322.15 1.4.798L22 11v8a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19v-8c0-.672.675-1.147 1.297-.955l.11.041l.593.264V6a3 3 0 0 1 2.824-2.995L7 3zm0 2H7a1 1 0 0 0-1 1v5.239l6 2.667l6-2.667V6a1 1 0 0 0-1-1m-5 3a1 1 0 0 1 .117 1.993L12 10h-2a1 1 0 0 1-.117-1.993L10 8z"></path></g>
                            </SvgIcon>
                                  </div>
                            
                            <Typography variant="h5">No proposals created</Typography>
                 
                        </Container>
                        ) : (
                          <PieChart
                            colors={['#32CD32', '#FFA500' , '#FF4500' ]} 
                            series={[{ data: Object.entries(proposalStatusCounts).map(([status, count]) => ({ label: status, value: count })) }]}
                            width={400}
                            height={200}
                          />
                        )
                      )}
                      {chartType === 'Invoices' && (
                        invoices.length === 0 ? (
                          <Container style={{ marginTop: "50px", textAlign: "center" }}>
                            <div
                              style={{
                                width: "75px",
                                height: "75px",
                                borderRadius: "50%",
                                backgroundColor: "#f5f5f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 0 auto",
                              }}
                            >
                              <SvgIcon width="40px" height="40px" viewBox="0 0 384 512" style={{ color: "#B0BEC5", fontSize:'40px' }}>
                                <g clipPath="url(#clip0_699_6)">
                                  <path d="M377 105L279.1 7C274.6 2.5 268.5 0 262.1 0H256V128H384V121.9C384 115.6 381.5 109.5 377 105ZM224 136V0H24C10.7 0 0 10.7 0 24V488C0 501.3 10.7 512 24 512H360C373.3 512 384 501.3 384 488V160H248C234.8 160 224 149.2 224 136ZM64 72C64 67.58 67.58 64 72 64H152C156.42 64 160 67.58 160 72V88C160 92.42 156.42 96 152 96H72C67.58 96 64 92.42 64 88V72ZM64 152V136C64 131.58 67.58 128 72 128H152C156.42 128 160 131.58 160 136V152C160 156.42 156.42 160 152 160H72C67.58 160 64 156.42 64 152ZM208 415.88V440C208 444.42 204.42 448 200 448H184C179.58 448 176 444.42 176 440V415.71C164.71 415.13 153.73 411.19 144.63 404.36C140.73 401.43 140.53 395.59 144.06 392.22L155.81 381.01C158.58 378.37 162.7 378.25 165.94 380.28C169.81 382.7 174.2 384 178.76 384H206.87C213.37 384 218.67 378.08 218.67 370.81C218.67 364.86 215.06 359.62 209.9 358.08L164.9 344.58C146.31 339 133.32 321.16 133.32 301.19C133.32 276.67 152.37 256.75 175.99 256.12V232C175.99 227.58 179.57 224 183.99 224H199.99C204.41 224 207.99 227.58 207.99 232V256.29C219.28 256.87 230.26 260.8 239.36 267.64C243.26 270.57 243.46 276.41 239.93 279.78L228.18 290.99C225.41 293.63 221.29 293.75 218.05 291.72C214.18 289.29 209.79 288 205.23 288H177.12C170.62 288 165.32 293.92 165.32 301.19C165.32 307.14 168.93 312.38 174.09 313.92L219.09 327.42C237.68 333 250.67 350.84 250.67 370.81C250.67 395.34 231.62 415.25 208 415.88Z" />
                                </g>
                                <defs>
                                  <clipPath id="clip0_699_6">
                                    <rect width="384" height="512" fill="white" />
                                  </clipPath>
                                </defs>
                              </SvgIcon>
                            </div>
                            <Typography variant="h5" style={{ marginBottom: "10px" }}>
                            No invoices generated
                          </Typography>
                    
                        </Container>
                        ) : (
                          <PieChart 
                              colors={['#1976D2', '#FBC02D', '#388E3C' , '#616161', '#E64A19 ' ]} 
                              series={[{ data: Object.entries(invoiceStatusCountsPie).map(([status, count]) => ({ label: status, value: count })), 
                            }]}
                              width={400}
                              height={200}
                          />
                        )
                      )}
                      {chartType === 'Tickets' && (
                        tickets.length === 0 ? (
                          <Container style={{ marginTop: "50px", textAlign: "center" }}>
                            <div
                                style={{
                                  width: "75px",
                                  height: "75px",
                                  borderRadius: "50%",
                                  backgroundColor: "#f5f5f5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 0 auto",
                                }}
                              >

                              <SvgIcon width="1em" height="1em" viewBox="0 0 256 256" style={{ color: "#B0BEC5", fontSize:'40px' }}>
                                <path d="M240 52H16A12 12 0 0 0 4 64v128a12 12 0 0 0 12 12h224a12 12 0 0 0 12-12V64a12 12 0 0 0-12-12m-58.79 128H74.79A60.18 60.18 0 0 0 28 133.21v-10.42A60.18 60.18 0 0 0 74.79 76h106.42A60.18 60.18 0 0 0 228 122.79v10.42A60.18 60.18 0 0 0 181.21 180M228 97.94A36.23 36.23 0 0 1 206.06 76H228ZM49.94 76A36.23 36.23 0 0 1 28 97.94V76ZM28 158.06A36.23 36.23 0 0 1 49.94 180H28ZM206.06 180A36.23 36.23 0 0 1 228 158.06V180ZM128 88a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 56a16 16 0 1 1 16-16a16 16 0 0 1-16 16"/>
                              </SvgIcon>
                            </div>
                            
                            <Typography variant="h5">
                              No support tickets
                            </Typography>
                          </Container>
                        ) : (
                          <PieChart
                            colors={['#ff0000', '#ff9800', '#4caf50']}
                            series={[{ data: Object.entries(ticketStatusCounts).map(([status, count]) => ({ label: status, value: count })) }]}
                            width={400}
                            height={200}
                          />
                        )
                      )}
                    </CardContent>
                  </Card>
                </Grid>




            </Grid>
          </Container>
         {/* )
      } */}

    
    </div>
  );
};

export default Dashboard;