import React, { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PrintQuote = forwardRef(({ quote, clientNamesMap, serviceNamesMap, superAdminId }, ref) => {

    return (
        <div id="quote-content">
        <Box ref={ref} sx={{ paddingTop:'150px', marginLeft:'50px', marginRight:'50px' }}>
            <Box mb={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    {superAdminId && superAdminId.company_img && superAdminId.company_SuperName ? (
                        <Box display="flex" alignItems="center">
                            <img src={superAdminId.company_img} alt="Company Logo" style={{ maxHeight: '100px', maxWidth:'150px', marginRight: '16px' }} />
                            <Typography variant="h5" fontWeight="bold">
                                {superAdminId.company_SuperName}
                            </Typography>
                        </Box>
                    ) : null}
                    <Typography variant="h4">PROPOSAL</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={4}>
                    <Box>
                        <Typography variant="body1"><strong>Proposal to:</strong></Typography>
                        <Typography variant="body1">
                            {clientNamesMap[quote.clientId] === undefined
                                ? <span style={{ color: 'red' }}>Client Deleted</span>
                                : (clientNamesMap[quote.clientId].companyname === '')
                                    ? 'Unnamed client'
                                    : clientNamesMap[quote.clientId].companyname}
                        </Typography>
                        <Typography variant="body1">
                            {`${clientNamesMap[quote.clientId] ? clientNamesMap[quote.clientId].city : ""},
                              ${clientNamesMap[quote.clientId] ? clientNamesMap[quote.clientId].state : ""},
                              ${clientNamesMap[quote.clientId] ? clientNamesMap[quote.clientId].country : ""}`}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body1"><strong>Proposal#</strong> {quote.quoteId}</Typography>
                        <Typography variant="body1"><strong>Created On:</strong> {new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</Typography>
                    </Box>
                </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold' }}>Duration</TableCell>
                                    <TableCell sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold' }}>Service Description</TableCell>
                                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold' }}>Quantity</TableCell>
                                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc', fontWeight: 'bold' }}>Budget</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ borderRight: '2px solid #ccc' }}>
                                        {quote.value ? quote.value : null} {quote.unit ? quote.unit : null}
                                    </TableCell>
                                    <TableCell sx={{ borderRight: '2px solid #ccc' }}>
                                        {serviceNamesMap[quote.serviceId]?.service_name ? serviceNamesMap[quote.serviceId].service_name : null}
                                    </TableCell>
                                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc' }}>
                                        {quote.quantity ? quote.quantity : null}
                                    </TableCell>
                                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc' }}>
                                        {quote.budget ? quote.budget : null}
                                    </TableCell>
                                    <TableCell align="center">
                                        {quote.budget && quote.quantity ? quote.budget * quote.quantity : null} 
                                        {serviceNamesMap[quote.serviceId]?.currency ? ` ${serviceNamesMap[quote.serviceId].currency}` : null}
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell align="center" colSpan={3} sx={{ borderRight: 'none', borderTop: '2px solid #ccc' }} />
                                    <TableCell align="center" sx={{ borderRight: '2px solid #ccc', borderTop: '2px solid #ccc', fontWeight: 'bold' }}>
                                        Total
                                    </TableCell>
                                    <TableCell align="center" sx={{ borderTop: '2px solid #ccc' }}>
                                        {quote.budget && quote.quantity ? quote.budget * quote.quantity : null} 
                                        {serviceNamesMap[quote.serviceId]?.currency ? ` ${serviceNamesMap[quote.serviceId].currency}` : null}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

            </Box>
        </Box>
        </div>

    );
});

export default PrintQuote;
