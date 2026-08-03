import React, { useState } from 'react';
import { EvidenceData } from '../types';
import { FileText, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';

interface EvidenceGradeProps {
  evidence: EvidenceData | string;
  compact?: boolean;
}

export function EvidenceGrade({ evidence, compact = false }: EvidenceGradeProps) {
  const [expanded, setExpanded] = useState(!compact);

  if (typeof evidence === 'string') {
    return (
      <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
        <BookOpen className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold block text-slate-900 mb-0.5">Clinical Insight</span>
          <p className="leading-relaxed text-slate-600">{evidence}</p>
        </div>
      </div>
    );
  }

  const { confidenceScore, grade, referenceTitle, journal, year, doiOrUrl, clinicalRationale } = evidence;

  const gradeBadgeBg = 
    grade === 'A' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
    grade === 'B' ? 'bg-blue-100 text-blue-800 border-blue-300' :
    'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div className="mt-2 bg-slate-900/5 rounded-2xl border border-slate-200/80 overflow-hidden text-xs">
      {/* Header bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-3 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Why This Recommendation
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${gradeBadgeBg}`}>
            Grade {grade}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            {confidenceScore}% Confidence
          </span>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Rationale & Citation details */}
      {expanded && (
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 space-y-2.5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Clinical Rationale & Mechanism
            </span>
            <p className="text-slate-700 font-normal leading-relaxed">
              {clinicalRationale}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="text-slate-500 font-medium truncate max-w-md">
              <span className="font-semibold text-slate-800">{journal}</span> ({year}) — <span className="italic">{referenceTitle}</span>
            </div>

            {doiOrUrl && (
              <a 
                href={doiOrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-3 h-3" />
                PubMed Reference
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
