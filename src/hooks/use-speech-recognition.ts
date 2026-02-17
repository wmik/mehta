'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  maxDuration?: number; // in milliseconds, default 5 minutes
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  liveTranscript: string;
  currentSegment: string;
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

  const [interimTranscript, setInterimTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [currentSegment, setCurrentSegment] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const intentionallyStopped = useRef(false);
  const maxDurationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interimRef = useRef('');
  const isRestartingRef = useRef(false);
  const finalTranscriptsRef = useRef<Set<string>>(new Set());

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const createRecognitionInstance = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

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

      // Only add FINAL results to liveTranscript if not already processed
      // Normalize text for comparison (trim, lowercase) to catch duplicates
      if (final) {
        const normalizedFinal = final.toLowerCase().trim();
        if (!finalTranscriptsRef.current.has(normalizedFinal)) {
          finalTranscriptsRef.current.add(normalizedFinal);
          setLiveTranscript(prev => (prev ? prev + ' ' + final : final).trim());
        }
        // Keep only the latest segment for display
        setCurrentSegment(final.trim());
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

      // Auto-restart if not intentionally stopped - create FRESH instance
      if (!intentionallyStopped.current) {
        isRestartingRef.current = true;
        setTimeout(() => {
          try {
            // Abort old instance to ensure clean state
            if (recognitionRef.current) {
              recognitionRef.current.abort();
            }

            if (!intentionallyStopped.current) {
              // Create a fresh recognition instance
              recognitionRef.current = createRecognitionInstance();
              recognitionRef.current.start();

              // Set max duration timer for new instance
              maxDurationRef.current = setTimeout(() => {
                intentionallyStopped.current = true;
                if (recognitionRef.current) {
                  recognitionRef.current.stop();
                }
              }, maxDuration);
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

    return recognition;
  }, [maxDuration]);

  useEffect(() => {
    if (!isSupported) return;

    recognitionRef.current = createRecognitionInstance();

    return () => {
      if (maxDurationRef.current) {
        clearTimeout(maxDurationRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported, createRecognitionInstance]);

  const startListening = useCallback(() => {
    setError(null);
    intentionallyStopped.current = false;
    finalTranscriptsRef.current = new Set(); // Reset for new recording session

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
    setInterimTranscript('');
    setLiveTranscript('');
    setCurrentSegment('');
    finalTranscriptsRef.current = new Set();
  }, []);

  return {
    transcript: liveTranscript,
    interimTranscript,
    liveTranscript,
    currentSegment,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
}
