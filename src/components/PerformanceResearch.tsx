import React, { useMemo, useState } from 'react';
import {
  RESEARCH_FINDINGS,
  RESEARCH_GRADE_LEGEND,
  RESEARCH_FRAMEWORK_NOTES,
  ResearchFinding,
  ResearchGrade,
  ResearchCategory,
  AthleteLevel,
} from '../data/researchBase';
import { useConsent } from '../lib/consent';
import { authFetch } from '../lib/dataService';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  FlaskConical,
  Search,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  BookOpenCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  Dumbbell,
  Pill,
  HeartPulse,
  MoonStar,
} from 'lucide-react';
import { cn } from '../lib/utils';

type BriefState = 'idle' | 'loading' | 'done' | 'unconfigured' | 'error';

const CATEGORY_ICONS: Record<ResearchCategory, React.ReactNode> = {
  'Ergogenic Aid': <Pill className="w-3.5 h-3.5" aria-hidden="true" />,
  'Training Method': <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" />,
  'Recovery': <MoonStar className="w-3.5 h-3.5" aria-hidden="true" />,
  'Medical': <HeartPulse className="w-3.5 h-3.5" aria-hidden="true" />,
};

function GradeBadge({ grade }: { grade: ResearchGrade }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border flex-shrink-0',
        grade === 'A' && 'bg-[#f1f5f2] text-[#2b4530] border-[#dbe5dc]',
        grade === 'B' && 'bg-[#faf5ee] text-[#785328] border-[#ede1cf]',
        grade === 'C' && 'bg-[#f5f4ef] text-[#5c5851] border-[#e6e4dc]'
      )}
    >
      Grade {grade}
    </span>
  );
}

