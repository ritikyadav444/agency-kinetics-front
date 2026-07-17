// import React, { useState, useEffect, useMemo } from 'react';
// import { Card, CardHeader, CardContent, Typography, Container, MenuItem, Select, FormControl, Grid } from '@mui/material';
// import { BarChart } from '@mui/x-charts';
// import empty from '../Images/empty-folder.png';
// import { Inbox as InboxIcon } from "@mui/icons-material";

// const OrdersBarChart = ({ orders }) => {
//   const [timeRange, setTimeRange] = useState('3 Months'); // Default to yearly
//   const [chartData, setChartData] = useState([]);

//   const getMonthFromDate = (dateString) => {
//     const date = new Date(dateString);
//     const month = date.toLocaleString('default', { month: 'long' }); // Convert to full month name
//     const year = date.getFullYear();
//     return `${month} ${year}`;
//   };

//   const getOrderCountByMonth = (orders) => {
//     const orderCountByMonth = {};
//     orders.forEach(order => {
//       const month = getMonthFromDate(order.kick_off_date);
//       orderCountByMonth[month] = (orderCountByMonth[month] || 0) + 1;
//     });
//     return orderCountByMonth;
//   };

//   const getOrderCountByYear = (orders) => {
//     const orderCountByYear = {};
//     orders.forEach(order => {
//       const year = new Date(order.kick_off_date).getFullYear();
//       orderCountByYear[year] = (orderCountByYear[year] || 0) + 1;
//     });
//     return orderCountByYear;
//   };

//   const getCurrentMonthAndYear = () => {
//     const now = new Date();
//     return {
//       currentMonth: now.toLocaleString('default', { month: 'long' }), // Convert to full month name
//       currentYear: now.getFullYear()
//     };
//   };

//   // Memoize the current month and year so it doesn't recalculate on every render
//   const { currentMonth, currentYear } = useMemo(() => getCurrentMonthAndYear(), []);

//   // Log current month once, only when the component mounts
//   useEffect(() => {
//     console.log(currentMonth);
//   }, [currentMonth]);

//   // Extract unique years from orders
//   const uniqueYears = [...new Set(orders.map(order => new Date(order.kick_off_date).getFullYear()))].sort((a, b) => a - b);

//   const generatePeriods = (range) => {
//     const periods = [];
//     const monthsOrder = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];

//     if (timeRange === 'Yearly') {
//       const filteredYears = [...uniqueYears]; // Use all unique years in orders
//       for (let i = 0; i < range; i++) {
//         if (filteredYears.length > 0) {
//           periods.unshift(`${filteredYears.pop()}`);
//         }
//       }
//     } else {
//       let monthIndex = monthsOrder.indexOf(currentMonth);
//       let yearIndex = currentYear;

//       for (let i = 0; i < range; i++) {
//         const month = monthsOrder[monthIndex];
//         periods.unshift(`${month} ${yearIndex}`);
        
//         monthIndex -= 1;
//         if (monthIndex < 0) {
//           monthIndex = 11; // Set to December if we go past January
//           yearIndex -= 1;
//         }
//       }
//     }

//     return periods;
//   };

//   const generateChartData = (orderCountByPeriod, periods) => {
//     const data = [];
//     for (const period of periods) {
//       data.push({ period, orders: orderCountByPeriod[period] || 0 });
//     }
//     return data;
//   };

//   useEffect(() => {
//     const periods = generatePeriods(timeRange === 'Yearly' ? uniqueYears.length : (timeRange === '6 Months' ? 6 : 3));
//     const orderCountByPeriod = timeRange === 'Yearly'
//       ? getOrderCountByYear(orders)
//       : getOrderCountByMonth(orders);

//     setChartData(generateChartData(orderCountByPeriod, periods));
//   }, [timeRange, orders, uniqueYears]);

