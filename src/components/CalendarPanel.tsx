import React, { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2, CalendarDays, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

type CalEvent = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  kind: 'meeting' | 'training' | 'appointment' | 'personal';
};

const KIND_OPTIONS: { value: CalEvent['kind']; label: string }[] = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'training', label: 'Training' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'personal', label: 'Personal' },
];

const KIND_DOT: Record<CalEvent['kind'], string> = {
  meeting: 'bg-orange-500',
  training: 'bg-emerald-400',
  appointment: 'bg-sky-400',
  personal: 'bg-purple-400',
};

/**
 * Visual month calendar — dynamic dates, event dots, add/delete tasks.
 * Everything persists to the calendar_events table, which also feeds the
 * voice receptionist's briefing (weather/calendar/meds) automatically.
 */
export function CalendarPanel() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [selected, setSelected] = useState<Date>(new Date());
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [kind, setKind] = useState<CalEvent['kind']>('meeting');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!isSupabaseConfigured || !supabase || !user) { setEvents([]); return; }
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, starts_at, location, kind')
        .gte('starts_at', new Date(Date.now() - 30 * 864e5).toISOString())
        .order('starts_at', { ascending: true })
        .limit(60);
      setEvents(error ? [] : (data as CalEvent[]) ?? []);
    } catch {
      setEvents([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    const days: Date[] = [];
    for (let d = start; d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) days.push(d);
    return days;
  }, [month]);

  const eventsOn = (day: Date) => (events ?? []).filter((e) => isSameDay(new Date(e.starts_at), day));
  const selectedEvents = eventsOn(selected);

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Give the task a name.'); return; }
    if (!supabase || !user) { setError('Sign in to save tasks to your calendar.'); return; }
    setBusy(true);
    setError(null);
    const [h, m] = time.split(':').map(Number);
    const at = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), h || 9, m || 0);
    const { error: err } = await supabase.from('calendar_events').insert({
      user_id: user.id,
      title: title.trim(),
      starts_at: at.toISOString(),
      location: location.trim() || null,
      kind,
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setTitle(''); setLocation('');
    setAdding(false);
    load();
  };

  const removeEvent = async (id: string) => {
    if (!supabase) return;
    await supabase.from('calendar_events').delete().eq('id', id);
    load();
  };

  const cell = 'min-h-[52px] p-1.5 text-center rounded-lg transition-colors';

  return (
    <section aria-labelledby="cal-heading" className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 shadow-sm space-y-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 id="cal-heading" className="text-sm font-bold text-[#f4f2ec] flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-orange-400" aria-hidden="true" /> My Calendar
          <span className="text-[10px] font-normal text-stone-500">— synced to your briefing &amp; voice assistant</span>
        </h2>
        <button
          onClick={() => setAdding((a) => !a)}
          aria-expanded={adding}
          className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add task
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonth(addMonths(month, -1))}
          aria-label="Previous month"
          className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <span className="text-sm font-bold text-[#f4f2ec]" aria-live="polite">{format(month, 'MMMM yyyy')}</span>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label="Next month"
          className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Month grid */}
      <div role="grid" aria-label={format(month, 'MMMM yyyy') + ' calendar'}>
        <div className="grid grid-cols-7 text-[10px] font-bold text-stone-500 uppercase mb-1" aria-hidden="true">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {grid.map((day) => {
            const dayEvents = eventsOn(day);
            const isSelected = isSameDay(day, selected);
            const dim = !isSameMonth(day, month);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                aria-label={`${format(day, 'EEEE, MMMM d')}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
                aria-pressed={isSelected}
                className={cn(
                  cell,
                  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                  dim ? 'text-stone-600' : 'text-[#f4f2ec] hover:bg-white/10',
                  isSelected && 'bg-orange-600/25 ring-1 ring-orange-500',
                  isToday(day) && !isSelected && 'ring-1 ring-white/30'
                )}
              >
                <span className={cn('block text-[11px] font-semibold', isToday(day) && 'text-orange-400')}>{day.getDate()}</span>
                <span className="flex items-center justify-center gap-0.5 h-1.5" aria-hidden="true">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className={cn('w-1 h-1 rounded-full', KIND_DOT[e.kind])} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add task form */}
      {adding && (
        <form onSubmit={addEvent} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.04] space-y-2.5">
          <div>
            <label htmlFor="cal-title" className="block text-[11px] font-bold text-[#f4f2ec] mb-1">Task or event <span className="text-red-400">*</span></label>
            <input
              id="cal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bloodwork at the lab"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-[#f4f2ec] placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="cal-date" className="block text-[11px] font-bold text-[#f4f2ec] mb-1">Date</label>
              <input id="cal-date" type="text" value={format(selected, 'MMM d, yyyy')} readOnly aria-readonly="true" className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.02] border border-white/10 text-stone-400 cursor-default" />
            </div>
            <div>
              <label htmlFor="cal-time" className="block text-[11px] font-bold text-[#f4f2ec] mb-1">Time</label>
              <input id="cal-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-[#f4f2ec] focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label htmlFor="cal-kind" className="block text-[11px] font-bold text-[#f4f2ec] mb-1">Type</label>
              <select id="cal-kind" value={kind} onChange={(e) => setKind(e.target.value as CalEvent['kind'])} className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-[#f4f2ec] focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer">
                {KIND_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="cal-loc" className="block text-[11px] font-bold text-[#f4f2ec] mb-1">Location <span className="font-normal text-stone-500">(optional)</span></label>
            <input
              id="cal-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Telehealth, gym, office"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/10 text-[#f4f2ec] placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {error && <p role="alert" className="text-[11px] text-red-400 font-bold">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => { setAdding(false); setError(null); }} className="btn-stone px-3 py-1.5 text-[11px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">Cancel</button>
            <button type="submit" disabled={busy} className="btn-ink px-4 py-1.5 text-[11px] inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e100f]">
              {busy ? 'Saving…' : 'Save to calendar'}
            </button>
          </div>
        </form>
      )}

      {/* Selected day's events */}
      <div>
        <span className="text-[11px] font-bold text-stone-400 block mb-1.5">{format(selected, 'EEEE, MMMM d')}</span>
        {events === null ? (
          <p className="text-xs text-stone-400">Loading your events…</p>
        ) : selectedEvents.length === 0 ? (
          <p className="text-xs text-stone-400 p-3 bg-white/[0.03] rounded-xl border border-white/[0.08]">
            Nothing scheduled this day. Click "Add task" — it appears in your briefing and the voice assistant reads it out.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {selectedEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', KIND_DOT[e.kind])} aria-hidden="true" />
                <span className="font-mono text-[11px] text-stone-400">{format(new Date(e.starts_at), 'HH:mm')}</span>
                <span className="font-semibold text-[#f4f2ec] flex-1 min-w-0 truncate">{e.title}</span>
                {e.location && (
                  <span className="text-[10px] text-stone-500 inline-flex items-center gap-0.5 flex-shrink-0">
                    <MapPin className="w-3 h-3" aria-hidden="true" /> {e.location}
                  </span>
                )}
                <button
                  onClick={() => removeEvent(e.id)}
                  aria-label={`Delete ${e.title}`}
                  className="p-1 rounded-lg text-stone-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