function FindingCard({ finding }: { finding: ResearchFinding }) {
  return (
    <article className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm space-y-3 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1.5 bg-[#faf9f6] border border-[#ebe7df] rounded-lg text-[#344a37] flex-shrink-0">
            {CATEGORY_ICONS[finding.category]}
          </span>
          <h3 className="text-sm font-bold text-[#181716] leading-snug">{finding.name}</h3>
        </div>
        <GradeBadge grade={finding.grade} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
        <span className="px-2 py-0.5 rounded-md bg-[#faf9f6] border border-[#ebe7df] text-[#5c5851]">{finding.category}</span>
        <span className="px-2 py-0.5 rounded-md bg-[#faf9f6] border border-[#ebe7df] text-[#5c5851]">
          {finding.level === 'both' ? 'Rec + Pro athletes' : finding.level === 'recreational' ? 'Recreational' : 'Professional'}
        </span>
      </div>

      <p className="text-xs font-bold text-[#344a37] bg-[#f1f5f2] border border-[#dbe5dc] rounded-lg px-3 py-2">
        {finding.effectSize}
      </p>

      <p className="text-xs text-[#5c5851] leading-relaxed">{finding.summary}</p>

      <div className="text-[11px] text-[#181716]">
        <span className="font-bold block mb-0.5">Protocol:</span>
        <span className="text-[#5c5851] leading-relaxed">{finding.dose}</span>
      </div>

      <div className="text-[11px]">
        <span className="font-bold text-[#181716] block mb-0.5">Caveats &amp; honesty notes:</span>
        <ul className="space-y-1">
          {finding.caveats.map((caveat) => (
            <li key={caveat} className="text-[#5c5851] leading-relaxed flex gap-1.5">
              <span className="text-[#785328] flex-shrink-0" aria-hidden="true">•</span> {caveat}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={finding.citation.url}
        target="_blank"
        rel="noreferrer"
        className="mt-auto pt-2 border-t border-[#f4f2ec] text-[11px] text-[#344a37] hover:underline font-semibold inline-flex items-start gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded"
      >
        <BookOpenCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          {finding.citation.title} — <span className="italic">{finding.citation.source}</span> {finding.citation.year}
        </span>
        <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
      </a>
    </article>
  );
}

export function PerformanceResearch() {
  const { isGranted, grant } = useConsent();
  const aiConsented = isGranted('ai_processing');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ResearchCategory>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | AthleteLevel>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | ResearchGrade>('all');

  const [briefPrompt, setBriefPrompt] = useState('');
  const [briefState, setBriefState] = useState<BriefState>('idle');
  const [brief, setBrief] = useState<{ brief: string; sources: { title: string; uri: string }[]; generatedAt?: string } | null>(null);
  const [aiDisclosureOpen, setAiDisclosureOpen] = useState(false);
  const [aiAckChecked, setAiAckChecked] = useState(false);

  const filtered = useMemo(() => RESEARCH_FINDINGS.filter((finding) => {
    if (categoryFilter !== 'all' && finding.category !== categoryFilter) return false;
    if (gradeFilter !== 'all' && finding.grade !== gradeFilter) return false;
    if (levelFilter !== 'all' && finding.level !== 'both' && finding.level !== levelFilter) return false;
    const query = search.trim().toLowerCase();
    if (query && !(`${finding.name} ${finding.summary} ${finding.effectSize}`.toLowerCase().includes(query))) return false;
    return true;
  }), [search, categoryFilter, levelFilter, gradeFilter]);

  const handleGenerateBrief = async () => {
    if (!briefPrompt.trim() || briefState === 'loading') return;
    setBriefState('loading');
    try {
      const response = await authFetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: briefPrompt.trim() }),
      });
      if (response.status === 404 || response.status === 501) {
        setBriefState('unconfigured');
        return;
      }
      if (!response.ok) {
        setBriefState('error');
        return;
      }
      const data = await response.json();
      setBrief(data);
      setBriefState('done');
    } catch {
      setBriefState('error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ebe7df] shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#f1f5f2] rounded-xl border border-[#dbe5dc]">
            <FlaskConical className="w-6 h-6 text-[#344a37]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#181716]">Performance Research Base</h1>
            <p className="text-xs text-[#5c5851] mt-1 max-w-3xl leading-relaxed">
              Training methods and ergogenic aids for recreational and professional athletes, compiled from human
              trials — meta-analyses, systematic reviews, and position stands (ISSN, IOC, AIS) — with effect sizes,
              protocols, and the caveats the marketing leaves out. Every claim links to its source.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          {(['A', 'B', 'C'] as ResearchGrade[]).map((grade) => (
            <div key={grade} className="flex items-start gap-2 p-2.5 rounded-xl border border-[#ebe7df] bg-[#faf9f6]">
              <GradeBadge grade={grade} />
              <span className="text-[#5c5851] leading-relaxed">{RESEARCH_GRADE_LEGEND[grade]}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#8c3232] flex items-start gap-1.5 p-2.5 rounded-xl border border-[#f5d5d5] bg-[#fdf2f2]">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>Educational information, not medical advice. Talk to a physician or sports dietitian before starting supplements — and if you compete, verify every product against the WADA Prohibited List and prefer batch-tested certification. Telehealth is not for emergencies: call 911.</span>
        </p>
      </div>

      {/* AI live brief */}
      <section aria-labelledby="ai-brief-heading" className="bg-white p-6 rounded-2xl border border-[#ebe7df] shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#faf5ee] rounded-lg border border-[#ede1cf]">
            <Sparkles className="w-5 h-5 text-[#785328]" aria-hidden="true" />
          </div>
          <div>
            <h2 id="ai-brief-heading" className="text-sm font-bold text-[#181716]">Live AI Research Brief</h2>
            <p className="text-[11px] text-[#5c5851] mt-0.5 leading-relaxed max-w-2xl">
              Ask a question and a server-side Gemini model with Google Search grounding will summarize the current
              human-trial literature. The API key lives on the server — never in your browser.
            </p>
          </div>
        </div>

        {!aiConsented && (
          <div className="p-4 rounded-xl border border-[#ebe7df] bg-[#faf9f6] space-y-3" role="status">
            <p className="text-xs text-[#181716] font-bold">AI processing consent required</p>
            <p className="text-[11px] text-[#5c5851] leading-relaxed">
              Live briefs send your question (plus, if you type them in, health details) to an AI service. Under this
              app's rules of engagement, nothing is sent until you allow it. The curated research base below works
              without any consent.
            </p>
            <button
              type="button"
              aria-expanded={aiDisclosureOpen}
              onClick={() => setAiDisclosureOpen((open) => !open)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[#344a37] bg-white border border-[#dbe5dc] px-2.5 py-1.5 rounded-lg hover:bg-[#f1f5f2] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
            >
              What would be shared?
              {aiDisclosureOpen ? <ChevronUp className="w-3 h-3" aria-hidden="true" /> : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
            </button>
            {aiDisclosureOpen && (
              <p className="text-[11px] text-[#5c5851] leading-relaxed bg-white border border-[#ebe7df] rounded-lg p-3">
                Your typed question, plus any health details you include in it, are sent through this app's server to
                Google Gemini with web search enabled. No profile metrics are attached automatically. You can withdraw
                consent anytime in Privacy &amp; Consent.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-[11px] text-[#181716] cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiAckChecked}
                  onChange={(e) => setAiAckChecked(e.target.checked)}
                  className="accent-[#344a37] w-3.5 h-3.5"
                />
                I understand and consent to AI processing for live briefs
              </label>
              <button
                type="button"
                disabled={!aiAckChecked}
                onClick={() => grant('ai_processing')}
                className="btn-ink px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
              >
                <Check className="w-3 h-3" aria-hidden="true" /> Enable
              </button>
            </div>
          </div>
        )}

        {aiConsented && (
          <div className="space-y-2.5">
            <label htmlFor="brief-prompt" className="block text-[11px] font-bold text-[#181716]">
              Your research question <span className="font-normal text-[#6e6960]">(e.g. "best evidence-based stack for a recreational cyclist training 6 h/week")</span>
            </label>
            <textarea
              id="brief-prompt"
              rows={2}
              value={briefPrompt}
              onChange={(e) => setBriefPrompt(e.target.value)}
              maxLength={2000}
              placeholder="Ask about training methods, ergogenic aids, or protocols…"
              className="w-full px-3 py-2 rounded-xl border border-[#e5e1d7] bg-[#fbfaf8] text-xs focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#6e6960]">
                AI output can be wrong — verify anything that matters against the curated citations below.
              </span>
              <button
                type="button"
                onClick={handleGenerateBrief}
                disabled={!briefPrompt.trim() || briefState === 'loading'}
                className="btn-ink px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                {briefState === 'loading' ? 'Researching…' : 'Generate live brief'}
              </button>
            </div>

            {briefState === 'loading' && (
              <p role="status" className="text-[11px] text-[#5c5851] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-[#dedad0] border-t-[#344a37] animate-spin inline-block" aria-hidden="true" />
                Searching the literature with live web grounding…
              </p>
            )}

            {briefState === 'unconfigured' && (
              <p role="status" className="text-[11px] text-[#785328] font-semibold p-3 rounded-xl border border-[#ede1cf] bg-[#faf5ee]">
                Live AI isn't configured on this deployment (no server-side GEMINI_API_KEY set). Nothing was sent.
                The curated research base below is fully available — it contains the core evidence base either way.
              </p>
            )}

            {briefState === 'error' && (
              <p role="alert" className="text-[11px] text-[#8c3232] font-semibold p-3 rounded-xl border border-[#f5d5d5] bg-[#fdf2f2]">
                The live brief service returned an error. Nothing about your question was stored — try again, or use the curated base below.
              </p>
            )}

            {briefState === 'done' && brief && (
              <div className="p-4 rounded-xl border border-[#dbe5dc] bg-[#f1f5f2] space-y-3">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#2b4530]">
                  <span className="font-bold uppercase tracking-wider">Live brief — verify before relying on it</span>
                  {brief.generatedAt && <span>{formatDistanceToNowStrict(new Date(brief.generatedAt))} ago</span>}
                </div>
                <p className="text-xs text-[#181716] leading-relaxed whitespace-pre-wrap">{brief.brief}</p>
                {brief.sources.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-[#181716] block mb-1">Grounding sources:</span>
                    <ul className="space-y-1">
                      {brief.sources.map((source, index) => (
                        <li key={`${source.uri}-${index}`} className="text-[11px]">
                          <a href={source.uri} target="_blank" rel="noreferrer" className="text-[#344a37] hover:underline inline-flex items-center gap-1">
                            {source.title} <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Filters */}
      <section aria-label="Filter the research base" className="bg-white p-4 rounded-2xl border border-[#ebe7df] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <label htmlFor="research-search" className="sr-only">Search the research base</label>
          <Search className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id="research-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search: creatine, sleep, VO2max…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#fbfaf8] border border-[#e5e1d7] focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter by category">
          {(['all', 'Ergogenic Aid', 'Training Method', 'Recovery', 'Medical'] as const).map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={categoryFilter === category}
              onClick={() => setCategoryFilter(category)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]',
                categoryFilter === category
                  ? 'bg-[#181716] text-white border-[#181716]'
                  : 'bg-white text-[#5c5851] border-[#dedad0] hover:bg-[#f6f4ee]'
              )}
            >
              {category === 'all' ? 'All topics' : category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="level-filter" className="text-[11px] font-bold text-[#181716]">Level</label>
          <select
            id="level-filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as 'all' | AthleteLevel)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#fbfaf8] border border-[#e5e1d7] text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#181716] cursor-pointer"
          >
            <option value="all">All athletes</option>
            <option value="recreational">Recreational</option>
            <option value="professional">Professional</option>
          </select>
          <label htmlFor="grade-filter" className="text-[11px] font-bold text-[#181716] ml-1">Grade</label>
          <select
            id="grade-filter"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value as 'all' | ResearchGrade)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#fbfaf8] border border-[#e5e1d7] text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#181716] cursor-pointer"
          >
            <option value="all">All</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
      </section>

      {/* Findings grid */}
      <section aria-label="Research findings">
        {filtered.length === 0 ? (
          <p className="text-xs text-[#5c5851] p-6 bg-white rounded-2xl border border-[#ebe7df] text-center">
            No entries match those filters. Clear the search or widen the filters to see the full base.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((finding) => <FindingCard key={finding.id} finding={finding} />)}
          </div>
        )}
      </section>

      {/* Framework / anti-doping panel */}
      <section aria-labelledby="framework-heading" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Object.values(RESEARCH_FRAMEWORK_NOTES).map((note) => (
          <div key={note.title} className="bg-white p-5 rounded-2xl border border-[#ebe7df] shadow-sm space-y-2">
            <h3 id="framework-heading" className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> {note.title}
            </h3>
            <p className="text-[11px] text-[#5c5851] leading-relaxed">{note.body}</p>
            <a
              href={note.url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-[#344a37] hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded"
            >
              Read the source <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        ))}
      </section>

      <p className="text-[11px] text-[#6e6960] px-1">
        Curated base compiled {new Date().getFullYear()} from the linked meta-analyses and position stands. Live AI briefs, when
        configured, run server-side with Google Search grounding and are never auto-accepted as fact.
      </p>
    </div>
  );
}