//   return (
//     <Grid item xs={12}>
//       <Card style={{ height: '486px', borderRadius: '10px', padding: '10px', backgroundColor: 'rgb(245, 245, 245)' }}>
//         <CardHeader
//           title="Orders"
//           action={
//             <FormControl style={{ minWidth: '120px', marginLeft: 'auto', marginTop: '8px', marginBottom: '8px' }}>
//               <Select
//                 labelId="time-range-label"
//                 id="time-range"
//                 value={timeRange}
//                 onChange={(e) => setTimeRange(e.target.value)}
//                 size="small"
//               >
//                 <MenuItem value="3 Months">Last 3 Months</MenuItem>
//                 <MenuItem value="6 Months">Last 6 Months</MenuItem>
//                 <MenuItem value="Yearly">Yearly</MenuItem>
//               </Select>
//             </FormControl>
//           }
//         />
//         <CardContent>
//           {orders.length === 0 ? (
//             <Container style={{ marginTop: "75px", textAlign: "center" }}>
//               <div
//                 style={{
//                   width: "75px",
//                   height: "75px",
//                   borderRadius: "50%",
//                   backgroundColor: "#f5f5f5",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   margin: "0 auto 20px auto",
//                 }}
//               >
//                 <InboxIcon style={{ fontSize: "50px", color: "#B0BEC5" }} />
//               </div>
//               <Typography variant="h5" style={{ marginBottom: "10px" }}>
//                 No orders yet
//               </Typography>
//               <Typography variant="body1" style={{ marginBottom: "20px", color: "#607D8B" }}>
//                 Create your first order to start tracking your business transactions
//               </Typography>
//         </Container>
//           ) : chartData.length > 0 ? (
//             <BarChart
//               colors={['rgb(127, 86, 217)']}
//               xAxis={[{ scaleType: 'band', data: chartData.map(item => item.period), label: 'Periods', tickLabelStyle:{fontSize:'10px'} }]}
//               yAxis={[
//                 {
//                   label: 'Count',
//                 },
//               ]}
//               series={[{ data: chartData.map(item => item.orders) }]}
//               height={300}
//               slotProps={{
//                 bar: {
//                   clipPath: `inset(0px round 10px 10px 0px 0px)`,
//                 },
//               }}
//             />
//           ) : (
//             <Typography variant="h6" style={{ textAlign: 'center' }}>No Data Available</Typography>
//           )}
//         </CardContent>
//       </Card>
//     </Grid>
//   );
// };

// export default OrdersBarChart;


