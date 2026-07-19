import axios from "axios";
import { baseURL, getConfig } from '../http';
import {
  ALL_ORDER_FAIL,
  ALL_ORDER_REQUEST,
  ALL_ORDER_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  NEW_ORDER_REQUEST,
  NEW_ORDER_SUCCESS,
  NEW_ORDER_FAIL,
  DELETE_ORDER_REQUEST,
  DELETE_ORDER_SUCCESS,
  DELETE_ORDER_FAIL,
  ADMIN_ORDER_REQUEST,
  ADMIN_ORDER_SUCCESS,
  ADMIN_ORDER_FAIL,
  UPDATE_ORDER_REQUEST,
  UPDATE_ORDER_SUCCESS,
  UPDATE_ORDER_FAIL,
  CLEAR_ERRORS,
} from "../constants/orderConstants";



//get Order
export const getOrders = ()=> async(dispatch)=>{
    try {
        const config = getConfig()
        dispatch({ type: ALL_ORDER_REQUEST });
        const {data} = await axios.get(`${baseURL}/api/v1/orders`, config);
        // console.log(data)
        dispatch({
            type:ALL_ORDER_SUCCESS,
            payload:data,
        })
    } catch (error) {
        dispatch({
            type:ALL_ORDER_FAIL,
            payload:error.response?.data,
        })
    }
};

export const fetchOrders = async () => {
  try {
    const config = getConfig();
    const { data } = await axios.get(`${baseURL}/api/v1/orders`, config);
    return data.orders || [];
  } catch (error) {
    console.error("Error fetching orders:", error.response?.data);
    throw error;
  }
};

//get one Order
export const getOrderDetails = (id)=> async(dispatch)=>{
    try {
      const config = getConfig()
      dispatch({ type: ORDER_DETAILS_REQUEST });
        const {data} = await axios.get(`${baseURL}/api/v1/order/${id}`, config);
        dispatch({
            type:  ORDER_DETAILS_SUCCESS,
            payload:data.order
        })
        // console.log("ord", data)
    } catch (error) {
      // console.log('okoskok', error.response)
        dispatch({
            type:ORDER_DETAILS_FAIL,
            payload:error.response?.data,
        })
    }
};

//create
  export const createOrder = (orderData) => async (dispatch) => {
    try {
      const config = getConfig()
      dispatch({ type: NEW_ORDER_REQUEST });
      const { data } = await axios.post(`${baseURL}/api/v1/new/order`, orderData, config);
      dispatch({
        type: NEW_ORDER_SUCCESS,
        payload: data,
      });
      return data

    } catch (error) {
      dispatch({
        type: NEW_ORDER_FAIL,
        payload: error.response?.data,
      });
      return { error: error.response?.data?.message || error.message };
    }
  };

  //update
  export const updateOrder = (id , orderData) => async (dispatch)=>{
  try{
    const config = getConfig()
    dispatch({ type: UPDATE_ORDER_REQUEST });
    // console.log("or",orderData)

    const {data} =await axios.put(`${baseURL}/api/v1/order/update/${id}`,
      orderData,
      config
    );
    dispatch({
      type: UPDATE_ORDER_SUCCESS,
      payload: data.success,
    });
    return data
  } catch (error){
  dispatch({
    type: UPDATE_ORDER_FAIL,
    payload: error.response?.data,
  });
  }
  };

  //delete
  export const deleteOrder= (id) => async (dispatch) => {
    try {
      const config = getConfig()
      dispatch({ type: DELETE_ORDER_REQUEST });
      const { data } = await axios.delete(`${baseURL}/api/v1/order/delete/${id}`, config);
  
      dispatch({
        type: DELETE_ORDER_SUCCESS,
        payload: data.success,
      });
    } catch (error) {
      dispatch({
        type: DELETE_ORDER_FAIL,
        payload: error.response?.data,
      });
    }
  };

export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};