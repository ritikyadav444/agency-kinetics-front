import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const IdleTimer = ({ timeout, onLogout }) => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef(null);
  const lastMoveRef = useRef(0);
  const navigate = useNavigate();

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    setIsIdle(false);
    timerRef.current = setTimeout(() => setIsIdle(true), timeout);
  }, [timeout]);

  const throttledResetTimer = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveRef.current < 1000) return;
    lastMoveRef.current = now;
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    window.addEventListener('mousemove', throttledResetTimer);
    window.addEventListener('keydown', resetTimer);

    timerRef.current = setTimeout(() => setIsIdle(true), timeout);

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', throttledResetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [timeout, resetTimer, throttledResetTimer]);

  useEffect(() => {
    if (isIdle) {
      onLogout();
      navigate('/login');
      resetTimer();
    }
  }, [isIdle, onLogout, navigate, resetTimer]);

  return null;
};

export default IdleTimer;
