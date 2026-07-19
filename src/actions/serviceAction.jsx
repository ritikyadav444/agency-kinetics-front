import axios from "axios";
import { baseURL, getConfig } from '../http';
import {
ALL_SERVICE_FAIL,
ALL_SERVICE_REQUEST,
ALL_SERVICE_SUCCESS,
SERVICE_DETAILS_FAIL,
SERVICE_DETAILS_REQUEST,
SERVICE_DETAILS_SUCCESS,
NEW_SERVICE_REQUEST,
NEW_SERVICE_SUCCESS,
NEW_SERVICE_FAIL,
ADMIN_SERVICE_REQUEST,
ADMIN_SERVICE_SUCCESS,
ADMIN_SERVICE_FAIL,
  DELETE_SERVICE_REQUEST,
  DELETE_SERVICE_SUCCESS,
  DELETE_SERVICE_FAIL,
  UPDATE_SERVICE_REQUEST,
  UPDATE_SERVICE_SUCCESS,
  UPDATE_SERVICE_FAIL,
CLEAR_ERRORS,
} from "../constants/serviceConstant";





// //get all
export const getService = ()=> async(dispatch)=>{
    try {
        const config = getConfig()
        dispatch({ type: ALL_SERVICE_REQUEST });
        const {data} = await axios.get(`${baseURL}/api/v1/services`, config);
        dispatch({
            type:ALL_SERVICE_SUCCESS,
            payload:data,
        })
    } catch (error) {
        dispatch({
            type:ALL_SERVICE_FAIL,
            payload:error.response?.data,
        })
    }
};

// //get one
export const getServiceDetails = (id)=> async(dispatch)=>{
    try {
        const config = getConfig()
        dispatch({ type: SERVICE_DETAILS_REQUEST });
        const {data} = await axios.get(`${baseURL}/api/v1/get/service/${id}`, config);
        dispatch({
            type:SERVICE_DETAILS_SUCCESS,
            payload:data.service
        });
        // console.log('gsd', data)

    } catch (error) {
        dispatch({
            type:SERVICE_DETAILS_FAIL,
            payload:error.response?.data,
        });
    }

};

//create
  export const createService = (serviceData) => async (dispatch) => {
    try {
      // console.log('sc',serviceData)
      const config = getConfig();
      dispatch({ type: NEW_SERVICE_REQUEST });
      const { data } = await axios.post(`${baseURL}/api/v1/new/service`, serviceData, config);
      // console.log("data", data)
      dispatch({
        type: NEW_SERVICE_SUCCESS,
        payload: data.success,
      });
      return data
    } catch (error) {
      dispatch({
        type: NEW_SERVICE_FAIL,
        payload: error.response?.data,
      });
      return { error: error.response?.data?.message || error.message };
    }
  };

  //update
  export const updateService = (id , serviceData) => async (dispatch)=>{
  try{
    const config = getConfig();
    dispatch({ type: UPDATE_SERVICE_REQUEST });
    // console.log("sa",serviceData)

    const {data} =await axios.put(`${baseURL}/api/v1/service/update/${id}`,
      serviceData,
      config
    );
    dispatch({
      type: UPDATE_SERVICE_SUCCESS,
      payload: data.success,
    });
    return data
  } catch (error){
      dispatch({
        type: UPDATE_SERVICE_FAIL,
        payload: error.response?.data,
      });
    }
  };

  //delete
  export const deleteService = (id) => async (dispatch) => {
    try {
        const config = getConfig()
        dispatch({ type: DELETE_SERVICE_REQUEST });
        const { data } = await axios.delete(  `${baseURL}/api/v1/service/delete/${id}`, config );
  
      dispatch({
        type: DELETE_SERVICE_SUCCESS,
        payload: data.success,
      });
    } catch (error) {
      dispatch({
        type: DELETE_SERVICE_FAIL,
        payload: error.response?.data,
      });
    }
  };

export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};