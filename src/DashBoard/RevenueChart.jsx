// import React, { useState, useEffect, useMemo } from 'react';
// import { Card, CardHeader, CardContent, Typography, Container, MenuItem, Select, FormControl, Grid } from '@mui/material';
// import { LineChart } from '@mui/x-charts';
// import empty from '../Images/empty-folder.png';
// import { Inbox as InboxIcon } from "@mui/icons-material";

// const RevenueChart = ({ orders }) => {
//   const [timeRange, setTimeRange] = useState('3 Months'); // Default to yearly
//   const [chartData, setChartData] = useState([]);
//   const [revenueData, setRevenueData] = useState({});
//   const [totalRevenue, setTotalRevenue] = useState(0); // State to store the total revenue

//   const getCurrentMonthAndYear = () => {
//     const now = new Date();
//     return {
//       currentMonth: now.toLocaleString('default', { month: 'long' }), // Short month name
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
  
//   const monthlyOrders = orders.reduce((acc, order) => {
//     const date = new Date(order.kick_off_date);
//     const year = date.getFullYear();
//     const month = date.toLocaleString('default', { month: 'long' }); // Short month name
//     const key = timeRange === 'Yearly' ? `${year}` : `${month} ${year}`;

//     if (!acc[key]) {
//       acc[key] = [];
//     }
//     acc[key].push(order);
//     return acc;
//   }, {});

//   const generatePeriods = (range) => {
//     const periods = [];
//     const monthsOrder = [
//       "January", "February", "March", "April", "May", "June", "July", 
//       "August", "September", "October", "November", "December"
//     ];
  
//     if (timeRange === 'Yearly') {
//       const filteredYears = [...uniqueYears];
//       for (let i = 0; i < range; i++) {
//         if (filteredYears.length > 0) {
//           periods.unshift(`${filteredYears.pop()}`);
//         }
//       }
//     } else {
//       let monthIndex = new Date().getMonth(); // Get the current month index (0-11)
//       let yearIndex = currentYear;
  
//       for (let i = 0; i < range; i++) {
//         const month = monthsOrder[monthIndex]; // Use full month names
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
  

//   const calculateChartData = (range) => {
//     const filteredPeriods = generatePeriods(range);
    
//     const chartData = filteredPeriods.map((period) => {
//       let totalValue = 0;
//       monthlyOrders[period]?.forEach((order) => {
//         const quantity = order.quantity || 0;
//         const budget = order.budget || 0;
//         totalValue += quantity * budget;
//       });
//       return {
//         x: period,
//         y: totalValue,
//       };
//     });

//     return chartData;
//   };

//   const calculateRevenueData = (range) => {
//     const filteredPeriods = generatePeriods(range);
//     const revenue = filteredPeriods.reduce((acc, period) => {
//       let totalValue = 0;
//       monthlyOrders[period]?.forEach((order) => {
//         const quantity = order.quantity || 0;
//         const budget = order.budget || 0;
//         totalValue += quantity * budget;
//       });
//       acc[period] = totalValue;
//       return acc;
//     }, {});

//     return revenue;
//   };

//   useEffect(() => {
//     if (timeRange === '3 Months') {
//       const data = calculateChartData(3);
//       const revenue = calculateRevenueData(3);
//       setChartData(data);
//       setRevenueData(revenue);
//       setTotalRevenue(Object.values(revenue).reduce((acc, value) => acc + value, 0));
//     } else if (timeRange === '6 Months') {
//       const data = calculateChartData(6);
//       const revenue = calculateRevenueData(6);
//       setChartData(data);
//       setRevenueData(revenue);
//       setTotalRevenue(Object.values(revenue).reduce((acc, value) => acc + value, 0));
//     } else {
//       const data = calculateChartData(uniqueYears.length);
//       const revenue = calculateRevenueData(uniqueYears.length);
//       setChartData(data);
//       setRevenueData(revenue);
//       setTotalRevenue(Object.values(revenue).reduce((acc, value) => acc + value, 0));
//     }
//   }, [timeRange, orders, uniqueYears]);

//   const formatNumber = (value) => {
//     if (Math.abs(value) >= 1e6) {
//       return (value / 1e6).toFixed(0) + 'L';
//     }
//     if (Math.abs(value) >= 1e3) {
//       return (value / 1e3).toFixed(0) + 'k';
//     }
//     return value.toString();
//   };

