import axios from "axios";
import { baseURL, getConfig } from '../http';
import {
  ALL_TEAM_FAIL,
  ALL_TEAM_REQUEST,
  ALL_TEAM_SUCCESS,
  TEAM_DETAILS_FAIL,
  TEAM_DETAILS_REQUEST,
  TEAM_DETAILS_SUCCESS,
  NEW_TEAM_REQUEST,
  NEW_TEAM_SUCCESS,
  NEW_TEAM_FAIL,
  DELETE_TEAM_REQUEST,
  DELETE_TEAM_SUCCESS,
  DELETE_TEAM_FAIL,
  ADMIN_TEAM_REQUEST,
  ADMIN_TEAM_SUCCESS,
  ADMIN_TEAM_FAIL,
  UPDATE_TEAM_REQUEST,
  UPDATE_TEAM_SUCCESS,
  UPDATE_TEAM_FAIL,
  LOGIN_TEAM_REQUEST,
  LOGIN_TEAM_SUCCESS,
  LOGIN_TEAM_FAIL,
  LOGOUT_TEAM_SUCCESS,
  LOGOUT_TEAM_FAIL,
  LOAD_TEAM_REQUEST,
  LOAD_TEAM_SUCCESS,
  LOAD_TEAM_FAIL,
  CLEAR_ERRORS,
  NEW_TEAM_ADD_REQUEST,
  NEW_TEAM_ADD_FAIL,
  NEW_TEAM_ADD_SUCCESS,

 
} from "../constants/teamConstants";



export const getTeams = ()=> async(dispatch)=>{
    try {
      const config = getConfig()

        dispatch({type:ALL_TEAM_REQUEST});
        const {data} = await axios.get(`${baseURL}/api/v1/getAllExceptClient`, config);
        //  console.log("data comTeam", data)
        dispatch({
            type:ALL_TEAM_SUCCESS,
            payload:data,
        })
    } catch (error) {
        dispatch({
            type:ALL_TEAM_FAIL,
            payload:error.response.data.message,
        })
    }
};
export const getTeamDetails = (id)=> async(dispatch)=>{
    try {
      const config = getConfig()

        dispatch({type:TEAM_DETAILS_REQUEST});
        const {data} = await axios.get(`${baseURL}/api/v1/get/team/${id}`, config);

        dispatch({
            type:TEAM_DETAILS_SUCCESS,
            payload:data.combined
        });

    } catch (error) {
        dispatch({
            type:TEAM_DETAILS_FAIL,
            payload:error.response.data.message,
        });
    }

};

//create
  export const createTeam = (teamData) => async (dispatch) => {
    try {
      dispatch({ type: NEW_TEAM_REQUEST });
  
      const config = getConfig()

      const { data } = await axios.post(`${baseURL}/api/v1/combined/newTeam`, teamData, config);
  // console.log("data team", data)
      dispatch({
        type: NEW_TEAM_SUCCESS,
        payload: data.success,
      });
    } catch (error) {
      dispatch({
        type: NEW_TEAM_FAIL,
        payload: error.response.data.message,
      });
    }
  };

  export const verifyTeamEmail = (token, fname , lname, password ) => async (dispatch) => {
    try {
      dispatch({ type: NEW_TEAM_ADD_REQUEST });
      const config = getConfig()

      const { data } = await axios.put(`${baseURL}/api/v1/combined/verifyTeam/${token}`,
        {
        fname, 
        lname,
        password
        },
        config
      );
      // console.log("team data", data)
      dispatch({ type: NEW_TEAM_ADD_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: NEW_TEAM_ADD_FAIL,
        payload: error.response.data.message,
      });
    }
  };

  //get admin service
    export const getAdminTeam = () => async (dispatch) => {
    try {
      dispatch({ type: ADMIN_TEAM_REQUEST });
      const config = getConfig()
  
      const { data } = await axios.get(`${baseURL}/api/v1/admin/services`, config);
  
      dispatch({
        type: ADMIN_TEAM_SUCCESS,
        payload: data.teams,
      });
    } catch (error) {
      dispatch({
        type: ADMIN_TEAM_FAIL,
        payload: error.response.data.message,
      });
    }
  };

  //update
  export const updateTeam = (id , teamData) => async (dispatch)=>{
  try{ 
    dispatch({type:UPDATE_TEAM_REQUEST});
    const config = getConfig()

    // console.log("sa",teamData)

    const {data} =await axios.put(`${baseURL}/api/v1/team/update/${id}`,
      teamData,
      config
    );
    dispatch({
      type: UPDATE_TEAM_SUCCESS,
      payload: data.success,
    });
    // console.log(teamData)
  } catch (error){
dispatch({
  type: UPDATE_TEAM_FAIL,
  payload: error.response.data.message,
});
  }
  };

  //delete
  export const deleteTeam = (id) => async (dispatch) => {
    try {
      dispatch({ type:DELETE_TEAM_REQUEST  });
      const config = getConfig()
  
      const { data } = await axios.delete(`${baseURL}/api/v1/member/delete/${id}`, config);
  
      dispatch({
        type: DELETE_TEAM_SUCCESS,
        payload: data.success,
      });
    } catch (error) {
      dispatch({
        type: DELETE_TEAM_FAIL,
        payload: error.response.data.message,
      });
    }
  };

export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};

//login
export const loginTeam = (team_email, team_password, team_createdUnder) => async (dispatch) => {
    try {
      dispatch({ type: LOGIN_TEAM_REQUEST });
      const config = getConfig()

      const { data } = await axios.post( `${baseURL}/api/v1/login/team`, { team_email, team_password, team_createdUnder },config);
  // console.log("sas",data)
      dispatch({ type: LOGIN_TEAM_SUCCESS, 
        payload: data });
    } catch (error) {
      dispatch({ type: LOGIN_TEAM_FAIL, 
        payload: error.response.data.message });
    };
  };

    export const logout = () => async (dispatch) => {
    try {  
      const config = getConfig()

await axios.get(`${baseURL}/api/v1/team/logout`, config);
  
      dispatch({ type: LOGOUT_TEAM_SUCCESS});
    } catch (error) {
      dispatch({ type: LOGOUT_TEAM_FAIL, payload: error.response.data.message });
    };
  };