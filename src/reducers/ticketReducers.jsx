import {
  ALL_TICKET_FAIL,
  ALL_TICKET_REQUEST,
  ALL_TICKET_SUCCESS,
  ADMIN_TICKET_REQUEST,
  ADMIN_TICKET_SUCCESS,
  ADMIN_TICKET_FAIL,
  TICKET_DETAILS_FAIL,
  TICKET_DETAILS_REQUEST,
  TICKET_DETAILS_SUCCESS,
  NEW_TICKET_REQUEST,
  NEW_TICKET_SUCCESS,
  NEW_TICKET_FAIL,
  NEW_TICKET_RESET,
  DELETE_TICKET_FAIL,
  DELETE_TICKET_REQUEST,
  DELETE_TICKET_SUCCESS,
  DELETE_TICKET_RESET,
  UPDATE_TICKET_FAIL,
  UPDATE_TICKET_REQUEST,
  UPDATE_TICKET_RESET,
  UPDATE_TICKET_SUCCESS,
  CLEAR_ERRORS,
  } from "../constants/ticketConstants";
  
  
//get all
export const ticketReducer = (state = { tickets: [] }, action) => {
  switch (action.type) {
    case ALL_TICKET_REQUEST:
    case ADMIN_TICKET_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case ALL_TICKET_SUCCESS:
      return {
        loading: false,
        tickets: action.payload.tickets,
      };
    case ADMIN_TICKET_SUCCESS:
      return {
        loading: false,
        tickets: action.payload,
      };

    case ALL_TICKET_FAIL:
    case ADMIN_TICKET_FAIL:

      return {
        loading: false,
        error: action.payload.message,
        tickets: action.payload.tickets
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
export const ticketDetailsReducer = (state = { ticket: {}, tickets: [] }, action) => {
  switch (action.type) {
    case TICKET_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case TICKET_DETAILS_SUCCESS:
      return {
        loading: false,
        ticket: action.payload,
      };
    case TICKET_DETAILS_FAIL:
      return {
        loading: false,
        error: action.payload.message,
        tickets: action.payload.tickets
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
  export const newTicketReducer = (state = { ticket: {}, tickets: [] }, action) => {
    switch (action.type) {
      case NEW_TICKET_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case NEW_TICKET_SUCCESS:
        return {
          loading: false,
          success: action.payload,
          ticket: action.payload.ticket,
        };
      case NEW_TICKET_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload.message,
          tickets: action.payload.tickets
        };
      case NEW_TICKET_RESET:
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
    export const ticketDUReducer = (state = {tickets: []}, action) => {
    switch (action.type) {
      case DELETE_TICKET_REQUEST:
        case UPDATE_TICKET_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case DELETE_TICKET_SUCCESS:
        return {
          ...state,
          loading: false,
          isDeleted: action.payload,
        };   
        case UPDATE_TICKET_SUCCESS:
          return {
            ...state,
            loading: false,
            isUpdated: action.payload,
          };    
      case DELETE_TICKET_FAIL:
        return {
          ...state,
          loading: false,
          deleteError: action.payload.message,
        tickets: action.payload.tickets
        };
        case UPDATE_TICKET_FAIL:
          return {
            ...state,
            loading: false,
            updateError: action.payload.message,
            tickets: action.payload.tickets
          };
      case DELETE_TICKET_RESET:
        return {
          ...state,
          isDeleted: false,
        };
        case UPDATE_TICKET_RESET:
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