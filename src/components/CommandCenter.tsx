import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { authFetch, fetchMyOrders } from '../lib/dataService';
import { MOCK_PRODUCTS } from '../data';
import { Product } from '../types';
import { Send, Mic, MicOff, Volume2, VolumeX, Zap, CornerDownLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';

type Msg = { id: string; role: 'user' | 'assist'; text: string; ts: Date; spoken?: boolean };

type Props = {
  userName: string;
  onNavigate: (tab: 'marketplace' | 'supplements' | 'trends' | 'profile' | 'research' | 'community' | 'consent' | 'admin' | 'operator') => void;
  onAddToCart: (products: Product[]) => void;
};

type Symbiosis = {
  calendar?: { title: string; time: string; location?: string }[];
  toTake?: { name: string; dose?: string; time?: string }[];
  toBuy?: { name: string; reason?: string }[];
  profile?: { details?: { readiness?: { score?: number }, metrics?: { sleep?: { current?: number }, hrv?: { current?: number }, rhr?: { current?: number } } }, loyaltyPoints?: number };
  weather?: { tempC?: number; description?: { en?: string }; raining?: boolean };
  inventory?: { name: string }[];
};

const uid = () => Math.random().toString(36).slice(2);

/** Symbiosis calendar times may be ISO or human strings ("Tomorrow 07:30") — display either safely. */
const safeWhen = (raw: string): string => {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : format(d, 'EEE HH:mm');
};

const MOCK_CATALOG_SEARCH = (term: string): Product[] => {
  const t = term.toLowerCase();
  return MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(t)).slice(0, 3);
};

/**
 * Quick Assist — the minimalist super-assistant.
 * One window, voice + text in, voice out. Every question is answered in two
 * tiers: instant local answers from live platform data (calendar, meds,
 * orders, readings, weather), then the secure AI service for open questions.
 * CEO commands work here too: navigate tabs, add to cart — same powers as
 * the voice layer on the main screen.
 */
