import { useState, useCallback, useEffect, useRef } from 'react';
import { synthesizeSpeech, cancelSpeech, pauseSpeech, resumeSpeech } from '../services/speechSynthesis';

interface UseSpeechSynthesisProps {
  onError?: (error: string) => void;
}

const useSpeechSynthesis = ({ onError }: UseSpeechSynthesisProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (activeUtteranceRef.current) {
        cancelSpeech();
      }
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      setIsPaused(false);

      const result = await synthesizeSpeech(text);
      
      if (!result.success) {
        throw new Error(result.error || 'Speech synthesis failed');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Speech synthesis failed';
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [onError]);

  const cancel = useCallback(() => {
    cancelSpeech();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    pauseSpeech();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    resumeSpeech();
    setIsPaused(false);
  }, []);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window
  };
};

export default useSpeechSynthesis;