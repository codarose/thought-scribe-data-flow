
import React, { useState, useRef } from 'react';
import { Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/use-toast";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  isProcessing: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscriptionComplete,
  isProcessing 
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const startRecording = async () => {
    audioChunksRef.current = [];
    
    try {
      setIsPreparing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // In a real app, send this to a transcription service like Whisper API
        // For now, we'll simulate transcription
        simulateTranscription(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPreparing(false);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access error",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive"
      });
      setIsPreparing(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setIsPreparing(true);
    }
  };
  
  const simulateTranscription = (audioBlob: Blob) => {
    // In a real app, send the audio to a speech-to-text API
    // For demo purposes, we'll return placeholder text after a delay
    
    setTimeout(() => {
      const sampleTexts = [
        "I need to remember to pick up groceries today, call mom about weekend plans, schedule dentist appointment, and follow up on that email from work. Also finish the presentation for Monday's meeting.",
        "Create a spreadsheet with the following data. First column is name, second is age, third is location. John is 34 and lives in New York. Mary is 28 and lives in Boston. Sam is 45 and lives in Chicago.",
        "Just thinking about my day today. Had a good meeting with the team. We discussed project timelines and resource allocation. I think we're on track, but we need to follow up on a few issues next week."
      ];
      
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      onTranscriptionComplete(randomText);
      setIsPreparing(false);
    }, 2000);
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div 
        className={`mic-container w-32 h-32 rounded-full flex items-center justify-center 
          ${isRecording ? 'bg-red-500 bg-opacity-20' : 'bg-thought-100'} 
          transition-all duration-300 ease-in-out`}
      >
        {isRecording && (
          <>
            <div className="mic-ring w-36 h-36 border border-red-500 animate-pulse-ring"></div>
            <div className="mic-ring w-44 h-44 border border-red-500 animate-pulse-ring" style={{ animationDelay: "0.5s" }}></div>
            <div className="mic-ring w-52 h-52 border border-red-500 animate-pulse-ring" style={{ animationDelay: "1s" }}></div>
          </>
        )}
        
        <Button 
          className={`w-24 h-24 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-thought-500 hover:bg-thought-600'}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isPreparing || isProcessing}
        >
          {isRecording ? (
            <StopCircle className="h-12 w-12 text-white" />
          ) : (
            <Mic className="h-12 w-12 text-white" />
          )}
        </Button>
      </div>
      
      <div className="text-center">
        {isPreparing ? (
          <p className="text-lg text-muted-foreground animate-pulse">
            Processing your voice memo...
          </p>
        ) : isRecording ? (
          <p className="text-lg font-medium text-red-500">
            Recording... tap to stop
          </p>
        ) : isProcessing ? (
          <p className="text-lg text-muted-foreground animate-pulse">
            Analyzing and structuring your data...
          </p>
        ) : (
          <p className="text-lg text-muted-foreground">
            Tap to start recording your thoughts
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
