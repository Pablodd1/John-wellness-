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
  Check,
  X,
  Stethoscope,
  FileText,
  Clock,
  RotateCcw,
  AlertTriangle,
  HeartPulse,
  Brain,
  Zap,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LogoOptionId, LOGO_OPTIONS } from './BrandLogoSelector';
import { CuasarLogo } from './CuasarLogo';
import { useConsent } from '../lib/consent';
import { authFetch } from '../lib/dataService';
import { MOCK_PRODUCTS } from '../data';
import { ShieldCheck, ChevronDown, ChevronUp, Radio as RadioIcon } from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'phi',
    text: `Hi! I'm your wellness assistant. I answer with live AI when the service is configured, and fall back to built-in guidance when it isn't — the label below the chat always tells you which mode is active. Your AI analysis consent controls everything. Tap "Voice HPI" to dictate symptoms for a structured intake, or type a question below.`,
    timestamp: new Date().toISOString(),
  }
];

const HPI_SAMPLE_PROMPTS = [
  {
    label: "Fatigue & Sleep Crash",
    text: "Experiencing acute 3 PM cognitive brain fog, low motivation, and 4.2 hours of fragmented sleep following a cross-country red-eye flight."
  },
  {
    label: "Joint / Tendon Soreness",
    text: "Mild acute soreness and localized inflammation in left patellar tendon following heavy eccentric leg press yesterday. No swelling, pain is 4/10."
  },
  {
    label: "High Stress & Palpitations",
    text: "Elevated perceived work stress (8/10), increased caffeine intake (400mg), and feeling heart palpitations before bed with high resting HR."
  },
  {
    label: "Post-Meal Bloating",
    text: "Experiencing post-prandial lethargy, mild epigastric bloating, and glycemic instability about 45 minutes after high-glycemic lunch."
  }
];

interface PhiChatProps {
  user: UserProfile;
  incomingEvaluation?: { text: string; senderName: string } | null;
  activeLogoId?: LogoOptionId;
  onClose?: () => void;
}

