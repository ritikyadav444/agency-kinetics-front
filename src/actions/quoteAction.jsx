import axios from "axios";
import { baseURL, getConfig } from '../http';
import {
  ALL_QUOTE_FAIL,
  ALL_QUOTE_REQUEST,
  ALL_QUOTE_SUCCESS,
  QUOTE_DETAILS_FAIL,
  QUOTE_DETAILS_REQUEST,
  QUOTE_DETAILS_SUCCESS,
  NEW_QUOTE_REQUEST,
  NEW_QUOTE_SUCCESS,
  NEW_QUOTE_FAIL,
  DELETE_QUOTE_REQUEST,
  DELETE_QUOTE_SUCCESS,
  DELETE_QUOTE_FAIL,
  ADMIN_QUOTE_REQUEST,
  ADMIN_QUOTE_SUCCESS,
  ADMIN_QUOTE_FAIL,
  UPDATE_QUOTE_REQUEST,
  UPDATE_QUOTE_SUCCESS,
  UPDATE_QUOTE_FAIL,
  CLEAR_ERRORS,
} from "../constants/quoteConstants";



export const getQuote = ()=> async(dispatch)=>{
    try {
      const config = getConfig()
      dispatch({ type: ALL_QUOTE_REQUEST });
      const {data} = await axios.get(`${baseURL}/api/v1/quotes`, config);
      dispatch({
          type:ALL_QUOTE_SUCCESS,
          payload:data,
      })
    } catch (error) {
        dispatch({
            type:ALL_QUOTE_FAIL,
            payload:error.response?.data,
        })
    }
};

export const getQuoteDetails = (id)=> async(dispatch)=>{
  try {
    const config = getConfig()
    dispatch({ type: QUOTE_DETAILS_REQUEST });
      const {data} = await axios.get(`${baseURL}/api/v1/quote/${id}`, config);
      dispatch({
          type:QUOTE_DETAILS_SUCCESS,
          payload:data.quote
      })
  } catch (error) {
      dispatch({
          type:QUOTE_DETAILS_FAIL,
          payload:error.response?.data,
      })
  }
};

//create
  export const createQuote = (quoteData) => async (dispatch) => {
    try {
      const config = getConfig();
      dispatch({ type: NEW_QUOTE_REQUEST });
      const { data } = await axios.post(`${baseURL}/api/v1/new/quote`, quoteData, config);
  // console.log(data)
      dispatch({
        type: NEW_QUOTE_SUCCESS,
        payload: data,
      });
      return data
    } catch (error) {
      dispatch({
        type: NEW_QUOTE_FAIL,
        payload: error.response?.data,
      });
    }
  };


  //update
  export const updateQuote = (id , quoteData) => async (dispatch)=>{
    try{
      const config = getConfig()
      dispatch({ type: UPDATE_QUOTE_REQUEST });
      const {data} = await axios.put(`${baseURL}/api/v1/quote/update/${id}`,
        quoteData,
        config
      );
      dispatch({
        type: UPDATE_QUOTE_SUCCESS,
        payload: data.success,
      });
      return data
    } catch (error){
        dispatch({
          type: UPDATE_QUOTE_FAIL,
          payload: error.response?.data,
        });
      }
  };

  //delete
  export const deleteQuote = (id) => async (dispatch) => {
    try {
      const config = getConfig()
      dispatch({ type: DELETE_QUOTE_REQUEST });
      const { data } = await axios.delete(`${baseURL}/api/v1/quote/delete/${id}`, config);
  
      dispatch({
        type: DELETE_QUOTE_SUCCESS,
        payload: data.success,
      });
    } catch (error) {
      dispatch({
        type: DELETE_QUOTE_FAIL,
        payload: error.response?.data,
      });
    }
  };
export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};