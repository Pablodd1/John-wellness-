import React from 'react';
import { UserProfile } from '../types';
import { SYNTHETIC_USERS } from '../data';
import { Users, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export function UserSelector({ 
  selectedUser, 
  onSelect 
}: { 
  selectedUser: UserProfile; 
  onSelect: (u: UserProfile) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors w-full text-left"
      >
        <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300" />
        <div className="flex-1 hidden md:block">
          <p className="text-sm font-semibold text-slate-900">{selectedUser.name}</p>
          <p className="text-xs text-slate-500 truncate">{selectedUser.role}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <Users className="w-4 h-4" /> Synthetic Users
          </div>
          <div className="max-h-80 overflow-y-auto">
            {SYNTHETIC_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => {
                  onSelect(user);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full p-3 text-left hover:bg-slate-50 transition-colors border-l-2",
                  selectedUser.id === user.id ? "border-indigo-500 bg-indigo-50/50" : "border-transparent"
                )}
              >
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-slate-200" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{user.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