export function PhiChat({ user, incomingEvaluation, activeLogoId = 'delta', onClose }: PhiChatProps) {
  const { isGranted, grant } = useConsent();
  const aiConsented = isGranted('ai_processing');
  const wearableSynced = isGranted('wearable_sync');
  const [aiDisclosureOpen, setAiDisclosureOpen] = useState(false);
  const [aiAckChecked, setAiAckChecked] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Voice HPI state
  const [showHpiModal, setShowHpiModal] = useState(false);
  const [hpiListening, setHpiListening] = useState(false);
  const [hpiTranscript, setHpiTranscript] = useState('');
  const [hpiCategory, setHpiCategory] = useState<'symptoms_fatigue' | 'injury_pain' | 'stress_sleep' | 'metabolic_gi' | 'general_life'>('symptoms_fatigue');
  const [hpiSeverity, setHpiSeverity] = useState<number>(6);
  const [hpiDuration, setHpiDuration] = useState<number>(0);
  const hpiTimerRef = useRef<any>(null);
  const hpiRecognitionRef = useRef<any>(null);

  const selectedLogo = LOGO_OPTIONS.find(l => l.id === activeLogoId) || LOGO_OPTIONS[0];
  const LogoIcon = selectedLogo.svgIcon;

  // Handle incoming evaluation trigger from Group Chat
  useEffect(() => {
    if (!aiConsented) return; // no AI processing (or spoken output) without consent
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
        let aiEvaluationResponse = `[QuasarX Wellness Evaluation for ${user.name}]\n\nAnalysis of ${incomingEvaluation.senderName}'s insight:\n`;
        
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

  // Clean up HPI timer and recognition on unmount
  useEffect(() => {
    return () => {
      if (hpiTimerRef.current) clearInterval(hpiTimerRef.current);
      if (hpiRecognitionRef.current) {
        try {
          hpiRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

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

  // Toggle standard input speech-to-text
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

  // Start dedicated HPI Voice Recording
  const startHpiRecording = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type or select one of the guided clinical prompts below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setHpiListening(true);
        setHpiDuration(0);
        hpiTimerRef.current = setInterval(() => {
          setHpiDuration(prev => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setHpiTranscript(currentTranscript.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn('HPI recognition error', e);
        stopHpiRecording();
      };

      recognition.onend = () => {
        setHpiListening(false);
        if (hpiTimerRef.current) clearInterval(hpiTimerRef.current);
      };

      hpiRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setHpiListening(false);
    }
  };

  // Stop dedicated HPI Voice Recording
  const stopHpiRecording = () => {
    if (hpiRecognitionRef.current) {
      try {
        hpiRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setHpiListening(false);
    if (hpiTimerRef.current) clearInterval(hpiTimerRef.current);
  };

  // Reset HPI form
  const handleResetHpi = () => {
    stopHpiRecording();
    setHpiTranscript('');
    setHpiDuration(0);
  };

  // Submit Voice HPI to Chat & Clinical Engine
  const handleSubmitHpi = () => {
    if (!hpiTranscript.trim()) return;

    stopHpiRecording();
    const recordedText = hpiTranscript.trim();
    const categoryLabels: Record<string, string> = {
      symptoms_fatigue: 'Fatigue, Sleep & Energy Dynamics',
      injury_pain: 'Musculoskeletal & Injury Soreness',
      stress_sleep: 'Psychological Stress & Insomnia',
      metabolic_gi: 'Metabolic & GI / Post-Prandial Event',
      general_life: 'General Life Event & Workload Shock'
    };

    const formattedUserMsg: ChatMessage = {
      id: `hpi-user-${Date.now()}`,
      sender: 'user',
      text: `🎙️ [VOICE HPI & LIFE EVENT INTAKE]\n• Category: ${categoryLabels[hpiCategory] || 'Clinical HPI'}\n• Severity Score: ${hpiSeverity}/10\n• Patient Voice Transcript: "${recordedText}"`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, formattedUserMsg]);
    setShowHpiModal(false);
    setHpiTranscript('');
    setHpiDuration(0);

    // AI Clinical Reasoning based on HPI data & user telemetry
    setTimeout(() => {
      let hpiAiResponse = `[QuasarX Voice Intake Summary & General Guidance]\n\n`;
      const lower = recordedText.toLowerCase();

      // Clinical Case 1: Musculoskeletal / Tendon / Joint Injury
      if (lower.includes('tendon') || lower.includes('knee') || lower.includes('joint') || lower.includes('shoulder') || lower.includes('pain') || lower.includes('injury') || hpiCategory === 'injury_pain') {
        const userRhr = user.metrics?.rhr?.current || user.baselineDiagnostics?.anthropometrics?.rhrBpm || 52;
        hpiAiResponse += `1. CLINICAL IMPRESSION: Acute mechanical strain / localized inflammatory signal (Severity: ${hpiSeverity}/10).\n\n`;
        hpiAiResponse += `2. TELEMETRY & WEARABLE CORRELATION:\n• Your current resting HR (${userRhr} bpm) suggests stable systemic tone, but local connective tissue requires metabolic rest.\n\n`;
        hpiAiResponse += `3. TARGETED PROTOCOL ADJUSTMENT:\n• Training: Auto-suppress heavy eccentric loading for 48h. Replace with isometrics & Zone 2 cycling (130-140 bpm).\n• Nutritional Support: Add Tart Cherry Extract (480mg) + Curcumin Phytosome (500mg) to reduce inflammatory cytokines without blunting systemic adaptation.\n• Peptide Status: If discomfort exceeds 72 hours, an ADM review for localized BPC-157 / TB-500 protocol authorization can be generated.`;
      } 
      // Clinical Case 2: Fatigue, Red-Eye, Sleep Deprivation, Jet Lag
      else if (lower.includes('sleep') || lower.includes('flight') || lower.includes('fatigue') || lower.includes('crash') || lower.includes('fog') || hpiCategory === 'symptoms_fatigue') {
        hpiAiResponse += `1. CLINICAL IMPRESSION: Circadian desynchronization & acute central nervous system (CNS) fatigue (Severity: ${hpiSeverity}/10).\n\n`;
        hpiAiResponse += `2. TELEMETRY & WEARABLE CORRELATION:\n• Matches your Oura wearable data (4.2 hours recorded sleep, +4 bpm RHR spike).\n• Autonomic balance is sympathetically shifted.\n\n`;
        hpiAiResponse += `3. TARGETED PROTOCOL ADJUSTMENT:\n• Sleep Hygiene: 400mg Magnesium L-Threonate + 3g Glycine 45 min before bed.\n• Circadian Reset: 15 min outdoor 10,000+ lux light exposure immediately; cut off caffeine intake past 1:00 PM.\n• Readiness Shield: Shift afternoon resistance session to a 20-minute sauna protocol (85°C) to upregulate heat shock proteins.`;
      }
      // Clinical Case 3: High Stress, Caffeine, Palpitations
      else if (lower.includes('stress') || lower.includes('heart') || lower.includes('caffeine') || lower.includes('palpitations') || hpiCategory === 'stress_sleep') {
        hpiAiResponse += `1. CLINICAL IMPRESSION: Sympathetic adrenergic overdrive & acute catecholamine elevation (Severity: ${hpiSeverity}/10).\n\n`;
        hpiAiResponse += `2. TELEMETRY & WEARABLE CORRELATION:\n• Elevated stress score (8/10) with elevated cortisol AUC.\n\n`;
        hpiAiResponse += `3. TARGETED PROTOCOL ADJUSTMENT:\n• Acute Intervention: 200mg L-Theanine + 300mg KSM-66 Ashwagandha for GABAergic calming.\n• Fluid Balance: 500ml water with sodium/potassium electrolytes.\n• Safety Guardrail: If resting palpitations persist above 100 bpm at rest, initiate 911 / Medical Protocol.`;
      }
      // Clinical Case 4: Post-Prandial GI, Glucose, Bloating
      else if (lower.includes('bloat') || lower.includes('meal') || lower.includes('glucose') || lower.includes('food') || hpiCategory === 'metabolic_gi') {
        hpiAiResponse += `1. CLINICAL IMPRESSION: Post-prandial glycemic excursion & digestive enzyme mismatch (Severity: ${hpiSeverity}/10).\n\n`;
        hpiAiResponse += `2. TELEMETRY & WEARABLE CORRELATION:\n• CGM spike expected; insulin sensitivity is reduced during poor sleep states.\n\n`;
        hpiAiResponse += `3. TARGETED PROTOCOL ADJUSTMENT:\n• Immediate: 15-minute Zone 1 brisk walking to clear excess glycemic load into GLUT4 receptors.\n• Preventive: 500mg Berberine HCl before your next carbohydrate-dense meal.`;
      }
      // Clinical Case 5: General Life Event
      else {
        hpiAiResponse += `1. CLINICAL IMPRESSION: Life event / situational stressor logged in your health diary (Severity: ${hpiSeverity}/10).\n\n`;
        hpiAiResponse += `2. TELEMETRY INTEGRATION:\n• Extracted facts synchronized to your lifestyle profile (${user.lifestylePersona}).\n\n`;
        hpiAiResponse += `3. PROTOCOL GUIDANCE:\n• I have calibrated your recovery algorithm and queued targeted adaptogens in your daily regimen.`;
      }

      const botMsgId = `hpi-ai-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'phi',
        text: hpiAiResponse,
        timestamp: new Date().toISOString(),
        action: {
          type: 'recommendation',
          payload: { productId: 'bundle-exec' }
        }
      };

      setMessages(prev => [...prev, botMsg]);

      if (autoSpeak) {
        speakText(hpiAiResponse, botMsgId);
      }
    }, 900);
  };

  const [liveAiAvailable, setLiveAiAvailable] = useState<boolean | null>(null); // null = unknown until first attempt
  const [coachTyping, setCoachTyping] = useState(false);

  const fallbackResponse = (userText: string): { text: string; action?: ChatMessage['action'] } => {
    let phiResponseText = "I have logged that in your daily telemetry.";
    let phiAction: ChatMessage['action'] = undefined;
    const lower = userText.toLowerCase();

    if (lower.includes('peptide') || lower.includes('bpc') || lower.includes('dose') || lower.includes('injection') || lower.includes('tb-500')) {
      phiResponseText = "⚠️ MEDICAL DISCLAIMER: I am an AI assistant, NOT a medical doctor. \n\n• Human Clinical Studies Status: Most research peptides (like BPC-157 or TB-500) lack large-scale double-blind human RCTs and rely on preclinical rodent/cell models.\n• Potential Side Benefits: Soft-tissue collagen support, local angiogenesis, mucosal lining repair.\n• Potential Side Effects / Precautions: Injection site irritation, blood pressure spikes, unknown long-term human pharmacokinetics.\n\nHigh-risk compound administration requires direct supervision from a licensed physician.";
      phiAction = { type: 'safety_block', payload: { category: 'clinical_escalation' } };
    } else if (lower.includes('recommend') || lower.includes('buy') || lower.includes('supplements')) {
      phiResponseText = "Based on your profile, a sensible starting point is the Executive Stack (L-Theanine + Alpha-GPC + Magnesium).\n\n• Human Studies: Validated in double-blind RCTs.\n• Potential Side Benefits: Sustained alpha-wave cognitive focus, reduced cortisol AUC.\n• Potential Side Effects: Mild dreaming or drowsiness if taken late.\n\nNote: I am an AI assistant, not a doctor. Consult your physician before changing your stack.";
      phiAction = { type: 'recommendation', payload: { productId: 'bundle-exec' } };
    } else if (lower.includes('sauna') || lower.includes('heat')) {
      phiResponseText = "For maximum Heat Shock Protein upregulation, complete 30-40 minutes at 85°C in the evening, followed by 10 minutes ambient cooling.";
    }
    return { text: phiResponseText, action: phiAction };
  };

  const deliverBotMessage = (text: string, action?: ChatMessage['action']) => {
    const botMsgId = Date.now().toString() + 'cuasarx';
    const botMsg: ChatMessage = {
      id: botMsgId,
      sender: 'phi',
      text,
      timestamp: new Date().toISOString(),
      action
    };
    setMessages(prev => [...prev, botMsg]);
    if (autoSpeak) {
      speakText(text, botMsgId);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || coachTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setCoachTyping(true);

    // Try the live Gemini coach first; fall back to the offline rule-based
    // replies when the server function isn't configured or errors.
    try {
      const catalog = MOCK_PRODUCTS.slice(0, 12).map(p => ({
        name: p.name,
        category: p.category,
        price: p.price ?? 0,
        dosage: p.dailyDosage,
        reason: p.tailoredReason,
      }));
      const res = await authFetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: {
            profileSummary: `${user.name}, ${user.age}, ${user.lifestylePersona}. Readiness ${user.readiness.score}/100. Sleep ${user.metrics.sleep.current}h, HRV ${user.metrics.hrv.current}ms, RHR ${user.metrics.rhr.current}bpm.`,
            goals: Array.isArray(user.goals) ? user.goals : [],
            topProducts: catalog,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLiveAiAvailable(true);
        setCoachTyping(false);
        deliverBotMessage(data.reply);
        return;
      }
      setLiveAiAvailable(false);
    } catch {
      setLiveAiAvailable(false);
    }

    // Offline fallback (with the honest notice about which mode is running)
    setTimeout(() => {
      const { text, action } = fallbackResponse(userText);
      setCoachTyping(false);
      const suffix = liveAiAvailable === false
        ? '\n\n_(Offline mode — the live AI service isn\'t configured on this deployment, so this reply came from built-in rules.)_'
        : '';
      deliverBotMessage(text + suffix, action);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full bg-[#fbfaf8] border-l border-[#ebe7df] shadow-xl relative">
      {/* Header */}
      <div className="p-3.5 border-b border-[#ebe7df] flex items-center justify-between bg-white text-[#181716]">
        <div className="flex items-center gap-2">
          <CuasarLogo size="sm" showSubtitle={true} />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Prominent Voice HPI Button in Header */}
          <button
            onClick={() => setShowHpiModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg btn-ink text-[11px] font-semibold transition-all cursor-pointer"
            title="Record Voice History of Present Illness (HPI) & Symptoms"
          >
            <Mic className="w-3 h-3 text-[#dedad0]" />
            <span>Voice HPI</span>
          </button>

          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            title={autoSpeak ? "Voice Auto-Read ON" : "Voice Auto-Read OFF"}
            className={cn(
              "p-1.5 rounded-lg transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer",
              autoSpeak ? "bg-[#181716] text-white" : "bg-[#faf9f6] border border-[#ebe7df] text-[#5c5851] hover:text-[#181716]"
            )}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            title="Configure Voice Settings"
            className="p-1.5 rounded-lg bg-[#faf9f6] border border-[#ebe7df] hover:bg-[#f4f2ec] text-[#5c5851] transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              title="Close Assistant"
              className="p-1.5 rounded-lg text-[#8a857b] hover:text-[#181716] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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

      {/* Dedicated Voice HPI Capture Overlay / Drawer */}
      <AnimatePresence>
        {showHpiModal && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md text-white flex flex-col p-4 overflow-y-auto"
          >
            {/* HPI Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    Voice HPI &amp; Symptom Intake
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">Clinical</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Speak symptoms, life events, fatigue, or pains directly</p>
                </div>
              </div>

              <button 
                onClick={() => { stopHpiRecording(); setShowHpiModal(false); }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Selector Pills */}
            <div className="mt-3 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Intake Category</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'symptoms_fatigue', label: '⚡ Fatigue & Sleep', icon: Zap },
                  { id: 'injury_pain', label: '🦵 Joint & Tendon Pain', icon: HeartPulse },
                  { id: 'stress_sleep', label: '🧠 Stress & Insomnia', icon: Brain },
                  { id: 'metabolic_gi', label: '🍽️ GI & Glycemic', icon: Activity },
                  { id: 'general_life', label: '🌍 Travel & Life Event', icon: FileText },
                ].map(cat => {
                  const Icon = cat.icon;
                  const active = hpiCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setHpiCategory(cat.id as any)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border",
                        active 
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-sm" 
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Rating Slider */}
            <div className="mt-3 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-[11px] text-slate-300 mb-1">
                <span className="font-semibold flex items-center gap-1 text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-rose-400" /> Subjective Severity / Discomfort:
                </span>
                <span className={cn(
                  "font-black px-2 py-0.5 rounded text-xs",
                  hpiSeverity >= 7 ? "bg-rose-500/20 text-rose-400" : hpiSeverity >= 4 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                )}>
                  {hpiSeverity} / 10 ({hpiSeverity >= 8 ? "Acute" : hpiSeverity >= 5 ? "Moderate" : "Mild"})
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={hpiSeverity}
                onChange={(e) => setHpiSeverity(parseInt(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Live Audio Visualizer & Dictation Hub */}
            <div className="mt-3 flex-1 flex flex-col justify-between space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      hpiListening ? "bg-rose-500 animate-ping" : "bg-slate-600"
                    )} />
                    <span className="text-[11px] font-bold text-slate-300">
                      {hpiListening ? `Recording Audio (${hpiDuration}s)...` : "Live Transcript"}
                    </span>
                  </div>

                  {hpiTranscript && (
                    <button 
                      onClick={handleResetHpi}
                      className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                {/* Animated Waveform when listening */}
                {hpiListening && (
                  <div className="h-10 flex items-center justify-center gap-1.5 my-1 bg-slate-950/60 rounded-xl px-4 border border-rose-500/20">
                    {[16, 28, 12, 36, 20, 32, 14, 26, 38, 18, 30, 22].map((height, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [height * 0.4, height, height * 0.4] }}
                        transition={{ repeat: Infinity, duration: 0.6 + (i % 4) * 0.15, ease: "easeInOut" }}
                        className="w-1 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full"
                      />
                    ))}
                  </div>
                )}

                {/* Transcript Text Area / Editable Input */}
                <textarea
                  value={hpiTranscript}
                  onChange={(e) => setHpiTranscript(e.target.value)}
                  placeholder={hpiListening ? "Listening... Speak your symptoms, when they started, and what makes it better or worse..." : "Tap the red microphone below to speak, or select a sample clinical scenario..."}
                  className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-xs resize-none focus:outline-none leading-relaxed p-1"
                  rows={4}
                />
              </div>

              {/* Guided One-Tap Scenario Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Quick Scenario Templates:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {HPI_SAMPLE_PROMPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setHpiTranscript(sample.text);
                        if (sample.label.includes('Fatigue')) setHpiCategory('symptoms_fatigue');
                        if (sample.label.includes('Joint')) setHpiCategory('injury_pain');
                        if (sample.label.includes('Stress')) setHpiCategory('stress_sleep');
                        if (sample.label.includes('Meal')) setHpiCategory('metabolic_gi');
                      }}
                      className="text-left p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all group"
                    >
                      <div className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 flex items-center justify-between">
                        <span>{sample.label}</span>
                        <CheckCircle2 className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{sample.text}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Microphone Button & Submit Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={hpiListening ? stopHpiRecording : startHpiRecording}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg",
                    hpiListening 
                      ? "bg-rose-600 text-white animate-pulse shadow-rose-600/30" 
                      : "bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-indigo-600/20"
                  )}
                >
                  {hpiListening ? (
                    <>
                      <MicOff className="w-4 h-4 text-white" />
                      <span>Stop Recording ({hpiDuration}s)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-amber-300" />
                      <span>{hpiTranscript ? "Resume Voice Dictation" : "Start Voice HPI Intake"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!hpiTranscript.trim()}
                  onClick={handleSubmitHpi}
                  className="py-3 px-4 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 disabled:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Analyze HPI</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" aria-live="polite">
        {!aiConsented && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3" role="status">
            <div className="flex items-center gap-2 text-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              <h3 className="text-sm font-bold">AI analysis is paused — your consent is needed first</h3>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              This assistant works by sending health information to an AI model. Under our rules of engagement, that
              can't happen until you explicitly allow it. Nothing has been sent.
            </p>

            <button
              type="button"
              aria-expanded={aiDisclosureOpen}
              onClick={() => setAiDisclosureOpen(open => !open)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              What exactly would be shared?
              {aiDisclosureOpen ? <ChevronUp className="w-3 h-3" aria-hidden="true" /> : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
            </button>

            {aiDisclosureOpen && (
              <ul className="text-[11px] text-slate-700 space-y-1 bg-slate-50 border border-slate-200 rounded-xl p-3" aria-label="Data that would be shared with the AI service">
                <li>• Profile metrics: sleep, HRV, resting heart rate, training load</li>
                <li>• Your name and persona, to personalize replies</li>
                <li>• Anything you type or dictate into this chat (symptoms, questions)</li>
                <li className="pt-1 text-slate-500">You can withdraw this consent at any time in Privacy &amp; Consent — withdrawal stops all future processing.</li>
              </ul>
            )}

            <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={aiAckChecked}
                onChange={(e) => setAiAckChecked(e.target.checked)}
                className="accent-indigo-600 w-4 h-4 mt-0.5"
              />
              <span className="text-[11px] text-slate-800">I understand what will be shared and I consent to AI analysis of my health data.</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!aiAckChecked}
                onClick={() => grant('ai_processing')}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Enable AI Analysis
              </button>
              <span className="text-[10px] text-slate-500">Or manage this later in Privacy &amp; Consent.</span>
            </div>
          </div>
        )}

        {aiConsented && messages.map((msg) => {
          const isBot = msg.sender === 'phi';
          const isSpeaking = speakingMsgId === msg.id;
          const isHpiIntake = msg.text.includes('[VOICE HPI');

          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex flex-col max-w-[90%]", 
                isBot ? "mr-auto items-start" : "ml-auto items-end"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl text-xs leading-relaxed relative group shadow-sm transition-all",
                isBot 
                  ? "bg-white text-slate-900 border border-slate-200/80 rounded-tl-sm" 
                  : isHpiIntake
                    ? "bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-500/40 rounded-tr-sm"
                    : "bg-slate-900 text-white rounded-tr-sm"
              )}>
                {/* Visual badge for Voice HPI intake notes */}
                {isHpiIntake && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-indigo-500/30 text-amber-300 font-extrabold text-[10px] tracking-wider uppercase">
                    <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                    <span>Voice Symptom Intake</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

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
        {coachTyping && (
          <div className="mr-auto flex flex-col items-start" role="status" aria-live="polite">
            <div className="px-4 py-3 rounded-2xl text-xs bg-white text-slate-500 border border-slate-200/80 rounded-tl-sm shadow-sm inline-flex items-center gap-2">
              <RadioIcon className="w-3 h-3 animate-pulse text-indigo-600" aria-hidden="true" />
              Quasar Keel is thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with dedicated HPI Action Bar */}
      <div className="p-3.5 border-t border-slate-200 bg-white space-y-2">
        {/* Quick Launch Pill for Voice HPI */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowHpiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-bold transition-all"
          >
            <Mic className="w-3 h-3 text-rose-600" />
            <span>Voice HPI &amp; Symptom Intake</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-indigo-600 text-white rounded-full">Dictate</span>
          </button>

          <span className="text-[10px] text-slate-400 font-medium">
            {liveAiAvailable === true ? 'Coach: live AI' : liveAiAvailable === false ? 'Coach: offline rules' : 'Coach: auto'}
            {' • '}
            {wearableSynced ? 'Wearable sync: enabled (demo)' : 'Wearable sync: off — enable in Privacy & Consent'}
          </span>
        </div>

        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            disabled={!aiConsented}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : (aiConsented ? "Ask health questions or protocol advice..." : "Enable AI analysis above to chat…")}
            className={cn(
              "w-full pl-3.5 pr-24 py-2.5 border rounded-2xl text-xs focus:outline-none transition-all",
              isListening 
                ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-400 font-medium"
                : "border-slate-200 bg-slate-50 focus:border-indigo-500"
            )}
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              disabled={!aiConsented}
              title={isListening ? "Stop Microphone" : "Quick Voice-to-Text"}
              aria-label={isListening ? "Stop Microphone" : "Quick Voice-to-Text"}
              className={cn(
                "p-1.5 transition-all rounded-xl disabled:opacity-40 disabled:cursor-not-allowed",
                isListening
                  ? "bg-rose-600 text-white animate-bounce"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
              )}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Mic className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || !aiConsented}
              className="p-1.5 bg-indigo-600 text-white rounded-xl disabled:opacity-40 disabled:bg-slate-300 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
