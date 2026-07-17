import {
  ALL_INVOICE_FAIL,
  ALL_INVOICE_REQUEST,
  ALL_INVOICE_SUCCESS,
  INVOICE_DETAILS_FAIL,
  INVOICE_DETAILS_SUCCESS,
  INVOICE_DETAILS_REQUEST,
  NEW_INVOICE_REQUEST,
  NEW_INVOICE_RESET,
  NEW_INVOICE_SUCCESS,
  NEW_INVOICE_FAIL,
  DELETE_INVOICE_REQUEST,
  DELETE_INVOICE_RESET,
  DELETE_INVOICE_SUCCESS,
  DELETE_INVOICE_FAIL,
  ADMIN_INVOICE_REQUEST,
  ADMIN_INVOICE_SUCCESS,
  ADMIN_INVOICE_FAIL,
  UPDATE_INVOICE_REQUEST,
  UPDATE_INVOICE_SUCCESS,
  UPDATE_INVOICE_FAIL,
  UPDATE_INVOICE_RESET,
  CLEAR_ERRORS,
} from "../constants/invoicesConstants";


//get all
export const invoiceReducer = (state = { invoices: [], error: null, loading:false }, action) => {
  switch (action.type) {
    case ALL_INVOICE_REQUEST:
    case ADMIN_INVOICE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ALL_INVOICE_SUCCESS:
// console.log('here2')

      return {
        loading: false,
       invoices: action.payload.invoices,
        error:null

      };
    case ADMIN_INVOICE_SUCCESS:
      return {
        loading: false,
        invoices: action.payload,
      };

    case ALL_INVOICE_FAIL:
    case ADMIN_INVOICE_FAIL:

      return {
        loading: false,
        error: action.payload.message,
        invoices: action.payload.invoices
      };

    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        loading:false,
      };
    default:
      return state;
  }
};


//get one
export const invoiceDetailsReducer = (state = { invoice: {}, invoices: [] }, action) => {
  switch (action.type) {
    case INVOICE_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
          };
    case INVOICE_DETAILS_SUCCESS:
      return {
        loading: false,
       invoice: action.payload,
      };


    case INVOICE_DETAILS_FAIL:
      return {
        loading: false,
        error: action.payload.message,
        invoices: action.payload.invoices
      };

    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        loading:false,
      };
    default:
      return state;
  }
};


//create
export const newInvoiceReducer = (state = { invoice: {}, invoices: [] }, action) => {
  switch (action.type) {
    case NEW_INVOICE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case NEW_INVOICE_SUCCESS:
      return {
        loading: false,
        success: action.payload,
        invoice: action.payload.invoice,
      };
    case NEW_INVOICE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload.message,
          invoices: action.payload.invoices
      };
    case NEW_INVOICE_RESET:
      return {
        ...state,
        success: false,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

//delete or update
  export const invoiceDUReducer = (state = {invoices: []}, action) => {
  switch (action.type) {
    case DELETE_INVOICE_REQUEST:
      case UPDATE_INVOICE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case DELETE_INVOICE_SUCCESS:
      return {
        ...state,
        loading: false,
        isDeleted: action.payload,
      };   
      case UPDATE_INVOICE_SUCCESS:
        return {
          ...state,
          loading: false,
          isUpdated: action.payload,
        };    
    case DELETE_INVOICE_FAIL:
      return {
        ...state,
        loading: false,
        deleteError: action.payload.message,
        invoices: action.payload.invoices
      };
      case UPDATE_INVOICE_FAIL:
        return {
          ...state,
          loading: false,
          updateError: action.payload.message,
          invoices: action.payload.invoices
        };
    case DELETE_INVOICE_RESET:
      return {
        ...state,
        isDeleted: false,
      };
      case UPDATE_INVOICE_RESET:
        return {
          ...state,
          isUpdated: false,
        };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        updateError: null,
        deleteError:null
      };
    default:
      return state;
  }
};