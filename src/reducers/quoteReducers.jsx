import {
  ALL_QUOTE_FAIL,
  ALL_QUOTE_REQUEST,
  ALL_QUOTE_SUCCESS,
  QUOTE_DETAILS_FAIL,
  QUOTE_DETAILS_REQUEST,
  QUOTE_DETAILS_SUCCESS,
  NEW_QUOTE_REQUEST,
  NEW_QUOTE_RESET,
  NEW_QUOTE_SUCCESS,
  NEW_QUOTE_FAIL,
  DELETE_QUOTE_REQUEST,
  DELETE_QUOTE_RESET,
  DELETE_QUOTE_SUCCESS,
  DELETE_QUOTE_FAIL,
  ADMIN_QUOTE_REQUEST,
  ADMIN_QUOTE_SUCCESS,
  ADMIN_QUOTE_FAIL,
  UPDATE_QUOTE_REQUEST,
  UPDATE_QUOTE_SUCCESS,
  UPDATE_QUOTE_FAIL,
  UPDATE_QUOTE_RESET,
  CLEAR_ERRORS,
} from "../constants/quoteConstants";

//get all
export const quotesReducer = (state = { quotes: [] }, action) => {
  switch (action.type) {
    case ALL_QUOTE_REQUEST:
    case ADMIN_QUOTE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case ALL_QUOTE_SUCCESS:
      return {
        loading: false,
       quotes: action.payload.quotes,
      };
    case ADMIN_QUOTE_SUCCESS:
      return {
        loading: false,
        quotes: action.payload,
      };

    case ALL_QUOTE_FAIL:
    case ADMIN_QUOTE_FAIL:

      return {
        loading: false,
        error: action.payload.message,
        quotes: action.payload.quotes
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
export const quotesDetailsReducer = (state = { quote: {},quotes: [] }, action) => {
  switch (action.type) {
    case QUOTE_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
          };
    case QUOTE_DETAILS_SUCCESS:
      return {
        loading: false,
       quote: action.payload,
      };


    case QUOTE_DETAILS_FAIL:
      return {
        loading: false,
        error: action.payload.message,
        quotes: action.payload.quotes
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
  export const newQuoteReducer = (state = { quote: {}, quotes: [] }, action) => {
    switch (action.type) {
      case NEW_QUOTE_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case NEW_QUOTE_SUCCESS:
        // console.log(action.payload)
        return {
          loading: false,
          success: action.payload,
          quote: action.payload.quote,
        };
      case NEW_QUOTE_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload.message,
          quotes: action.payload.quotes
        };
      case NEW_QUOTE_RESET:
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
export const quoteDUReducer = (state = {quotes: []}, action) => {
  switch (action.type) {
    case DELETE_QUOTE_REQUEST:
      case UPDATE_QUOTE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case DELETE_QUOTE_SUCCESS:
      return {
        ...state,
        loading: false,
        isDeleted: action.payload,
      };   
      case UPDATE_QUOTE_SUCCESS:
        return {
          ...state,
          loading: false,
          isUpdated: action.payload,
        };    
    case DELETE_QUOTE_FAIL:
      return {
        ...state,
        loading: false,
        deleteError: action.payload.message,
        quotes: action.payload.quotes
      };
      case UPDATE_QUOTE_FAIL:
        return {
          ...state,
          loading: false,
          updateError: action.payload.message,
          quotes: action.payload.quotes
        };
    case DELETE_QUOTE_RESET:
      return {
        ...state,
        isDeleted: false,
      };
      case UPDATE_QUOTE_RESET:
        return {
          ...state,
          isUpdated: false,
        };
    case CLEAR_ERRORS:
      return {
        ...state,
        updateError: null,
        deleteError:null
      };
    default:
      return state;
  }
};