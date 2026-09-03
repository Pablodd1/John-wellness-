import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../types';
import {
  ConsentPurposeId,
  ConsentRecord,
  ConsentState,
  ConsentAuditEvent,
  ConsentAuditAction,
  ConsentSubject,
  ConsentMethod,
  HipaaAuthorization
} from '../types';

/**
 * Consent & compliance store.
 *
 * This is a client-side reference implementation: consent records, the HIPAA-style
 * authorization, and the audit log persist to this browser's localStorage only.
 * In production this module would be replaced with server-side persistence
 * (e.g. a `consent_records` + `consent_audit` table in Supabase) so the trail is
 * tamper-evident and follows the patient across devices. The API surface below is
 * shaped so that swap is a change of implementation, not of call sites.
 */

export const PRIVACY_POLICY_VERSION = '2026-08.1';

export type ConsentPurposeInfo = {
  id: ConsentPurposeId;
  title: string;
  summary: string;
  dataUsed: string[];
  offConsequence: string;
  optional: boolean;
};

export const CONSENT_PURPOSES: ConsentPurposeInfo[] = [
  {
    id: 'telehealth',
    title: 'Telemedicine Video Visits',
    summary: 'Identifies you and opens a private video session with your clinician, and keeps a record that you gave informed consent for telehealth care.',
    dataUsed: ['Name & date of birth', 'Camera & microphone during the visit', 'Visit time & duration'],
    offConsequence: 'Video visits are disabled. All other features keep working; you can still message your clinician.',
    optional: false,
  },
  {
    id: 'ai_processing',
    title: 'AI Clinical Analysis',
    summary: 'Sends the health information in your profile and anything you type into the assistant to an AI model to generate insights and recommendations.',
    dataUsed: ['Profile metrics (sleep, HRV, RHR)', 'Symptoms & messages you type', 'Lab values you enter'],
    offConsequence: 'The AI assistant is paused and nothing is sent to any AI service. Your data stays in the app.',
    optional: true,
  },
  {
    id: 'wearable_sync',
    title: 'Wearable & Device Sync',
    summary: 'Imports sleep, heart-rate variability, activity, and recovery data from connected devices (Oura, Whoop, Garmin) into your profile.',
    dataUsed: ['Device identifiers', 'Sleep / HRV / activity readings'],
    offConsequence: 'Existing synced data is kept; new readings are not imported and readiness scores go stale.',
    optional: true,
  },
  {
    id: 'research_deidentified',
    title: 'De-identified Research',
    summary: 'Contributes your data to research after identifiers (name, email, device IDs) are removed. You are never identified in outputs.',
    dataUsed: ['De-identified biomarkers & regimens'],
    offConsequence: 'Your data is excluded from all research datasets, including already-exported de-identified batches where technically feasible.',
    optional: true,
  },
  {
    id: 'community_sharing',
    title: 'Peer Network Sharing',
    summary: 'Shares the metrics you select (readiness, protocols, check-ins) with community groups and peer matches.',
    dataUsed: ['Metrics you explicitly post', 'Your display name & avatar'],
    offConsequence: 'Your posts stop appearing in community feeds and peer matching is turned off.',
    optional: true,
  },
  {
    id: 'behavioral_analytics',
    title: 'Product Analytics (How You Use the App)',
    summary: 'Records in-app events — pages viewed, searches, cart actions, visit starts — under an anonymous session ID, so the team can see how testers use the platform and improve it.',
    dataUsed: ['Pages & tabs you open', 'Search terms & clicks', 'Cart/checkout steps', 'An anonymous session ID'],
    offConsequence: 'Your interactions are not recorded and your sessions won\'t appear in the team\'s insights dashboard. Nothing else changes.',
    optional: true,
  },
  {
    id: 'marketing',
    title: 'Product & Marketing Communications',
    summary: 'Sends offers, newsletters, and product recommendations based on your profile. Service messages (order status, clinician notes) are always sent regardless.',
    dataUsed: ['Email address', 'Purchase & browsing history'],
    offConsequence: 'You only receive transactional and clinical messages. No change to your care.',
    optional: true,
  },
];

const STORAGE_KEY = 'cx_consent_state_v1';
const MAX_AUDIT_EVENTS = 200;

