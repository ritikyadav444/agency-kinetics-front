
import React, { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';


const PrintInvoice = forwardRef(({ invoice, ordersMap, servicesMap, clientNamesMap, superAdminId }, ref) => {
    // console.log(superAdminId,invoice)
    let serviceCurrency = '';
    return (
    <Box ref={ref} sx={{
      // marginTop:'150px',
      paddingTop:'150px',
      marginLeft:'50px',
      marginRight:'50px',
  }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
         {superAdminId && superAdminId.company_img && superAdminId.company_SuperName ? (
              <Box display="flex" alignItems="center">
                <img src={superAdminId.company_img} alt="Company Logo" style={{ maxHeight: '100px', maxWidth:'150px', marginRight: '16px' }} />
                <Typography variant="h5" fontWeight="bold">{superAdminId.company_SuperName}</Typography>
              </Box>
            ) : (
              null
            )}
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
            <Typography variant="body1"><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</Typography>
          </Box>
        </Box>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>Order ID</TableCell>
                    <TableCell sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>Service Description</TableCell>
                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>Unit Price</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: '2px solid #ccc',  }}>Total</TableCell>
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
                
                {invoice.amount !== undefined && invoice.amount !== null && invoice.amount !== 0 && (
                    <TableRow>
                        <TableCell align="center" colSpan={3} sx={{ borderRight: 'none', borderTop: '2px solid #ccc' }} />
                        <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', borderTop: '2px solid #ccc', fontWeight: 'bold' }}>
                            Subtotal
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '2px solid #ccc', borderTop: '2px solid #ccc' }}>
                            {invoice.amount.toFixed(2)} {serviceCurrency}
                        </TableCell>
                    </TableRow>
                )}

                {invoice.discount_percentage !== undefined && invoice.discount_percentage !== null && invoice.discount_percentage !== 0 && (
                    <TableRow>
                        <TableCell align="center" colSpan={3} sx={{ borderRight: '2px solid #ccc', borderTop: '2px solid #ccc' }} />
                        <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>
                            Discount ({invoice.discount_percentage.toFixed(2)}%)
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '2px solid #ccc' }}>
                            {invoice.discount_amount !== undefined && invoice.discount_amount !== null ? invoice.discount_amount.toFixed(2) : '-'}
                        </TableCell>
                    </TableRow>
                )}

                {invoice.tax_percentage !== undefined && invoice.tax_percentage !== null && invoice.tax_percentage !== 0 && (
                    <TableRow>
                        <TableCell align="center" colSpan={3} sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc' }} />
                        <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderBottom: '2px solid #ccc', fontWeight: 'bold' }}>
                            VAT/Tax ({invoice.tax_percentage.toFixed(2)}%)
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '2px solid #ccc' }}>
                            {invoice.tax_amount !== undefined && invoice.tax_amount !== null ? invoice.tax_amount.toFixed(2) : '-'}
                        </TableCell>
                    </TableRow>
                )}

                {invoice.total_amount !== undefined && invoice.total_amount !== null && invoice.total_amount !== 0 && (
                    <TableRow>
                        <TableCell align="center" colSpan={3} sx={{  borderTop: '2px solid #ccc' }}/>
                        <TableCell align="center" sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold', borderLeft:'none' }}>Total</TableCell>
                        <TableCell align="center">
                            {invoice.total_amount.toFixed(2)} {serviceCurrency}
                        </TableCell>
                    </TableRow>
                )}

                </TableBody>
            </Table>
            </TableContainer>

        <Box mb={2} sx={{marginTop:'20px'}}>
          <Typography variant="body1"><strong>TERMS & CONDITION: {invoice.terms}</strong></Typography>
        </Box>
      </Box>
    </Box>
    );
});


export default PrintInvoice;
