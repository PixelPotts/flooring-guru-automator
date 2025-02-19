import { VoiceResponse } from '../types/voice';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error('ElevenLabs API key not configured. Please add your API key to .env file.');
}

// Rachel voice - optimized for natural conversation
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
const MODEL_ID = 'eleven_monolingual_v1';

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const stopCurrentAudio = () => {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (error) {
      console.warn('Error stopping current audio:', error);
    }
    currentSource = null;
  }
};

const playAudioBuffer = async (audioBuffer: ArrayBuffer): Promise<void> => {
  const context = initAudioContext();
  stopCurrentAudio();

  try {
    const buffer = await context.decodeAudioData(audioBuffer.slice(0));
    currentSource = context.createBufferSource();
    currentSource.buffer = buffer;
    currentSource.connect(context.destination);

    return new Promise((resolve, reject) => {
      if (!currentSource) return reject(new Error('Audio source not initialized'));

      currentSource.onended = () => {
        currentSource?.disconnect();
        currentSource = null;
        resolve();
      };

      currentSource.start(0);
    });
  } catch (error) {
    console.error('Error playing audio:', error);
    throw error;
  }
};

export const synthesizeSpeech = async (text: string): Promise<VoiceResponse> => {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    await playAudioBuffer(audioBuffer);

    return {
      transcript: text,
      success: true,
    };
  } catch (error) {
    console.error('Speech synthesis error:', error);
    return {
      transcript: text,
      success: false,
      error: error instanceof Error ? error.message : 'Speech synthesis failed',
    };
  }
};

export const cancelSpeech = () => {
  stopCurrentAudio();
};