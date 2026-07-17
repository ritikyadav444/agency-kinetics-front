const initialState = {
    logMember: { loading: false, isAuthenticated: false, combined: {}, error: null },
    member: { loading: false, isAuthenticated: false, combined: {}, error: null },
  
    services: { loading: false, services: [], error: null },
    serviceDetails: { loading: false, service: {}, error: null },
    newService: { loading: false, success: false, service: {}, error: null },
    serviceDU: { loading: false, isDeleted: false, isUpdated: false, error: null },
  
    invoices: { loading: false, invoices: [], error: null },
    invoiceDetails: { loading: false, invoice: {}, error: null },
    newInvoice: { loading: false, success: false, invoice: {}, error: null },
    invoiceDU: { loading: false, isDeleted: false, isUpdated: false, error: null },
  
    users: { loading: false, users: [], error: null },
    userDetails: { loading: false, user: {}, error: null },
    newUser: { loading: false, success: false, user: {}, error: null },
    userDU: { loading: false, isDeleted: false, isUpdated: false, error: null },
    userlog: { loading: false, isAuthenticated: false, user: {}, error: null },
  
    clients: { loading: false, clients: [], error: null },
    clientDetails: { loading: false, client: {}, error: null },
    clientDU: { loading: false, isDeleted: false, isUpdated: false, error: null },
    newClient: { loading: false, success: false, client: {}, error: null },
    clientLog: { loading: false, isAuthenticated: false, client: {}, error: null },
  
    orders: { loading: false, orders: [], error: null },
    orderDetails: { loading: false, order: {}, error: null },
    newOrder: { loading: false, success: false, order: {}, error: null },
    orderDU: { loading: false, isDeleted: false, isUpdated: false, error: null },
  
    quotes: { loading: false, quotes: [], error: null },
    quoteDetails: { loading: false, quote: {}, error: null },
    newQuote: { loading: false, success: false, quote: {}, error: null },
    quoteDU: { loading: false, isDeleted: false, isUpdated: false, error: null },
  
    tickets: { loading: false, tickets: [], error: null },
    ticketDetails: { loading: false, ticket: {}, error: null },
    ticketDU: { loading: false, isDeleted: false, isUpdated: false, error: null },
    newTicket: { loading: false, success: false, ticket: {}, error: null },
  
    teams: { loading: false, combined: [], error: null },
    teamDetails: { loading: false, combined: {}, error: null },
    teamDU: { loading: false, isDeleted: false, isUpdated: false, error: null },
    newTeam: { loading: false, success: false, combined: {}, error: null },
    teamlog: { loading: false, isAuthenticated: false, combined: {}, error: null },
  };
  
  export default initialState;
  