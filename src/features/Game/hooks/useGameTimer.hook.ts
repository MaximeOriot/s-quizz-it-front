import { useState, useRef, useEffect, useCallback } from 'react';

interface UseGameTimerProps {
  initialTime: number;
  waitingForPlayers: boolean;
  onTimeUp: () => void;
}

export const useGameTimer = ({ initialTime, waitingForPlayers, onTimeUp }: UseGameTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef(initialTime);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(initialTime);
    timeLeftRef.current = initialTime;
  }, [clearTimer, initialTime]);

  const startTimer = useCallback(() => {
    if (waitingForPlayers) return;
    
    clearTimer();
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        
        if (newTime <= 0) {
          clearTimer();
          onTimeUp();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  }, [waitingForPlayers, clearTimer, onTimeUp]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    timeLeft,
    startTimer,
    resetTimer,
    clearTimer
  };
};
