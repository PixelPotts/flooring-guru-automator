import { useState, useCallback } from 'react';
import { synthesizeSpeech } from '../services/speechSynthesis';
import type { VoiceResponse } from '../types/voice';

interface UseElevenLabsProps {
  onError?: (error: string) => void;
}

const useElevenLabs = ({ onError }: UseElevenLabsProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string): Promise<VoiceResponse> => {
    try {
      setIsSpeaking(true);
      return await synthesizeSpeech(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Speech synthesis failed';
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsSpeaking(false);
    }
  }, [onError]);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    cancelSpeech,
    isSpeaking,
    isSupported: true
  };
};

export default useElevenLabs;