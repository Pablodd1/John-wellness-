import React, { useState } from 'react';
import { UserProfile, Product } from '../types';
import { MOCK_PRODUCTS } from '../data';
import { EvidenceGrade } from './EvidenceGrade';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Check, 
  ArrowRight, 
  Briefcase, 
  Flame, 
  Clock, 
  Building2,
  TrendingUp,
  Brain,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Marketplace({ user }: { user: UserProfile }) {
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'executive' | 'endurance' | 'recovery'>('all');

  const handleBuy = (productId: string) => {
    setPurchasedIds([...purchasedIds, productId]);
  };

  const isExecutive = user.lifestylePersona === 'High-Stress Executive / Zero-Time';

  const executiveBundle: Product = {
    id: 'bundle-exec',
    name: 'Executive Stress & Cognition Power Bundle',
    category: 'Executive Stack',
    description: 'Designed for high-stress executives with zero time: L-Theanine + Alpha-GPC + Bioavailable Magnesium Glycinate + Electrolyte Hydration sticks.',
    status: 'recommended',
    riskLevel: 'low',
    price: 110.00,
    evidenceData: {
      confidenceScore: 98,
      grade: 'A',
      referenceTitle: 'Synergistic Effects of L-Theanine and Nootropic Precursors in High-Cognitive Load Environments',
      journal: 'Neuroscience & Executive Health Quarterly',
      year: 2024,
      doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/18296328/',
      clinicalRationale: 'Simultaneously lowers salivary cortisol AUC by 28% and sustains working memory speed during continuous multi-hour boardroom decision making.'
    },
    tailoredReason: 'Synthesized from your Oura sleep restriction (<4.5h) and high stress scores.'
  };

  const recommendedProducts = MOCK_PRODUCTS.filter(p => p.riskLevel === 'low' && p.category !== 'Diagnostics');
  const diagnosticProducts = MOCK_PRODUCTS.filter(p => p.category === 'Diagnostics');
  const clinicalProducts = MOCK_PRODUCTS.filter(p => p.riskLevel === 'high');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">AI Biohacking Marketplace</h2>
          </div>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Hyper-personalized solutions extracted from your ChatGPT, Gemini &amp; Claude AI history, wearable telemetry, and lifestyle persona.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-800/90 text-indigo-300 px-4 py-2 rounded-2xl border border-slate-700 font-semibold self-start md:self-auto">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>Extracted Persona: {user.lifestylePersona}</span>
        </div>
      </div>

      {/* Featured Executive Stack Banner (Tailored for Busy CEOs or High Stress Users) */}
      <div className="bg-white p-6 rounded-3xl border-2 border-indigo-500/30 shadow-lg relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-600 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 1-Click Executive Bundle
            </span>
            <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
              Tailored for {user.name}
            </span>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">$110.00 <span className="text-xs text-slate-400 line-through font-normal">$140.00</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">{executiveBundle.name}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{executiveBundle.description}</p>
            
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Executive AI Context Rationale:
              </span>
              <p className="text-slate-600 italic">{executiveBundle.tailoredReason}</p>
            </div>

            {executiveBundle.evidenceData && (
              <EvidenceGrade evidence={executiveBundle.evidenceData} compact={true} />
            )}
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero-Time Automated Shipping
              </div>
              <p className="text-[11px] text-slate-500">Auto-delivered every 30 days. Pause or cancel with 1-click in Mission Control.</p>
            </div>

            <button
              onClick={() => handleBuy(executiveBundle.id)}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2",
                purchasedIds.includes(executiveBundle.id)
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              )}
            >
              {purchasedIds.includes(executiveBundle.id) ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Bundle Added to Active Regimen!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  1-Click Buy Executive Bundle
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Clinical Diagnostics &amp; Testing
          </h3>
          <span className="text-xs font-semibold text-slate-500">At-home and local clinic integration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diagnosticProducts.map(product => {
            const isBought = purchasedIds.includes(product.id);
            return (
              <div key={product.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                      {product.category}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">${product.price || '199.00'}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">{product.name}</h4>
                  <p className="text-xs text-slate-600 mb-3">{product.description}</p>

                  {product.evidenceData && (
                    <EvidenceGrade evidence={product.evidenceData} compact={true} />
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">{product.timing}</span>
                  <button
                    onClick={() => handleBuy(product.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                      isBought 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    )}
                  >
                    {isBought ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Test Ordered
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Order Kit
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Solutions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Personalized Individual Solutions</h3>
          <span className="text-xs font-semibold text-slate-500">Filtered for: {user.lifestylePersona}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedProducts.map(product => {
            const isBought = purchasedIds.includes(product.id);
            return (
              <div key={product.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                      {product.category}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">${product.price || '29.99'}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">{product.name}</h4>
                  <p className="text-xs text-slate-600 mb-3">{product.description}</p>

                  {product.tailoredReason && (
                    <div className="bg-indigo-50/70 p-2.5 rounded-xl text-[11px] text-indigo-900 mb-3 border border-indigo-100 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span><strong>AI Match:</strong> {product.tailoredReason}</span>
                    </div>
                  )}

                  {product.evidenceData && (
                    <EvidenceGrade evidence={product.evidenceData} compact={true} />
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Standard 30-day Supply</span>
                  <button
                    onClick={() => handleBuy(product.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                      isBought 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                    )}
                  >
                    {isBought ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Added to Regimen
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Regimen
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Peptides & High Risk Compound Approval Queue */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" /> Clinical Review Compounds (Peptides &amp; Prescription Protocols)
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {clinicalProducts.map(product => (
            <div key={product.id} className="bg-rose-50/60 p-6 rounded-3xl border border-rose-200 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-slate-900">{product.name}</h4>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-rose-200 text-rose-900 rounded-full uppercase tracking-wider">
                    High Risk / Medical Gate
                  </span>
                </div>
                <p className="text-xs text-slate-700">{product.description}</p>
                
                {product.evidenceData && (
                  <EvidenceGrade evidence={product.evidenceData} compact={false} />
                )}
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                <button className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                  Request Clinician Consult <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-center text-rose-800 font-medium">Requires blood panel &amp; licensed MD authorization</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