export function CommandCenter({ userName, onNavigate, onAddToCart }: Props) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      const saved = sessionStorage.getItem('cx_qa_msgs');
      if (saved) return JSON.parse(saved).map((m: Msg) => ({ ...m, ts: new Date(m.ts) }));
    } catch { /* ignore */ }
    return [{
    id: uid(), role: 'assist',
    text: `Ask me anything, ${userName.split(' ')[0]} — your calendar, medications, orders, readings, the catalog. Type or hold the mic. You can also command: "open insights", "add magnesium to cart", "what's on today".`,
    ts: new Date(),
  }];
  });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<any>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    try { sessionStorage.setItem('cx_qa_msgs', JSON.stringify(msgs.slice(-30))); } catch { /* ignore */ }
  }, [msgs, busy]);

  const say = (text: string, speak = speakOn) => {
    setMsgs((m) => [...m, { id: uid(), role: 'assist', text, ts: new Date() }]);
    if (speak && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.replace(/\*/g, ''));
        u.rate = 1.04;
        window.speechSynthesis.speak(u);
      } catch { /* voice unavailable */ }
    }
  };

  const symbiosis = (): Symbiosis => {
    try { return (window as any).__VOICELAYER_SYMBIOSIS__ ?? {}; } catch { return {}; }
  };

  // ── Tier 1: instant local answers from live platform data ──
  const localAnswer = (q: string): string | null => {
    try { return localAnswerInner(q); } catch (e) { console.warn('Quick Assist local answer failed, using AI:', e); return null; }
  };

  const localAnswerInner = (q: string): string | null => {
    const t = q.toLowerCase();
    const S = symbiosis();

    if (/(calendar|meeting|schedule|today|agenda|appointment)/.test(t)) {
      const cal = S.calendar ?? [];
      if (!cal.length) return 'Your calendar is clear — nothing scheduled in the next day.';
      return `You have ${cal.length} upcoming: ` + cal.slice(0, 4).map((e) =>
        `${e.title} (${safeWhen(e.time)}${e.location ? `, ${e.location}` : ''})`
      ).join('; ') + '. Say "open profile" to see the calendar.';
    }
    if (/(take|medication|meds|pill|dose|supplement now)/.test(t)) {
      const take = S.toTake ?? [];
      return take.length
        ? 'On your schedule: ' + take.map((m) => `${m.name}${m.dose ? ` (${m.dose})` : ''}${m.time ? ` at ${m.time}` : ''}`).join('; ') + '.'
        : 'Nothing pending to take right now.';
    }
    if (/(buy|reorder|running low|low|refill|restock)/.test(t)) {
      const buy = S.toBuy ?? [];
      return buy.length
        ? 'Running low / due for reorder: ' + buy.map((b) => `${b.name}${b.reason ? ` — ${b.reason}` : ''}`).join('; ') + '. Say "add it to cart" or open Daily Regimens.'
        : 'Everything is well stocked — nothing needs a reorder.';
    }
    if (/(weather|rain|temperature|hot|cold outside)/.test(t)) {
      const w = S.weather;
      if (!w) return 'Weather is not loaded yet — ask me again in a moment.';
      return `It's ${w.tempC}°C with ${w.description?.en ?? 'variable conditions'}${w.raining ? ' — raining, take a jacket.' : ' — dry out.'}`;
    }
    if (/(readiness|score|how am i|hrv|sleep|resting)/.test(t)) {
      const d = S.profile?.metrics ? S.profile : S.profile?.details;
      const m = d?.metrics;
      const bits: string[] = [];
      if (d?.readiness?.score != null) bits.push(`readiness ${d.readiness.score}/100`);
      if (m?.sleep?.current != null) bits.push(`sleep ${m.sleep.current}h`);
      if (m?.hrv?.current != null) bits.push(`HRV ${m.hrv.current}ms`);
      if (m?.rhr?.current != null) bits.push(`resting HR ${m.rhr.current}bpm`);
      return bits.length ? `Your latest numbers: ${bits.join(', ')}. Open Lab Telemetry for the trends.` : 'No readings on file yet — sync a device first.';
    }
    if (/(loyalty|points)/.test(t)) {
      const pts = S.profile?.loyaltyPoints;
      return pts != null ? `You have ${pts} loyalty points. 100 points = $5 off at checkout.` : 'No loyalty balance yet — you earn 1 point per $1 ordered.';
    }
    if (/(how many order|my order|order history|orders do)/.test(t)) {
      // answered via a local fetch — handled asynchronously in ask(), not here
      return 'FETCH:orders';
    }
    if (/(what do you sell|catalog|products|find|do you have)/.test(t)) {
      const inv = S.inventory ?? [];
      const match = inv.find((i) => i.name && t.split(' ').some((w) => w.length > 3 && i.name.toLowerCase().includes(w)));
      if (match) return `${match.name} is in the catalog. Say "open marketplace" to browse it.`;
      return `The marketplace has ${inv.length || 22} evidence-graded products. Say "open marketplace" to browse, or tell me what you're looking for.`;
    }
    // ── commands (same powers as the voice layer) ──
    const nav: [RegExp, Parameters<Props['onNavigate']>[0], string][] = [
      [/(open|go to|show|take me to).*(insight|analytic|admin dashboard)/, 'operator', 'operator'],
      [/(open|go to|show).*(consent|privacy)/, 'consent', 'consent'],
      [/(open|go to|show).*(research)/, 'research', 'research'],
      [/(open|go to|show).*(community|peer)/, 'community', 'community'],
      [/(open|go to|show).*(lab|trend|telemetry|biomarker)/, 'trends', 'trends'],
      [/(open|go to|show).*(calendar|profile|health data|goal)/, 'profile', 'profile'],
      [/(open|go to|show).*(regimen|supplement stack|daily)/, 'supplements', 'supplements'],
      [/(open|go to|show).*(store|marketplace|shop|catalog)/, 'marketplace', 'marketplace'],
    ];
    for (const [re, tab, label] of nav) {
      if (re.test(t)) { onNavigate(tab); return `Opening ${label} for you.`; }
    }
    const addMatch = t.match(/add (.+?) to (?:my |the )?(?:cart|order)/);
    if (addMatch) return 'FETCH:addcart:' + addMatch[1];
    return null;
  };

  // ── async local fetches (orders, cart-add) ──
  const resolveFetch = async (token: string): Promise<string | null> => {
    const { fetchMyOrders } = await import('../lib/dataService');
    if (token === 'FETCH:orders') {
      if (!user) return 'Sign in to see your orders.';
      const orders = await fetchMyOrders(user.id);
      if (!orders.length) return 'No orders yet — your checkout history appears here once you place one.';
      const last = orders[0] as { order_number?: string; total?: number; fulfillment_status?: string };
      return `You have ${orders.length} order${orders.length > 1 ? 's' : ''}. Latest: #${last.order_number} ($${Number(last.total).toFixed(2)}, ${last.fulfillment_status}). Say "open insights" for the full picture.`;
    }
    if (token.startsWith('FETCH:addcart:')) {
      const term = token.replace('FETCH:addcart:', '').trim();
      const products = MOCK_CATALOG_SEARCH(term);
      if (!products.length) return `I couldn't find "${term}" in the catalog — try the marketplace search.`;
      onAddToCart(products);
      return `Added ${products.map((p) => p.name).join(', ')} to your cart. Say "open marketplace" to check out.`;
    }
    return null;
  };

  // ── Tier 2: AI for open questions ──
  const aiAnswer = async (q: string): Promise<string | null> => {
    try {
      const res = await authFetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          context: { ...(window as any).__CUASARX_COACH_CTX, voiceLayerContext: (window as any).__VOICELAYER_SYMBIOSIS__ },
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.reply ?? null;
    } catch {
      return null;
    }
  };

  const ask = async (q: string, viaVoice = false) => {
    const text = q.trim();
    if (!text || busy) return;
    setMsgs((m) => [...m, { id: uid(), role: 'user', text, ts: new Date(), spoken: viaVoice }]);
    setBusy(true);
    try {
      const local = localAnswer(text);
      if (local === 'FETCH:orders' || local.startsWith('FETCH:addcart:')) {
        const fetched = await resolveFetch(local);
        if (fetched) { say(fetched, viaVoice || speakOn); return; }
      } else if (local) {
        say(local, viaVoice || speakOn);
        return;
      }
      const ai = await aiAnswer(text);
      say(ai ?? `I don't have that answer yet — try one of the quick chips below, or ask about your calendar, meds, orders, or readings.`, viaVoice || speakOn);
    } finally {
      setBusy(false);
    }
  };

  // ── voice input (browser speech recognition, free) ──
  const toggleMic = () => {
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) { setMicError('Voice input is not supported in this browser — type instead.'); return; }
    if (listening) { recogRef.current?.stop(); return; }
    try {
      const recog = new SR();
      recog.lang = 'en-US';
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.onresult = (e: any) => {
        const said = e.results[0][0].transcript;
        setListening(false);
        ask(said, true);
      };
      recog.onerror = (e: any) => {
        setListening(false);
        setMicError(e.error === 'not-allowed' ? 'Microphone access was blocked — allow it in the browser bar.' : 'Voice input failed — type instead.');
      };
      recog.onend = () => setListening(false);
      recogRef.current = recog;
      setMicError(null);
      setListening(true);
      recog.start();
    } catch {
      setMicError('Voice input could not start — type instead.');
    }
  };

  useEffect(() => () => { try { recogRef.current?.stop(); } catch { /* */ } window.speechSynthesis?.cancel(); }, []);

  const chips = ['What is on today?', 'Meds to take', 'Running low?', 'My readiness', 'Weather', 'How many orders?'];

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-190px)] min-h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/25">
            <Zap className="w-4 h-4 text-orange-400" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-sm font-bold text-[#f4f2ec]">Quick Assist</h1>
            <p className="text-[10px] text-stone-500">Connected to everything — calendar, meds, orders, readings, catalog</p>
          </div>
        </div>
        <button
          onClick={() => setSpeakOn((v) => !v)}
          aria-pressed={speakOn}
          aria-label={speakOn ? 'Turn voice replies off' : 'Turn voice replies on'}
          title={speakOn ? 'Voice replies on' : 'Voice replies off'}
          className={cn('p-2 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            speakOn ? 'bg-orange-500/20 text-orange-400' : 'text-stone-400 hover:bg-white/5')}
        >
          {speakOn ? <Volume2 className="w-4 h-4" aria-hidden="true" /> : <VolumeX className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>

      {/* Messages */}
      <div ref={chatLogRef} className="flex-1 overflow-y-auto py-4 space-y-3" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap',
              m.role === 'user'
                ? 'bg-orange-600 text-white rounded-br-sm'
                : 'bg-white/[0.06] border border-white/10 text-[#f4f2ec] rounded-bl-sm'
            )}>
              {m.text}
              <span className={cn('block mt-1 text-[9px]', m.role === 'user' ? 'text-white/60' : 'text-stone-500')}>
                {m.role === 'user' ? (m.spoken ? 'voice · ' : '') + format(m.ts, 'HH:mm') : `Quasar Keel · ${format(m.ts, 'HH:mm')}`}
              </span>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-xs text-stone-400 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" aria-hidden="true" />
              Checking your data…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick chips */}
      <div className="flex gap-1.5 flex-wrap pb-2">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => ask(c)}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/[0.05] border border-white/10 text-stone-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); const v = input; setInput(''); ask(v); }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white/[0.05] border border-white/10 focus-within:border-orange-500/40 transition-colors"
      >
        <button
          type="button"
          onClick={toggleMic}
          aria-pressed={listening}
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          title={listening ? 'Listening — click to stop' : 'Voice input'}
          className={cn('p-2.5 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            listening ? 'bg-red-600 text-white animate-pulse' : 'text-stone-400 hover:text-orange-400 hover:bg-white/5')}
        >
          {listening ? <MicOff className="w-4 h-4" aria-hidden="true" /> : <Mic className="w-4 h-4" aria-hidden="true" />}
        </button>
        <label htmlFor="qa-input" className="sr-only">Ask Quick Assist anything</label>
        <input
          id="qa-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? 'Listening…' : 'Ask anything, or command: "open insights"…'}
          className="flex-1 bg-transparent text-xs text-[#f4f2ec] placeholder-stone-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Send"
          className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
      {micError && <p role="alert" className="text-[10px] text-amber-400 font-semibold pt-1.5">{micError}</p>}
      <p className="text-[9px] text-stone-600 pt-1.5 flex items-center gap-1">
        <CornerDownLeft className="w-3 h-3" aria-hidden="true" />
        Instant answers from your data · AI for open questions · commands like "open insights" or "add magnesium to cart"
      </p>
    </div>
  );
}
