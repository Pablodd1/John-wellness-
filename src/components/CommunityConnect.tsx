import React, { useState } from 'react';
import { UserProfile, PeerMatch } from '../types';
import { MOCK_PEER_MATCHES } from '../data';
import { Users, Flame, MapPin, Calendar, Clock, Sparkles, CheckCircle2, MessageSquare, Briefcase, Zap, ShieldAlert, Bot } from 'lucide-react';
import { GroupChat } from './GroupChat';

interface CommunityConnectProps {
  user: UserProfile;
  onEvaluateWithAi?: (text: string, senderName: string) => void;
}

export function CommunityConnect({ user, onEvaluateWithAi = () => {} }: CommunityConnectProps) {
  const [activeTab, setActiveTab] = useState<'group_chat' | 'peer_matches'>('group_chat');
  const [activeFilter, setActiveFilter] = useState<'all' | 'workout' | 'coworking'>('all');
  const [invitedPeer, setInvitedPeer] = useState<string | null>(null);

  const filteredPeers = MOCK_PEER_MATCHES.filter(peer => {
    if (activeFilter === 'coworking') return peer.coWorkingAvailable;
    return true;
  });

  const handleSendInvite = (peerName: string) => {
    setInvitedPeer(peerName);
    setTimeout(() => {
      setInvitedPeer(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Biohacking Community &amp; Operator Lounge</h2>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            Interact live in the global group chat, share protocol questions, and evaluate any community response instantly with your CuasarX Personal AI.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-800/90 text-indigo-300 px-4 py-2 rounded-2xl border border-slate-700 font-semibold self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Live Synchronized Lounge Active</span>
        </div>
      </div>

      {/* Primary Sub-Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={() => setActiveTab('group_chat')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'group_chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Live Community Group Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('peer_matches')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'peer_matches'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Peer &amp; Co-Working Matches
          </button>
        </div>
      </div>

      {/* Main View Content */}
      {activeTab === 'group_chat' ? (
        <GroupChat user={user} onEvaluateWithAi={onEvaluateWithAi} />
      ) : (
        <div className="space-y-6">
          {/* Persona Context Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-indigo-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                  <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                    {user.lifestylePersona}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Matching preference: {user.trainingPlan.type} &amp; Parasympathetic co-sessions</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all flex-1 sm:flex-none ${activeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All Matches
              </button>
              <button
                onClick={() => setActiveFilter('workout')}
                className={`px-3 py-1.5 rounded-lg transition-all flex-1 sm:flex-none ${activeFilter === 'workout' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Workout Peers
              </button>
              <button
                onClick={() => setActiveFilter('coworking')}
                className={`px-3 py-1.5 rounded-lg transition-all flex-1 sm:flex-none ${activeFilter === 'coworking' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Executive Co-Working
              </button>
            </div>
          </div>

          {/* Success Notification Banner */}
          {invitedPeer && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Invitation Sent to {invitedPeer}!</strong> Meeting request dispatched with synchronized low-stress window &amp; shared supplement protocol.
                </span>
              </div>
            </div>
          )}

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPeers.map((peer) => (
              <div key={peer.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={peer.avatar} alt={peer.name} className="w-12 h-12 rounded-2xl bg-slate-100 object-cover" />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${peer.onlineStatus === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{peer.name}</h4>
                        <p className="text-[11px] text-slate-500">{peer.role}</p>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-xl border border-indigo-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      {peer.compatibilityScore}% Match
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{peer.location}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-500" /> Biohacking Style</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{peer.biohackingStyle}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Workout / Session</span>
                      <p className="text-xs text-slate-800 font-semibold">{peer.preferredWorkout}</p>
                    </div>

                    {/* Shared Stacks */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Shared Regimen Supplements</span>
                      <div className="flex flex-wrap gap-1">
                        {peer.sharedSupplements.map((sup, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-medium">
                            {sup}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => handleSendInvite(peer.name)}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Invite to Workout &amp; Sauna
                  </button>

                  {peer.coWorkingAvailable && (
                    <button
                      onClick={() => handleSendInvite(`${peer.name} (Co-Working Lounge)`)}
                      className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl font-bold text-xs border border-indigo-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      Schedule Executive Co-Working Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

