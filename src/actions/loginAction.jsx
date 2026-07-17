import {
  LOGIN_MEMBER_REQUEST,
  LOGIN_MEMBER_SUCCESS,
  LOGIN_MEMBER_FAIL,
  LOGOUT_MEMBER_SUCCESS,
  LOGOUT_MEMBER_FAIL,
  ALL_COMBINED_FAIL,
  ALL_COMBINED_REQUEST,
  ALL_COMBINED_SUCCESS,
  ADMIN_COMBINED_REQUEST,
  ADMIN_COMBINED_SUCCESS,
  ADMIN_COMBINED_FAIL,
  LOAD_MEMBER_REQUEST,
  LOAD_MEMBER_SUCCESS,
  LOAD_MEMBER_FAIL,
  CLEAR_ERRORS,
  SET_SIDEBAR_VISIBILITY,
  SET_USER_ROLE,
  SET_AUTHENTICATION,
} from "../constants/loginConstants";
import axios from "axios";
import { baseURL, getConfig } from "../http";
import { getOrders } from "./orderAction";
import { getQuote } from "./quoteAction";
import { getTickets } from "./ticketAction";
import { getTeams } from "./teamAction";
import { getClient } from "./clientAction";
import { getInvoice } from "./invoiceAction";
import { getService } from "./serviceAction";
import { getTasks } from "./taskAction";
import { RESET_STATE } from "../constants/resetConstants";

export const loadMember = () => (dispatch) => {
  const expiresAt = localStorage.getItem("expiresAt");
  const authData = localStorage.getItem("authData");

  if (!authData) return;

  if (expiresAt && Date.now() > Number(expiresAt)) {
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("authData");
    return;
  }

  try {
    const parsed = JSON.parse(authData);
    dispatch({ type: LOAD_MEMBER_SUCCESS, payload: parsed });
  } catch {
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("authData");
  }
};

export const loginMember =
  (email, password, workspace_name) => async (dispatch) => {
    try {
      dispatch({ type: LOGIN_MEMBER_REQUEST });
      dispatch({ type: RESET_STATE });

      const config = getConfig();

      const { data } = await axios.post(
        `${baseURL}/api/v1/login`,
        { email, password, workspace_name },
        config
      );

      localStorage.setItem("expiresAt", data.expiresAt);

      let superAdminId = null;
      try {
        const { data: saData } = await axios.get(
          `${baseURL}/api/v1/combined/superAdminId/${workspace_name}`,
          config
        );
        superAdminId = saData.superadmin || null;
      } catch {
        // non-fatal
      }

      const authPayload = { ...data, workspace_name, superAdminId };
      localStorage.setItem("authData", JSON.stringify(authPayload));

      dispatch({
        type: LOGIN_MEMBER_SUCCESS,
        payload: authPayload,
      });

      if (data.user.role === "CLIENT") {
        dispatch(getOrders());
        dispatch(getQuote());
        dispatch(getService());
        dispatch(getInvoice());
        dispatch(getTickets());
      } else if (data.user.role === "SUPERADMIN") {
        dispatch(fetchSuperadminData());
      } else if (data.user.role === "ASSIGNEE") {
        dispatch(getOrders());
        dispatch(getTickets());
        dispatch(getService());
      } else if (data.user.role === "ADMIN") {
        dispatch(getOrders());
        dispatch(getQuote());
        dispatch(getTickets());
        dispatch(getTeams());
        dispatch(getClient());
        dispatch(getInvoice());
        dispatch(getService());
      } else if (data.user.role === "PROJECTMANAGER") {
        dispatch(getOrders());
        dispatch(getQuote());
        dispatch(getTickets());
        dispatch(getInvoice());
        dispatch(getService());
      }

      return { success: true, data };
    } catch (error) {
      console.error("Login Failed:", error);

      const errorMessage = error.response?.data?.message || "Login failed";

      dispatch({ type: LOGIN_MEMBER_FAIL, payload: errorMessage });
      dispatch({ type: SET_SIDEBAR_VISIBILITY, payload: false });
      dispatch({ type: SET_AUTHENTICATION, payload: false });

      return { success: false, error: errorMessage };
    }
  };

const fetchSuperadminData = () => async (dispatch) => {
  dispatch(getOrders());
  dispatch(getQuote());
  dispatch(getTickets());
  dispatch(getTeams());
  dispatch(getClient());
  dispatch(getInvoice());
  dispatch(getService());
};

export const logoutMember = () => async (dispatch) => {
  try {
    const config = getConfig();
    await axios.get(`${baseURL}/api/v1/combined/logout`, config);

    dispatch({ type: LOGOUT_MEMBER_SUCCESS, payload: false });
    dispatch({ type: SET_SIDEBAR_VISIBILITY, payload: false });
    dispatch({ type: SET_AUTHENTICATION, payload: false });

    localStorage.removeItem("expiresAt");
    localStorage.removeItem("authData");
  } catch (error) {
    dispatch({ type: LOGOUT_MEMBER_FAIL, payload: error });
    dispatch({ type: SET_SIDEBAR_VISIBILITY, payload: false });
    dispatch({ type: SET_AUTHENTICATION, payload: false });

    localStorage.removeItem("expiresAt");
    localStorage.removeItem("authData");
  }
};

export const setSidebarVisibility = (isVisible) => (dispatch) => {
  dispatch({
    type: SET_SIDEBAR_VISIBILITY,
    payload: isVisible,
  });
};
export const setAuthentication = (isAuthenticated) => (dispatch) => {
  dispatch({
    type: SET_AUTHENTICATION,
    payload: isAuthenticated,
  });
};

export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};

export const getCombined = () => async (dispatch) => {
  try {
    const config = getConfig();

    dispatch({ type: ALL_COMBINED_REQUEST });
    const { data } = await axios.get(`${baseURL}/api/v1/getAll`, config);
    dispatch({
      type: ALL_COMBINED_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ALL_COMBINED_FAIL,
      payload: error.response.data.message,
    });
  }
};
