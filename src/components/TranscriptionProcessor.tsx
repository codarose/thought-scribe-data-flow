
import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import ResultDisplay from './ResultDisplay';

const TranscriptionProcessor: React.FC = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const handleTranscriptionComplete = (text: string) => {
    setTranscription(text);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
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
    </div>
  );
};

export default TranscriptionProcessor;
