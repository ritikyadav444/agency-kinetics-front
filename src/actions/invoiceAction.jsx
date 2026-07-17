import axios from "axios";
import {
  ALL_INVOICE_FAIL,
  ALL_INVOICE_REQUEST,
  ALL_INVOICE_SUCCESS,
  INVOICE_DETAILS_FAIL,
  INVOICE_DETAILS_SUCCESS,
  INVOICE_DETAILS_REQUEST,
  NEW_INVOICE_REQUEST,
  NEW_INVOICE_SUCCESS,
  NEW_INVOICE_FAIL,
  DELETE_INVOICE_REQUEST,
  DELETE_INVOICE_SUCCESS,
  DELETE_INVOICE_FAIL,
  ADMIN_INVOICE_REQUEST,
  ADMIN_INVOICE_SUCCESS,
  ADMIN_INVOICE_FAIL,
  UPDATE_INVOICE_REQUEST,
  UPDATE_INVOICE_SUCCESS,
  UPDATE_INVOICE_FAIL,
  CLEAR_ERRORS,
} from "../constants/invoicesConstants";
import { baseURL, getConfig } from '../http';

// Helper function to get config with JWT token


// Get all invoices
export const getInvoice = () => async (dispatch) => {
  try {
    const config = getConfig();
    dispatch({ type: ALL_INVOICE_REQUEST });
    const { data } = await axios.get(`${baseURL}/api/v1/invoices`, config);
    // console.log(data);
    dispatch({
      type: ALL_INVOICE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ALL_INVOICE_FAIL,
      payload: error.response?.data,
    });
  }
};

// Get invoice details
export const getInvoiceDetails = (id) => async (dispatch) => {
  try {
    const config = getConfig();
    dispatch({ type: INVOICE_DETAILS_REQUEST });
    const { data } = await axios.get(`${baseURL}/api/v1/invoice/${id}`, config);
    dispatch({
      type: INVOICE_DETAILS_SUCCESS,
      payload: data.invoice,
    });
  } catch (error) {
    dispatch({
      type: INVOICE_DETAILS_FAIL,
      payload: error.response?.data,
    });
  }
};

// Create invoice
export const createInvoice = (invoiceData) => async (dispatch) => {
  try {
    const config = getConfig();
    dispatch({ type: NEW_INVOICE_REQUEST });
    const { data } = await axios.post(`${baseURL}/api/v1/new/invoice`, invoiceData, config);
    // console.log("ID", data);
    dispatch({
      type: NEW_INVOICE_SUCCESS,
      payload: data.success,
    });
    return data
  } catch (error) {
    dispatch({
      type: NEW_INVOICE_FAIL,
      payload: error.response?.data,
    });
  }
};

// Update invoice
export const updateInvoice = (id, invoiceData) => async (dispatch) => {
  try {
    const config = getConfig();
    dispatch({ type: UPDATE_INVOICE_REQUEST });
    const { data } = await axios.put(`${baseURL}/api/v1/invoice/update/${id}`, invoiceData, config);
    dispatch({
      type: UPDATE_INVOICE_SUCCESS,
      payload: data,
    });
    return data

  } catch (error) {
    dispatch({
      type: UPDATE_INVOICE_FAIL,
      payload: error.response?.data,
    });
  }
};

// Delete invoice
export const deleteInvoice = (id) => async (dispatch) => {
  try {
    const config = getConfig();
    dispatch({ type: DELETE_INVOICE_REQUEST });
    const { data } = await axios.delete(`${baseURL}/api/v1/invoice/delete/${id}`, config);
    dispatch({
      type: DELETE_INVOICE_SUCCESS,
      payload: data.success,
    });
  } catch (error) {
    dispatch({
      type: DELETE_INVOICE_FAIL,
      payload: error.response?.data,
    });
  }
};

// Clear errors
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
