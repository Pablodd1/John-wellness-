import React, { useState } from 'react';
import { EvidenceData, Product } from '../types';
import { FileText, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, Sparkles, BookOpen, AlertCircle, Stethoscope, PlusCircle, AlertTriangle } from 'lucide-react';

interface EvidenceGradeProps {
  evidence?: EvidenceData | string;
  product?: Product;
  compact?: boolean;
}

export function EvidenceGrade({ evidence, product, compact = false }: EvidenceGradeProps) {
  const [expanded, setExpanded] = useState(!compact);

  // Derive values if product is passed
  const effectiveEvidence = evidence || product?.evidenceData || product?.evidence;
  const hasHumanStudies = product?.hasHumanStudies;
  const humanStudiesNote = product?.humanStudiesNote;
  const potentialSideBenefits = product?.potentialSideBenefits;
  const potentialSideEffects = product?.potentialSideEffects;
  const medicalDisclaimer = product?.medicalDisclaimer || 'Educational biohacking research only. This platform is NOT a medical doctor. Consult a licensed physician before starting any compound or supplement protocol.';

  if (!effectiveEvidence && !product) return null;

  if (typeof effectiveEvidence === 'string') {
    return (
      <div className="mt-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold block text-slate-800 mb-0.5">Clinical Insight</span>
            <p className="leading-relaxed text-slate-600">{effectiveEvidence}</p>
          </div>
        </div>

        {/* Human Studies Status */}
        {hasHumanStudies !== undefined && (
          <div className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
            hasHumanStudies === false 
              ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}>
            <AlertCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${hasHumanStudies === false ? 'text-amber-600' : 'text-emerald-600'}`} />
            <div>
              <span className="font-bold block">
                {hasHumanStudies === false ? 'No Direct Human Clinical Trials' : 'Human Clinical Studies Available'}
              </span>
              {humanStudiesNote && <p className="text-[10px] opacity-90 mt-0.5">{humanStudiesNote}</p>}
            </div>
          </div>
        )}

        {/* Side Benefits & Side Effects */}
        {(potentialSideBenefits || potentialSideEffects) && (
          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {potentialSideBenefits && potentialSideBenefits.length > 0 && (
              <div className="p-2 bg-emerald-50/50 rounded-xl border border-emerald-100/80">
                <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                  <PlusCircle className="w-3 h-3 text-emerald-600" /> Potential Side Benefits:
                </span>
                <ul className="list-disc list-inside text-emerald-900/80 space-y-0.5 text-[10px]">
                  {potentialSideBenefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {potentialSideEffects && potentialSideEffects.length > 0 && (
              <div className="p-2 bg-amber-50/50 rounded-xl border border-amber-100/80">
                <span className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Potential Side Effects / Precautions:
                </span>
                <ul className="list-disc list-inside text-amber-900/80 space-y-0.5 text-[10px]">
                  {potentialSideEffects.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Doctor Disclaimer */}
        <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-500 italic">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{medicalDisclaimer}</span>
        </div>
      </div>
    );
  }

  const confidenceScore = effectiveEvidence?.confidenceScore || 85;
  const grade = effectiveEvidence?.grade || 'B';
  const referenceTitle = effectiveEvidence?.referenceTitle || '';
  const journal = effectiveEvidence?.journal || '';
  const year = effectiveEvidence?.year || 2023;
  const doiOrUrl = effectiveEvidence?.doiOrUrl;
  const clinicalRationale = effectiveEvidence?.clinicalRationale || '';

  const gradeBadgeBg = 
    grade === 'A' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
    grade === 'B' ? 'bg-slate-100 text-slate-800 border-slate-200' :
    'bg-amber-50 text-amber-800 border-amber-200';

  return (
    <div className="mt-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 overflow-hidden text-xs">
      {/* Header bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-3 bg-white hover:bg-slate-50/80 cursor-pointer flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            Clinical Research Rationale
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${gradeBadgeBg}`}>
            Grade {grade}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-slate-500" />
            {confidenceScore}% Confidence
          </span>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Rationale & Citation details */}
      {expanded && (
        <div className="p-3.5 bg-slate-50/90 border-t border-slate-200/80 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Mechanism & Clinical Rationale
            </span>
            <p className="text-slate-700 font-normal leading-relaxed text-xs">
              {clinicalRationale}
            </p>
          </div>

          {/* Human Studies Availability Notice */}
          {hasHumanStudies !== undefined && (
            <div className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
              hasHumanStudies === false 
                ? 'bg-amber-50/80 border-amber-200/80 text-amber-900' 
                : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
            }`}>
              <AlertCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${hasHumanStudies === false ? 'text-amber-600' : 'text-emerald-600'}`} />
              <div>
                <span className="font-bold block text-xs">
                  {hasHumanStudies === false ? '⚠️ No Conclusive Human Clinical Studies Available' : '✓ Validated in Human Clinical Trials'}
                </span>
                {humanStudiesNote && <p className="text-[11px] opacity-90 mt-0.5 leading-normal">{humanStudiesNote}</p>}
              </div>
            </div>
          )}

          {/* Potential Side Benefits & Potential Side Effects / Precautions */}
          {(potentialSideBenefits || potentialSideEffects) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {potentialSideBenefits && potentialSideBenefits.length > 0 && (
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" /> Potential Side Benefits:
                  </span>
                  <ul className="list-disc list-inside text-emerald-900/80 space-y-0.5 text-[11px]">
                    {potentialSideBenefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {potentialSideEffects && potentialSideEffects.length > 0 && (
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Potential Side Effects / Precautions:
                  </span>
                  <ul className="list-disc list-inside text-amber-900/80 space-y-0.5 text-[11px]">
                    {potentialSideEffects.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Citation / PubMed Link */}
          {journal && (
            <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="text-slate-500 font-medium truncate max-w-md">
                <span className="font-semibold text-slate-800">{journal}</span> ({year}) — <span className="italic">{referenceTitle}</span>
              </div>

              {doiOrUrl && (
                <a 
                  href={doiOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  PubMed Reference
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          )}

          {/* Medical Disclaimer Banner */}
          <div className="pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-[10px] text-slate-500 italic bg-slate-100/60 p-2 rounded-xl">
            <Stethoscope className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>{medicalDisclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
