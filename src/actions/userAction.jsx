import axios from "axios";
import { baseURL, getConfig } from '../http';
import {
  ALL_USER_FAIL,
  ALL_USER_REQUEST,
  ALL_USER_SUCCESS,
  USER_DETAILS_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  NEW_USER_REQUEST,
  NEW_USER_SUCCESS,
  NEW_USER_FAIL,
  ADMIN_USER_REQUEST,
  ADMIN_USER_SUCCESS,
  ADMIN_USER_FAIL,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGOUT_USER_SUCCESS,
  LOGOUT_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_RESET,
    UPDATE_PROFILE_FAIL,
    UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_SUCCESS,
    UPDATE_PASSWORD_RESET,
    UPDATE_PASSWORD_FAIL,
    FORGOT_PASSWORD_REQUEST,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAIL,
    RESET_PASSWORD_REQUEST,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_FAIL,
  CLEAR_ERRORS,
  
} from "../constants/userConstant";



//get all
export const getUser = ()=> async(dispatch)=>{
    try {
        dispatch({type:ALL_USER_REQUEST});
        const config = getConfig()

        const {data} = await axios.get(`${baseURL}/api/v1/getAll`, config);
        dispatch({
            type:ALL_USER_SUCCESS,
            payload:data,
        })
    } catch (error) {
        dispatch({
            type:ALL_USER_FAIL,
            payload:error.response.data.message,
        })
    }
};
//get one
export const getUserDetails = (id)=> async(dispatch)=>{
    try {
      const config = getConfig()

        dispatch({type:USER_DETAILS_REQUEST});
        const {data} = await axios.get(`${baseURL}/api/v1/get/team/${id}`, config);
        // console.log(data)
        dispatch({
            type:USER_DETAILS_SUCCESS,
            payload:data.user
        })
    } catch (error) {
        dispatch({
            type:USER_DETAILS_FAIL,
            payload:error.response.data.message,
        })
    }
};

  //get admin user
    export const getAdminUser = () => async (dispatch) => {
    try {
      dispatch({ type: ADMIN_USER_REQUEST });
      const config = getConfig()
  
      const { data } = await axios.get(`${baseURL}/api/v1/admin/user`, config);
  
      dispatch({
        type: ADMIN_USER_SUCCESS,
        payload: data.user,
      });
    } catch (error) {
      dispatch({
        type: ADMIN_USER_FAIL,
        payload: error.response.data.message,
      });
    }
  };

  //create
  export const createUser = (userData) => async (dispatch) => {
    try {
      dispatch({ type: NEW_USER_REQUEST });
  
      const config = getConfig()

  
      // const { data } = await axios.post(`${baseURL}/api/v1/combined/newUser`, userData, config);
      const { data } = await axios.post(`${baseURL}/api/v1/signup`, userData, config);
  // console.log(data)
  // console.log(userData)
      dispatch({
        type: NEW_USER_SUCCESS,
        payload: data,
      });
      // console.log([...userData])
      
    } catch (error) {
      dispatch({
        type: NEW_USER_FAIL,
        payload: error.response.data.message,
      });
    }
  };



  //delete
  export const deleteUser = (id) => async (dispatch) => {
    try {
      dispatch({ type:DELETE_USER_REQUEST  });
      const config = getConfig()
  
      const { data } = await axios.delete(`${baseURL}/api/v1/user/${id}`, config);
  
      dispatch({
        type: DELETE_USER_SUCCESS,
        payload: data.success,
      });
    } catch (error) {
      dispatch({
        type: DELETE_USER_FAIL,
        payload: error.response.data.message,
      });
    }
  };
export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};

// //update
// export const updateUser = (id , userData) => async (dispatch)=>{
//   try{ 
//     const config = getConfig()

//     dispatch({type:UPDATE_USER_REQUEST});

//     console.log("us",userData)

//     const {data} =await axios.put(`${baseURL}/api/v1/user/update/${id}`,
//       userData,
//       config
//     );
//     dispatch({
//       type: UPDATE_USER_SUCCESS,
//       payload: data.success,
//     });
//     console.log(userData)
//   } catch (error){
// dispatch({
//   type: UPDATE_USER_FAIL,
//   payload: error.response.data.message,
// });
//   }
//   };
  //password update 
  export const updatePassword = (passwords) => async (dispatch) => {
    try {
      const config = getConfig()

      dispatch({type:UPDATE_PASSWORD_REQUEST});

      const {data} = await axios.put(`${baseURL}/api/v1/password/update`, passwords, config)
dispatch({type:UPDATE_PASSWORD_SUCCESS, payload: data.success});
    } catch (error) {
      // console.log(error)

      dispatch({
        type:UPDATE_PASSWORD_FAIL,
        payload: error.response.data.message,
      });
    };
  };


  //forgot password
export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch({ type: FORGOT_PASSWORD_REQUEST });

    const config = getConfig()
    const { data } = await axios.post(`${baseURL}/api/v1/password/forgot`, email, config);

    dispatch({ type: FORGOT_PASSWORD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FORGOT_PASSWORD_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Reset Password
export const resetPassword = (resetToken, passwords) => async (dispatch) => {
  try {
    dispatch({ type: RESET_PASSWORD_REQUEST });
    const config = getConfig()

    const { data } = await axios.put(`${baseURL}/api/v1/password/reset/${resetToken}`,
      passwords,
      config
    );
    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: RESET_PASSWORD_FAIL,
      payload: error.message,
    });
  }
};

//login
export const loginUser = (email, password, workspace) => async (dispatch) => {
    try {
      dispatch({ type: LOGIN_USER_REQUEST });
      const config = getConfig()

      const { data } = await axios.post( `${baseURL}/api/v1/login/user`, { email, password, workspace },config);
  // console.log("sas",data)
      dispatch({ type: LOGIN_USER_SUCCESS, 
        payload: data });
    } catch (error) {
      dispatch({ type: LOGIN_USER_FAIL, 
        payload: error.response.data.message });
    };
  };

    export const logout = () => async (dispatch) => {
    try {  
      const config = getConfig()
      
await axios.get(`${baseURL}/api/v1/user/logout`, config);
  
      dispatch({ type: LOGOUT_USER_SUCCESS});
    } catch (error) {
      dispatch({ type: LOGOUT_USER_FAIL, payload: error.response.data.message });
    };
  };


  //update
  export const updateUserLoggedIn = (id , userData) => async (dispatch)=>{
    try{ 
      dispatch({type:UPDATE_USER_REQUEST});
  const token = localStorage.getItem('jwt');
      const config = {
        headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        }
      };
      // console.log("UD from UA",userData)
  
      const {data} =await axios.put(`${baseURL}/api/v1/combined/updateUserLoggedIn/${id}`,
        userData,
        config
      );
      // console.log(data)
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: data.success,
      });
    } catch (error){
  dispatch({
    type: UPDATE_USER_FAIL,
    payload: error.response.data.message,
  });
    }
    };