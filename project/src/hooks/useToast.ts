import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(({ 
    title, 
    message, 
    type, 
    duration = 5000 
  }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, title, message, type };
    
    setToasts(current => [...current, toast]);

    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, duration);
  }, []);

  return { toasts, showToast };
};