const PURPOSE_IDS: ConsentPurposeId[] = ['telehealth', 'ai_processing', 'wearable_sync', 'research_deidentified', 'community_sharing', 'marketing', 'behavioral_analytics'];

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `cx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function defaultRecord(purpose: ConsentPurposeId): ConsentRecord {
  return { purpose, granted: false, grantedAt: null, withdrawnAt: null, policyVersion: PRIVACY_POLICY_VERSION, method: null };
}

function defaultState(): ConsentState {
  const records = {} as Record<ConsentPurposeId, ConsentRecord>;
  PURPOSE_IDS.forEach(id => { records[id] = defaultRecord(id); });
  return {
    records,
    audit: [],
    hipaaAuthorization: null,
    doNotSellOrShare: false,
    policyAcknowledgedVersion: null,
    acknowledgedName: null,
    policyAcknowledgedAt: null,
    deletionRequestedAt: null,
  };
}

function loadState(): ConsentState {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      ...base,
      ...parsed,
      records: { ...base.records, ...(parsed.records ?? {}) },
      audit: Array.isArray(parsed.audit) ? parsed.audit.slice(0, MAX_AUDIT_EVENTS) : [],
    };
  } catch {
    return base;
  }
}

export interface ConsentContextValue {
  state: ConsentState;
  isGranted: (purpose: ConsentPurposeId) => boolean;
  isStale: (purpose: ConsentPurposeId) => boolean;
  needsPolicyReview: boolean;
  grant: (purpose: ConsentPurposeId, method?: ConsentMethod) => void;
  withdraw: (purpose: ConsentPurposeId) => void;
  acknowledgePolicy: (name: string) => void;
  signAuthorization: (input: Omit<HipaaAuthorization, 'id' | 'signedAt' | 'policyVersion'>) => void;
  revokeAuthorization: () => void;
  setDoNotSellOrShare: (value: boolean) => void;
  exportData: (user: UserProfile) => void;
  requestDeletion: () => void;
  recordAudit: (action: ConsentAuditAction, detail: string, subject?: ConsentSubject) => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsentState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked (private mode): keep working in-memory.
    }
  }, [state]);

  const recordAudit = useCallback((action: ConsentAuditAction, detail: string, subject: ConsentSubject = 'policy') => {
    const event: ConsentAuditEvent = { id: makeId(), ts: new Date().toISOString(), subject, action, detail };
    setState(prev => ({ ...prev, audit: [event, ...prev.audit].slice(0, MAX_AUDIT_EVENTS) }));
  }, []);

  const grant = useCallback((purpose: ConsentPurposeId, method: ConsentMethod = 'check-action') => {
    setState(prev => ({
      ...prev,
      records: {
        ...prev.records,
        [purpose]: { purpose, granted: true, grantedAt: new Date().toISOString(), withdrawnAt: null, policyVersion: PRIVACY_POLICY_VERSION, method },
      },
    }));
    const info = CONSENT_PURPOSES.find(p => p.id === purpose);
    recordAudit('granted', `${info?.title ?? purpose} consent granted (${method}, policy v${PRIVACY_POLICY_VERSION})`, purpose);
  }, [recordAudit]);

  const withdraw = useCallback((purpose: ConsentPurposeId) => {
    setState(prev => ({
      ...prev,
      records: {
        ...prev.records,
        [purpose]: { ...prev.records[purpose], granted: false, withdrawnAt: new Date().toISOString() },
      },
    }));
    const info = CONSENT_PURPOSES.find(p => p.id === purpose);
    recordAudit('withdrawn', `${info?.title ?? purpose} consent withdrawn — processing stops going forward`, purpose);
  }, [recordAudit]);

  const acknowledgePolicy = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      policyAcknowledgedVersion: PRIVACY_POLICY_VERSION,
      acknowledgedName: name,
      policyAcknowledgedAt: new Date().toISOString(),
    }));
    recordAudit('policy_acknowledged', `Privacy notice & terms acknowledged by ${name} (electronic signature, v${PRIVACY_POLICY_VERSION})`);
  }, [recordAudit]);

  const signAuthorization = useCallback((input: Omit<HipaaAuthorization, 'id' | 'signedAt' | 'policyVersion'>) => {
    const authorization: HipaaAuthorization = {
      ...input,
      id: makeId(),
      signedAt: new Date().toISOString(),
      policyVersion: PRIVACY_POLICY_VERSION,
    };
    setState(prev => ({ ...prev, hipaaAuthorization: authorization }));
    recordAudit('authorization_signed', `HIPAA authorization signed by ${authorization.signedName} — disclose ${authorization.informationScope.join(', ')} to ${authorization.recipient} until ${authorization.expiresOn}`, 'hipaa_authorization');
  }, [recordAudit]);

  const revokeAuthorization = useCallback(() => {
    setState(prev => {
      if (!prev.hipaaAuthorization) return prev;
      return { ...prev, hipaaAuthorization: null };
    });
    recordAudit('authorization_revoked', 'HIPAA authorization revoked — disclosure stops going forward; prior disclosures not retroactively affected', 'hipaa_authorization');
  }, [recordAudit]);

  const setDoNotSellOrShare = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, doNotSellOrShare: value }));
    recordAudit(value ? 'granted' : 'withdrawn', `Do Not Sell or Share preference turned ${value ? 'ON' : 'OFF'}`, 'data_rights');
  }, [recordAudit]);

  const exportData = useCallback((user: UserProfile) => {
    const payload = {
      exportedAt: new Date().toISOString(),
      policyVersion: PRIVACY_POLICY_VERSION,
      notice: 'Machine-readable export of the data this demo holds about you (GDPR Art. 20 / CPRA access).',
      profile: user,
      consent: state,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cuasarx-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    recordAudit('exported', `Data export downloaded (${JSON.stringify(payload).length.toLocaleString()} bytes)`, 'data_rights');
  }, [state, recordAudit]);

  const requestDeletion = useCallback(() => {
    setState(prev => ({ ...prev, deletionRequestedAt: new Date().toISOString() }));
    recordAudit('deletion_requested', 'Deletion request recorded — in production this erases the account within 30 days, except data we must retain by law', 'data_rights');
  }, [recordAudit]);

  const isGranted = useCallback((purpose: ConsentPurposeId) => state.records[purpose]?.granted ?? false, [state.records]);
  const isStale = useCallback((purpose: ConsentPurposeId) => {
    const record = state.records[purpose];
    return Boolean(record?.granted && record.policyVersion !== PRIVACY_POLICY_VERSION);
  }, [state.records]);
  const needsPolicyReview = state.policyAcknowledgedVersion !== PRIVACY_POLICY_VERSION;

  const value = useMemo<ConsentContextValue>(() => ({
    state,
    isGranted,
    isStale,
    needsPolicyReview,
    grant,
    withdraw,
    acknowledgePolicy,
    signAuthorization,
    revokeAuthorization,
    setDoNotSellOrShare,
    exportData,
    requestDeletion,
    recordAudit,
  }), [state, isGranted, isStale, needsPolicyReview, grant, withdraw, acknowledgePolicy, signAuthorization, revokeAuthorization, setDoNotSellOrShare, exportData, requestDeletion, recordAudit]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used inside <ConsentProvider>');
  return ctx;
}
