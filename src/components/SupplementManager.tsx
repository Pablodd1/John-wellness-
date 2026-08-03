import React, { useState } from 'react';
import { UserProfile, Product, BiohackingCard } from '../types';
import { BIOHACKING_PROTOCOLS } from '../data';
import { BurnRateChart } from './BurnRateChart';
import { EvidenceGrade } from './EvidenceGrade';
import { 
  Pill, 
  AlertTriangle, 
  Plus, 
  BookOpen, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  ExternalLink,
  Flame,
  Sun,
  Wind,
  Activity,
  Clock,
  TrendingDown
} from 'lucide-react';
import { cn } from '../lib/utils';

export function SupplementManager({ 
  user, 
  onUpdateInventory 
}: { 
  user: UserProfile; 
  onUpdateInventory?: (newInventory: Product[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'burnrate' | 'biohacking' | 'peptides_knowledge'>('inventory');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  const inventory = user.inventory;
  const lowStockItems = inventory.filter(p => p.daysRemaining !== undefined && p.daysRemaining <= 5);

  const handleReorder = (productId: string) => {
    setReorderSuccess(productId);
    setTimeout(() => setReorderSuccess(null), 3000);
  };

  const categoryIcons: Record<string, any> = {
    Thermal: Flame,
    Circadian: Sun,
    Respiratory: Wind,
    Cellular: Activity,
    'Brain Training': Sparkles,
    'Physical Optimization': Activity
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Supplements & Biohacking Solutions</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Inventory depletion forecasting, biohacking protocols, and clinical research transparency.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-semibold transition-all",
              activeTab === 'inventory' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            My Regimen ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('burnrate')}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'burnrate' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <TrendingDown className="w-3.5 h-3.5 text-indigo-600" />
            Burn-Rate Forecasting
          </button>
          <button
            onClick={() => setActiveTab('biohacking')}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'biohacking' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Biohacking Cards
          </button>
          <button
            onClick={() => setActiveTab('peptides_knowledge')}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'peptides_knowledge' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            Knowledge Base
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Low Stock Depletion Warning ({lowStockItems.length} items)</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {lowStockItems.map(item => `${item.name} (~${item.daysRemaining} days left)`).join(', ')}. 
                Auto-replenishment ensures uninterrupted protocol adherence.
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleReorder('all')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap"
          >
            Reorder Low Supplies
          </button>
        </div>
      )}

      {/* TAB 1: INVENTORY MANAGER */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Active Regimen &amp; Supplies</h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Supplement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inventory.map((product) => {
              const isLow = product.daysRemaining !== undefined && product.daysRemaining <= 5;
              return (
                <div 
                  key={product.id} 
                  className={cn(
                    "bg-white p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden",
                    isLow ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {isLow && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Running Low
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      <span className="px-2.5 py-0.5 bg-slate-100 rounded-md text-slate-700 font-semibold">{product.category}</span>
                      {product.timing && <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> {product.timing}</span>}
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h4>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{product.description}</p>

                    {product.dailyDosage && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 mb-3">
                        <span className="font-semibold text-slate-900">Dosage: </span>
                        {product.dailyDosage}
                      </div>
                    )}

                    {/* Evidence Grade & Clinical Rationale Component */}
                    {product.evidenceData && (
                      <EvidenceGrade evidence={product.evidenceData} compact={true} />
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {product.daysRemaining !== undefined ? (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                          <span className="text-slate-500">Stock Level</span>
                          <span className={isLow ? "text-amber-600 font-bold" : "text-slate-700"}>
                            ~{product.daysRemaining} days left ({product.unitsInStock || 30} units)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", isLow ? "bg-amber-500" : "bg-emerald-500")} 
                            style={{ width: `${Math.min(100, (product.daysRemaining / 30) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 mb-4 italic">Continuous replenishment</div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">${product.price || '29.99'}</span>
                      <button
                        onClick={() => handleReorder(product.id)}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                          reorderSuccess === product.id || reorderSuccess === 'all'
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                        )}
                      >
                        {reorderSuccess === product.id || reorderSuccess === 'all' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Reordered
                          </>
                        ) : (
                          "Reorder Now"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BURN-RATE FORECASTING */}
      {activeTab === 'burnrate' && (
        <div className="space-y-6">
          <BurnRateChart inventory={inventory} />
        </div>
      )}

      {/* TAB 3: BIOHACKING & LIFESTYLE CARDS */}
      {activeTab === 'biohacking' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Biohacking &amp; Lifestyle Protocols</h3>
              <p className="text-xs text-slate-500">Non-pharmacological protocols integrated directly into today's training regimen.</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-slate-500">Filter:</span>
              {['All', 'Thermal', 'Circadian', 'Respiratory', 'Cellular', 'Brain Training', 'Physical Optimization'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition-all font-semibold",
                    selectedCategory === cat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(user.biohackingProtocols || BIOHACKING_PROTOCOLS)
              .filter(card => selectedCategory === 'All' || card.category === selectedCategory)
              .map(card => {
                const IconComponent = categoryIcons[card.category] || Sparkles;
                return (
                  <div key={card.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{card.category}</span>
                            <h4 className="text-base font-bold text-slate-900">{card.title}</h4>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          Grade {card.evidenceGrade}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 font-mono mb-4">
                        <span className="font-sans font-semibold text-slate-900 block mb-1">Exact Protocol:</span>
                        {card.protocol}
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 mb-4">
                        <div>
                          <strong className="text-slate-800">Target Outcome:</strong> {card.targetOutcome}
                        </div>
                        <div>
                          <strong className="text-slate-800">Recommended Timing:</strong> {card.recommendedTiming}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                      <Activity className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Integrated with Today's Training:</strong> {card.integratedWithTraining}
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE & EVIDENCE */}
      {activeTab === 'peptides_knowledge' && (
        <div className="space-y-6">
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl flex items-start gap-4">
            <ShieldAlert className="w-8 h-8 text-rose-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-base font-bold text-rose-900">Clinical Safety Framework for Peptides &amp; High-Risk Compounds</h4>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Autonomous AI agents are strictly prohibited from generating individualized peptide dosages, reconstitution liquid volumes, or unmonitored injection schedules. High-risk compounds require physician sign-off and documented lab screening.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inventory.map((prod) => (
              <div key={prod.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                      prod.riskLevel === 'high' ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"
                    )}>
                      {prod.category} • {prod.riskLevel.toUpperCase()} RISK
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-bold">${prod.price || '30.00'}</span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-1">{prod.name}</h4>
                  <p className="text-xs text-slate-600 mb-3">{prod.description}</p>

                  {prod.evidenceData ? (
                    <EvidenceGrade evidence={prod.evidenceData} compact={false} />
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 mb-4 space-y-1">
                      <div><strong>Evidence Summary:</strong> {prod.evidence || 'Established clinical baseline.'}</div>
                      <div><strong>Dosage Rule:</strong> {prod.dailyDosage || 'Standard guidance applies.'}</div>
                    </div>
                  )}
                </div>

                {prod.riskLevel === 'high' ? (
                  <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100 flex items-center justify-between mt-4">
                    <span className="text-xs text-rose-700 font-bold">Clinician Sign-off Required</span>
                    <button className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1">
                      Request Consult <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors mt-4">
                    View Published Clinical Studies
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Supplement Modal Simulation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Supplement to Active Inventory</h3>
            <p className="text-xs text-slate-500">Log a new product to estimate depletion burn-rate and sync with Phi AI.</p>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Product Name</label>
                <input type="text" placeholder="e.g. Executive Nootropic Stack" className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Category</label>
                <select className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Nutrition</option>
                  <option>Recovery</option>
                  <option>Executive Stack</option>
                  <option>Hydration</option>
                  <option>Nootropic</option>
                  <option>Peptide</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Stock Count (Units)</label>
                  <input type="number" defaultValue={30} className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Daily Dosage</label>
                  <input type="text" placeholder="e.g. 1 per day" className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl">
                Save &amp; Track Burn-Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
