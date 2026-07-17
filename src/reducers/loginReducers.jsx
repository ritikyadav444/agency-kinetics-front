 import {
      ALL_COMBINED_FAIL,
    ALL_COMBINED_REQUEST,
    ALL_COMBINED_SUCCESS,

    ADMIN_COMBINED_REQUEST,
    ADMIN_COMBINED_SUCCESS,
    ADMIN_COMBINED_FAIL,
  LOGIN_MEMBER_REQUEST,
  LOGIN_MEMBER_SUCCESS,
  LOGIN_MEMBER_FAIL,
  LOGOUT_MEMBER_SUCCESS,
  LOGOUT_MEMBER_FAIL,
  LOAD_MEMBER_REQUEST,
  LOAD_MEMBER_SUCCESS,
  LOAD_MEMBER_FAIL,
  SET_SIDEBAR_VISIBILITY,
  CLEAR_ERRORS,
  SET_AUTHENTICATION,
} from "../constants/loginConstants";
 

export const memberLoginReducer = (state = {error:null,  combined: {}, showSidebar: false, isAuthenticated:false }, action) => {
switch (action.type) {
    case LOGIN_MEMBER_REQUEST:
    case LOAD_MEMBER_REQUEST:
      return {
        loading: true,
        isAuthenticated: false,
        error:null,
        showSidebar:false,
        combined:null
      };
    case LOGIN_MEMBER_SUCCESS:
    case LOAD_MEMBER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        combined: action.payload,
        workspace_name: action.payload.workspace_name,
        showSidebar:true,
        userRole: action.payload.user.role,
        // error:null,
        success: action.payload.success
      };
      case SET_SIDEBAR_VISIBILITY:
        // console.log(action.payload)
      return {
        ...state,
        showSidebar: action.payload,
      };
      case SET_AUTHENTICATION:
      return {
        ...state,
        isAuthenticated: action.payload,
      };
case LOGOUT_MEMBER_SUCCESS:
  // console.log(action.payload)
  return{
    loading: false, 
    combined:null,
    isAuthenticated: false,
    showSidebar: false,
  }
    case LOGIN_MEMBER_FAIL:
      // console.log(action.payload)
      return {
        // ...state,
        loading: false,
        isAuthenticated: false,
        combined: null,
        showSidebar:false,
        error: action.payload,
      };

    case LOAD_MEMBER_FAIL:
      return {
        loading: false,
        isAuthenticated: false,
        combined: null,
        error: action.payload,
      };

case LOGOUT_MEMBER_FAIL:
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

  //get all
  export const combinedReducer = (state = { combined: [] }, action) => {
    switch (action.type) {
      case ALL_COMBINED_REQUEST:
      case ADMIN_COMBINED_REQUEST:
  
        return {
          loading: true,
          combined: [],
        };
      case ALL_COMBINED_SUCCESS:
        return {
          loading: false,
         combined: action.payload.combined,
        };
  
      case ADMIN_COMBINED_SUCCESS:
        return {
          loading: false,
         combined: action.payload,
        };
  
      case ALL_COMBINED_FAIL:
      case ADMIN_COMBINED_FAIL:
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