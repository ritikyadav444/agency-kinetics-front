import {
  ALL_TEAM_FAIL,
  ALL_TEAM_REQUEST,
  ALL_TEAM_SUCCESS,
  TEAM_DETAILS_FAIL,
  TEAM_DETAILS_REQUEST,
  TEAM_DETAILS_SUCCESS,
  NEW_TEAM_REQUEST,
  NEW_TEAM_RESET,
  NEW_TEAM_SUCCESS,
  NEW_TEAM_FAIL,
  DELETE_TEAM_REQUEST,
  DELETE_TEAM_RESET,
  DELETE_TEAM_SUCCESS,
  DELETE_TEAM_FAIL,
  ADMIN_TEAM_REQUEST,
  ADMIN_TEAM_SUCCESS,
  ADMIN_TEAM_FAIL,
  UPDATE_TEAM_REQUEST,
  UPDATE_TEAM_SUCCESS,
  UPDATE_TEAM_FAIL,
  UPDATE_TEAM_RESET,
  LOGIN_TEAM_REQUEST,
  LOGIN_TEAM_SUCCESS,
  LOGIN_TEAM_FAIL,
  LOGOUT_TEAM_SUCCESS,
  LOGOUT_TEAM_FAIL,
  LOAD_TEAM_REQUEST,
  LOAD_TEAM_SUCCESS,
  LOAD_TEAM_FAIL,
  CLEAR_ERRORS,
  RESET_STATE,
  NEW_TEAM_ADD_REQUEST,
  NEW_TEAM_ADD_SUCCESS,
  NEW_TEAM_ADD_FAIL

 
} from "../constants/teamConstants";

export const resetState = () => ({
  type: RESET_STATE,
});

//get all
export const teamsReducer = (state = { combined: [] }, action) => {
  switch (action.type) {
    case ALL_TEAM_REQUEST:
    case ADMIN_TEAM_REQUEST:
      return {
        loading: true,
        combined: [],
      };
    case ALL_TEAM_SUCCESS:
      return {
        loading: false,
       combined: action.payload.combined,
      };
    case ADMIN_TEAM_SUCCESS:
      return {
        loading: false,
        combined: action.payload,
      };

    case ALL_TEAM_FAIL:
    case ADMIN_TEAM_FAIL:

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

//get one
export const teamsDetailsReducer = (state = { combined: {} }, action) => {
  switch (action.type) {
    case TEAM_DETAILS_REQUEST:
      return {
        loading: true,
      ...state,
          };
    case TEAM_DETAILS_SUCCESS:
      return {
        loading: false,
        combined: action.payload,
      };


    case TEAM_DETAILS_FAIL:
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
export const newTeamReducer = (state = { combined: {} }, action) => {
  switch (action.type) {
    case NEW_TEAM_REQUEST:
    case NEW_TEAM_ADD_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case NEW_TEAM_SUCCESS:
      return {
        loading: false,
        success: action.payload,
        combined: action.payload.team,
      };
         case NEW_TEAM_ADD_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload.success,
        combined: action.payload.team,
      };
    case NEW_TEAM_FAIL:
    case NEW_TEAM_ADD_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case NEW_TEAM_RESET:
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
    export const teamDUReducer = (state = {}, action) => {
    switch (action.type) {
      case DELETE_TEAM_REQUEST:
        case UPDATE_TEAM_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case DELETE_TEAM_SUCCESS:
        return {
          ...state,
          loading: false,
          isDeleted: action.payload,
        };   
        case UPDATE_TEAM_SUCCESS:
          return {
            ...state,
            loading: false,
            isUpdated: action.payload,
          };    
      case DELETE_TEAM_FAIL:
        case UPDATE_TEAM_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      case DELETE_TEAM_RESET:
        return {
          ...state,
          isDeleted: false,
        };
        case UPDATE_TEAM_RESET:
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


    export const teamLoginReducer = (state = { combined: {} }, action) => {
switch (action.type) {
    case LOGIN_TEAM_REQUEST:
    case LOAD_TEAM_REQUEST:
      return {
        loading: true,
        isAuthenticated: false,
      };
    case LOGIN_TEAM_SUCCESS:
    case LOAD_TEAM_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        combined: action.payload,
      };
case LOGOUT_TEAM_SUCCESS:
  return{
    loading: false, 
    combined:null,
    isAuthenticated: false,

  }
    case LOGIN_TEAM_FAIL:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        combined: null,
        error: action.payload,
      };

    case LOAD_TEAM_FAIL:
      return {
        loading: false,
        isAuthenticated: false,
        combined: null,
        error: action.payload,
      };

case LOGOUT_TEAM_FAIL:
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