import React, { useRef, useState } from 'react';
import { MessageSquarePlus, Star, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { submitFeedback } from '../lib/dataService';
import { useAuth } from '../lib/auth';
import { useDialogBehavior } from '../lib/useDialog';
import { cn } from '../lib/utils';

/**
 * Tester feedback button — red, bottom-LEFT corner so it never overlaps the
 * CuasarX AI orb in the bottom-right. Opens a short review form that persists
 * to the public.feedback table for the team to review in the Insights tab.
 */
export function FeedbackButton({ page }: { page: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ persisted: boolean; notice?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogBehavior({
    containerRef: dialogRef,
    active: open,
    onEscape: () => setOpen(false),
    lockScroll: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError('Please write at least a few words of feedback.');
      return;
    }
    if (!name.trim()) {
      setError('Add your name so the team knows who to thank.');
      return;
    }
    setBusy(true);
    setError(null);
    const res = await submitFeedback({
      name,
      email,
      rating: rating ?? undefined,
      message,
      page,
      userId: user?.id ?? null,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Could not send feedback.');
      return;
    }
    setResult({ persisted: res.persisted, notice: res.error });
  };

  const input = 'w-full px-3 py-2 rounded-lg text-xs bg-[#fbfaf8] border border-[#e5e1d7] focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white';
  const label = 'block text-[11px] font-bold text-[#181716] mb-1';

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setResult(null); setError(null); }}
        aria-label="Leave comments or a review"
        className="fixed bottom-4 left-4 z-40 bg-[#8c3232] hover:bg-[#732828] text-white pl-3 pr-3.5 py-2.5 rounded-full shadow-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c3232] focus-visible:ring-offset-2"
      >
        <MessageSquarePlus className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Comments / Reviews</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-xs">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            tabIndex={-1}
            className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#ebe7df] space-y-4 focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <h2 id="feedback-title" className="text-sm font-bold text-[#181716] flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-[#8c3232]" aria-hidden="true" /> Comments &amp; Reviews
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close feedback form"
                className="p-1.5 text-[#6e6960] hover:text-[#181716] hover:bg-[#f5f3ee] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {result ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2 text-[#2b4530]">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm font-bold">Thank you — feedback received.</span>
                </div>
                <p className="text-[11px] text-[#5c5851] leading-relaxed">
                  {result.persisted
                    ? 'It was saved to the team\'s review queue and will show up in the Insights dashboard.'
                    : `It could not be saved (${result.notice ?? 'demo mode'}). Nothing was lost in this browser, but the team won\'t see it — try again when the database is connected.`}
                </p>
                <button
                  onClick={() => { setOpen(false); setMessage(''); setRating(null); }}
                  className="btn-ink w-full py-2 text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <span className={label} id="fb-rating-label">How would you rate the experience so far?</span>
                  <div className="flex items-center gap-1" role="group" aria-labelledby="fb-rating-label">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value > 1 ? 's' : ''}`}
                        aria-pressed={rating === value}
                        onClick={() => setRating(value)}
                        className="p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded"
                      >
                        <Star
                          className={cn('w-6 h-6 transition-colors', rating !== null && value <= rating ? 'fill-[#b8860b] text-[#b8860b]' : 'text-[#dedad0]')}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="fb-name" className={label}>Name <span className="text-[#8c3232]">*</span></label>
                    <input id="fb-name" className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="fb-email" className={label}>Email <span className="font-normal text-[#6e6960]">(optional)</span></label>
                    <input id="fb-email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="if you want a reply" />
                  </div>
                </div>

                <div>
                  <label htmlFor="fb-message" className={label}>What should we keep, fix, or change? <span className="text-[#8c3232]">*</span></label>
                  <textarea
                    id="fb-message"
                    rows={4}
                    className={input}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Be blunt — this is a test build and blunt is useful. (You're on: ${page})`}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-[11px] text-[#8c3232] font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-ink w-full py-2.5 text-xs disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2"
                >
                  {busy ? 'Sending…' : 'Send feedback'}
                </button>
                <p className="text-[10px] text-[#6e6960] text-center">Goes straight to the team's review queue. No marketing use.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
