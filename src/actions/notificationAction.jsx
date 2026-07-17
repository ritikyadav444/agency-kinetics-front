import axios from 'axios';
import {
    CREATE_NOTIFICATION_REQUEST,
    CREATE_NOTIFICATION_SUCCESS,
    CREATE_NOTIFICATION_FAIL,
    DELETE_NOTIFICATION_REQUEST,
    DELETE_NOTIFICATION_SUCCESS,
    DELETE_NOTIFICATION_FAIL,
    CLEAR_NOTIFICATIONS_REQUEST,
    CLEAR_NOTIFICATIONS_SUCCESS,
    CLEAR_NOTIFICATIONS_FAIL,
    GET_ALL_NOTIFICATIONS_REQUEST,
    GET_ALL_NOTIFICATIONS_SUCCESS,
    GET_ALL_NOTIFICATIONS_FAIL,
    MARK_ALL_NOTIFICATIONS_AS_READ_REQUEST,
    MARK_ALL_NOTIFICATIONS_AS_READ_SUCCESS,
    MARK_ALL_NOTIFICATIONS_AS_READ_FAIL,
} from '../constants/notificationConstants';
import { baseURL, getConfig } from '../http';




// Action creator for creating a notification
export const createNotification = (userId, message, routeLink) => async (dispatch) => {
    const config = getConfig()
      
    dispatch({ type: CREATE_NOTIFICATION_REQUEST });
    try {
        const { data } = await axios.post(`${baseURL}/api/v1/notification/create`, { userId, message, routeLink }, config);
        dispatch({ type: CREATE_NOTIFICATION_SUCCESS, payload: data.notification });
    } catch (error) {
        dispatch({
            type: CREATE_NOTIFICATION_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

// Action creator for deleting a notification
export const deleteNotification = (notificationId) => async (dispatch) => {
  const config = getConfig()
    
  dispatch({ type: DELETE_NOTIFICATION_REQUEST });
    try {
      const { data } = await axios.delete(`${baseURL}/api/v1/notification/delete/${notificationId}`, config);
      // console.log(data)
        dispatch({ type: DELETE_NOTIFICATION_SUCCESS, payload: data.notifications });
    } catch (error) {
        dispatch({
            type: DELETE_NOTIFICATION_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

// Action creator for clearing all notifications for a user
export const clearNotificationsForUser = (userId) => async (dispatch) => {
  const config = getConfig()

  dispatch({ type: CLEAR_NOTIFICATIONS_REQUEST });
    try {
        await axios.delete(`${baseURL}/api/v1/notification/deleteAll/${userId}`, config);
        dispatch({ type: CLEAR_NOTIFICATIONS_SUCCESS });
    } catch (error) {
        dispatch({
            type: CLEAR_NOTIFICATIONS_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};


// Action creator for fetching all notifications for a specific user
export const getAllNotifications = (userId) => async (dispatch) => {
  const config = getConfig()
  
  dispatch({ type: GET_ALL_NOTIFICATIONS_REQUEST });
  try {
    const { data } = await axios.get(`${baseURL}/api/v1/notification/getByUserId/${userId}`, config);
    // console.log(data)
    dispatch({ type: GET_ALL_NOTIFICATIONS_SUCCESS, payload: data.notifications });
  } catch (error) {
    dispatch({
      type: GET_ALL_NOTIFICATIONS_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

export const markAllNotificationsAsRead = (userId) => async (dispatch) => {
  const config = getConfig()
  
  dispatch({ type: MARK_ALL_NOTIFICATIONS_AS_READ_REQUEST });
  try {
    const { data } = await axios.put(`${baseURL}/api/v1/notifications/markAllAsRead/${userId}`, {}, config);
    dispatch({ type: MARK_ALL_NOTIFICATIONS_AS_READ_SUCCESS, payload: data.notifications });
    // console.log(data)
  } catch (error) {
    dispatch({
      type: MARK_ALL_NOTIFICATIONS_AS_READ_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};
