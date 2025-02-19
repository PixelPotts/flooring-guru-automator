export const synthesizeSpeech = (text: string): Promise<VoiceResponse> => {
  return new Promise((resolve) => {
    try {
      const utterance = createUtterance(text);

      utterance.onend = () => {
        resolve({ transcript: text, success: true });
      };

      utterance.onerror = () => {
        resolve({ 
          transcript: text, 
          success: false, 
          error: 'Speech synthesis failed' 
        });
      };

      speechQueue.push(utterance);
      speakNext();
    } catch (error) {
      console.error('Speech synthesis error:', error);
      resolve({ 
        transcript: text, 
        success: false, 
        error: error instanceof Error ? error.message : 'Speech synthesis failed' 
      });
    }
  });
};