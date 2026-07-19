import {
  ALL_TICKET_FAIL,
  ALL_TICKET_REQUEST,
  ALL_TICKET_SUCCESS,
  ADMIN_TICKET_REQUEST,
  ADMIN_TICKET_SUCCESS,
  ADMIN_TICKET_FAIL,
  TICKET_DETAILS_FAIL,
  TICKET_DETAILS_REQUEST,
  TICKET_DETAILS_SUCCESS,
  NEW_TICKET_REQUEST,
  NEW_TICKET_SUCCESS,
  NEW_TICKET_FAIL,
  DELETE_TICKET_FAIL,
  DELETE_TICKET_REQUEST,
  DELETE_TICKET_SUCCESS,
  UPDATE_TICKET_FAIL,
  UPDATE_TICKET_REQUEST,
  UPDATE_TICKET_SUCCESS,
  CLEAR_ERRORS,
  } from "../constants/ticketConstants";
import axios from "axios";
import { baseURL, getConfig } from '../http';
  
  


//get ticket
export const getTickets = ()=> async(dispatch)=>{
    try {
        const config = getConfig()
        dispatch({ type: ALL_TICKET_REQUEST });
        const {data} = await axios.get(`${baseURL}/api/v1/tickets`, config);
        dispatch({
            type:ALL_TICKET_SUCCESS,
            payload:data,
        })
    } catch (error) {
        dispatch({
            type:ALL_TICKET_FAIL,
            payload:error.response?.data,
        })
    }
};
  
export const getTicketDetails = (id)=> async(dispatch)=>{
    try {
        const config = getConfig()
        dispatch({ type: TICKET_DETAILS_REQUEST });
        const {data} = await axios.get(`${baseURL}/api/v1/ticket/${id}`, config);
        // console.log(data)
        dispatch({
            type:TICKET_DETAILS_SUCCESS,
            payload:data.ticket
        })
    } catch (error) {
        dispatch({
            type:TICKET_DETAILS_FAIL,
            payload:error.response?.data,
        })
    }
};

export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};

//create
export const createTicket = (ticketData) => async (dispatch) => {
  try {
    const config = getConfig()
    dispatch({ type: NEW_TICKET_REQUEST });
    const { data } = await axios.post(`${baseURL}/api/v1/new/ticket`, ticketData, config);
    // console.log(data)
    // console.log(ticketData)
    dispatch({
      type: NEW_TICKET_SUCCESS,
      payload: data.success,
    });
    return data
  } catch (error) {
    dispatch({
      type: NEW_TICKET_FAIL,
      payload: error.response?.data,
    });
    return { error: error.response?.data?.message || error.message };
  }
};
  
//update
export const updateTicket = (id , ticketData) => async (dispatch)=>{
  try{
    const config = getConfig()
    dispatch({ type: UPDATE_TICKET_REQUEST });

    const {data} =await axios.put(`${baseURL}/api/v1/ticket/update/${id}`,
      ticketData,
      config
    );
    dispatch({
      type: UPDATE_TICKET_SUCCESS,
      payload: data.success,
    });
    return data

    } catch (error){
      dispatch({
      type: UPDATE_TICKET_FAIL,
      payload: error.response?.data,
      });
    }
};
  
//delete
export const deleteTicket = (id) => async (dispatch) => {
  try {
    const config = getConfig()
    dispatch({ type: DELETE_TICKET_REQUEST });
    const { data } = await axios.delete(`${baseURL}/api/v1/ticket/delete/${id}`, config);

    dispatch({
      type: DELETE_TICKET_SUCCESS,
      payload: data.success,
    });
  } catch (error) {
    dispatch({
      type: DELETE_TICKET_FAIL,
      payload: error.response?.data,
    });
  }
};