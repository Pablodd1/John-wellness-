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

  const effectiveEvidence = evidence || product?.evidenceData || product?.evidence;
  const hasHumanStudies = product?.hasHumanStudies;
  const humanStudiesNote = product?.humanStudiesNote;
  const potentialSideBenefits = product?.potentialSideBenefits;
  const potentialSideEffects = product?.potentialSideEffects;
  const medicalDisclaimer = product?.medicalDisclaimer || 'Educational research only. Consult a licensed clinician before starting any protocol.';

  if (!effectiveEvidence && !product) return null;

  if (typeof effectiveEvidence === 'string') {
    return (
      <div className="mt-2 p-3 bg-[#faf9f6] rounded-xl border border-[#ebe7df] text-xs text-[#5c5851] space-y-2">
        <div className="flex items-start gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#6e6960] mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-[#181716] block text-xs">Clinical Summary</span>
            <p className="leading-relaxed mt-0.5">{effectiveEvidence}</p>
          </div>
        </div>

        {hasHumanStudies !== undefined && (
          <div className="p-2 rounded-lg border text-[11px] bg-[#f1f5f2] border-[#dbe5dc] text-[#2b4530]">
            <span className="font-semibold block">
              {hasHumanStudies === false ? 'Observational / Preclinical Data' : 'Human Clinical Trials Available'}
            </span>
            {humanStudiesNote && <p className="text-[10px] opacity-90 mt-0.5">{humanStudiesNote}</p>}
          </div>
        )}

        <div className="pt-2 border-t border-[#ebe7df] flex items-center gap-1.5 text-[10px] text-[#8a857b] italic">
          <Stethoscope className="w-3 h-3 text-[#8a857b] flex-shrink-0" />
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

  return (
    <div className="mt-2 bg-[#faf9f6] rounded-xl border border-[#ebe7df] overflow-hidden text-xs">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-2.5 bg-white hover:bg-[#fbfaf8] cursor-pointer flex items-center justify-between transition-colors border-b border-[#ebe7df]"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-[#181716] text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#344a37]" />
            Clinical Evidence
          </span>
          <span className={grade === 'A' ? "badge-clinical" : grade === 'B' ? "badge-warm" : "badge-neutral"}>
            Grade {grade}
          </span>
          <span className="text-[10px] text-[#6e6960] font-mono">
            {confidenceScore}% Confidence
          </span>
        </div>

        <button className="text-[#8a857b] hover:text-[#181716] p-0.5">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="p-3 bg-[#faf9f6] space-y-2.5">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a857b] block mb-0.5">
              Mechanism of Action
            </span>
            <p className="text-[#5c5851] leading-relaxed text-xs">
              {clinicalRationale}
            </p>
          </div>

          {hasHumanStudies !== undefined && (
            <div className="p-2 rounded-lg border text-[11px] bg-[#f1f5f2] border-[#dbe5dc] text-[#2b4530]">
              <span className="font-semibold block">
                {hasHumanStudies === false ? 'Observational / Preclinical Data' : 'Human Clinical Studies Validated'}
              </span>
              {humanStudiesNote && <p className="opacity-90 mt-0.5 leading-normal">{humanStudiesNote}</p>}
            </div>
          )}

          {(potentialSideBenefits || potentialSideEffects) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {potentialSideBenefits && potentialSideBenefits.length > 0 && (
                <div className="p-2 bg-[#f1f5f2] rounded-lg border border-[#dbe5dc] text-[#2b4530]">
                  <span className="font-semibold block mb-0.5">Secondary Benefits:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                    {potentialSideBenefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {potentialSideEffects && potentialSideEffects.length > 0 && (
                <div className="p-2 bg-[#faf5ee] rounded-lg border border-[#ede1cf] text-[#785328]">
                  <span className="font-semibold block mb-0.5">Precautions:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                    {potentialSideEffects.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {journal && (
            <div className="pt-2 border-t border-[#ebe7df] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="text-[#6e6960] truncate max-w-md">
                <span className="font-semibold text-[#181716]">{journal}</span> ({year}) — <span className="italic">{referenceTitle}</span>
              </div>

              {doiOrUrl && (
                <a 
                  href={doiOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#181716] hover:underline bg-white px-2 py-0.5 rounded border border-[#ebe7df] transition-colors flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-3 h-3 text-[#6e6960]" />
                  <span>PubMed</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          )}

          <div className="pt-1.5 flex items-center gap-1 text-[10px] text-[#8a857b] italic">
            <Stethoscope className="w-3 h-3 text-[#8a857b] flex-shrink-0" />
            <span>{medicalDisclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
