'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  maxDuration?: number; // in milliseconds, default 5 minutes
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  liveTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

interface SpeechRecognitionType {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult:
    | ((event: {
        resultIndex: number;
        results: { isFinal: boolean; 0: { transcript: string } }[];
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

export function useSpeechRecognition(
  options?: UseSpeechRecognitionOptions
): UseSpeechRecognitionReturn {
  const maxDuration = options?.maxDuration || 5 * 60 * 1000; // default 5 minutes

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const intentionallyStopped = useRef(false);
  const maxDurationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interimRef = useRef('');
  const isRestartingRef = useRef(false);
  const lastFinalRef = useRef('');

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();

    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: {
      resultIndex: number;
      results: { isFinal: boolean; 0: { transcript: string } }[];
    }) => {
      let interim = '';
      let final = '';

      // Process all results in this batch
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      // Update interim in real-time (not accumulated)
      if (interim !== interimRef.current) {
        interimRef.current = interim;
        setInterimTranscript(interim);
      }

      // Only add FINAL results to liveTranscript if different from last final
      // This prevents duplicates
      if (final && final !== lastFinalRef.current) {
        lastFinalRef.current = final;
        setLiveTranscript(prev => (prev ? prev + ' ' + final : final).trim());
      }
    };

    recognition.onerror = (event: { error: string }) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Clear max duration timer
      if (maxDurationRef.current) {
        clearTimeout(maxDurationRef.current);
        maxDurationRef.current = null;
      }

      // Auto-restart if not intentionally stopped
      if (!intentionallyStopped.current) {
        isRestartingRef.current = true;
        setTimeout(() => {
          try {
            if (recognitionRef.current && !intentionallyStopped.current) {
              // Restore interim from ref before restarting
              setInterimTranscript(interimRef.current);
              recognitionRef.current.start();
            }
          } catch (e: unknown) {
            console.log(e);
            setIsListening(false);
            setInterimTranscript('');
          } finally {
            isRestartingRef.current = false;
          }
        }, 100);
      }

      // Only clear interim if not auto-restarting (user intentionally stopped)
      if (!isRestartingRef.current) {
        setIsListening(false);
        // Don't clear liveTranscript here - user can continue editing
        setInterimTranscript('');
        interimRef.current = '';
      }
    };

    return () => {
      if (maxDurationRef.current) {
        clearTimeout(maxDurationRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    setError(null);
    intentionallyStopped.current = false;
    lastFinalRef.current = ''; // Reset for new recording session

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();

        // Set max duration timer
        maxDurationRef.current = setTimeout(() => {
          intentionallyStopped.current = true;
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, maxDuration);
      } catch (err) {
        if ((err as Error).message?.includes('already started')) {
          recognitionRef.current.stop();
        }
      }
    }
  }, [maxDuration]);

  const stopListening = useCallback(() => {
    intentionallyStopped.current = true;

    if (maxDurationRef.current) {
      clearTimeout(maxDurationRef.current);
      maxDurationRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setLiveTranscript('');
  }, []);

  return {
    transcript,
    interimTranscript,
    liveTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
}
