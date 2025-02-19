import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, X, Loader, Lightbulb, Bot, FileText, Calendar, Package2 } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { synthesizeSpeech } from '../../services/elevenlabs';
import { analyzeVoiceCommand, generateVoiceResponse } from '../../services/openai';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClientInfo {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Context {
  currentProcess?: string;
  currentStep?: number;
  collectedInfo?: ClientInfo;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<Context>({});

  const navigate = useNavigate();
  const { addClient } = useClients();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setFeedback('');
      setError(null);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen]);

  const handleCommand = async (command: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const analysis = await analyzeVoiceCommand(command);
      
      if (!analysis.action) {
        throw new Error('Could not understand command');
      }

      setContext(prev => ({
        ...prev,
        currentProcess: analysis.action,
        collectedInfo: { ...prev.collectedInfo, ...analysis.parameters }
      }));

      if (analysis.action === 'navigate' && analysis.parameters?.path) {
        navigate(analysis.parameters.path);
      }

      const response = await generateVoiceResponse(analysis);
      await respondWithVoice(response);

      if (analysis.action === 'create_client' && analysis.parameters) {
        addClient({
          name: analysis.parameters.name || '',
          company: analysis.parameters.company || '',
          email: analysis.parameters.email || '',
          phone: analysis.parameters.phone || '',
          address: analysis.parameters.address || '',
          type: 'Residential',
          status: 'Active',
          totalProjects: 0,
          totalRevenue: 0
        });
      }

    } catch (error) {
      console.error('Error processing command:', error);
      setError('Failed to process command. Please try again.');
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
      startListening();
    }
  };

  const respondWithVoice = async (text: string) => {
    setFeedback(text);
    await synthesizeSpeech(text);
  };

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(transcript);
      handleCommand(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
      startListening();
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!processingRef.current) {
        startListening();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setError(null);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 m-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Voice Assistant
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <button
            onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
            disabled={isProcessing}
            className={`p-6 rounded-full ${
              isListening
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            } transition-all duration-200 hover:scale-105`}
          >
            {isProcessing ? (
              <Loader className="h-6 w-6 animate-spin" />
            ) : isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isListening ? 'Listening...' : 'Tap to start listening'}
          </p>
        </div>

        {transcript && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              You said:
            </p>
            <p className="text-gray-600 dark:text-gray-400">{transcript}</p>
          </div>
        )}

        {feedback && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">{feedback}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <button
            onClick={() => handleCommand("create new client")}
            className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Bot className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <span className="text-sm text-blue-600 dark:text-blue-400">New Client</span>
          </button>
          <button
            onClick={() => handleCommand("create estimate")}
            className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <FileText className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <span className="text-sm text-green-600 dark:text-green-400">New Estimate</span>
          </button>
          <button
            onClick={() => handleCommand("schedule installation")}
            className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Calendar className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <span className="text-sm text-purple-600 dark:text-purple-400">Schedule</span>
          </button>
          <button
            onClick={() => handleCommand("order materials")}
            className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <Package2 className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <span className="text-sm text-amber-600 dark:text-amber-400">Materials</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceAssistant;