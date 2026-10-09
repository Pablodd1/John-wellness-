import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Activity, 
  Users, 
  ArrowRight, 
  Bot, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Zap,
  Flame
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export interface GroupMessage {
  id: string;
  senderName: string;
  senderRole: string;
  avatar: string;
  text: string;
  timestamp: string;
  category?: 'Question' | 'Insight' | 'Protocol' | 'Telemetry';
  evaluatedByAi?: boolean;
}

const INITIAL_GROUP_MESSAGES: GroupMessage[] = [
  {
    id: 'g1',
    senderName: 'Elena Rostova (Wellness Coach)',
    senderRole: 'Wellness Coach & Longevity Lead',
    avatar: 'https://images.unsplash.com/photo-1594824813566-7885a3977341?w=150&auto=format&fit=crop&q=80',
    text: 'Community Question: Is anyone combining the Norwegian 4x4 interval protocol with red-light bio-photomodulation immediately post-session? Looking at mitochondrial biogenesis markers.',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    category: 'Question'
  },
  {
    id: 'g2',
    senderName: 'Marcus Vance',
    senderRole: 'Executive Biohacker & Ironman Athlete',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: 'I have been using 20 mins 660nm/850nm on quadriceps immediately after 4x4 intervals. My lactate clearance rate improved by 18% on Oura/WHOOP recovery logs.',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    category: 'Protocol'
  },
  {
    id: 'g3',
    senderName: 'Sarah Chen',
    senderRole: 'Quantified Self Researcher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    text: 'Dexcom G7 update: Fasted 24h glucose stayed flat at 84 mg/dL using L-Theanine + Berberine before sleep. Zero night-time glycemic spikes recorded.',
    timestamp: new Date(Date.now() - 3600000 * 0.9).toISOString(),
    category: 'Telemetry'
  },
  {
    id: 'g4',
    senderName: 'Alex Rivera',
    senderRole: 'Performance Physical Therapist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    text: 'Has anyone evaluated BPC-157 vs TB-500 specifically for patellar tendon tightness post heavy eccentric squatting?',
    timestamp: new Date(Date.now() - 3600000 * 0.4).toISOString(),
    category: 'Question'
  }
];

interface GroupChatProps {
  user: UserProfile;
  onEvaluateWithAi: (text: string, senderName: string) => void;
}

export function GroupChat({ user, onEvaluateWithAi }: GroupChatProps) {
  const [messages, setMessages] = useState<GroupMessage[]>(INITIAL_GROUP_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [evaluatedMsgIds, setEvaluatedMsgIds] = useState<string[]>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const isQuestion = inputText.includes('?') || inputText.toLowerCase().includes('how') || inputText.toLowerCase().includes('what');

    const newMsg: GroupMessage = {
      id: `msg-${Date.now()}`,
      senderName: user.name,
      senderRole: user.lifestylePersona,
      avatar: user.avatar,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      category: isQuestion ? 'Question' : 'Insight'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate reply from peer operator after 2 seconds
    setTimeout(() => {
      const peerReply: GroupMessage = {
        id: `msg-reply-${Date.now()}`,
        senderName: 'Elena Rostova (Wellness Coach)',
        senderRole: 'Wellness Coach',
        avatar: 'https://images.unsplash.com/photo-1594824813566-7885a3977341?w=150&auto=format&fit=crop&q=80',
        text: `Great point @${user.name.split(' ')[0]}! That aligns with recent clinical literature on parasympathetic nervous system recovery. Let's run this through CuasarX Assistant for a personalized safety check.`,
        timestamp: new Date().toISOString(),
        category: 'Insight'
      };
      setMessages(prev => [...prev, peerReply]);
    }, 2000);
  };

  const handleEvaluate = (msg: GroupMessage) => {
    setEvaluatedMsgIds(prev => [...prev, msg.id]);
    onEvaluateWithAi(msg.text, msg.senderName);
  };

  const filteredMessages = messages.filter(m => {
    if (activeCategoryFilter === 'All') return true;
    return m.category === activeCategoryFilter;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Group Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base leading-tight text-white">
                Live Biohacking Operator Group Lounge
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-indigo-300">
              Interactive community chat • Direct integration with CuasarX Assistant
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-[11px] font-semibold self-start sm:self-auto">
          {['All', 'Question', 'Protocol', 'Telemetry'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all",
                activeCategoryFilter === cat ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
        {filteredMessages.map((msg) => {
          const isUser = msg.senderName === user.name;
          const isEvaluated = evaluatedMsgIds.includes(msg.id);

          return (
            <div 
              key={msg.id} 
              className={cn(
                "p-4 rounded-2xl border transition-all space-y-3 bg-white shadow-sm",
                isUser ? "border-indigo-200 ring-1 ring-indigo-500/20" : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={msg.avatar} alt={msg.senderName} className="w-10 h-10 rounded-2xl bg-slate-100 object-cover border border-slate-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{msg.senderName}</h4>
                      {msg.category && (
                        <span className={cn(
                          "text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider",
                          msg.category === 'Question' ? "bg-amber-100 text-amber-800 border border-amber-200" :
                          msg.category === 'Protocol' ? "bg-indigo-100 text-indigo-800 border border-indigo-200" :
                          "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        )}>
                          {msg.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{msg.senderRole}</p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </span>
              </div>

              {/* Message Content */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {msg.text}
              </p>

              {/* Action Bar for Live Evaluation with Personal AI */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Community Peer Verified</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleEvaluate(msg)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm",
                    isEvaluated 
                      ? "bg-emerald-600 text-white" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  )}
                >
                  <Bot className="w-3.5 h-3.5" />
                  {isEvaluated ? "Evaluated in CuasarX Assistant" : "Evaluate with CuasarX Personal AI"}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Group Chat Input Bar */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question or share a protocol insight with the biohacking community..."
              className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Post
            </button>
          </div>

          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Tip: Any question or protocol shared here can be evaluated live by your personal CuasarX Assistant.</span>
          </p>
        </form>
      </div>
    </div>
  );
}
