import {
  ALL_ORDER_FAIL,
  ALL_ORDER_REQUEST,
  ALL_ORDER_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  NEW_ORDER_REQUEST,
  NEW_ORDER_RESET,
  NEW_ORDER_SUCCESS,
  NEW_ORDER_FAIL,
  DELETE_ORDER_REQUEST,
  DELETE_ORDER_RESET,
  DELETE_ORDER_SUCCESS,
  DELETE_ORDER_FAIL,
  ADMIN_ORDER_REQUEST,
  ADMIN_ORDER_SUCCESS,
  ADMIN_ORDER_FAIL,
  UPDATE_ORDER_REQUEST,
  UPDATE_ORDER_SUCCESS,
  UPDATE_ORDER_FAIL,
  UPDATE_ORDER_RESET,
  CLEAR_ERRORS,

 
} from "../constants/orderConstants";

//get all
export const orderReducer = (state = { orders: [] }, action) => {
  switch (action.type) {
    case ALL_ORDER_REQUEST:
    case ADMIN_ORDER_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case ALL_ORDER_SUCCESS:
      return {
        loading: false,
       orders: action.payload.orders,
      };
    case ADMIN_ORDER_SUCCESS:
      return {
        loading: false,
        orders: action.payload,
      };

    case ALL_ORDER_FAIL:
    case ADMIN_ORDER_FAIL:

      return {
        loading: false,
        error: action.payload.message,
        orders: action.payload.orders
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
export const ordersDetailsReducer = (state = { order: {}, orders:[] }, action) => {
  switch (action.type) {
    case ORDER_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
        };
    case ORDER_DETAILS_SUCCESS:
      return {
        loading: false,
        order: action.payload,
      };


    case ORDER_DETAILS_FAIL:
      return {
        loading: false,
        error: action.payload.message,
        orders: action.payload.orders

      };

    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        loading:false
      };
    default:
      return state;
  }
};

//create
  export const newOrderReducer = (state = { order: {} }, action) => {
    switch (action.type) {
      case NEW_ORDER_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case NEW_ORDER_SUCCESS:
        return {
          loading: false,
          success: action.payload.success,
          order: action.payload.order,
        };
      case NEW_ORDER_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload.message,
          orders: action.payload.orders
        };
      case NEW_ORDER_RESET:
        return {
          ...state,
          success: false,
        };
      case CLEAR_ERRORS:
        return {
          ...state,
          error: null,
          loading:false
        };
      default:
        return state;
    }
  };
  
//delete or update
    export const orderDUReducer = (state = {}, action) => {
    switch (action.type) {
      case DELETE_ORDER_REQUEST:
        case UPDATE_ORDER_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case DELETE_ORDER_SUCCESS:
        return {
          ...state,
          loading: false,
          isDeleted: action.payload,
        };   
        case UPDATE_ORDER_SUCCESS:
          return {
            ...state,
            loading: false,
            isUpdated: action.payload,
          };    
      case DELETE_ORDER_FAIL:
        return {
          ...state,
          loading: false,
          deleteError: action.payload.message,
        orders: action.payload.orders
        };
        case UPDATE_ORDER_FAIL:
        return {
          ...state,
          loading: false,
          updateError: action.payload.message,
        orders: action.payload.orders
        };
      case DELETE_ORDER_RESET:
        return {
          ...state,
          isDeleted: false,
          loading:false

        };
        case UPDATE_ORDER_RESET:
          return {
            ...state,
            isUpdated: false,
            loading:false
          };
      case CLEAR_ERRORS:
        return {
          ...state,
          deleteError:null,
          updateError: null,
          loading:false
        };
      default:
        return state;
    }
  };
