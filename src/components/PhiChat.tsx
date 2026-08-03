import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { 
  Send, 
  Mic, 
  MicOff, 
  Activity, 
  Info, 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  Settings, 
  Play, 
  Square, 
  Sparkles, 
  Radio, 
  Check 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'phi',
    text: 'Good morning, JohnMatrix operator! Your sleep duration was lower than baseline (4.2 hrs) and resting heart rate spiked by 4 bpm. I adjusted your workout to active recovery. How do your legs and energy feel right now?',
    timestamp: new Date().toISOString(),
  }
];

import { LogoOptionId, LOGO_OPTIONS } from './BrandLogoSelector';

interface PhiChatProps {
  user: UserProfile;
  incomingEvaluation?: { text: string; senderName: string } | null;
  activeLogoId?: LogoOptionId;
}

export function PhiChat({ user, incomingEvaluation, activeLogoId = 'delta' }: PhiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const selectedLogo = LOGO_OPTIONS.find(l => l.id === activeLogoId) || LOGO_OPTIONS[0];
  const LogoIcon = selectedLogo.svgIcon;

  // Handle incoming evaluation trigger from Group Chat
  useEffect(() => {
    if (incomingEvaluation && incomingEvaluation.text) {
      const evalText = `Evaluating Group Chat Insight from ${incomingEvaluation.senderName}: "${incomingEvaluation.text}"`;
      
      const userMsg: ChatMessage = {
        id: `eval-user-${Date.now()}`,
        sender: 'user',
        text: evalText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMsg]);

      // Generate CuasarX evaluation
      setTimeout(() => {
        let aiEvaluationResponse = `[CuasarX Clinical Evaluation for ${user.name}]\n\nAnalysis of ${incomingEvaluation.senderName}'s insight:\n`;
        
        const lower = incomingEvaluation.text.toLowerCase();
        if (lower.includes('4x4') || lower.includes('red-light') || lower.includes('mitochondrial')) {
          aiEvaluationResponse += `• Evidence Grade: A (Strong Clinical)\n• Mechanistic Fit: Red-light photomodulation (660nm/850nm) upregulates cytochrome c oxidase when applied post-interval.\n• Personalized Telemetry Guardrail: Given your current sleep restriction (4.2h), perform this protocol in active recovery mode.`;
        } else if (lower.includes('berberine') || lower.includes('glucose') || lower.includes('theanine')) {
          aiEvaluationResponse += `• Evidence Grade: B (High Observational)\n• Mechanistic Fit: Berberine activates AMPK, mimicking caloric restriction and stabilizing overnight glycemic variability.\n• Safety Check: Cleared with zero recorded supplement conflicts in your daily stack.`;
        } else if (lower.includes('bpc') || lower.includes('tb-500') || lower.includes('tendon')) {
          aiEvaluationResponse += `• Clinical Safety Warning: Peptide administration requires authorized clinician supervision.\n• Evidence Grade: B (Preclinical/Phase II)\n• Next Step: Would you like me to generate a formal summary report for your sports medicine physician?`;
        } else {
          aiEvaluationResponse += `• Evidence Grade: High Clinical Relevance\n• Personalized Alignment: Aligns well with your ${user.lifestylePersona} training plan.\n• Telemetry Status: Telemetry metrics stay within safe parasympathetic parameters.`;
        }

        const botMsgId = `eval-bot-${Date.now()}`;
        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'phi',
          text: aiEvaluationResponse,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMsg]);

        if (autoSpeak) {
          speakText(aiEvaluationResponse, botMsgId);
        }
      }, 700);
    }
  }, [incomingEvaluation]);
  
  // Voice engine settings
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(0.95); // 0.95x executive cadence
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load available voices from SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Auto-select best realistic voice
        if (voices.length > 0 && !selectedVoiceURI) {
          const naturalVoice = voices.find(v => 
            (v.name.toLowerCase().includes('natural') || 
             v.name.toLowerCase().includes('google') || 
             v.name.toLowerCase().includes('samantha') || 
             v.name.toLowerCase().includes('daniel') ||
             v.name.toLowerCase().includes('alex') ||
             v.name.toLowerCase().includes('karen')) && 
            v.lang.startsWith('en')
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

          if (naturalVoice) {
            setSelectedVoiceURI(naturalVoice.voiceURI);
          }
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speak text using human-realistic Web Speech API settings
  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      return;
    }

    // Process text for natural human cadence (insert tiny pauses at commas/periods)
    const processedText = text
      .replace(/\.\s/g, '... ')
      .replace(/,\s/g, ', ');

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;

    if (selectedVoiceURI) {
      const voiceObj = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Speech-to-Text Microphone input
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate CuasarX Assistant response
    setTimeout(() => {
      let phiResponseText = "I have logged that in your daily telemetry.";
      let phiAction: ChatMessage['action'] = undefined;

      const lower = userText.toLowerCase();

      if (lower.includes('peptide') || lower.includes('bpc') || lower.includes('dose') || lower.includes('injection')) {
        phiResponseText = "I cannot provide direct peptide injection dosages without clinical oversight. I can show you published clinical trials or route your request to a licensed physician.";
        phiAction = {
          type: 'safety_block',
          payload: { category: 'clinical_escalation' }
        };
      } else if (lower.includes('why') || lower.includes('workout') || lower.includes('training')) {
        phiResponseText = "Your Oura telemetry recorded 4.2 hours of sleep and an elevated resting HR. Training hard today spikes cortisol and delays connective tissue recovery.";
      } else if (lower.includes('recommend') || lower.includes('buy') || lower.includes('supplements')) {
        phiResponseText = "Based on your high executive stress score (8/10), I recommend our 1-Click Executive Bundle featuring L-Theanine and Alpha-GPC.";
        phiAction = {
          type: 'recommendation',
          payload: { productId: 'bundle-exec' }
        };
      } else if (lower.includes('sauna') || lower.includes('heat')) {
        phiResponseText = "For maximum Heat Shock Protein upregulation, complete 30-40 minutes at 85°C in the evening, followed by 10 minutes ambient cooling.";
      }

      const botMsgId = Date.now().toString() + 'cuasarx';
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'phi',
        text: phiResponseText,
        timestamp: new Date().toISOString(),
        action: phiAction
      };

      setMessages(prev => [...prev, botMsg]);

      // Auto read if enabled
      if (autoSpeak) {
        speakText(phiResponseText, botMsgId);
      }
    }, 900);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-amber-400 shadow-sm p-1.5">
            <LogoIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm leading-tight text-white flex items-center gap-1.5">
              CuasarX Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h3>
            <p className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
              {selectedLogo.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            title={autoSpeak ? "Voice Auto-Read ON" : "Voice Auto-Read OFF"}
            className={cn(
              "p-2 rounded-xl transition-all text-xs font-semibold flex items-center gap-1",
              autoSpeak ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            title="Configure Human Voice Settings"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Settings Panel Overlay */}
      {showVoiceSettings && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 text-white text-xs space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-4 h-4" /> Human Speech Synthesis Config
            </span>
            <button 
              onClick={() => setShowVoiceSettings(false)}
              className="text-slate-400 hover:text-white text-[10px] uppercase font-bold"
            >
              Done
            </button>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Select Realistic Voice</label>
            <select
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-2 focus:outline-none text-xs"
            >
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Pacing / Speed</span>
                <span className="font-bold text-indigo-400">{voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min={0.7}
                max={1.3}
                step={0.05}
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Pitch Frequency</span>
                <span className="font-bold text-indigo-400">{voicePitch}</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={1.2}
                step={0.05}
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isBot = msg.sender === 'phi';
          const isSpeaking = speakingMsgId === msg.id;

          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex flex-col max-w-[88%]", 
                isBot ? "mr-auto items-start" : "ml-auto items-end"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl text-xs leading-relaxed relative group shadow-sm transition-all",
                isBot 
                  ? "bg-white text-slate-900 border border-slate-200/80 rounded-tl-sm" 
                  : "bg-slate-900 text-white rounded-tr-sm"
              )}>
                {msg.text}

                {/* Speak button on Bot messages */}
                {isBot && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all",
                        isSpeaking 
                          ? "bg-indigo-600 text-white animate-pulse" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                    >
                      {isSpeaking ? (
                        <>
                          <Radio className="w-3 h-3 text-white animate-spin" />
                          Speaking...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-indigo-600" />
                          Listen (Realistic Voice)
                        </>
                      )}
                    </button>

                    <span className="text-[10px] text-slate-400">
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </span>
                  </div>
                )}
              </div>

              {!isBot && (
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </span>
              )}

              {/* Action Cards */}
              {msg.action?.type === 'safety_block' && (
                <div className="mt-2 bg-rose-50 border border-rose-200 rounded-xl p-3 max-w-sm text-xs space-y-1">
                  <div className="flex items-center gap-2 text-rose-700 font-bold">
                    <AlertOctagon className="w-4 h-4 text-rose-600" /> Medical Safety Lockout
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Individualized medical peptide dosing requires physician authorization.
                  </p>
                </div>
              )}

              {msg.action?.type === 'recommendation' && (
                <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3 max-w-sm text-xs space-y-1">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Info className="w-4 h-4 text-indigo-600" /> Tailored Recommendation
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    1-Click Executive Bundle added to Marketplace queue.
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : "Ask CuasarX Assistant..."}
            className={cn(
              "w-full pl-4 pr-24 py-3 border rounded-2xl text-xs focus:outline-none transition-all",
              isListening 
                ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-400 font-medium"
                : "border-slate-200 bg-slate-50 focus:border-indigo-500"
            )}
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            <button 
              type="button" 
              onClick={toggleSpeechRecognition}
              title={isListening ? "Stop Microphone" : "Voice Input (Speech-to-Text)"}
              className={cn(
                "p-2 transition-all rounded-xl",
                isListening 
                  ? "bg-rose-600 text-white animate-bounce" 
                  : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button 
              type="submit" 
              disabled={!input.trim()}
              className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-40 disabled:bg-slate-300 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
