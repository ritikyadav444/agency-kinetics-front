import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import {
  logoutMember,
  setSidebarVisibility,
  setAuthentication,
} from './actions/loginAction';
import { baseURL, getConfig } from './http';

const useSessionChecker = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/v1/checkSession`, getConfig());
        if (
          response.data.message === 'Session is inactive or expired. Please log in again.' ||
          response.status === 200
        ) {
          dispatch(setSidebarVisibility(false));
          dispatch(setAuthentication(false));
          dispatch(logoutMember());
          alert('Logout Successfully');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Session inactive. Logging out...', error);
        dispatch(setSidebarVisibility(false));
        dispatch(setAuthentication(false));
        dispatch(logoutMember());
        alert('Logout Successfully');
        window.location.href = '/login';
      }
    };

    const interval = setInterval(checkSession, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return null;
};

export default useSessionChecker;
