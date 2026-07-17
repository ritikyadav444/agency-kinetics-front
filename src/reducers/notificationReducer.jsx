import { combineReducers } from 'redux';
import {
  GET_ALL_NOTIFICATIONS_REQUEST,
  GET_ALL_NOTIFICATIONS_SUCCESS,
  GET_ALL_NOTIFICATIONS_FAIL,
  CREATE_NOTIFICATION_REQUEST,
  CREATE_NOTIFICATION_SUCCESS,
  CREATE_NOTIFICATION_FAIL,
  DELETE_NOTIFICATION_REQUEST,
  DELETE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_FAIL,
  CLEAR_NOTIFICATIONS_REQUEST,
  CLEAR_NOTIFICATIONS_SUCCESS,
  CLEAR_NOTIFICATIONS_FAIL,
  MARK_ALL_NOTIFICATIONS_AS_READ_REQUEST,
  MARK_ALL_NOTIFICATIONS_AS_READ_SUCCESS,
  MARK_ALL_NOTIFICATIONS_AS_READ_FAIL,
} from '../constants/notificationConstants';

// Initial state for each part of notifications
const initialGetAllNotificationsState = {
  loading: false,
  notifications: [],
  error: null,
};

const initialCreateNotificationState = {
  loading: false,
  error: null,
};


export const getAllNotificationsReducer = (state = initialGetAllNotificationsState, action) => {
  switch (action.type) {
    case GET_ALL_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_ALL_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload,
      };
    case GET_ALL_NOTIFICATIONS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case MARK_ALL_NOTIFICATIONS_AS_READ_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case MARK_ALL_NOTIFICATIONS_AS_READ_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: state.notifications.map(notification => ({
          ...notification,
          markAsRead: true,
        })),
      };
    case MARK_ALL_NOTIFICATIONS_AS_READ_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Reducer for creating notifications
export const createNotificationReducer = (state = initialCreateNotificationState, action) => {
  switch (action.type) {
    case CREATE_NOTIFICATION_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CREATE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
      };
    case CREATE_NOTIFICATION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Reducer for deleting notifications
export const deleteNotificationReducer = (state = { notifications: [] }, action) => {
  switch (action.type) {
    case DELETE_NOTIFICATION_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case DELETE_NOTIFICATION_SUCCESS:
      // console.log(action.payload)

      return {
        ...state,
        loading: false,
        notifications: action.payload, // Update the state with the new list of notifications
      };
    case DELETE_NOTIFICATION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Reducer for clearing all notifications
export const clearNotificationsReducer = (state = initialGetAllNotificationsState, action) => {
  switch (action.type) {
    case CLEAR_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CLEAR_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: [],
      };
    case CLEAR_NOTIFICATIONS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};


const notificationReducer = combineReducers({
  getAllNotifications: getAllNotificationsReducer,
  createNotification: createNotificationReducer,
  deleteNotification: deleteNotificationReducer,
  clearNotifications: clearNotificationsReducer,
  // Other reducers here
});

export default notificationReducer;