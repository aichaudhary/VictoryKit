
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { gsap } from 'gsap';
import { 
  Sparkles, Send, Brain, Loader2, X, Wand2, Search, MapPin, 
  MessageSquare, ExternalLink, Mic, MicOff, Volume2, Image as ImageIcon,
  MoreVertical, Check, Copy, Terminal, Activity, Zap
} from 'lucide-react';

interface Props {
  currentImageUrl?: string;
  onUpdateImage: (newUrl: string) => void;
}

// Helper functions for Audio Encoding & Decoding as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AIInterface: React.FC<Props> = ({ currentImageUrl, onUpdateImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState<string | React.ReactNode>('');
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Playful bounce animation for the AI button - moves across entire screen
  useEffect(() => {
    if (isOpen) {
      // Stop animation when panel is open
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      return;
    }

    const getRandomPosition = () => {
      // Get viewport dimensions with padding
      const padding = 80;
      const buttonSize = 56;
      const maxX = window.innerWidth - buttonSize - padding;
      const maxY = window.innerHeight - buttonSize - padding;
      
      return {
        x: Math.random() * maxX + padding / 2,
        y: Math.random() * maxY + padding / 2
      };
    };

    const getRandomEntryDirection = () => {
      // Entry from outside screen
      const side = Math.floor(Math.random() * 4);
      switch (side) {
        case 0: return { x: -100, y: Math.random() * window.innerHeight }; // left
        case 1: return { x: window.innerWidth + 100, y: Math.random() * window.innerHeight }; // right
        case 2: return { x: Math.random() * window.innerWidth, y: -100 }; // top
        default: return { x: Math.random() * window.innerWidth, y: window.innerHeight + 100 }; // bottom
      }
    };

    const animateBounce = () => {
      if (!buttonRef.current) return;
      
      const entryPos = getRandomEntryDirection();
      const targetPos = getRandomPosition();
      const exitPos = getRandomEntryDirection();
      
      // Set starting position (outside screen)
      gsap.set(buttonRef.current, { 
        left: entryPos.x,
        top: entryPos.y,
        right: 'auto',
        bottom: 'auto',
        x: 0,
        y: 0,
        scale: 0.3, 
        opacity: 0,
        rotation: Math.random() * 360
      });
      setIsVisible(true);

      // Bounce in to random position on screen
      gsap.to(buttonRef.current, {
        left: targetPos.x,
        top: targetPos.y,
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.5)",
      });

      // After 2.5 seconds, bounce out to another edge
      gsap.to(buttonRef.current, {
        left: exitPos.x,
        top: exitPos.y,
        scale: 0.2,
        opacity: 0,
        rotation: Math.random() * 360 - 180,
        duration: 0.5,
        ease: "back.in(2)",
        delay: 2.5,
        onComplete: () => setIsVisible(false)
      });
    };

    // Initial appearance after 3-4 seconds
    const initialTimeout = setTimeout(() => {
      animateBounce();
      
      // Then repeat every 3-4 seconds
      animationIntervalRef.current = setInterval(() => {
        animateBounce();
      }, 3500);
    }, 3500);

    return () => {
      clearTimeout(initialTimeout);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  // Clean up audio sources and contexts
  useEffect(() => {
    return () => {
      stopVoiceChat();
    };
  }, []);

  const stopVoiceChat = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioSourcesRef.current.forEach(s => s.stop());
    audioSourcesRef.current.clear();
    setIsVoiceActive(false);
  };

  const handleTranscription = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsLoading(true);
          setResponse("Transcribing neural input...");
          
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          try {
            const result = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: {
                parts: [
                  { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
                  { text: "Transcribe this audio accurately. If it's silent or noisy, say 'No clear audio detected'." }
                ]
              }
            });
            setPrompt(result.text || "");
            setResponse("Audio transcribed successfully.");
          } catch (e) {
            setResponse("Neural signal lost during transcription.");
          } finally {
            setIsLoading(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResponse("Listening to voice uplink...");
    } catch (err) {
      setResponse("Microphone access denied.");
    }
  };

  const handleVoiceChat = async () => {
    if (isVoiceActive) {
      stopVoiceChat();
      return;
    }

    setIsVoiceActive(true);
    setResponse("Initializing Live Neural Uplink...");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inputAudioContext = new AudioContext({ sampleRate: 16000 });
    const outputAudioContext = new AudioContext({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmData = encode(new Uint8Array(int16.buffer));
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: () => stopVoiceChat(),
          onclose: () => stopVoiceChat(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are Maula AI, a world-class autonomous security agent. You speak concisely and with tactical authority.',
        },
      });

      liveSessionRef.current = await sessionPromise;
      setResponse("Live session active. Speak now.");
    } catch (e) {
      setResponse("Failed to connect to Live API.");
      stopVoiceChat();
    }
  };

  const handleAction = async (mode: 'fast' | 'think' | 'gen' | 'edit' | 'search' | 'maps' | 'chat') => {
    if (!prompt.trim() && mode !== 'edit') return;
    setIsLoading(true);
    setResponse('');
    setGroundingLinks([]);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      if (mode === 'gen') {
        const result = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: [{ text: prompt }],
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: "1K"
            }
          }
        });
        for (const part of result.candidates[0].content.parts) {
          if (part.inlineData) {
            onUpdateImage(`data:image/png;base64,${part.inlineData.data}`);
            setResponse(`Tactical visual generated with ${aspectRatio} aspect ratio.`);
            break;
          }
        }
      } else if (mode === 'edit' && currentImageUrl) {
        const base64Data = currentImageUrl.split(',')[1] || currentImageUrl;
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
              { text: prompt || "Enhance this image with a high-tech security aesthetic" }
            ]
          }
        });
        for (const part of result.candidates[0].content.parts) {
          if (part.inlineData) {
            onUpdateImage(`data:image/png;base64,${part.inlineData.data}`);
            setResponse("Tactical visualization updated.");
            break;
          }
        }
      } else if (mode === 'think') {
        setIsThinking(true);
        const result = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: prompt,
          config: { thinkingConfig: { thinkingBudget: 32768 } }
        });
        setResponse(result.text);
      } else if (mode === 'search') {
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { tools: [{ googleSearch: {} }] }
        });
        setResponse(result.text);
        const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          const links = chunks.filter(c => c.web).map(c => ({ title: c.web.title, uri: c.web.uri }));
          setGroundingLinks(links);
        }
      } else if (mode === 'maps') {
        let location = { latitude: 37.78193, longitude: -122.40476 };
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) { console.warn("Location denied."); }

        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: location } }
          }
        });
        setResponse(result.text);
        const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          const links = chunks.filter(c => c.maps).map(c => ({ title: c.maps.title || 'Location', uri: c.maps.uri }));
          setGroundingLinks(links);
        }
      } else if (mode === 'chat') {
        const chat = ai.chats.create({ model: 'gemini-3-pro-preview' });
        const result = await chat.sendMessage({ message: prompt });
        setResponse(result.text);
      } else {
        const result = await ai.models.generateContent({
          model: 'gemini-flash-lite-latest',
          contents: prompt
        });
        setResponse(result.text);
      }
    } catch (err) {
      setResponse('Neural connection interrupted.');
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(true)}
        className={`fixed z-[110] bg-white text-black p-4 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-colors flex items-center justify-center border border-purple-500/30 group ${!isVisible ? 'opacity-0 pointer-events-none' : ''}`}
        style={{ bottom: 32, left: 32 }}
      >
        <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 left-8 z-[110] w-[450px] glass rounded-[2.5rem] p-8 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-3xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <div className="flex flex-col">
            <span className="font-black text-[12px] uppercase tracking-widest text-white">Neural Interface</span>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">Active Model: Gemini 3 Pro</span>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Coordinate neural command..."
            className="w-full bg-black/60 border border-white/5 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-purple-500/50 min-h-[120px] resize-none scrollbar-hide shadow-inner"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={handleTranscription}
              className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
              title="Transcribe Voice"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleVoiceChat}
              className={`p-3 rounded-xl transition-all ${isVoiceActive ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
              title="Live Voice AI"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
           <span className="text-[9px] font-black text-white/30 uppercase tracking-widest whitespace-nowrap">Aspect:</span>
           {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"].map(ratio => (
             <button 
               key={ratio}
               onClick={() => setAspectRatio(ratio)}
               className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest transition-all whitespace-nowrap ${aspectRatio === ratio ? 'bg-purple-500 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
             >
               {ratio}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => handleAction('fast')} disabled={isLoading} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest border border-white/5 transition-all">
            <Zap className="w-4 h-4 text-blue-400" /> Fast
          </button>
          <button onClick={() => handleAction('think')} disabled={isLoading} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest border border-white/5 transition-all">
            <Brain className="w-4 h-4 text-purple-400" /> Think
          </button>
          <button onClick={() => handleAction('gen')} disabled={isLoading} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest border border-white/5 transition-all">
            <ImageIcon className="w-4 h-4 text-pink-400" /> Gen
          </button>
          <button onClick={() => handleAction('search')} disabled={isLoading} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest border border-white/5 transition-all">
            <Search className="w-4 h-4 text-amber-400" /> Search
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-purple-400 text-[11px] font-black animate-pulse px-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {isThinking ? "PROCESSING NEURAL DEPTH (32K)..." : "CALIBRATING UPLINK..."}
          </div>
        )}

        {response && (
          <div ref={scrollRef} className="max-h-52 overflow-y-auto p-4 bg-black/40 rounded-2xl text-[12px] text-white/90 leading-relaxed border border-white/5 scrollbar-hide shadow-inner">
            <div className="whitespace-pre-wrap">{response}</div>
            {groundingLinks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Source Grounding:</span>
                {groundingLinks.map((link, i) => (
                  <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group/link">
                    <ExternalLink className="w-3 h-3" /> 
                    <span className="truncate border-b border-transparent group-hover/link:border-blue-300/50">{link.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInterface;
