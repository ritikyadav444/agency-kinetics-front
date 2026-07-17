import { useEffect, useState, useRef } from 'react';
import { logoutMember } from './loginAction';
import { SET_AUTHENTICATION, SET_SIDEBAR_VISIBILITY } from '../constants/loginConstants';
import { useDispatch } from 'react-redux';

const useSessionManager = (expiresAt) => {
  const dispatch = useDispatch();
  const [showWarning, setShowWarning] = useState(false);
  const logoutTimerRef = useRef(null);

  const handleSessionExpiration = () => {
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('authData');
    dispatch({ type: SET_SIDEBAR_VISIBILITY, payload: false });
    dispatch({ type: SET_AUTHENTICATION, payload: false });
    dispatch(logoutMember());
    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
  };

  const handleExtend = () => {
    clearTimeout(logoutTimerRef.current);
    const newExpiry = Date.now() + 30 * 60 * 1000;
    localStorage.setItem('expiresAt', newExpiry);
    setShowWarning(false);
  };

  useEffect(() => {
    if (!expiresAt) return;

    const warningTimeout = expiresAt - Date.now() - 30 * 1000;
    const logoutTimeout = expiresAt - Date.now();

    if (logoutTimeout <= 0) {
      handleSessionExpiration();
      return;
    }

    const warningTimer = setTimeout(() => {
      setShowWarning(true);
      clearTimeout(logoutTimerRef.current);
    }, warningTimeout);

    logoutTimerRef.current = setTimeout(() => {
      handleSessionExpiration();
    }, logoutTimeout);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimerRef.current);
    };
  }, [expiresAt]);

  return { showWarning, handleExtend, handleLogout: handleSessionExpiration };
};

export default useSessionManager;