//   return (
//     <Grid item xs={12}>
//       <Card style={{ height: '486px', borderRadius: '10px', padding: '10px', backgroundColor: 'rgb(245, 245, 245)' }}>
//         <CardHeader
//           title="Revenue"
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
//             <div
//               style={{
//                 width: "75px",
//                 height: "75px",
//                 borderRadius: "50%",
//                 backgroundColor: "#f5f5f5",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 margin: "0 auto 20px auto",
//               }}
//             >
//               <InboxIcon style={{ fontSize: "50px", color: "#B0BEC5" }} />
//             </div>
//             <Typography variant="h5" style={{ marginBottom: "10px" }}>
//               No orders yet
//             </Typography>
//             <Typography variant="body1" style={{ marginBottom: "20px", color: "#607D8B" }}>
//               Create your first order to start tracking your business transactions
//             </Typography>
//        </Container>
//           ) : (
//             <>
//               <LineChart
//                 xAxis={[{ scaleType: 'band', data: chartData.map(data => data.x), label: 'Periods' }]}
//                 series={[
//                   {
//                     data: chartData.map((data) => data.y),
//                     area: true,
//                     fill: 'rgb(127, 86, 217)',
//                     connectNulls: true,
//                     baseValue: 0,
//                     color: 'rgb(127, 86, 217)',
//                   },
//                 ]}
//                 yAxis={[
//                   {
//                     label: 'Amount',
//                     labelStyle: {
//                       transform: 'rotate(-90deg) translateY(-60px) translateX(30px)',
//                       transformOrigin: 'left center',
//                     },
//                     valueFormatter: (value) => formatNumber(value),
//                   },
//                 ]}
//                 grid={{ vertical: true, horizontal: true }}
//                 height={300}
//                 sx={{ padding: '10px', '.MuiChartsItemTooltipContent-mark': { fill: 'rgb(127, 86, 217)' } }}
//               />
//               <div style={{ marginTop: '20px' }}>
//                 <Typography variant="h6">Total Revenue: {totalRevenue}</Typography>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </Grid>
//   );
// };

// export default RevenueChart;


