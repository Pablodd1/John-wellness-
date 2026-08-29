import React, { useRef, useState } from 'react';
import { UserProfile } from '../types';
import { CONSENT_PURPOSES, PRIVACY_POLICY_VERSION, useConsent } from '../lib/consent';
import { useDialogBehavior } from '../lib/useDialog';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  ShieldCheck,
  ShieldAlert,
  FileSignature,
  Download,
  Trash2,
  Video,
  Gavel,
  ScrollText,
  History,
  Check,
  X,
  Database,
  EyeOff,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { cn } from '../lib/utils';

const HIPAA_SCOPE_OPTIONS = [
  'Lab & bloodwork results',
  'Biomarker history & trends',
  'Supplement regimens',
  'Baseline diagnostics (DEXA, VO2max, EKG)',
  'AI chat transcripts',
  'Clinician notes',
];

const HIPAA_PURPOSE_OPTIONS = [
  'Coordination of treatment with an outside clinician',
  'Insurance claim or reimbursement',
  'Legal request or subpoena response',
  'Other (specified in writing below)',
];

function ConsentToggle({
  granted,
  title,
  onChange,
  disabled,
}: {
  granted: boolean;
  title: string;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={granted}
      aria-label={`${title}: ${granted ? 'on' : 'off'}`}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
        granted ? 'bg-[#344a37] border-[#344a37]' : 'bg-[#dedad0] border-[#cbcabf]'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform',
          granted ? 'translate-x-[24px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  );
}

export function ConsentCenter({
  user,
  onStartVideoVisit,
}: {
  user: UserProfile;
  onStartVideoVisit?: () => void;
}) {
  const {
    state,
    isGranted,
    isStale,
    needsPolicyReview,
    grant,
    withdraw,
    signAuthorization,
    revokeAuthorization,
    setDoNotSellOrShare,
    exportData,
    requestDeletion,
  } = useConsent();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const grantedCount = CONSENT_PURPOSES.filter(p => isGranted(p.id)).length;
  const staleCount = CONSENT_PURPOSES.filter(p => isStale(p.id)).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ebe7df] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#f1f5f2] rounded-xl border border-[#dbe5dc]">
              <ShieldCheck className="w-6 h-6 text-[#344a37]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#181716]">Privacy &amp; Consent Center</h1>
              <p className="text-xs text-[#5c5851] mt-1 max-w-2xl leading-relaxed">
                You decide what happens with your health information. Every purpose below is off until you turn it on,
                you can withdraw any consent at any time, and every change is written to your audit log.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1.5 text-[11px]">
            <span className="badge-neutral font-mono">Policy v{PRIVACY_POLICY_VERSION}</span>
            {needsPolicyReview ? (
              <span className="badge-flag"><AlertTriangle className="w-3 h-3" aria-hidden="true" /> Notice not yet acknowledged</span>
            ) : (
              <span className="badge-clinical">
                <Check className="w-3 h-3" aria-hidden="true" />
                Acknowledged {state.policyAcknowledgedAt ? format(new Date(state.policyAcknowledgedAt), 'MMM d, yyyy') : ''} by {state.acknowledgedName}
              </span>
            )}
          </div>
        </div>

        {(needsPolicyReview || staleCount > 0) && (
          <div className="mt-4 p-3.5 bg-[#faf5ee] border border-[#ede1cf] rounded-xl text-xs text-[#785328] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {needsPolicyReview && 'Our privacy notice was updated — acknowledge it below before further use. '}
              {staleCount > 0 && `${staleCount} consent${staleCount > 1 ? 's were' : ' was'} given under an older policy version — review and re-affirm below.`}
            </span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
            <span className="text-[10px] uppercase font-bold text-[#5c5851] block">Purposes enabled</span>
            <span className="text-lg font-bold text-[#181716]">{grantedCount} / {CONSENT_PURPOSES.length}</span>
          </div>
          <div className="p-3 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
            <span className="text-[10px] uppercase font-bold text-[#5c5851] block">HIPAA authorization</span>
            <span className={cn("text-sm font-bold", state.hipaaAuthorization ? "text-[#344a37]" : "text-[#785328]")}>
              {state.hipaaAuthorization ? 'On file' : 'None signed'}
            </span>
          </div>
          <div className="p-3 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
            <span className="text-[10px] uppercase font-bold text-[#5c5851] block">Audit events</span>
            <span className="text-lg font-bold text-[#181716]">{state.audit.length}</span>
          </div>
        </div>
      </div>

      {/* Consent Purposes */}
      <section aria-labelledby="purposes-heading" className="space-y-3">
        <h2 id="purposes-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2 px-1">
          <Database className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Data-Use Purposes
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {CONSENT_PURPOSES.map(purpose => {
            const granted = isGranted(purpose.id);
            const stale = isStale(purpose.id);
            return (
              <div
                key={purpose.id}
                className={cn(
                  'bg-white p-5 rounded-2xl border shadow-sm space-y-3',
                  stale ? 'border-[#ede1cf]' : 'border-[#ebe7df]'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#181716]">{purpose.title}</h3>
                    {purpose.optional ? (
                      <span className="badge-neutral mt-1">Optional</span>
                    ) : (
                      <span className="badge-clinical mt-1">Required for this feature</span>
                    )}
                    {stale && <span className="badge-warm mt-1 ml-1">Under old policy — re-affirm</span>}
                  </div>
                  <ConsentToggle
                    granted={granted}
                    title={purpose.title}
                    onChange={() => (granted ? withdraw(purpose.id) : grant(purpose.id))}
                  />
                </div>

                <p className="text-xs text-[#5c5851] leading-relaxed">{purpose.summary}</p>

                <div className="text-[11px] space-y-1.5">
                  <span className="font-bold text-[#181716] block">What this uses:</span>
                  <ul className="space-y-0.5">
                    {purpose.dataUsed.map(item => (
                      <li key={item} className="text-[#5c5851] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#344a37] flex-shrink-0" aria-hidden="true" /> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[#5c5851] pt-1">
                    <span className="font-bold text-[#181716]">If you turn this off: </span>
                    {purpose.offConsequence}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#f4f2ec] flex items-center justify-between text-[10px]">
                  {granted ? (
                    <span className="text-[#344a37] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" aria-hidden="true" /> Granted{' '}
                      {state.records[purpose.id].grantedAt && format(new Date(state.records[purpose.id].grantedAt!), 'MMM d, yyyy HH:mm')}
                    </span>
                  ) : state.records[purpose.id].withdrawnAt ? (
                    <span className="text-[#8c3232] font-bold flex items-center gap-1">
                      <Ban className="w-3 h-3" aria-hidden="true" /> Withdrawn{' '}
                      {format(new Date(state.records[purpose.id].withdrawnAt!), 'MMM d, yyyy HH:mm')}
                    </span>
                  ) : (
                    <span className="text-[#6e6960] font-semibold">Off — no data used for this purpose</span>
                  )}
                  <span className="text-[#6e6960] font-mono">v{state.records[purpose.id].policyVersion}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HIPAA Authorization */}
      <section aria-labelledby="hipaa-heading" className="bg-white p-6 rounded-2xl border border-[#ebe7df] shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#faf5ee] rounded-lg border border-[#ede1cf]">
              <FileSignature className="w-5 h-5 text-[#785328]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="hipaa-heading" className="text-sm font-bold text-[#181716]">Authorization to Disclose Health Information (HIPAA)</h2>
              <p className="text-xs text-[#5c5851] mt-1 max-w-2xl leading-relaxed">
                Required before we share your protected health information with anyone outside your care team —
                another clinic, your insurer, or a legal party. You specify who, what, why, and until when.
              </p>
            </div>
          </div>
        </div>

        {state.hipaaAuthorization ? (
          <div className="space-y-3">
            <div className="p-4 bg-[#f1f5f2] border border-[#dbe5dc] rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div><span className="font-bold text-[#181716] block text-[10px] uppercase">Disclose to</span><span className="text-[#2b4530]">{state.hipaaAuthorization.recipient}</span></div>
                <div><span className="font-bold text-[#181716] block text-[10px] uppercase">Purpose</span><span className="text-[#2b4530]">{state.hipaaAuthorization.purpose}</span></div>
                <div><span className="font-bold text-[#181716] block text-[10px] uppercase">Signed by</span><span className="text-[#2b4530]">{state.hipaaAuthorization.signedName} — {format(new Date(state.hipaaAuthorization.signedAt), 'MMM d, yyyy')}</span></div>
                <div><span className="font-bold text-[#181716] block text-[10px] uppercase">Expires</span><span className="text-[#2b4530]">{format(new Date(state.hipaaAuthorization.expiresOn), 'MMM d, yyyy')}</span></div>
              </div>
              <div>
                <span className="font-bold text-[#181716] block text-[10px] uppercase">Information covered</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {state.hipaaAuthorization.informationScope.map(item => (
                    <span key={item} className="badge-clinical">{item}</span>
                  ))}
                </div>
              </div>
            </div>
            {!confirmRevoke ? (
              <button
                onClick={() => setConfirmRevoke(true)}
                className="text-xs font-bold text-[#8c3232] hover:bg-[#fdf2f2] px-3 py-1.5 rounded-lg border border-[#f5d5d5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c3232] cursor-pointer"
              >
                Revoke this authorization
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#5c5851]">Revocation stops disclosure going forward — it does not recall information already shared. Confirm?</span>
                <button
                  onClick={() => { revokeAuthorization(); setConfirmRevoke(false); }}
                  className="px-3 py-1.5 bg-[#8c3232] hover:bg-[#732828] text-white font-bold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c3232] cursor-pointer"
                >
                  Yes, revoke
                </button>
                <button
                  onClick={() => setConfirmRevoke(false)}
                  className="px-3 py-1.5 bg-white border border-[#dedad0] hover:bg-[#f6f4ee] font-bold rounded-lg text-[#181716] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="btn-ink px-4 py-2 text-xs inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
          >
            <FileSignature className="w-3.5 h-3.5" aria-hidden="true" /> Authorize a disclosure
          </button>
        )}
      </section>

      {/* Telehealth status */}
      <section aria-labelledby="telehealth-heading" className="bg-white p-6 rounded-2xl border border-[#ebe7df] shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#f1f5f2] rounded-lg border border-[#dbe5dc]">
            <Video className="w-5 h-5 text-[#344a37]" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="telehealth-heading" className="text-sm font-bold text-[#181716]">Telehealth Informed Consent</h2>
            <p className="text-xs text-[#5c5851] mt-1 leading-relaxed max-w-2xl">
              Many US states require informed consent before receiving care by telemedicine. Your status:{' '}
              {isGranted('telehealth') ? (
                <span className="font-bold text-[#344a37]">on file — video visits are enabled.</span>
              ) : (
                <span className="font-bold text-[#785328]">not on file — you will be asked to review and sign before joining a visit.</span>
              )}
            </p>
          </div>
          {onStartVideoVisit && (
            <button
              onClick={onStartVideoVisit}
              className="btn-ink px-3.5 py-2 text-xs inline-flex items-center gap-1.5 self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" aria-hidden="true" /> Start a video visit
            </button>
          )}
        </div>
      </section>

      {/* Privacy Rights */}
      <section aria-labelledby="rights-heading" className="bg-white p-6 rounded-2xl border border-[#ebe7df] shadow-sm space-y-4">
        <h2 id="rights-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2">
          <Gavel className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Your Privacy Rights
        </h2>

        <div className="flex items-start justify-between gap-4 p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
          <div>
            <span className="text-xs font-bold text-[#181716] block">Do Not Sell or Share My Personal Information</span>
            <span className="text-[11px] text-[#5c5851] block mt-0.5">Opt out under the CPRA and similar state laws. Cross-context behavioral advertising and data sales are stopped.</span>
          </div>
          <ConsentToggle
            granted={state.doNotSellOrShare}
            title="Do Not Sell or Share"
            onChange={() => setDoNotSellOrShare(!state.doNotSellOrShare)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 border border-[#ebe7df] rounded-xl space-y-2">
            <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5"><Download className="w-3.5 h-3.5 text-[#344a37]" aria-hidden="true" /> Export my data</span>
            <p className="text-[11px] text-[#5c5851] leading-relaxed">Download everything this app holds about you — profile, metrics, and your full consent ledger — as a machine-readable JSON file.</p>
            <button
              onClick={() => exportData(user)}
              className="btn-subtle px-3 py-1.5 text-xs inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" /> Download JSON export
            </button>
          </div>

          <div className="p-4 border border-[#f5d5d5] rounded-xl space-y-2 bg-[#fffbfa]">
            <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5 text-[#8c3232]" aria-hidden="true" /> Delete my data</span>
            <p className="text-[11px] text-[#5c5851] leading-relaxed">
              {state.deletionRequestedAt ? (
                <>Request recorded {format(new Date(state.deletionRequestedAt), 'MMM d, yyyy HH:mm')}. In production, erasure completes within 30 days except what we must retain by law. You can still withdraw specific purposes meanwhile.</>
              ) : (
                'Ask us to erase your account and health data. We keep only what law requires (e.g. dispensing records) and tell you what.'
              )}
            </p>
            {state.deletionRequestedAt ? (
              <span className="badge-flag">Deletion request on file</span>
            ) : !confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-1.5 text-xs font-bold text-[#8c3232] border border-[#f5d5d5] hover:bg-[#fdf2f2] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c3232] cursor-pointer"
              >
                Request deletion
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { requestDeletion(); setConfirmDelete(false); }}
                  className="px-3 py-1.5 bg-[#8c3232] hover:bg-[#732828] text-white text-xs font-bold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c3232] cursor-pointer"
                >
                  Confirm deletion request
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 bg-white border border-[#dedad0] text-xs font-bold rounded-lg text-[#181716] hover:bg-[#f6f4ee] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Audit Log */}
      <section aria-labelledby="audit-heading" className="bg-white p-6 rounded-2xl border border-[#ebe7df] shadow-sm space-y-3">
        <h2 id="audit-heading" className="text-sm font-bold text-[#181716] flex items-center gap-2">
          <History className="w-4 h-4 text-[#344a37]" aria-hidden="true" /> Consent Audit Log
          <span className="badge-neutral">{state.audit.length} events</span>
        </h2>
        {state.audit.length === 0 ? (
          <p className="text-xs text-[#5c5851] p-4 bg-[#faf9f6] rounded-xl border border-[#ebe7df]">
            No events yet. Every grant, withdrawal, signature, export, and deletion request will appear here with a timestamp.
          </p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {state.audit.map(event => (
              <li key={event.id} className="p-3 bg-[#faf9f6] rounded-xl border border-[#ebe7df] flex items-start gap-3 text-xs">
                <span className={cn(
                  'p-1.5 rounded-lg flex-shrink-0',
                  event.action === 'withdrawn' || event.action === 'deletion_requested' || event.action === 'authorization_revoked'
                    ? 'bg-[#fdf2f2] text-[#8c3232]'
                    : 'bg-[#f1f5f2] text-[#344a37]'
                )}>
                  {event.action === 'withdrawn' || event.action === 'authorization_revoked' ? <X className="w-3 h-3" aria-hidden="true" /> :
                   event.action === 'deletion_requested' ? <Trash2 className="w-3 h-3" aria-hidden="true" /> :
                   event.action === 'exported' ? <Download className="w-3 h-3" aria-hidden="true" /> :
                   event.action === 'policy_acknowledged' ? <ScrollText className="w-3 h-3" aria-hidden="true" /> :
                   event.action === 'authorization_signed' ? <FileSignature className="w-3 h-3" aria-hidden="true" /> :
                   event.action === 'visit_completed' ? <Video className="w-3 h-3" aria-hidden="true" /> :
                   <Check className="w-3 h-3" aria-hidden="true" />}
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-[#181716] block capitalize">{event.action.replace(/_/g, ' ')}</span>
                  <span className="text-[#5c5851] leading-relaxed block">{event.detail}</span>
                  <span className="text-[10px] text-[#6e6960] block mt-0.5 font-mono">
                    {format(new Date(event.ts), 'MMM d, yyyy HH:mm:ss')} • {formatDistanceToNowStrict(new Date(event.ts))} ago • subject: {event.subject.replace(/_/g, ' ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-[11px] text-[#6e6960] px-1 flex items-start gap-1.5">
        <EyeOff className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        Demo note: consent records, signatures, and this audit log are stored only in your browser (localStorage) — nothing is sent to a server. The production architecture would persist them server-side in a tamper-evident table.
      </p>

      {authModalOpen && (
        <HipaaAuthorizationModal
          user={user}
          onClose={() => setAuthModalOpen(false)}
          onSigned={() => { setAuthModalOpen(false); }}
          signAuthorization={signAuthorization}
        />
      )}
    </div>
  );
}

function HipaaAuthorizationModal({
  user,
  onClose,
  onSigned,
  signAuthorization,
}: {
  user: UserProfile;
  onClose: () => void;
  onSigned: () => void;
  signAuthorization: (input: { signedName: string; recipient: string; informationScope: string[]; purpose: string; expiresOn: string }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useDialogBehavior({ containerRef, active: true, onEscape: onClose });

  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);

  const [recipient, setRecipient] = useState('');
  const [purpose, setPurpose] = useState(HIPAA_PURPOSE_OPTIONS[0]);
  const [otherPurpose, setOtherPurpose] = useState('');
  const [scope, setScope] = useState<string[]>([]);
  const [expiresOn, setExpiresOn] = useState(defaultExpiry.toISOString().slice(0, 10));
  const [signature, setSignature] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleScope = (item: string) => {
    setScope(prev => prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) { setError('Name the person or organization who will receive the information.'); return; }
    if (scope.length === 0) { setError('Select at least one category of information to disclose.'); return; }
    if (purpose === HIPAA_PURPOSE_OPTIONS[3] && !otherPurpose.trim()) { setError('Describe the "other" purpose you selected.'); return; }
    if (signature.trim().length < 2) { setError('Type your full name as an electronic signature.'); return; }
    if (!expiresOn) { setError('Set an expiration date. HIPAA authorizations must expire by event or date.'); return; }

    signAuthorization({
      signedName: signature.trim(),
      recipient: recipient.trim(),
      informationScope: scope,
      purpose: purpose === HIPAA_PURPOSE_OPTIONS[3] ? `Other: ${otherPurpose.trim()}` : purpose,
      expiresOn,
    });
    onSigned();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hipaa-modal-title"
        tabIndex={-1}
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#ebe7df] space-y-4 max-h-[90vh] overflow-y-auto focus:outline-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#f4f2ec]">
          <h2 id="hipaa-modal-title" className="text-sm font-bold text-[#181716] flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-[#785328]" aria-hidden="true" /> Authorization to Use &amp; Disclose Protected Health Information
          </h2>
          <button
            onClick={onClose}
            aria-label="Close authorization form"
            className="p-1.5 text-[#6e6960] hover:text-[#181716] hover:bg-[#f5f3ee] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="hipaa-recipient" className="block font-bold text-[#181716] mb-1">Disclose to (person or organization) <span className="text-[#8c3232]">*</span></label>
            <input
              id="hipaa-recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Dr. Miriam Chen, Austin Cardiology Associates"
              className="w-full px-3 py-2 rounded-lg border border-[#e5e1d7] bg-[#fbfaf8] text-xs focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white"
            />
          </div>

          <fieldset>
            <legend className="font-bold text-[#181716] mb-1.5">Information to disclose <span className="text-[#8c3232]">*</span></legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {HIPAA_SCOPE_OPTIONS.map(item => (
                <label key={item} className="flex items-center gap-2 p-2 rounded-lg border border-[#ebe7df] hover:bg-[#faf9f6] cursor-pointer text-[#181716]">
                  <input
                    type="checkbox"
                    checked={scope.includes(item)}
                    onChange={() => toggleScope(item)}
                    className="accent-[#344a37] w-3.5 h-3.5"
                  />
                  <span className="text-[11px]">{item}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="hipaa-purpose" className="block font-bold text-[#181716] mb-1">Purpose of disclosure <span className="text-[#8c3232]">*</span></label>
            <select
              id="hipaa-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e5e1d7] bg-[#fbfaf8] text-xs focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white cursor-pointer"
            >
              {HIPAA_PURPOSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {purpose === HIPAA_PURPOSE_OPTIONS[3] && (
              <input
                type="text"
                value={otherPurpose}
                onChange={(e) => setOtherPurpose(e.target.value)}
                aria-label="Describe the other purpose"
                placeholder="Describe the purpose…"
                className="mt-2 w-full px-3 py-2 rounded-lg border border-[#e5e1d7] bg-[#fbfaf8] text-xs focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white"
              />
            )}
          </div>

          <div>
            <label htmlFor="hipaa-expiry" className="block font-bold text-[#181716] mb-1">Expires on <span className="text-[#8c3232]">*</span></label>
            <input
              id="hipaa-expiry"
              type="date"
              value={expiresOn}
              onChange={(e) => setExpiresOn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e5e1d7] bg-[#fbfaf8] text-xs focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="hipaa-signature" className="block font-bold text-[#181716] mb-1">
              Electronic signature (type your full name as it appears on your profile: {user.name}) <span className="text-[#8c3232]">*</span>
            </label>
            <input
              id="hipaa-signature"
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Your full legal name"
              autoComplete="name"
              className="w-full px-3 py-2 rounded-lg border border-[#e5e1d7] bg-[#fbfaf8] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white"
            />
          </div>

          <div className="p-3 bg-[#faf9f6] border border-[#ebe7df] rounded-lg text-[11px] text-[#5c5851] space-y-1">
            <p><span className="font-bold text-[#181716]">Your rights:</span> You may revoke this authorization at any time in writing through the Privacy Center. Revocation stops future disclosures but cannot recall information already released. Treatment, payment, and health-care operations may proceed without this authorization as permitted by law.</p>
            <p><span className="font-bold text-[#181716]">Redisclosure:</span> Information disclosed under this authorization may be redisclosed by the recipient and no longer protected by federal privacy rules.</p>
          </div>

          {error && (
            <p role="alert" className="text-[11px] text-[#8c3232] font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" /> {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-subtle px-4 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-ink px-4 py-2 text-xs inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" /> Sign authorization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
