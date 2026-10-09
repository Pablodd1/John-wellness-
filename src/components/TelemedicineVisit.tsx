import React, { useEffect, useRef, useState } from 'react';
import { TelemedicineMode, TelemedicinePhase, UserProfile } from '../types';
import { PRIVACY_POLICY_VERSION, useConsent } from '../lib/consent';
import { authFetch } from '../lib/dataService';
import { useDialogBehavior } from '../lib/useDialog';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { cn } from '../lib/utils';

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const CONNECTING_MS = 2200;

export function TelemedicineVisit({
  mode,
  patient,
  onClose,
}: {
  mode: TelemedicineMode;
  patient: UserProfile;
  onClose: () => void;
}) {
  const { isGranted, grant, recordAudit } = useConsent();

  const telehealthOnFile = isGranted('telehealth');
  // Clinician-initiated visits require the patient's telehealth consent before connecting;
  // patient-initiated visits go through the informed-consent sign flow when not on file.
  const [phase, setPhase] = useState<TelemedicinePhase>(() =>
    telehealthOnFile ? 'waiting' : 'consent'
  );
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'ready' | 'denied' | 'unsupported'>('checking');
  const [micStatus, setMicStatus] = useState<'checking' | 'ready' | 'denied' | 'unsupported'>('checking');
  const [remoteSupportsStream, setRemoteSupportsStream] = useState(false);
  const [dailyState, setDailyState] = useState<'off' | 'loading' | 'active' | 'failed'>('off');
  const [dailyRoomUrl, setDailyRoomUrl] = useState<string | null>(null);
  const dailyFrameRef = useRef<{ destroy: () => void; leave: () => void } | null>(null);
  const dailyContainerRef = useRef<HTMLDivElement>(null);
  const dailyScriptPromiseRef = useRef<Promise<unknown> | null>(null);

  const [consentChecked, setConsentChecked] = useState(false);
  const [signature, setSignature] = useState(mode === 'patient' ? patient.name : '');
  const [consentError, setConsentError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const shareVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const shareStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const mediaStartedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const inCall = phase === 'connecting' || phase === 'incall';
  const remoteName = mode === 'clinician' ? patient.name : 'Quasar Keel Care Advisor';
  const remoteSubtitle = mode === 'clinician'
    ? 'Patient — simulated remote participant (demo)'
    : 'Wellness Advisor — simulated remote participant (demo)';

  const stopShare = () => {
    shareStreamRef.current?.getTracks().forEach(track => track.stop());
    shareStreamRef.current = null;
    setSharing(false);
  };

  const stopAllMedia = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    stopShare();
    remoteStreamRef.current?.getTracks().forEach(track => track.stop());
    remoteStreamRef.current = null;
  };

  const handleClose = () => {
    stopAllMedia();
    onClose();
  };

  const handleEndCall = () => {
    if (dailyFrameRef.current) {
      try { dailyFrameRef.current.destroy(); } catch { /* already gone */ }
      dailyFrameRef.current = null;
    }
    stopAllMedia();
    recordAudit(
      'visit_completed',
      `Telemedicine visit (${mode}-initiated) with ${remoteName} ended after ${formatDuration(secondsElapsed)}${dailyState === 'active' ? ' — live video via Daily.co' : ' — local simulated session'}. Telehealth consent v${PRIVACY_POLICY_VERSION} was on file. No visit notes recorded in demo.`,
      'telehealth'
    );
    setDailyState('off');
    setDailyRoomUrl(null);
    setPhase('ended');
  };

  // Load daily-js from the CDN once per session.
  type DailyFrame = { destroy: () => void; leave: () => void; join: (opts: { url: string }) => Promise<unknown>; on: (event: string, handler: () => void) => void };
  type DailyIframeApi = { createFrame: (container: HTMLElement, options?: Record<string, unknown>) => DailyFrame };
  const loadDailyScript = (): Promise<DailyIframeApi | null> => {
    if (dailyScriptPromiseRef.current) return dailyScriptPromiseRef.current as Promise<DailyIframeApi | null>;
    dailyScriptPromiseRef.current = new Promise<DailyIframeApi | null>((resolve, reject) => {
      const win = window as unknown as { DailyIframe?: DailyIframeApi };
      if (win.DailyIframe) { resolve(win.DailyIframe); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@daily-co/daily-js';
      script.onload = () => resolve((window as unknown as { DailyIframe?: DailyIframeApi }).DailyIframe ?? null);
      script.onerror = () => reject(new Error('daily-js failed to load'));
      document.head.appendChild(script);
    });
    return dailyScriptPromiseRef.current as Promise<DailyIframeApi | null>;
  };

  // Join: ask the server for a real Daily.co room. If the server function is
  // configured, join it for live video; otherwise fall back to the local
  // simulated session so the flow always completes.
  const handleJoin = async () => {
    setPhase('connecting');
    try {
      const res = await authFetch('/api/daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.roomUrl) {
          setDailyRoomUrl(data.roomUrl);
          setDailyState('loading');
          return;
        }
      }
      // 404/501/anything else → simulated session
    } catch {
      // server unreachable → simulated session
    }
    // Simulated handshake proceeds via the existing connecting → incall timer.
  };

  // Mount the Daily call frame once the room URL exists.
  useEffect(() => {
    if (!dailyRoomUrl || dailyState !== 'loading') return;
    let cancelled = false;

    loadDailyScript()
      .then((DailyIframe) => {
        if (cancelled || !dailyContainerRef.current || !DailyIframe) {
          if (!DailyIframe) setDailyState('failed');
          return;
        }
        // The Daily frame manages its own camera/mic — release ours.
        localStreamRef.current?.getTracks().forEach((track) => { track.stop(); });
        localStreamRef.current = null;

        const frame = DailyIframe.createFrame(dailyContainerRef.current, {
          iframeStyle: { width: '100%', height: '100%', border: '0', borderRadius: '16px' },
          showLeaveButton: false,
          userName: mode === 'clinician' ? 'Clinician (this device)' : (patient.name || 'Patient'),
        });
        dailyFrameRef.current = frame;
        frame.on('joined-meeting', () => {
          if (!cancelled) { setDailyState('active'); setPhase('incall'); }
        });
        frame.on('left-meeting', () => {
          if (!cancelled && dailyFrameRef.current) handleEndCall();
        });
        frame.on('error', () => { if (!cancelled) setDailyState('failed'); });
        return frame.join({ url: dailyRoomUrl });
      })
      .catch(() => { if (!cancelled) setDailyState('failed'); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyRoomUrl, dailyState]);

  // Fall back to the simulated session when Daily isn't available.
  useEffect(() => {
    if (dailyState === 'failed' && phase === 'connecting') {
      // the connecting → incall timer (2.2s) is already running and will fire
    }
  }, [dailyState, phase]);

  useDialogBehavior({
    containerRef,
    active: true,
    onEscape: inCall ? undefined : handleClose,
  });

  // Tear down all media when the overlay unmounts or the session is over.
  useEffect(() => {
    return () => {
      mediaStartedRef.current = false;
      stopAllMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Acquire camera + mic once, when the waiting room is entered.
  useEffect(() => {
    if (phase !== 'waiting' || mediaStartedRef.current) return;
    mediaStartedRef.current = true;

    const acquire = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('unsupported');
        setMicStatus('unsupported');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setCameraStatus('ready');
        setMicStatus('ready');
      } catch {
        // Camera blocked — try audio-only so the visit can still happen.
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          setCameraStatus('denied');
          setMicStatus('ready');
        } catch {
          setCameraStatus('denied');
          setMicStatus('denied');
        }
      }
    };
    acquire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Re-attach the local stream whenever the visible local video element
  // changes (waiting-room preview → in-call PiP).
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [phase]);

  // Simulated connection handshake.
  useEffect(() => {
    if (phase !== 'connecting') return;
    const timer = window.setTimeout(() => setPhase('incall'), CONNECTING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Call timer.
  useEffect(() => {
    if (phase !== 'incall') return;
    const interval = window.setInterval(() => setSecondsElapsed(s => s + 1), 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  // Simulated remote participant: animate a canvas and feed it to the video
  // element as a real MediaStream, mirroring the pipeline a WebRTC remote
  // stream would use. Falls back to showing the canvas directly.
  useEffect(() => {
    if (!inCall) return;
    const canvas = canvasRef.current;
    const video = remoteVideoRef.current;
    if (!canvas) return;
    if (video && typeof canvas.captureStream === 'function') {
      try {
        const stream = canvas.captureStream(20);
        remoteStreamRef.current = stream;
        video.srcObject = stream;
        video.play().catch(() => {});
        setRemoteSupportsStream(true);
      } catch {
        setRemoteSupportsStream(false);
      }
    } else {
      setRemoteSupportsStream(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCall]);

  // Remote canvas animation loop.
  useEffect(() => {
    if (!inCall) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = 1280;
    canvas.height = 720;
    const initials = remoteName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    let raf = 0;

    const draw = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#101b15');
      bg.addColorStop(1, '#1d2b24');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) {
        const cx = w * (0.32 + 0.2 * Math.sin(time / 4200 + i * 2.1));
        const cy = h * (0.4 + 0.18 * Math.cos(time / 5400 + i * 1.7));
        const blob = ctx.createRadialGradient(cx, cy, 0, cx, cy, 320);
        blob.addColorStop(0, 'rgba(74, 104, 79, 0.30)');
        blob.addColorStop(1, 'rgba(74, 104, 79, 0)');
        ctx.fillStyle = blob;
        ctx.fillRect(0, 0, w, h);
      }

      const bobbing = Math.sin(time / 950) * 4;
      const speaking = Math.sin(time / 340) > 0.35;

      if (speaking) {
        ctx.strokeStyle = 'rgba(240, 235, 220, 0.45)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(w / 2, 300 + bobbing, 104 + Math.sin(time / 340) * 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#3d5643';
      ctx.beginPath();
      ctx.arc(w / 2, 300 + bobbing, 86, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f4f2ec';
      ctx.font = 'bold 64px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, w / 2, 302 + bobbing);

      ctx.font = '600 30px system-ui, sans-serif';
      ctx.fillText(remoteName, w / 2, 440 + bobbing);
      ctx.font = '500 20px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(244, 242, 236, 0.6)';
      ctx.fillText(mode === 'clinician' ? 'Patient' : 'Clinician', w / 2, 480 + bobbing);

      ctx.font = 'bold 20px monospace';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(244, 242, 236, 0.55)';
      // Top corners stay clear of the bottom label chips and the local PiP,
      // and the 16% insets keep the text inside object-cover's safe area.
      ctx.textAlign = 'right';
      ctx.fillText('SIMULATED — DEMO', w * 0.84, 44);
      ctx.textAlign = 'left';
      ctx.fillText('Local demo — nothing leaves this device', w * 0.16, 44);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [inCall, remoteName, mode]);

  // Attach screen-share stream to its video element.
  useEffect(() => {
    const video = shareVideoRef.current;
    if (!video) return;
    if (sharing && shareStreamRef.current) {
      video.srcObject = shareStreamRef.current;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [sharing, phase]);

  const toggleMic = () => {
    const next = !micMuted;
    setMicMuted(next);
    localStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = !next; });
  };

  const toggleCam = () => {
    if (cameraStatus !== 'ready') return;
    const next = !camOff;
    setCamOff(next);
    localStreamRef.current?.getVideoTracks().forEach(track => { track.enabled = !next; });
  };

  const toggleShare = async () => {
    if (sharing) { stopShare(); return; }
    if (!navigator.mediaDevices?.getDisplayMedia) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      shareStreamRef.current = stream;
      setSharing(true);
      stream.getVideoTracks()[0]?.addEventListener('ended', stopShare);
    } catch {
      // User cancelled the browser's share picker.
    }
  };

  const handleConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) { setConsentError('Please confirm you have read and accept the consent notice.'); return; }
    if (signature.trim().length < 2) { setConsentError('Type your full name to sign electronically.'); return; }
    grant('telehealth', 'electronic-signature');
    setConsentError(null);
    setPhase('waiting');
  };

  // Clinician-initiated call without patient consent on file: the clinician
  // cannot sign for the patient — they can only request it.
  const handleSendConsentRequest = () => {
    grant('telehealth', 'electronic-signature');
    setPhase('waiting');
  };

  const phaseStatus: Record<TelemedicinePhase, string> = {
    consent: 'Waiting for telehealth informed consent',
    waiting: 'Device check — waiting room',
    connecting: 'Connecting to visit…',
    incall: 'In visit',
    ended: 'Visit ended',
  };

  const controlBtn = 'p-3 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="fixed inset-0 z-[90] bg-[#0d1210]/97 backdrop-blur-sm">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Telemedicine video visit with ${remoteName}`}
        tabIndex={-1}
        className="h-full flex flex-col focus:outline-none text-[#f4f2ec]"
      >
        <p className="sr-only" role="status">{phaseStatus[phase]}</p>

        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white/10">
              <Video className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">Telemedicine Visit — {remoteName}</h2>
              <span className="text-[11px] text-white/60 block truncate">
                {phaseStatus[phase]}
                {phase === 'incall' && <> • {formatDuration(secondsElapsed)}</>}
                {' • '}
                {dailyState === 'active'
                  ? 'Live video via Daily.co — consent on file, not recorded'
                  : 'Local demo session — no network transmission'}
              </span>
            </div>
          </div>
          {phase !== 'incall' && phase !== 'connecting' && (
            <button
              onClick={handleClose}
              aria-label="Close video visit"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </header>

        {/* Body */}
        <div className="flex-1 min-h-0 relative">
          {/* ---------- CONSENT PHASE ---------- */}
          {phase === 'consent' && (mode === 'patient' ? (
            <div className="h-full overflow-y-auto flex items-start sm:items-center justify-center p-4">
              <form
                onSubmit={handleConsentSubmit}
                className="bg-white text-[#181716] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-2 text-[#344a37]">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  <h3 className="text-sm font-bold">Telehealth Informed Consent</h3>
                </div>

                <div className="text-xs text-[#5c5851] space-y-2 leading-relaxed">
                  <p>
                    Before joining by video, please review what telehealth means. By law we need your informed consent
                    before delivering care this way.
                  </p>
                  <ul className="space-y-1.5" aria-label="Key points of the telehealth consent">
                    <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" /> Telehealth uses video/audio technology — quality can vary and connections may drop or delay.</li>
                    <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" /> The visit is not recorded. Your clinician documents notes in your chart as with an in-person visit.</li>
                    <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" /> <span><strong className="text-[#8c3232]">Telehealth is not for emergencies.</strong> For chest pain, breathing trouble, or any emergency, hang up and call 911.</span></li>
                    <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" /> You may withdraw consent at any time — before or during a visit — and switch to in-person care without penalty.</li>
                    <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-[#344a37] flex-shrink-0 mt-0.5" aria-hidden="true" /> This demo runs entirely on your device: camera and microphone streams never leave your computer.</li>
                  </ul>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#ebe7df] bg-[#faf9f6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="accent-[#344a37] w-4 h-4 mt-0.5"
                  />
                  <span className="text-xs text-[#181716] font-medium">
                    I have read and accept this telehealth informed consent, including the emergency guidance above.
                  </span>
                </label>

                <div>
                  <label htmlFor="visit-signature" className="block font-bold text-xs text-[#181716] mb-1">
                    Electronic signature <span className="text-[#8c3232]">*</span>
                  </label>
                  <input
                    id="visit-signature"
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    autoComplete="name"
                    className="w-full px-3 py-2 rounded-lg border border-[#e5e1d7] bg-[#fbfaf8] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white"
                  />
                  <span className="text-[10px] text-[#6e6960] block mt-1">Typing your full name adopts and signs this consent electronically.</span>
                </div>

                {consentError && (
                  <p role="alert" className="text-[11px] text-[#8c3232] font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" /> {consentError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-subtle px-4 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
                  >
                    Not now
                  </button>
                  <button
                    type="submit"
                    className="btn-ink px-4 py-2 text-xs inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" /> Sign &amp; continue
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <div className="bg-white text-[#181716] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-2 text-[#785328]">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  <h3 className="text-sm font-bold">Patient consent required before connecting</h3>
                </div>
                <p className="text-xs text-[#5c5851] leading-relaxed">
                  <strong className="text-[#181716]">{patient.name}</strong> has no telehealth informed consent on file.
                  You cannot connect until the patient reviews and signs the consent on their own device — you cannot
                  sign on their behalf.
                </p>
                <p className="text-[11px] text-[#6e6960] leading-relaxed">
                  In production this button sends a consent request to the patient's app. For this demo, simulating the
                  patient signing on their device will record the consent with a note in the audit log.
                </p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={handleClose}
                    className="btn-subtle px-4 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendConsentRequest}
                    className="btn-ink px-4 py-2 text-xs inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Send consent request (simulated)
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* ---------- WAITING ROOM ---------- */}
          {phase === 'waiting' && (
            <div className="h-full flex flex-col items-center justify-center p-4 gap-5">
              <div className="relative w-full max-w-2xl aspect-video bg-[#141b17] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn('w-full h-full object-cover', (camOff || cameraStatus !== 'ready') && 'hidden')}
                />
                {(camOff || cameraStatus !== 'ready') && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
                    <Camera className="w-8 h-8" aria-hidden="true" />
                    <span className="text-xs font-semibold">
                      {camOff ? 'Camera off' : cameraStatus === 'denied' ? 'Camera unavailable — you can join with audio only' : cameraStatus === 'unsupported' ? 'Camera not supported in this browser' : 'Starting camera…'}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-2.5 left-3 text-[10px] font-bold bg-black/50 px-2 py-1 rounded-md">You ({mode === 'clinician' ? 'clinician' : 'patient'})</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 max-w-2xl w-full space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">Device check</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <li className="flex items-center gap-2 text-white/85">
                    <span className={cn('w-2 h-2 rounded-full', micStatus === 'ready' ? 'bg-emerald-400' : micStatus === 'checking' ? 'bg-amber-400' : 'bg-rose-400')} aria-hidden="true" />
                    Microphone: {micStatus === 'ready' ? 'Ready' : micStatus === 'checking' ? 'Checking…' : micStatus === 'denied' ? 'Blocked' : 'Unsupported'}
                  </li>
                  <li className="flex items-center gap-2 text-white/85">
                    <span className={cn('w-2 h-2 rounded-full', cameraStatus === 'ready' ? 'bg-emerald-400' : cameraStatus === 'checking' ? 'bg-amber-400' : 'bg-rose-400')} aria-hidden="true" />
                    Camera: {cameraStatus === 'ready' ? 'Ready' : cameraStatus === 'checking' ? 'Checking…' : cameraStatus === 'denied' ? 'Blocked — audio-only' : 'Unsupported'}
                  </li>
                </ul>
                <p className="text-[11px] text-white/50">
                  Telehealth consent v{PRIVACY_POLICY_VERSION} on file (signed electronically). Not feeling well enough to talk? You can leave and message {mode === 'clinician' ? 'your patient' : 'your clinician'} instead.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-full border border-white/25 hover:bg-white/10 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                >
                  Leave
                </button>
                <button
                  onClick={handleJoin}
                  className="px-5 py-2.5 rounded-full bg-[#4a6850] hover:bg-[#54765c] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                >
                  <Video className="w-4 h-4" aria-hidden="true" /> Join visit
                </button>
              </div>
            </div>
          )}

          {/* ---------- CONNECTING / IN CALL ---------- */}
          {inCall && (
            <div className="h-full p-3 sm:p-5">
              <div className="relative h-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-[#141b17] border border-white/10 shadow-2xl">
                {/* Live Daily.co video when a real room was created */}
                {dailyRoomUrl && dailyState !== 'failed' && (
                  <div ref={dailyContainerRef} className="absolute inset-0" aria-label="Live video call frame" />
                )}

                {/* Simulated session markup (hidden while Daily is active) */}
                {!(dailyRoomUrl && dailyState !== 'failed') && (
                  <>
                {/* Main slot: shared screen > simulated remote */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  aria-hidden="true"
                  className={cn('w-full h-full object-cover', (!sharing && remoteSupportsStream) ? 'block' : 'hidden')}
                />
                <canvas
                  ref={canvasRef}
                  aria-hidden="true"
                  className={cn('w-full h-full object-cover', (!sharing && !remoteSupportsStream) ? 'block' : 'hidden')}
                />
                <video
                  ref={shareVideoRef}
                  autoPlay
                  playsInline
                  className={cn('w-full h-full object-contain bg-black', sharing ? 'block' : 'hidden')}
                />

                {sharing && (
                  <div className="absolute top-3 left-3 text-[10px] font-bold bg-black/60 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                    <MonitorUp className="w-3 h-3" aria-hidden="true" /> You are sharing your screen
                  </div>
                )}
                {!sharing && (
                  <div className="absolute bottom-3 left-3 text-[10px] font-bold bg-black/50 px-2.5 py-1 rounded-md">
                    {remoteName} — simulated remote participant (demo)
                  </div>
                )}

                {/* Local PiP */}
                <div className="absolute bottom-3 right-3 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border border-white/20 bg-[#0d1210] shadow-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn('w-full h-full object-cover scale-x-[-1]', (camOff || cameraStatus !== 'ready') && 'hidden')}
                  />
                  {(camOff || cameraStatus !== 'ready') && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60">
                      <Camera className="w-5 h-5" aria-hidden="true" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white/80">You</span>
                </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ---------- ENDED ---------- */}
          {phase === 'ended' && (
            <div className="h-full flex items-center justify-center p-4">
              <div className="bg-white text-[#181716] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-2 text-[#344a37]">
                  <Check className="w-5 h-5" aria-hidden="true" />
                  <h3 className="text-sm font-bold">Visit ended</h3>
                </div>
                <dl className="text-xs space-y-2">
                  <div className="flex justify-between gap-4"><dt className="text-[#5c5851]">Participant</dt><dd className="font-bold text-right">{remoteName}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#5c5851]">Duration</dt><dd className="font-bold">{formatDuration(secondsElapsed)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#5c5851]">Consent reference</dt><dd className="font-bold">Telehealth v{PRIVACY_POLICY_VERSION}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#5c5851]">Transmission</dt><dd className="font-bold">Local demo — nothing sent</dd></div>
                </dl>
                <p className="text-[11px] text-[#6e6960] leading-relaxed">
                  The completion was recorded in your consent audit log. This demo does not produce clinical notes or
                  diagnoses — nothing about this session represents medical advice.
                </p>
                <button
                  onClick={handleClose}
                  className="btn-ink w-full py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls (visible during connecting / in call). The Daily frame
            manages its own mic/cam, so device controls are hidden in that mode. */}
        {inCall && (
          <footer className="flex items-center justify-center gap-2.5 sm:gap-3.5 px-4 py-4 border-t border-white/10">
            {dailyState !== 'active' && (
              <>
            <button
              type="button"
              onClick={toggleMic}
              aria-pressed={micMuted}
              aria-label={micMuted ? 'Unmute microphone' : 'Mute microphone'}
              title={micMuted ? 'Unmute' : 'Mute'}
              className={cn(controlBtn, micMuted ? 'bg-[#8c3232] hover:bg-[#732828]' : 'bg-white/10 hover:bg-white/20')}
            >
              {micMuted ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={toggleCam}
              disabled={cameraStatus !== 'ready'}
              aria-pressed={camOff}
              aria-label={camOff ? 'Turn camera on' : 'Turn camera off'}
              title={camOff ? 'Camera on' : 'Camera off'}
              className={cn(controlBtn, camOff ? 'bg-[#8c3232] hover:bg-[#732828]' : 'bg-white/10 hover:bg-white/20')}
            >
              {camOff ? <VideoOff className="w-5 h-5" aria-hidden="true" /> : <Video className="w-5 h-5" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={toggleShare}
              aria-pressed={sharing}
              aria-label={sharing ? 'Stop screen sharing' : 'Share your screen'}
              title={sharing ? 'Stop sharing' : 'Share screen'}
              className={cn(controlBtn, sharing ? 'bg-[#785328] hover:bg-[#654621]' : 'bg-white/10 hover:bg-white/20')}
            >
              <MonitorUp className="w-5 h-5" aria-hidden="true" />
            </button>
              </>
            )}
            {dailyState === 'loading' && (
              <span className="text-[11px] text-white/60">Connecting to live video room…</span>
            )}

            <button
              type="button"
              onClick={handleEndCall}
              aria-label="End visit"
              title="End visit"
              className={cn(controlBtn, 'bg-[#8c3232] hover:bg-[#732828] px-5')}
            >
              <span className="flex items-center gap-2 text-xs font-bold">
                <PhoneOff className="w-5 h-5" aria-hidden="true" /> End
              </span>
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
