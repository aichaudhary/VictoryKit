
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Send, Brain, Loader2, X, Wand2, Search, MapPin, MessageSquare, ExternalLink } from 'lucide-react';

interface Props {
  currentImageUrl?: string;
  onUpdateImage: (newUrl: string) => void;
}

const AIInterface: React.FC<Props> = ({ currentImageUrl, onUpdateImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState<string | React.ReactNode>('');
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = useMemo(() => apiKey ? new GoogleGenAI({ apiKey }) : null, [apiKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const handleAction = async (mode: 'fast' | 'think' | 'edit' | 'search' | 'maps' | 'chat') => {
    if (!prompt.trim() && mode !== 'edit') return;
    setIsLoading(true);
    setResponse('');
    setGroundingLinks([]);

    if (!ai) {
      setResponse('Add VITE_GEMINI_API_KEY to your .env.local to enable the neural interface.');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'edit' && currentImageUrl) {
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
          model: 'gemini-2.5-flash-lite-latest',
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
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 z-[110] bg-white text-black p-4 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-purple-500/30 group"
        aria-label="Open AI Command"
      >
        <Sparkles className="w-6 h-6 text-purple-600 animate-pulse transition-transform group-hover:rotate-12" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 left-8 z-[110] w-[400px] glass rounded-[2rem] p-6 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-3xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="font-black text-[10px] uppercase tracking-widest text-white/60">Neural Interface v5.0</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors" aria-label="Close AI panel">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter command or coordinate..."
          className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 min-h-[100px] resize-none"
        />

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => handleAction('fast')} disabled={isLoading} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-bold uppercase tracking-tighter border border-white/5 transition-all">
            <Send className="w-4 h-4 text-blue-400" /> Lite
          </button>
          <button onClick={() => handleAction('think')} disabled={isLoading} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-bold uppercase tracking-tighter border border-white/5 transition-all">
            <Brain className="w-4 h-4 text-purple-400" /> Think
          </button>
          <button onClick={() => handleAction('chat')} disabled={isLoading} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-bold uppercase tracking-tighter border border-white/5 transition-all">
            <MessageSquare className="w-4 h-4 text-green-400" /> Pro Chat
          </button>
          <button onClick={() => handleAction('search')} disabled={isLoading} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-bold uppercase tracking-tighter border border-white/5 transition-all">
            <Search className="w-4 h-4 text-amber-400" /> Search
          </button>
          <button onClick={() => handleAction('maps')} disabled={isLoading} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-bold uppercase tracking-tighter border border-white/5 transition-all">
            <MapPin className="w-4 h-4 text-emerald-400" /> Maps
          </button>
          <button onClick={() => handleAction('edit')} disabled={isLoading || !currentImageUrl} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[8px] font-bold uppercase tracking-tighter border border-white/5 transition-all disabled:opacity-30">
            <Wand2 className="w-4 h-4 text-pink-400" /> Edit Vis
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-purple-400 text-[10px] font-bold animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            {isThinking ? "PROCESSING DEPTH (32K)..." : "CONNECTING..."}
          </div>
        )}

        {response && (
          <div ref={scrollRef} className="max-h-40 overflow-y-auto p-3 bg-black/20 rounded-xl text-[11px] text-white/80 leading-relaxed border border-white/5 scrollbar-hide">
            <div className="whitespace-pre-wrap">{response}</div>
            {groundingLinks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                {groundingLinks.map((link, i) => (
                  <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400/80 hover:text-blue-400">
                    <ExternalLink className="w-3 h-3" /> {link.title}
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
