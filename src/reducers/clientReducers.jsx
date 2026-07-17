import {
  ALL_CLIENT_FAIL,
  ALL_CLIENT_REQUEST,
  ALL_CLIENT_SUCCESS,
  CLIENT_DETAILS_FAIL,
  CLIENT_DETAILS_REQUEST,
  CLIENT_DETAILS_SUCCESS,
  NEW_CLIENT_REQUEST,
  NEW_CLIENT_RESET,
  NEW_CLIENT_SUCCESS,
  NEW_CLIENT_FAIL,
  DELETE_CLIENT_REQUEST,
  DELETE_CLIENT_RESET,
  DELETE_CLIENT_SUCCESS,
  DELETE_CLIENT_FAIL,
  ADMIN_CLIENT_REQUEST,
  ADMIN_CLIENT_SUCCESS,
  ADMIN_CLIENT_FAIL,
  UPDATE_CLIENT_REQUEST,
  UPDATE_CLIENT_SUCCESS,
  UPDATE_CLIENT_FAIL,
  UPDATE_CLIENT_RESET,
  LOGIN_CLIENT_REQUEST,
  LOGIN_CLIENT_SUCCESS,
  LOGIN_CLIENT_FAIL,
  LOGOUT_CLIENT_SUCCESS,
  LOGOUT_CLIENT_FAIL,
  LOAD_CLIENT_REQUEST,
  LOAD_CLIENT_SUCCESS,
  LOAD_CLIENT_FAIL,
  CLEAR_ERRORS,
} from "../constants/clientsConstants";


//get all
export const clientReducer = (state = { combined: [] }, action) => {
  switch (action.type) {
    case ALL_CLIENT_REQUEST:
    case ADMIN_CLIENT_REQUEST:

      return {
        loading: true,
        combined: [],
      };
    case ALL_CLIENT_SUCCESS:
      return {
        loading: false,
       combined: action.payload.combined,
      };
    case ADMIN_CLIENT_SUCCESS:
      return {
        loading: false,
        combined: action.payload,
      };

    case ALL_CLIENT_FAIL:
    case ADMIN_CLIENT_FAIL:

      return {
        loading: false,
        error: action.payload.message,
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

//get one
export const clientDetailsReducer = (state = { error: null, combined: {} }, action) => {
  switch (action.type) {
    case CLIENT_DETAILS_REQUEST:
      return {
        loading: true,
        ...state,

      };
    case CLIENT_DETAILS_SUCCESS:
      return {
        loading: false,
        combined: action.payload,
      };
    case CLIENT_DETAILS_FAIL:
      return {
        loading: false,
        error: action.payload,
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



//create
export const newClientReducer = (state = { combined: {}, success:false }, action) => {
  switch (action.type) {
    case NEW_CLIENT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case NEW_CLIENT_SUCCESS:
      return {
        loading: false,
        success: action.payload.success,
        combined: action.payload.client,
      };
    case NEW_CLIENT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case NEW_CLIENT_RESET:
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
  export const clientDUReducer = (state = {}, action) => {
  switch (action.type) {
    case DELETE_CLIENT_REQUEST:
      case UPDATE_CLIENT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case DELETE_CLIENT_SUCCESS:
      return {
        ...state,
        loading: false,
        isDeleted: action.payload,
      };   
      case UPDATE_CLIENT_SUCCESS:
        return {
          ...state,
          loading: false,
          isUpdated: action.payload,
        };    
    case DELETE_CLIENT_FAIL:
      case UPDATE_CLIENT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case DELETE_CLIENT_RESET:
      return {
        ...state,
        isDeleted: false,
      };
      case UPDATE_CLIENT_RESET:
        return {
          ...state,
          isUpdated: false,
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

export const clientLoginReducer = (state = { combined: {} }, action) => {
switch (action.type) {
    case LOGIN_CLIENT_REQUEST:
    case LOAD_CLIENT_REQUEST:
      return {
        loading: true,
        isAuthenticated: false,
      };
    case LOGIN_CLIENT_SUCCESS:
    case LOAD_CLIENT_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        combined: action.payload,
      };
case LOGOUT_CLIENT_SUCCESS:
  return{
    loading: false, 
    combined:null,
    isAuthenticated: false,

  }
    case LOGIN_CLIENT_FAIL:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        combined: null,
        error: action.payload,
      };

    case LOAD_CLIENT_FAIL:
      return {
        loading: false,
        isAuthenticated: false,
        combined: null,
        error: action.payload,
      };

case LOGOUT_CLIENT_FAIL:
  return{
    ...state,
    loading:false,
    error:action.payload,
  }
            case CLEAR_ERRORS:
                return {
                    ...state,
                    error:null,
                };
    default:
return state;
}
}