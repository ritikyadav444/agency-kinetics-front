import {
  ALL_SERVICE_FAIL,
  ALL_SERVICE_REQUEST,
  ALL_SERVICE_SUCCESS,
  SERVICE_DETAILS_FAIL,
  SERVICE_DETAILS_REQUEST,
  SERVICE_DETAILS_SUCCESS,
  NEW_SERVICE_REQUEST,
  NEW_SERVICE_RESET,
  NEW_SERVICE_SUCCESS,
  NEW_SERVICE_FAIL,
  DELETE_SERVICE_REQUEST,
  DELETE_SERVICE_RESET,
  DELETE_SERVICE_SUCCESS,
  DELETE_SERVICE_FAIL,
  ADMIN_SERVICE_REQUEST,
  ADMIN_SERVICE_SUCCESS,
  ADMIN_SERVICE_FAIL,
  UPDATE_SERVICE_REQUEST,
  UPDATE_SERVICE_SUCCESS,
  UPDATE_SERVICE_FAIL,
  UPDATE_SERVICE_RESET,
  CLEAR_ERRORS,

 
} from "../constants/serviceConstant";

//get all
export const servicesReducer = (state = { services: [] }, action) => {
  switch (action.type) {
    case ALL_SERVICE_REQUEST:
    case ADMIN_SERVICE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case ALL_SERVICE_SUCCESS:
      return {
        loading: false,
       services: action.payload.services,
      };
    case ADMIN_SERVICE_SUCCESS:
      return {
        loading: false,
        services: action.payload,
      };

    case ALL_SERVICE_FAIL:
    case ADMIN_SERVICE_FAIL:

      return {
        loading: false,
        error: action.payload.message,
        services: action.payload.services
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
export const servicesDetailsReducer = (state = { service: {}, services: [] }, action) => {
  switch (action.type) {
    case SERVICE_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
          };
    case SERVICE_DETAILS_SUCCESS:
      return {
        loading: false,
       service: action.payload,
      };


    case SERVICE_DETAILS_FAIL:
      return {
        loading: false,
        error: action.payload.message,
        services: action.payload.services
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
  export const newServiceReducer = (state = { service: {}, services: [] }, action) => {
    switch (action.type) {
      case NEW_SERVICE_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case NEW_SERVICE_SUCCESS:
        return {
          loading: false,
          success: action.payload,
          service: action.payload.service,
        };
      case NEW_SERVICE_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload.message,
          services: action.payload.services
        };
      case NEW_SERVICE_RESET:
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
export const serviceDUReducer = (state = {services: []}, action) => {
  switch (action.type) {
    case DELETE_SERVICE_REQUEST:
      case UPDATE_SERVICE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case DELETE_SERVICE_SUCCESS:
      return {
        ...state,
        loading: false,
        isDeleted: action.payload,
      };   
      case UPDATE_SERVICE_SUCCESS:
        return {
          ...state,
          loading: false,
          isUpdated: action.payload,
        };    
    case DELETE_SERVICE_FAIL:
      return {
        ...state,
        loading: false,
        deleteError: action.payload.message,
        services: action.payload.services
      };
      case UPDATE_SERVICE_FAIL:
      return {
        ...state,
        loading: false,
        updateError: action.payload.message,
        services: action.payload.services
      };
    case DELETE_SERVICE_RESET:
      return {
        ...state,
        isDeleted: false,
      };
      case UPDATE_SERVICE_RESET:
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
