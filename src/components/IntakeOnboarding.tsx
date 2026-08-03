import React, { useState, useEffect } from 'react';
import { UserProfile, ExtractedFact } from '../types';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';

type OnboardingStep = {
  id: string;
  question: string;
  category: string;
  whyItMatters: string;
  structuredOptions?: string[];
  followUpTrigger?: (answer: string) => string | null;
};

const BASE_QUESTIONS: OnboardingStep[] = [
  {
    id: 'q1',
    question: "Hello! I am CuasarX Assistant, your Health Intelligence engine for JohnMatrix. What are your primary athletic or wellness goals for this quarter?",
    category: 'Primary Goals',
    whyItMatters: "Helps tailor periodization, daily readiness calculations, and recovery protocols.",
    structuredOptions: ['Marathon / Endurance Race', 'Hypertrophy & Strength', 'Fat Loss & Body Composition', 'Executive Stress & Energy']
  },
  {
    id: 'q2',
    question: "How many days per week do you currently train, and do you have any active injuries or joint discomfort?",
    category: 'Training & Injuries',
    whyItMatters: "Prevents acute workload spikes and filters out contraindicated strength movements.",
    structuredOptions: ['3 Days/wk (No Injury)', '4-5 Days/wk (Mild Joint Soreness)', '6+ Days/wk (Active Injury)']
  },
  {
    id: 'q3',
    question: "What is your typical sleep duration and average work stress level on a scale from 1 to 10?",
    category: 'Circadian & Stress',
    whyItMatters: "Directly determines your baseline HRV recovery capacity and daily workout suppression rules.",
    structuredOptions: ['< 6 hrs / High Stress (8-10)', '6-7 hrs / Moderate Stress (5-7)', '8+ hrs / Low Stress (1-4)']
  }
];

export function IntakeOnboarding({ 
  user, 
  onComplete 
}: { 
  user: UserProfile; 
  onComplete?: (updatedUser: Partial<UserProfile>) => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [extractedFacts, setExtractedFacts] = useState<ExtractedFact[]>([]);
  const [showingConfirmation, setShowingConfirmation] = useState(false);
  const [pendingFacts, setPendingFacts] = useState<ExtractedFact[]>([]);

  const currentStep = BASE_QUESTIONS[currentStepIndex] || BASE_QUESTIONS[0];

  // Speech Recognition Setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2500);
    }
  };

  const handleStartVoice = () => {
    setIsListening(true);
    // Simulate voice intake for robust demo performance across browsers
    setTimeout(() => {
      setIsListening(false);
      handleProcessAnswer("I train 6 days a week, but my left knee has been hurting since Tuesday during long runs.");
    }, 3000);
  };

  const handleProcessAnswer = (answerText: string) => {
    // Generate extracted facts based on current step
    const newFact: ExtractedFact = {
      id: Date.now().toString(),
      key: currentStep.category,
      value: answerText,
      category: currentStep.category,
      confidence: 0.96,
      source: 'voice',
      verified: false
    };

    setPendingFacts([newFact]);
    setShowingConfirmation(true);
  };

  const confirmFact = () => {
    setExtractedFacts(prev => [...prev, ...pendingFacts]);
    setPendingFacts([]);
    setShowingConfirmation(false);
    setTextInput('');

    if (currentStepIndex < BASE_QUESTIONS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      speakQuestion(BASE_QUESTIONS[nextIndex].question);
    } else {
      // Completed
      if (onComplete) {
        onComplete({
          dataCompleteness: Math.min(100, user.dataCompleteness + 25)
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Multimodal Intake Experience</span>
          <h2 className="text-2xl font-bold text-slate-900">Conversational Onboarding with Phi</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          Step {currentStepIndex + 1} of {BASE_QUESTIONS.length}
        </div>
      </div>

      {/* Phi Voice Avatar Display */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
        {/* Animated Avatar Orb */}
        <div className="relative flex items-center justify-center">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
            isSpeaking ? "bg-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.6)] scale-110" :
            isListening ? "bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse" :
            "bg-indigo-600 shadow-md"
          )}>
            <Activity className="w-10 h-10 text-white animate-spin-slow" />
          </div>

          {/* Soundwaves visualizer */}
          {(isSpeaking || isListening) && (
            <div className="absolute flex gap-1 items-center h-12 bottom-[-10px]">
              <span className="w-1 bg-indigo-400 h-6 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-indigo-300 h-10 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-indigo-400 h-8 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-indigo-200 h-4 animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>
          )}
        </div>

        {/* State Tag */}
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {isSpeaking ? "Phi is Speaking..." : isListening ? "Listening to your response..." : "Phi Ready"}
        </div>

        {/* Question Text */}
        <p className="text-lg md:text-xl font-medium max-w-2xl leading-relaxed text-slate-100">
          "{currentStep.question}"
        </p>

        {/* Why it matters banner */}
        <div className="text-xs text-slate-400 bg-slate-800/50 px-4 py-2 rounded-xl max-w-lg border border-slate-700/50 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span><strong>Why Phi asks:</strong> {currentStep.whyItMatters}</span>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-2 pt-2">
          <button 
            onClick={() => speakQuestion(currentStep.question)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
            title="Read question aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Answer Modal / Response Area (3-Way Inputs) */}
      {!showingConfirmation ? (
        <div className="space-y-6 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Choose How to Answer:</h3>

          {/* Option 1: Structured Selection */}
          {currentStep.structuredOptions && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-600 block">1. Quick Selection</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentStep.structuredOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleProcessAnswer(opt)}
                    className="p-3.5 bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 text-left transition-all flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Option 2: Voice Input */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600 block">2. Speak Your Response</span>
            <button
              onClick={handleStartVoice}
              disabled={isListening}
              className={cn(
                "w-full py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all font-semibold text-sm shadow-sm",
                isListening 
                  ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse" 
                  : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100/80 text-indigo-900"
              )}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 text-rose-600" />
                  Listening... Speak clearly into mic
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-indigo-600" />
                  Press to Speak Naturally
                </>
              )}
            </button>
          </div>

          {/* Option 3: Text Box */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600 block">3. Type Detailed Text</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your response here..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => textInput.trim() && handleProcessAnswer(textInput)}
                disabled={!textInput.trim()}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold disabled:opacity-50 hover:bg-slate-800 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Confirmation step for extracted facts */
        <div className="bg-indigo-50/50 border border-indigo-200 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Fact Extraction Confirmation
            </h4>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              96% Confidence
            </span>
          </div>

          <div className="space-y-3">
            {pendingFacts.map(fact => (
              <div key={fact.id} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">{fact.category}</span>
                <p className="text-sm font-semibold text-slate-900">"{fact.value}"</p>
                <p className="text-xs text-slate-400">Extracted via {fact.source} intake engine</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowingConfirmation(false)}
              className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Edit / Re-answer
            </button>
            <button
              onClick={confirmFact}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm & Save Fact
            </button>
          </div>
        </div>
      )}

      {/* Extracted Facts Summary Tray */}
      {extractedFacts.length > 0 && (
        <div className="pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Saved Intake Facts ({extractedFacts.length})</h4>
          <div className="flex flex-wrap gap-2">
            {extractedFacts.map(fact => (
              <span key={fact.id} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <strong>{fact.key}:</strong> {fact.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