import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent, Typography, Container, MenuItem, Select, FormControl, Grid, TextField } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { Inbox as InboxIcon } from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const OrdersBarChart = ({ orders }) => {
  const [timeRange, setTimeRange] = useState('3 Months'); // Default to 3 months
  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const getMonthFromDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'long' }); // Convert to full month name
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const getOrderCountByMonth = (orders) => {
    const orderCountByMonth = {};
    orders.forEach(order => {
      const month = getMonthFromDate(order.kick_off_date);
      orderCountByMonth[month] = (orderCountByMonth[month] || 0) + 1;
    });
    return orderCountByMonth;
  };

  const getOrderCountByYear = (orders) => {
    const orderCountByYear = {};
    orders.forEach(order => {
      const year = new Date(order.kick_off_date).getFullYear();
      orderCountByYear[year] = (orderCountByYear[year] || 0) + 1;
    });
    return orderCountByYear;
  };

  const getCurrentMonthAndYear = () => {
    const now = new Date();
    return {
      currentMonth: now.toLocaleString('default', { month: 'long' }), // Convert to full month name
      currentYear: now.getFullYear()
    };
  };

  const { currentMonth, currentYear } = useMemo(() => getCurrentMonthAndYear(), []);

  // Filter orders based on the selected date range
  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return orders;
    return orders.filter(order => {
      const orderDate = dayjs(order.kick_off_date);
      return orderDate.isAfter(startDate) && orderDate.isBefore(endDate);
    });
  }, [orders, startDate, endDate]);

  const generateChartData = (orderCountByPeriod, periods) => {
    const data = [];
    for (const period of periods) {
      data.push({ period, orders: orderCountByPeriod[period] || 0 });
    }
    return data;
  };

  const uniqueYears = [...new Set(orders.map(order => new Date(order.kick_off_date).getFullYear()))].sort((a, b) => a - b);

  const generatePeriods = (range) => {
    const periods = [];
    const monthsOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Handle Yearly range
    if (timeRange === 'Yearly') {
      const filteredYears = [...uniqueYears];
      for (let i = 0; i < range; i++) {
        if (filteredYears.length > 0) {
          periods.unshift(`${filteredYears.pop()}`);
        }
      }
    }
    // Handle monthly ranges (e.g., 3 months, 6 months)
    else if (timeRange === '3 Months' || timeRange === '6 Months') {
      let monthIndex = monthsOrder.indexOf(currentMonth);
      let yearIndex = currentYear;

      for (let i = 0; i < range; i++) {
        const month = monthsOrder[monthIndex];
        periods.unshift(`${month} ${yearIndex}`);
        
        monthIndex -= 1;
        if (monthIndex < 0) {
          monthIndex = 11;
          yearIndex -= 1;
        }
      }
    }
    // Handle Custom Range
    else if (timeRange === 'Custom') {
      if (!startDate || !endDate) return periods; // If no custom range selected, return empty periods
      
      let start = dayjs(startDate);
      let end = dayjs(endDate);
      while (start.isBefore(end)) {
        periods.push(start.format("MMMM YYYY"));
        start = start.add(1, 'month');
      }
    }

    return periods;
  };

  useEffect(() => {
    const periods = generatePeriods(timeRange === 'Yearly' ? uniqueYears.length : (timeRange === '6 Months' ? 6 : 3));
    const orderCountByPeriod = timeRange === 'Yearly'
      ? getOrderCountByYear(filteredOrders)
      : getOrderCountByMonth(filteredOrders);

    setChartData(generateChartData(orderCountByPeriod, periods));
  }, [timeRange, filteredOrders, uniqueYears, startDate, endDate]);

  return (
    <Grid item xs={12}>
      <Card style={{ height: '486px', borderRadius: '10px', padding: '10px', backgroundColor: 'rgb(245, 245, 245)' }}>
        <CardHeader
          title="Orders"
          action={
            <FormControl style={{ minWidth: '120px', marginLeft: 'auto', marginTop: '8px', marginBottom: '8px' }}>
              <Select
                labelId="time-range-label"
                id="time-range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                size="small"
              >
                <MenuItem value="3 Months">Last 3 Months</MenuItem>
                <MenuItem value="6 Months">Last 6 Months</MenuItem>
                <MenuItem value="Yearly">Yearly</MenuItem>
                <MenuItem value="Custom">Custom Range</MenuItem> {/* New option for custom range */}
              </Select>
            </FormControl>
          }
        />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2}>
              {timeRange === 'Custom' && ( // Show date pickers when Custom Range is selected
                <>
                  <Grid item>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} size="small" />}
                    />
                  </Grid>
                  <Grid item>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} size="small" />}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </LocalizationProvider>

          {orders.length === 0 ? (
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
                <InboxIcon style={{ fontSize: "50px", color: "#B0BEC5" }} />
              </div>
              <Typography variant="h5" style={{ marginBottom: "10px" }}>
                No orders yet
              </Typography>
              <Typography variant="body1" style={{ marginBottom: "20px", color: "#607D8B" }}>
                Create your first order to start tracking your business transactions
              </Typography>
            </Container>
          ) : chartData.length > 0 ? (
            <BarChart
              colors={['rgb(127, 86, 217)']}
              xAxis={[{ scaleType: 'band', data: chartData.map(item => item.period), label: 'Periods', tickLabelStyle:{fontSize:'10px'} }]}
              yAxis={[
                {
                  label: 'Count',
                },
              ]}
              series={[{ data: chartData.map(item => item.orders) }]}
              height={300}
              slotProps={{
                bar: {
                  clipPath: `inset(0px round 10px 10px 0px 0px)`,
                },
              }}
            />
          ) : (
            <Typography variant="h6" style={{ textAlign: 'center', marginTop:'100px' }}>Please Select Date</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default OrdersBarChart;
