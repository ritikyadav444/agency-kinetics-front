import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Grid, Container, Card, CardContent, Typography, Icon, FormControl, Select, MenuItem, ListItem, ListItemText, List, SvgIcon } from '@mui/material';
import { PieChart, BarChart } from '@mui/x-charts';
import { CardHeader } from '@mui/material';
import {
  Inbox as InboxIcon,
} from "@mui/icons-material";
import empty from '../Images/empty-folder.png'
import { getQuote } from '../actions/quoteAction';
import { getInvoice } from '../actions/invoiceAction';
import { getOrders } from '../actions/orderAction';
import { getTickets } from '../actions/ticketAction';
import ListIcon from '@mui/icons-material/List';
import { baseURL } from '../http';
import OrdersBarChart from './OrderBarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';

const ClientDashboard = () => {

  const dispatch = useDispatch()
  const { orders } = useSelector((state) => state.orders);
  const {invoices} = useSelector((state)=>state.invoices)
  const {quotes} = useSelector((state)=>state.quotes)
  // console.log(orders)
  
  
  const {tickets} = useSelector((state)=>state.tickets)
  

  const combined = useSelector((state) => state.logMember.combined);

  const [assignedToNamesMap, setassignedToNamesMap] = useState({});

  // var finalorders = orders.filter(order => order.clientId === combined.user._id);
  var finalquotes = quotes.filter(quote => quote.clientId === combined.user._id);
  var finalinvoices = invoices.filter(invoice => invoice.client_name === combined.user._id);
  var finaltickets = tickets.filter(ticket => ticket.client_name === combined.user._id)
  

  useEffect(() => {
    dispatch(getOrders());
    dispatch(getQuote());
    dispatch(getInvoice());
    dispatch(getTickets());
  }, [dispatch]);

  const [finalTasks, setFinalTasks] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTasksForAClient = async () => {
      try {
        const userId = combined.user._id
        const response = await fetch(`${baseURL}/api/v1/client/${userId}/tasks`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks for client: ${response.status}`);
        }
        const data = await response.json();
        // console.log(data)
        setFinalTasks(data.tasks)
        // console.log('foft', finalTasks)
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Failed to fetch tasks for client:', error.message);
      }
    };

    fetchTasksForAClient();
    return () => controller.abort();
  }, []);


  // // Memoize final orders to avoid unnecessary recalculations
  const finalorders = useMemo(() => {
    return orders.filter(order => order.clientId === combined?.user?._id);
  }, [orders, combined?.user?._id]);

  // useEffect(() => {
  //   // Only fetch tasks if finalorders changes and tasks haven't already been fetched
  //   if (!finalorders || finalorders.length === 0 || finalTasks.length > 0) return;
  
  //   const fetchTasksForOrders = async () => {
  //     let tasksAccumulator = []; // Temporary accumulator for tasks
  
  //     // Loop through the orders and fetch tasks
  //     for (const order of finalorders) {
  //       try {
  //         const result = await dispatch(getTasks(order._id));
  //         console.log(result);
  
  //         // If tasks exist, accumulate them
  //         if (result?.tasks) {
  //           console.log('In here', result.tasks);
  //           tasksAccumulator = [...tasksAccumulator, ...result.tasks];
  //         }
  //       } catch (err) {
  //         console.error(`Error fetching tasks for order ${order._id}:`, err);
  //       }
  //     }
  
  //     console.log(tasksAccumulator);
  //     setFinalTasks(tasksAccumulator);  // Set the tasks once fetched
  //   };
  
  //   fetchTasksForOrders(); // Trigger the fetching process
  
  // }, [finalorders, dispatch, finalTasks.length]); 
  // console.log('foft', finalorders, finalTasks);




  const [chartType, setChartType] = useState('Orders');

  const handleChange = (event) => {
    setChartType(event.target.value);
  };

  const [clickedGrid, setClickedGrid] = useState('Orders');
  const handleGridClick = (gridName) => {
    setClickedGrid(gridName);
    // console.log(`${gridName} clicked`);
  };

  const [clickedGridTask, setClickedGridTask] = useState('Tasks');
  const handleGridClickTask = (gridNameTask) => {
    setClickedGridTask(gridNameTask);
    // console.log(`${gridNameTask} clicked1`);
  };

  // console.log("after login",error, loading, isAuthenticated, combined)
  

  const orderStatusCounts = {
    Ongoing: finalorders.filter(order => order.status === 'Ongoing').length,
    Review: finalorders.filter(order => order.status === 'Review').length,
    Cancelled: finalorders.filter(order => order.status === 'Cancelled').length,
    Completed: finalorders.filter(order => order.status === 'Completed').length
  };

  const invoiceStatusCountsPie = {
    Open: finalinvoices.filter(invoice => invoice.status === 'Open').length,
    Draft: finalinvoices.filter(invoice => invoice.status === 'Draft').length,
    Paid: finalinvoices.filter(invoice => invoice.status === 'Paid').length,
    Void: finalinvoices.filter(invoice => invoice.status === 'Void').length,
    Uncollectable: finalinvoices.filter(invoice => invoice.status === 'Uncollectable').length
  };

  const proposalStatusCounts = {
    Accepted: finalquotes.filter(proposal => proposal.selected === 'Accepted').length,
    Pending: finalquotes.filter(proposal => proposal.selected === 'Pending').length,
    Rejected: finalquotes.filter(proposal => proposal.selected === 'Rejected').length
  };

  const ticketStatusCounts = {
    Open: finaltickets.filter(ticket => ticket.status === 'Open').length,
    Hold: finaltickets.filter(ticket => ticket.status === 'Hold').length,
    Close: finaltickets.filter(ticket => ticket.status === 'Close').length
  };
  // console.log(ticketStatusCounts)

  const formatRole = (role) => {
    switch (role) {
      case 'ASSIGNEE':
        return 'Assignee';
      case 'PROJECTMANAGER':
        return 'Project Manager';
      case 'ADMIN':
        return 'Admin';
      default:
        return role;
    }
  };


    //--------------------Orders Bar Chart-------------------

    const getMonthFromDate = (dateString) => {
      const date = new Date(dateString);
      const month = date.toLocaleString('default', { month: 'long' });
      return month;
    };
  
    const getOrderCountByMonth = (orders) => {
      const orderCountByMonth = {};
      orders.forEach(order => {
        const month = getMonthFromDate(order.kick_off_date);
        orderCountByMonth[month] = (orderCountByMonth[month] || 0) + 1;
      });
      return orderCountByMonth;
    };
  
    const generateChartData = (orderCountByMonth) => {
      const data = [];
      for (const month in orderCountByMonth) {
        data.push({ month, orders: orderCountByMonth[month] });
      }
      return data;
    };
  
    const orderCountByMonth = getOrderCountByMonth(finalorders);
    const orderBarData = generateChartData(orderCountByMonth);
    orderBarData.sort((a, b) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
    // console.log(orderCountByMonth, orderBarData)
    const xAxisOrderBar = [{ scaleType: 'band', data: orderBarData.map(item => item.month), label:'Months' }];
    const seriesOrderBar = [{ data: orderBarData.map(item => item.orders) }];
  
    //-------------------------------------------------------------



    //------------------------------Ticket Bar Chart-----------------------
    const xAxisTicketBar = [
      {
        scaleType: 'band',
        data: Object.keys(ticketStatusCounts),
        label: 'Ticket Status',
      },
    ];
    
  
    const seriesTicketBar = [
      {
        data: Object.values(ticketStatusCounts),
      },
    ];
    //----------------------------------------------------------------------
    
  //---------------------------------Invoices Bar Chart----------------------------
  const invoiceStatusCounts = finalinvoices.reduce((acc, invoice) => {
    acc[invoice.status] = (acc[invoice.status] || 0) + 1;
    return acc;
  }, {});
  const invoiceData = Object.entries(invoiceStatusCounts).map(([status, count]) => ({ status, count }));

  const monthlyOrders = finalorders.reduce((acc, order) => {
    const month = new Date(order.kick_off_date).toLocaleString('default', { month: 'short' }); // Get short month name (e.g., Jan, Feb)
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(1); // Assuming you want to count the number of orders per month
    return acc;
  }, {});

  //---------------------------------Order Line Chart----------------------------

  const months = Object.keys(monthlyOrders);
  const orderCounts = Object.values(monthlyOrders).map((orders) => orders.length);

  const chartData = months.map((month, index) => {
    let totalValue = 0;
  
    finalorders.forEach(order => {
      const orderMonth = new Date(order.kick_off_date).toLocaleString('default', { month: 'short' });
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



  // -----------------------------------totalAmount x invoice ID line chart----------------------
  const totalAmounts = finalinvoices.map(invoice => invoice.total_amount);
  const labels = finalinvoices.map(invoice => invoice.invoiceId);
  // console.log(totalAmounts, labels)

  //-------------------------------------totalAmount x Month line chart--------------------------
  const dataByMonth = finalinvoices.reduce((acc, invoice) => {
    const monthName = new Date(invoice.createdAt).toLocaleString('default', { month: 'long' }); // Get month name
  const totalAmount = invoice.total_amount;

  if (!acc[monthName]) {
    acc[monthName] = totalAmount;
  } else {
    acc[monthName] += totalAmount;
  }

    return acc;
  }, {});

  const xAxisData = Object.keys(dataByMonth);
  const seriesData = Object.values(dataByMonth);
  // console.log(xAxisData, seriesData)


  //-----------------------------Client UI-----------------------
  const getClientData = (clientId) => {
    const TaskName = orders.filter(order => order.clientId === clientId);
    const clientInvoices = finalinvoices.filter(invoice => invoice.client_name === clientId);
    const clientTickets = tickets.filter(ticket => ticket.client_name === clientId);
    return { TaskName, clientInvoices, clientTickets };
  };

  //------------------------Proposal Pie------------------
  const quoteStatusCounts = {
    Pending: finalquotes.filter(quote => quote.selected === 'Pending').length,
    Accepted: finalquotes.filter(quote => quote.selected === 'Accepted').length,
    Rejected: finalquotes.filter(quote => quote.selected === 'Rejected').length,
  };
  //----------------------------------------------------------


  //----------------------------Task Bar Chart-----------------------------
  const [selectedOrder, setSelectedOrder] = useState(finalorders.length > 0 ? finalorders[0]._id : '')

    const handleChangeOrder = (event) => {
        setSelectedOrder(event.target.value);
    };
    const filteredTasks = selectedOrder ? finalTasks.filter(task => task.orderId === selectedOrder) : finalTasks;

    // Count the number of tasks for each status
    const taskStatusCounts = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    // Create xAxis and series structure
    const xAxisTaskBar = [
    {
      scaleType: 'band',
      data: Object.keys(taskStatusCounts), // Array of task statuses
      label: 'Task Status',
    },
    ];

    const seriesTaskBar = [
    {
      data: Object.values(taskStatusCounts), // Array of task counts
      label: 'Count', // Label for the series
    },
    ];

    // console.log(xAxisTaskBar, seriesTaskBar);
  //------------------------------------------------------------------------



  useEffect(() => {
    const fetchAssigneeData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/getAllExceptClient`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Assigned To data:', data);

        const assignedToMap = {};
        data.combined.forEach((combined) => {
          assignedToMap[combined._id] = combined.fname + ' ' + combined.lname;
        });

        setassignedToNamesMap(assignedToMap);
        // console.log(assignedToMap)
      } catch (error) {
        console.error('Error fetching clients:', error.message);
      }
    };

    fetchAssigneeData();
  }, []);
  
  return (
    <div>

      <Container style={{ marginTop: '20px'}}>
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
          <Typography variant="body1" component="p" style={{ marginLeft: '10px', color: clickedGrid === 'Orders' ? 'white' : 'inherit' }}>{finalorders.length}</Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={3} style={{ maxHeight: '100px' }}>
      <Card style={{ borderRadius: '10px', height: '100%', backgroundColor: clickedGrid === 'Tickets' ? 'rgb(127, 86, 217)' : 'rgb(245, 245, 245)' }} onClick={() => handleGridClick('Tickets')}>
        <CardHeader style={{ paddingTop: '6px', paddingLeft: '6px' }} title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SvgIcon  style={{ color: clickedGrid === 'Tickets' ? 'white' : 'inherit' }} width="1em" height="1em" viewBox="0 0 256 256">
        <path d="M240 52H16A12 12 0 0 0 4 64v128a12 12 0 0 0 12 12h224a12 12 0 0 0 12-12V64a12 12 0 0 0-12-12m-58.79 128H74.79A60.18 60.18 0 0 0 28 133.21v-10.42A60.18 60.18 0 0 0 74.79 76h106.42A60.18 60.18 0 0 0 228 122.79v10.42A60.18 60.18 0 0 0 181.21 180M228 97.94A36.23 36.23 0 0 1 206.06 76H228ZM49.94 76A36.23 36.23 0 0 1 28 97.94V76ZM28 158.06A36.23 36.23 0 0 1 49.94 180H28ZM206.06 180A36.23 36.23 0 0 1 228 158.06V180ZM128 88a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 56a16 16 0 1 1 16-16a16 16 0 0 1-16 16"/>
          </SvgIcon>

            <Typography variant="h6" component="h4" style={{ marginLeft: '10px', color: clickedGrid === 'Tickets' ? 'white' : 'inherit' }}>Tickets</Typography>
          </div>
        } />
        <CardContent style={{ display: 'flex', alignItems: 'center', paddingTop: '6px', paddingLeft: '6px' }}>
          <Typography variant="body1" component="p" style={{ marginLeft: '10px', color: clickedGrid === 'Tickets' ? 'white' : 'inherit' }}>{finaltickets.length}</Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={3} style={{ maxHeight: '100px' }}>
      <Card style={{ borderRadius: '10px', height: '100%', backgroundColor: clickedGrid === 'Tasks' ? 'rgb(127, 86, 217)' : 'rgb(245, 245, 245)' }} onClick={() => handleGridClick('Tasks')}>
        <CardHeader style={{ paddingTop: '6px', paddingLeft: '6px' }} title={
          <div style={{ display: 'flex', alignItems: 'center' }}>

            <ListIcon style={{ color: clickedGrid === 'Tasks' ? 'white' : 'inherit' }}/>

            <Typography variant="h6" component="h4" style={{ marginLeft: '10px', color: clickedGrid === 'Tasks' ? 'white' : 'inherit' }}>Tasks</Typography>
          </div>
        } />
        <CardContent style={{ display: 'flex', alignItems: 'center', paddingTop: '6px', paddingLeft: '6px' }}>
          <Typography variant="body1" component="p" style={{ marginLeft: '10px', color: clickedGrid === 'Tasks' ? 'white' : 'inherit' }}>{finalTasks.length}</Typography>
        </CardContent>
      </Card>
    </Grid>


    <Grid item xs={3} style={{ maxHeight: '100px' }}>
        <Card style={{ borderRadius: '10px', height: '275%', backgroundColor: 'rgb(245, 245, 245)' }}>
          <CardHeader
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SvgIcon width="384" height="512" viewBox="0 0 384 512">
          <g clipPath="url(#clip0_699_6)">
            <path d="M377 105L279.1 7C274.6 2.5 268.5 0 262.1 0H256V128H384V121.9C384 115.6 381.5 109.5 377 105ZM224 136V0H24C10.7 0 0 10.7 0 24V488C0 501.3 10.7 512 24 512H360C373.3 512 384 501.3 384 488V160H248C234.8 160 224 149.2 224 136ZM64 72C64 67.58 67.58 64 72 64H152C156.42 64 160 67.58 160 72V88C160 92.42 156.42 96 152 96H72C67.58 96 64 92.42 64 88V72ZM64 152V136C64 131.58 67.58 128 72 128H152C156.42 128 160 131.58 160 136V152C160 156.42 156.42 160 152 160H72C67.58 160 64 156.42 64 152ZM208 415.88V440C208 444.42 204.42 448 200 448H184C179.58 448 176 444.42 176 440V415.71C164.71 415.13 153.73 411.19 144.63 404.36C140.73 401.43 140.53 395.59 144.06 392.22L155.81 381.01C158.58 378.37 162.7 378.25 165.94 380.28C169.81 382.7 174.2 384 178.76 384H206.87C213.37 384 218.67 378.08 218.67 370.81C218.67 364.86 215.06 359.62 209.9 358.08L164.9 344.58C146.31 339 133.32 321.16 133.32 301.19C133.32 276.67 152.37 256.75 175.99 256.12V232C175.99 227.58 179.57 224 183.99 224H199.99C204.41 224 207.99 227.58 207.99 232V256.29C219.28 256.87 230.26 260.8 239.36 267.64C243.26 270.57 243.46 276.41 239.93 279.78L228.18 290.99C225.41 293.63 221.29 293.75 218.05 291.72C214.18 289.29 209.79 288 205.23 288H177.12C170.62 288 165.32 293.92 165.32 301.19C165.32 307.14 168.93 312.38 174.09 313.92L219.09 327.42C237.68 333 250.67 350.84 250.67 370.81C250.67 395.34 231.62 415.25 208 415.88Z"/>
            </g>
            <defs>
            <clipPath id="clip0_699_6">
            <rect width="384" height="512" fill="white"/>
            </clipPath>
            </defs>
          </SvgIcon>
                <Typography variant="h6" component="h4" style={{ marginLeft: '10px' }}>Unpaid Invoices</Typography>
              </div>
            }
            subheader={finalinvoices.filter(invoice => invoice.status === 'Open').length}
            subheaderTypographyProps={{ style: { fontSize: '14px', fontStyle: 'italic', marginTop:'10px', paddingLeft: '6px' } }} // Add style to the subheader
          />
          {finalinvoices.length === 0 ? (
            <Container style={{ textAlign: 'center' }}>
              <img
                src={empty}
                alt="Empty Folder"
                style={{ width: "75px", height: "75px", marginBottom: "10px" }}
              />
              <Typography variant="h5">No Invoices</Typography>
            </Container>
          ) : (
            <CardContent style={{ display: 'flex', flexDirection: 'column', maxHeight: '80%', overflowY: 'auto', marginTop:'-20px' }}>
              <List>
                {finalinvoices
                  .filter(invoice => invoice.status === 'Open') // Filter invoices with status Open
                  .map(invoice => (
                    <ListItem key={invoice._id}>
                      <ListItemText primary={invoice.invoiceId} secondary={`Amount: ${invoice.amount}`} />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          )}
        </Card>
      </Grid>


          <Grid item xs={9}>
          {clickedGrid === 'Orders' && (
            <OrdersBarChart orders={finalorders} />
            
            )}

        {clickedGrid === 'Tickets' && (
            <Card style={{ height: '486px', borderRadius: '10px', padding: '10px', backgroundColor:'rgb(245, 245, 245)' }}>
                <CardHeader title="Tickets" />
                <CardContent>
                {finaltickets.length === 0 ? (
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
                  <div style={{display:'flex', alignItems:'center'}}>
                  <BarChart
                    colors={['rgb(127, 86, 217)' ]} 
                    xAxis={ xAxisTicketBar}
                    yAxis={[
                      {
                        label: 'Count',               
                      },
                    ]}
                    series={seriesTicketBar}
                    height={300}
                    slotProps={{
                      bar: {
                        clipPath: `inset(0px round 10px 10px 0px 0px)`,
                        
                      },
                    }}
                  >
                  </BarChart>
                </div>

                )}
                </CardContent>
            </Card>
            )}


            {clickedGrid === 'Tasks' && (
                <Card style={{ height: '486px', borderRadius: '10px', padding: '10px', overflowY: 'auto', backgroundColor: 'rgb(245, 245, 245)' }}>

                    <CardHeader
                        title="Tasks"
                        action={
                            <FormControl style={{ minWidth: '120px', textAlign: 'center' }}>
                                <Select
                                    value={selectedOrder}
                                    onChange={handleChangeOrder}
                                    displayEmpty
                                    style={{ marginBottom: '10px' }}
                                >
                                    <MenuItem value="" disabled>
                                        Select an Order
                                    </MenuItem>
                                    {finalorders.map(order => (
                                        <MenuItem key={order._id} value={order._id}>{order.orderId}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        }
                    />
                    <CardContent>
                        {finalTasks.length === 0 ? (
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
                              <AssignmentIcon style={{ fontSize: "50px", color: "#B0BEC5" }} />
                            </div>
                            <Typography variant="h5" style={{ marginBottom: "10px" }}>
                            No Tasks yet
                            </Typography>
                      </Container>
                        ) : selectedOrder && seriesTicketBar ? (
                            filteredTasks.length === 0 ? ( // Check if filteredTasks is empty
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
                                  margin: "0 auto 0 auto",
                                }}
                              >
                                <AssignmentIcon style={{ fontSize: "50px", color: "#B0BEC5" }} />
                              </div>
                              <Typography variant="h5" style={{ marginBottom: "10px" }}>
                             This Order has no Task
                              </Typography>
                        </Container>
                            ) : (
                              <div style={{display:'flex', alignItems:'center'}}>
                              <BarChart
                                colors={['rgb(127, 86, 217)']}
                                xAxis={xAxisTaskBar}
                                yAxis={[{ label: 'Count', scaleType: 'linear', tickLabelStyle:{fontSize:'10px'}}]}
                                series={seriesTaskBar} 
                                height={300}
                                width={800}
                                sx={{
                                    '.MuiChartsLegend-root': {
                                        display: 'none', 
                                    },
                                }}
                                slotProps={{
                                    bar: {
                                        clipPath: `inset(0px round 10px 10px 0px 0px)`, // Clip path for vertical bar chart
                                    },
                                }}
                            />
                            </div>
                          
                            )
                        ) : null}
                    </CardContent>

                </Card>
            )}

  
          </Grid>
          


          <Grid item xs={3}>
            <Card style={{ borderRadius: '10px', height: '70%', marginTop:'145px', backgroundColor:'rgb(245, 245, 245)' }}>
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
                finalorders.length === 0 ? (
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
                finalquotes.length === 0 ? (
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
                finalinvoices.length === 0 ? (
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
                    series={[{ data: Object.entries(invoiceStatusCountsPie).map(([status, count]) => ({ label: status, value: count })) }]}
                    width={400}
                    height={200}
                  />
                )
              )}
              {chartType === 'Tickets' && (
                finaltickets.length === 0 ? (
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

    
    </div>
  );
};

export default ClientDashboard