import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent, Typography, Container, MenuItem, Select, FormControl, Grid, TextField } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import empty from '../Images/empty-folder.png';
import { Inbox as InboxIcon } from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const RevenueChart = ({ orders }) => {
  const [timeRange, setTimeRange] = useState('3 Months'); // Default to 3 Months
  const [chartData, setChartData] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0); // State to store the total revenue
  const [startDate, setStartDate] = useState(null); // Start date for custom range
  const [endDate, setEndDate] = useState(null); // End date for custom range

  const getCurrentMonthAndYear = () => {
    const now = new Date();
    return {
      currentMonth: now.toLocaleString('default', { month: 'long' }), // Short month name
      currentYear: now.getFullYear()
    };
  };

  // Memoize the current month and year so it doesn't recalculate on every render
  const { currentMonth, currentYear } = useMemo(() => getCurrentMonthAndYear(), []);

  // Extract unique years from orders
  const uniqueYears = [...new Set(orders.map(order => new Date(order.kick_off_date).getFullYear()))].sort((a, b) => a - b);
  
  const monthlyOrders = orders.reduce((acc, order) => {
    const date = new Date(order.kick_off_date);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' }); // Short month name
    const key = timeRange === 'Yearly' ? `${year}` : `${month} ${year}`;

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(order);
    return acc;
  }, {});

  const generatePeriods = (range) => {
    const periods = [];
    const monthsOrder = [
      "January", "February", "March", "April", "May", "June", "July", 
      "August", "September", "October", "November", "December"
    ];
  
    // Handle Yearly and 3/6 months ranges as before
    if (timeRange === 'Yearly') {
      const filteredYears = [...uniqueYears];
      for (let i = 0; i < range; i++) {
        if (filteredYears.length > 0) {
          periods.unshift(`${filteredYears.pop()}`);
        }
      }
    } else if (timeRange === '3 Months' || timeRange === '6 Months') {
      let monthIndex = new Date().getMonth(); // Get the current month index (0-11)
      let yearIndex = currentYear;
  
      for (let i = 0; i < range; i++) {
        const month = monthsOrder[monthIndex]; // Use full month names
        periods.unshift(`${month} ${yearIndex}`);
  
        monthIndex -= 1;
        if (monthIndex < 0) {
          monthIndex = 11; // Set to December if we go past January
          yearIndex -= 1;
        }
      }
    } 
  
    // Handle Custom Range
    else if (timeRange === 'Custom') {
      if (!startDate || !endDate) return periods; // If no custom range selected, return empty periods
      
      let start = dayjs(startDate);
      let end = dayjs(endDate);
      
      // Loop through the months between startDate and endDate
      while (start.isBefore(end) || start.isSame(end, 'month')) {
        periods.push(start.format("MMMM YYYY"));
        start = start.add(1, 'month');
      }
    }
  
    return periods;
  };
  

  const calculateChartData = (range) => {
    const filteredPeriods = generatePeriods(range);
    
    const chartData = filteredPeriods.map((period) => {
      let totalValue = 0;
      monthlyOrders[period]?.forEach((order) => {
        const quantity = order.quantity || 0;
        const budget = order.budget || 0;
        totalValue += quantity * budget;
      });
      return {
        x: period,
        y: totalValue,
      };
    });

    return chartData;
  };

  const calculateRevenueData = (range) => {
    const filteredPeriods = generatePeriods(range);
    const revenue = filteredPeriods.reduce((acc, period) => {
      let totalValue = 0;
      monthlyOrders[period]?.forEach((order) => {
        const quantity = order.quantity || 0;
        const budget = order.budget || 0;
        totalValue += quantity * budget;
      });
      acc[period] = totalValue;
      return acc;
    }, {});

    return revenue;
  };

  // Filter orders based on custom date range
  const filterOrdersByDateRange = (startDate, endDate) => {
    return orders.filter(order => {
      const orderDate = dayjs(order.kick_off_date);
      return orderDate.isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]');
    });
  };

  useEffect(() => {
    let filteredOrders = orders;

    if (timeRange === 'Custom' && startDate && endDate) {
      filteredOrders = filterOrdersByDateRange(startDate, endDate);
    }

    if (timeRange === '3 Months') {
      const data = calculateChartData(3);
      const revenue = calculateRevenueData(3);
      setChartData(data);
      setRevenueData(revenue);
      setTotalRevenue(Object.values(revenue).reduce((acc, value) => acc + value, 0));
    } else if (timeRange === '6 Months') {
      const data = calculateChartData(6);
      const revenue = calculateRevenueData(6);
      setChartData(data);
      setRevenueData(revenue);
      setTotalRevenue(Object.values(revenue).reduce((acc, value) => acc + value, 0));
    } else if (timeRange === 'Yearly') {
      const data = calculateChartData(uniqueYears.length);
      const revenue = calculateRevenueData(uniqueYears.length);
      setChartData(data);
      setRevenueData(revenue);
      setTotalRevenue(Object.values(revenue).reduce((acc, value) => acc + value, 0));
    } else if (timeRange === 'Custom') {
      const data = calculateChartData(filteredOrders.length);
      const revenue = calculateRevenueData(filteredOrders.length);
      setChartData(data);
      setRevenueData(revenue);
      setTotalRevenue(Object.values(revenue).reduce((acc, value) => acc + value, 0));
    }
  }, [timeRange, orders, uniqueYears, startDate, endDate]);

  const formatNumber = (value) => {
    if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(0) + 'L';
    }
    if (Math.abs(value) >= 1e3) {
      return (value / 1e3).toFixed(0) + 'k';
    }
    return value.toString();
  };

  return (
    <Grid item xs={12}>
      <Card style={{ height: '486px', borderRadius: '10px', padding: '10px', backgroundColor: 'rgb(245, 245, 245)' }}>
        <CardHeader
          title="Revenue"
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
                <MenuItem value="Custom">Custom Range</MenuItem> {/* Custom range option */}
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
            <>
              <LineChart
                xAxis={[{ scaleType: 'band', data: chartData.map(data => data.x), label: 'Periods' }]}
                series={[
                  {
                    data: chartData.map((data) => data.y),
                    area: true,
                    fill: 'rgb(127, 86, 217)',
                    connectNulls: true,
                    baseValue: 0,
                    color: 'rgb(127, 86, 217)',
                  },
                ]}
                yAxis={[
                  {
                    label: 'Amount',
                    labelStyle: {
                      transform: 'rotate(-90deg) translateY(-60px) translateX(30px)',
                      transformOrigin: 'left center',
                    },
                    valueFormatter: (value) => formatNumber(value),
                  },
                ]}
                grid={{ vertical: true, horizontal: true }}
                height={300}
                sx={{ padding: '10px', '.MuiChartsItemTooltipContent-mark': { fill: 'rgb(127, 86, 217)' } }}
              />
              
              <div style={{ marginTop: timeRange === 'Custom' ? '0px' : '20px' }}>
                <Typography variant="h6">Total Revenue: {totalRevenue}</Typography>
              </div>

            </>
            ) : (
            <Typography variant="h6" style={{ textAlign: 'center', marginTop:'100px' }}>Please Select Date</Typography>
                
            )
          }
        </CardContent>
      </Card>
    </Grid>
  );
};

export default RevenueChart;
