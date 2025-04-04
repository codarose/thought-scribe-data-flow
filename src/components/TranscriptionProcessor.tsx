
import React, { useState, useEffect } from 'react';
import VoiceRecorder from './VoiceRecorder';
import ResultDisplay from './ResultDisplay';
import ApiConfig from './ApiConfig';

const TranscriptionProcessor: React.FC = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for existing API key in localStorage
    const savedApiKey = localStorage.getItem('anthropic_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  
  const handleTranscriptionComplete = (text: string) => {
    setTranscription(text);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div className="flex justify-end">
        <ApiConfig onApiKeySet={setApiKey} />
      </div>
      
      <VoiceRecorder 
        onTranscriptionComplete={handleTranscriptionComplete}
        isProcessing={isProcessing}
      />
      
      {transcription && (
        <ResultDisplay 
          transcription={transcription}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
      )}
      
      {!apiKey && (
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
          <p className="text-yellow-800">
            ⚠️ Anthropic API key not configured. Features will use fallback processing.
          </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionProcessor;
