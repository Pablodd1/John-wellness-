import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Database, ShieldCheck } from 'lucide-react';

/**
 * Sign-in / sign-up gate shown when the database is configured but no user is
 * logged in. If Supabase isn't configured at all, the app keeps working in
 * demo mode — the gate is only rendered when a real identity is possible.
 */
export function AuthGate() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email.trim(), password);
        if (err) setError(err);
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setBusy(false);
          return;
        }
        const { error: err, needsConfirmation } = await signUp(email.trim(), password, name.trim());
        if (err) {
          setError(err);
        } else if (needsConfirmation) {
          setNotice('Account created — check your email for a confirmation link, then sign in here. (You can turn off "Confirm email" in Supabase → Authentication → Providers during testing.)');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-[#fbfaf8] border border-[#e5e1d7] focus:outline-none focus:ring-2 focus:ring-[#181716] focus:bg-white';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#ebe7df] shadow-sm p-6 sm:p-8 w-full max-w-md space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#f1f5f2] rounded-xl border border-[#dbe5dc]">
            <ShieldCheck className="w-6 h-6 text-[#344a37]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#181716]">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="text-[11px] text-[#6e6960] leading-relaxed">
              Your orders, intake results, and consent records are tied to this identity.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <label htmlFor="auth-name" className="sr-only">Full name</label>
              <UserIcon className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                placeholder="Full name"
                className={field}
              />
            </div>
          )}

          <div className="relative">
            <label htmlFor="auth-email" className="sr-only">Email</label>
            <Mail className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
              className={field}
            />
          </div>

          <div className="relative">
            <label htmlFor="auth-password" className="sr-only">Password</label>
            <Lock className="w-4 h-4 text-[#8a857b] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              placeholder={mode === 'signup' ? 'Password (min 6 characters)' : 'Password'}
              className={field}
            />
          </div>

          {error && (
            <p role="alert" className="text-[11px] text-[#8c3232] font-bold p-2.5 rounded-lg border border-[#f5d5d5] bg-[#fdf2f2]">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-[11px] text-[#2b4530] font-semibold p-2.5 rounded-lg border border-[#dbe5dc] bg-[#f1f5f2]">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-ink w-full py-2.5 text-xs inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] focus-visible:ring-offset-2"
          >
            {mode === 'signin'
              ? <><LogIn className="w-4 h-4" aria-hidden="true" /> {busy ? 'Signing in…' : 'Sign in'}</>
              : <><UserPlus className="w-4 h-4" aria-hidden="true" /> {busy ? 'Creating…' : 'Create account'}</>}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setNotice(null); }}
          className="w-full text-[11px] font-semibold text-[#5c5851] hover:text-[#181716] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181716] rounded"
        >
          {mode === 'signin' ? 'No account yet? Create one' : 'Already have an account? Sign in'}
        </button>

        <p className="text-[10px] text-[#6e6960] flex items-start gap-1.5 p-2.5 rounded-lg bg-[#faf9f6] border border-[#ebe7df]">
          <Database className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>Test MVP: passwords are verified by Supabase Auth over an encrypted connection, and every table is locked so you can only ever read and write your own rows.</span>
        </p>
      </div>
    </div>
  );
}
