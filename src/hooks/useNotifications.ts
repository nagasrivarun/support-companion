import { useCallback, useRef, useEffect } from 'react';

// Simple notification sound using Web Audio API
const createNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playSound = () => {
    // Create a simple bell-like sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(830, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(830, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return playSound;
};

export function useNotifications() {
  const playSound = useRef<(() => void) | null>(null);
  const hasPermission = useRef<boolean>(false);

  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = () => {
      if (!playSound.current) {
        playSound.current = createNotificationSound();
      }
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);

    // Check notification permission
    if ('Notification' in window) {
      hasPermission.current = Notification.permission === 'granted';
    }

    return () => {
      document.removeEventListener('click', initAudio);
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      hasPermission.current = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      hasPermission.current = permission === 'granted';
      return permission === 'granted';
    }

    return false;
  }, []);

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    // Play sound
    if (playSound.current) {
      try {
        playSound.current();
      } catch (e) {
        console.error('Failed to play notification sound:', e);
      }
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
      } catch (e) {
        console.error('Failed to show notification:', e);
      }
    }

    return null;
  }, []);

  return {
    notify,
    requestPermission,
    hasPermission: () => hasPermission.current,
  };
}
