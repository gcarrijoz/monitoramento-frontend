// hooks/useAlarmSound.ts
import { useEffect } from 'react';

export const useAlarmSound = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    
    const audio = new Audio('/sounds/alarm.mp3'); // Adicione um arquivo de som
    audio.loop = true;
    audio.play();
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [active]);
};