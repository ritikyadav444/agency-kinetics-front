import React, { forwardRef, useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { clearErrors, getInvoiceDetails } from '../../actions/invoiceAction';
import { useDispatch, useSelector } from 'react-redux';
import { baseURL } from '../../http';


const PrintFromInvoice = forwardRef(({ invoiceFromInvoices, ordersMap, servicesMap, clientNamesMap, superAdminId }, ref) => {
  // console.log(invoiceFromInvoices, ordersMap, servicesMap, superAdminId)
  let serviceCurrency = '';
  const dispatch = useDispatch()
  const [invoice, setinvoice]=useState({});

  useEffect(() => {
    const controller = new AbortController();
    const fetchClientData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/invoice/${invoiceFromInvoices}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Clients data:', data);
        setinvoice(data.invoice)
        // console.log(invoice)
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching clients:', error.message);
      }
    };
    fetchClientData();
    return () => controller.abort();
  }, []);

    return (
    <Box ref={ref} sx={{ padding: '32px'}}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Box>
            {superAdminId && superAdminId.company_img && superAdminId.company_SuperName ? (
              <>
                <img src={superAdminId.company_img} alt="Company Logo" style={{ maxHeight: '100px' }} />
                <Typography variant="h6">{superAdminId.company_SuperName}</Typography>
              </>
            ) : (
              <Typography variant="h6">Loading...</Typography>
            )}
          </Box>
          <Typography variant="h4">INVOICE</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="body1"><strong>Invoice to:</strong></Typography>
            <Typography variant="body1">
              {clientNamesMap[invoice.client_name] === undefined
                ? <span style={{ color: 'red' }}>Client Deleted</span>
                : (clientNamesMap[invoice.client_name].name === '')
                  ? 'Unnamed client'
                  : clientNamesMap[invoice.client_name].name}
            </Typography>
            <Typography variant="body1">
                      {`${clientNamesMap[invoice.client_name] ? clientNamesMap[invoice.client_name].city : ""},
                       ${clientNamesMap[invoice.client_name] ? clientNamesMap[invoice.client_name].state : ""},
                       ${clientNamesMap[invoice.client_name] ? clientNamesMap[invoice.client_name].country : ""}` }
                    </Typography>
          </Box>
          <Box>
            <Typography variant="body1"><strong>Invoice#</strong> {invoice.invoiceId}</Typography>
            <Typography variant="body1"><strong>Date</strong> {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</Typography>
          </Box>
        </Box>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold' }}>Order ID</TableCell>
                    <TableCell sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold' }}>Service Description</TableCell>
                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold' }}>Unit Price</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                        {invoice.orderIds && invoice.orderIds.length > 0 ? (
                            invoice.orderIds.map((orderId, index) => {
                                const order = ordersMap[orderId];
                                const serviceDetails = order ? servicesMap[order.serviceId] : null;
                                const serviceName = serviceDetails ? serviceDetails.service_name : 'Unknown Service';
                                serviceCurrency = serviceDetails ? serviceDetails.currency : '';
                                const orderTotal = order ? order.quantity * order.unitPrice : 0;
                                return (
                                    <TableRow key={index}>
                                        <TableCell sx={{ borderRight: '2px solid #ccc' }}>{order ? order.orderId : '-'}</TableCell>
                                        <TableCell sx={{ borderRight: '2px solid #ccc' }}>{serviceName}</TableCell>
                                        <TableCell align="center" sx={{ borderRight: '2px solid #ccc' }}>{order ? order.quantity : '-'}</TableCell>
                                        <TableCell align="center" sx={{ borderRight: '2px solid #ccc' }}>{order ? order.unitPrice : '-'}</TableCell>
                                        <TableCell align="center">{orderTotal !== 0 ? orderTotal : '-'} {serviceCurrency}</TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell align="center" colSpan={3} sx={{ borderRight: 'none', borderTop:'2px solid #ccc' }} />
                            <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', borderTop: '2px solid #ccc', fontWeight: 'bold' }}>Subtotal</TableCell>
                            <TableCell align="center" sx={{ borderBottom: '2px solid #ccc', borderTop:'2px solid #ccc' }}>
                                {invoice.amount !== undefined && invoice.amount !== null ? invoice.amount.toFixed(2) : '-'} {serviceCurrency}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center" colSpan={3} sx={{ borderRight: '2px solid #ccc', borderBottom: 'none', borderTop:'2px solid #ccc'  }} />
                            <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>
                                Discount ({invoice.discount_percentage !== undefined && invoice.discount_percentage !== null ? invoice.discount_percentage.toFixed(2) : '0.00'}%)
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '2px solid #ccc' }}>
                                {invoice.discount_amount !== undefined && invoice.discount_amount !== null ? invoice.discount_amount.toFixed(2) : '-'}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center" colSpan={3} sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc' }} />
                            <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>
                                VAT/Tax ({invoice.tax_percentage !== undefined && invoice.tax_percentage !== null ? invoice.tax_percentage.toFixed(2) : '0.00'}%)
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '2px solid #ccc' }}>
                                {invoice.tax_amount !== undefined && invoice.tax_amount !== null ? invoice.tax_amount.toFixed(2) : '-'}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center" colSpan={3} />
                            <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>Total</TableCell>
                            <TableCell align="center" sx={{ borderBottom: '2px solid #ccc' }}>
                                {invoice.total_amount !== undefined && invoice.total_amount !== null ? invoice.total_amount.toFixed(2) : '-'} {serviceCurrency}
                            </TableCell>
                        </TableRow>
                    </TableBody>
            </Table>
            </TableContainer>
        <Box mb={2} sx={{marginTop:'20px'}}>
          <Typography variant="body1"><strong>TERMS & CONDITION:  {invoice.terms}</strong></Typography>
        </Box>
      </Box>
    </Box>
    );
});


export default PrintFromInvoice;


