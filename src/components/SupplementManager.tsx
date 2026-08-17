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
  TrendingDown,
  CheckCircle2,
  Calendar,
  X,
  ShoppingCart,
  Zap,
  Repeat
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SupplementManagerProps {
  user: UserProfile;
  onAddToCart?: (products: Product[]) => void;
  onUpdateInventory?: (newInventory: Product[]) => void;
}

export function SupplementManager({ 
  user, 
  onAddToCart,
  onUpdateInventory 
}: SupplementManagerProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'inventory' | 'burnrate' | 'biohacking' | 'peptides_knowledge'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  const [dailyCheckoffs, setDailyCheckoffs] = useState<{ [id: string]: boolean }>({
    'supp-d3k2': true,
    'supp-bcomplex': true,
    'p5': true,
    'supp-omega3': false,
    'p2': false,
  });

  const [localInventory, setLocalInventory] = useState<Product[]>(user.inventory);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Nutrition' | 'Recovery' | 'Peptide' | 'Hydration' | 'Nootropic'>('Nutrition');
  const [newStock, setNewStock] = useState(30);
  const [newDosage, setNewDosage] = useState('1 serving daily');
  const [newTiming, setNewTiming] = useState('Morning');

  const lowStockItems = localInventory.filter(p => p.daysRemaining !== undefined && p.daysRemaining <= 5);

  const handleReorder = (product: Product) => {
    setReorderSuccess(product.id);
    if (onAddToCart) {
      onAddToCart([product]);
    }
    setTimeout(() => setReorderSuccess(null), 3000);
  };

  const handleReorderAllLow = () => {
    setReorderSuccess('all');
    if (onAddToCart && lowStockItems.length > 0) {
      onAddToCart(lowStockItems);
    }
    setTimeout(() => setReorderSuccess(null), 3000);
  };

  const handleToggleCheckoff = (id: string) => {
    setDailyCheckoffs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCreateSupplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProd: Product = {
      id: `supp-custom-${Date.now()}`,
      name: newName,
      category: newCategory,
      description: `Custom formulation logged on ${new Date().toLocaleDateString()}.`,
      status: 'owned',
      riskLevel: 'low',
      daysRemaining: newStock,
      unitsInStock: newStock,
      dailyUsageRate: 1,
      dailyDosage: newDosage,
      timing: newTiming,
      price: 29.99,
      evidenceData: {
        confidenceScore: 92,
        grade: 'A',
        referenceTitle: 'Personalized Protocol Formulation',
        journal: 'Clinical Regimen Log',
        year: 2026,
        clinicalRationale: 'Self-directed nutrient supplementation synced with active wearable monitoring.'
      }
    };

    const updated = [newProd, ...localInventory];
    setLocalInventory(updated);
    if (onUpdateInventory) onUpdateInventory(updated);

    setNewName('');
    setShowAddModal(false);
  };

  const morningItems = localInventory.filter(p => p.timing?.toLowerCase().includes('morning') || p.timing?.toLowerCase().includes('am') || p.category === 'Nutrition' || p.category === 'Executive Stack');
  const middayItems = localInventory.filter(p => p.timing?.toLowerCase().includes('noon') || p.timing?.toLowerCase().includes('midday') || p.category === 'Hydration' || p.category === 'Nootropic');
  const eveningItems = localInventory.filter(p => p.timing?.toLowerCase().includes('evening') || p.timing?.toLowerCase().includes('bed') || p.timing?.toLowerCase().includes('night') || p.category === 'Recovery');

  const totalScheduleItems = morningItems.length + middayItems.length + eveningItems.length || localInventory.length;
  const completedCount = Object.values(dailyCheckoffs).filter(Boolean).length;
  const adherenceRate = Math.min(100, Math.round((completedCount / Math.max(1, totalScheduleItems)) * 100));

  const categoryIcons: Record<string, any> = {
    Thermal: Flame,
    Circadian: Sun,
    Respiratory: Wind,
    Cellular: Activity,
    'Brain Training': Sparkles,
    'Physical Optimization': Activity
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#ebe7df] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-[#181716]" />
            <h1 className="text-lg font-bold text-[#181716] tracking-tight">
              Daily Regimens &amp; Auto-Delivery Subscriptions
            </h1>
          </div>
          <p className="text-xs text-[#6e6960]">
            Automated depletion forecasting, intake adherence tracking, and clinical research transparency.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#faf9f6] p-1 rounded-xl flex-wrap gap-1 border border-[#ebe7df]">
          <button
            onClick={() => setActiveTab('daily')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'daily' ? "bg-white text-[#181716] font-semibold shadow-2xs" : "text-[#5c5851] hover:text-[#181716]"
            )}
          >
            <Calendar className="w-3.5 h-3.5 text-[#344a37]" />
            Daily Tracker ({adherenceRate}%)
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'inventory' ? "bg-white text-[#181716] font-semibold shadow-2xs" : "text-[#5c5851] hover:text-[#181716]"
            )}
          >
            <Pill className="w-3.5 h-3.5 text-[#344a37]" />
            Active Regimen ({localInventory.length})
          </button>
          <button
            onClick={() => setActiveTab('burnrate')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'burnrate' ? "bg-white text-[#181716] font-semibold shadow-2xs" : "text-[#5c5851] hover:text-[#181716]"
            )}
          >
            <TrendingDown className="w-3.5 h-3.5 text-[#785328]" />
            Burn-Rate Forecast
          </button>
          <button
            onClick={() => setActiveTab('biohacking')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'biohacking' ? "bg-white text-[#181716] font-semibold shadow-2xs" : "text-[#5c5851] hover:text-[#181716]"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#785328]" />
            Lifestyle Cards
          </button>
          <button
            onClick={() => setActiveTab('peptides_knowledge')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'peptides_knowledge' ? "bg-white text-[#181716] font-semibold shadow-2xs" : "text-[#5c5851] hover:text-[#181716]"
            )}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#344a37]" />
            Safety Framework
          </button>
        </div>
      </div>

      {/* Low Stock Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-[#faf5ee] border border-[#ede1cf] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#785328] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#785328]">Supply Notice ({lowStockItems.length} items running low)</h4>
              <p className="text-[11px] text-[#785328] mt-0.5">
                {lowStockItems.map(item => `${item.name} (~${item.daysRemaining} days left)`).join(', ')}. 
                Auto-replenishment ensures continuous protocol adherence.
              </p>
            </div>
          </div>
          <button 
            onClick={handleReorderAllLow}
            className="px-3.5 py-1.5 btn-ink text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {reorderSuccess === 'all' ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" /> 1-Click Refill All ({lowStockItems.length})
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 1: DAILY TRACKER */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#ebe7df] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f1f5f2] border border-[#dbe5dc] text-[#2b4530] flex items-center justify-center font-bold text-sm font-mono">
                {adherenceRate}%
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#181716]">Today&apos;s Protocol Adherence</h3>
                <p className="text-[11px] text-[#6e6960]">
                  {completedCount} of {totalScheduleItems} planned formulations logged for today.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 btn-subtle text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Compound
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Morning */}
            <div className="soft-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#f4f2ec]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#181716] uppercase tracking-wider">
                  <Sun className="w-3.5 h-3.5 text-[#785328]" />
                  <span>Morning Fasted</span>
                </div>
                <span className="text-[10px] text-[#8a857b] font-mono">07:00 - 09:00 AM</span>
              </div>

              <div className="space-y-1.5">
                {morningItems.map(item => {
                  const isDone = dailyCheckoffs[item.id] || false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheckoff(item.id)}
                      className={cn(
                        "p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 select-none text-xs",
                        isDone ? "bg-[#f1f5f2] border-[#dbe5dc] text-[#2b4530]" : "bg-[#faf9f6] hover:bg-[#f4f2ec] border-[#ebe7df] text-[#181716]"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center mt-0.5 transition-colors",
                        isDone ? "bg-[#2b4530] text-white" : "border border-[#dedad0] bg-white"
                      )}>
                        {isDone && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={cn("font-medium", isDone && "line-through opacity-70")}>{item.name}</span>
                          <span className="text-[10px] font-mono text-[#8a857b]">{item.dailyDosage || '1 cap'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Midday */}
            <div className="soft-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#f4f2ec]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#181716] uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-[#344a37]" />
                  <span>Midday / Pre-Workout</span>
                </div>
                <span className="text-[10px] text-[#8a857b] font-mono">12:00 - 02:00 PM</span>
              </div>

              <div className="space-y-1.5">
                {middayItems.map(item => {
                  const isDone = dailyCheckoffs[item.id] || false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheckoff(item.id)}
                      className={cn(
                        "p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 select-none text-xs",
                        isDone ? "bg-[#f1f5f2] border-[#dbe5dc] text-[#2b4530]" : "bg-[#faf9f6] hover:bg-[#f4f2ec] border-[#ebe7df] text-[#181716]"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center mt-0.5 transition-colors",
                        isDone ? "bg-[#2b4530] text-white" : "border border-[#dedad0] bg-white"
                      )}>
                        {isDone && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={cn("font-medium", isDone && "line-through opacity-70")}>{item.name}</span>
                          <span className="text-[10px] font-mono text-[#8a857b]">{item.dailyDosage || '1 serving'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evening */}
            <div className="soft-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#f4f2ec]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#181716] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-[#5c5851]" />
                  <span>Evening Sleep Prep</span>
                </div>
                <span className="text-[10px] text-[#8a857b] font-mono">09:00 - 10:30 PM</span>
              </div>

              <div className="space-y-1.5">
                {eveningItems.map(item => {
                  const isDone = dailyCheckoffs[item.id] || false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheckoff(item.id)}
                      className={cn(
                        "p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 select-none text-xs",
                        isDone ? "bg-[#f1f5f2] border-[#dbe5dc] text-[#2b4530]" : "bg-[#faf9f6] hover:bg-[#f4f2ec] border-[#ebe7df] text-[#181716]"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center mt-0.5 transition-colors",
                        isDone ? "bg-[#2b4530] text-white" : "border border-[#dedad0] bg-white"
                      )}>
                        {isDone && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={cn("font-medium", isDone && "line-through opacity-70")}>{item.name}</span>
                          <span className="text-[10px] font-mono text-[#8a857b]">{item.dailyDosage || '2 caps'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#181716]">Active Formulations &amp; Inventory</h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 btn-subtle text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Compound
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localInventory.map((product) => {
              const isLow = product.daysRemaining !== undefined && product.daysRemaining <= 5;
              return (
                <div 
                  key={product.id} 
                  className={cn(
                    "soft-card p-4 flex flex-col justify-between relative",
                    isLow ? "border-[#ede1cf] bg-[#faf6ee]/40" : ""
                  )}
                >
                  {isLow && (
                    <div className="absolute top-3 right-3 badge-warm text-[10px]">
                      Supply Low
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#8a857b] mb-1.5">
                      <span className="badge-neutral">{product.category}</span>
                      {product.timing && <span className="flex items-center gap-1 text-[11px]"><Clock className="w-3 h-3" /> {product.timing}</span>}
                    </div>

                    <h4 className="text-sm font-semibold text-[#181716] mb-1">{product.name}</h4>
                    <p className="text-xs text-[#5c5851] mb-2 leading-relaxed">{product.description}</p>

                    {product.dailyDosage && (
                      <div className="bg-[#faf9f6] p-2 rounded-lg border border-[#ebe7df] text-xs text-[#5c5851] mb-2">
                        <span className="font-semibold text-[#181716]">Dosage: </span>
                        {product.dailyDosage}
                      </div>
                    )}

                    <EvidenceGrade product={product} compact={true} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#f4f2ec]">
                    {product.daysRemaining !== undefined ? (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1 font-medium">
                          <span className="text-[#8a857b]">Supply Status</span>
                          <span className={isLow ? "text-[#785328] font-semibold" : "text-[#5c5851]"}>
                            ~{product.daysRemaining} days remaining ({product.unitsInStock || 30} units)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#ebe7df] rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", isLow ? "bg-[#785328]" : "bg-[#2b4530]")} 
                            style={{ width: `${Math.min(100, (product.daysRemaining / 30) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-[#8a857b] mb-3 italic">Continuous replenishment</div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#181716]">${(product.price || 29.99).toFixed(2)}</span>
                      <button
                        onClick={() => handleReorder(product)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                          reorderSuccess === product.id
                            ? "bg-[#2b4530] text-white"
                            : "btn-subtle"
                        )}
                      >
                        {reorderSuccess === product.id ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" />
                            Refill Auto-Delivery
                          </>
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

      {/* TAB 3: BURN-RATE */}
      {activeTab === 'burnrate' && (
        <div className="space-y-4">
          <BurnRateChart inventory={localInventory} />
        </div>
      )}

      {/* TAB 4: BIOHACKING CARDS */}
      {activeTab === 'biohacking' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#181716]">Lifestyle &amp; Circadian Protocols</h3>
              <p className="text-xs text-[#6e6960]">Non-pharmacological protocols integrated into today&apos;s recovery plan.</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', 'Thermal', 'Circadian', 'Respiratory', 'Cellular'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg transition-all font-medium cursor-pointer",
                    selectedCategory === cat ? "bg-[#181716] text-white" : "bg-[#faf9f6] text-[#5c5851] border border-[#ebe7df] hover:bg-[#f4f2ec]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(user.biohackingProtocols || BIOHACKING_PROTOCOLS)
              .filter(card => selectedCategory === 'All' || card.category === selectedCategory)
              .map(card => (
                <div key={card.id} className="soft-card p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-clinical">{card.category}</span>
                      <span className="text-[10px] font-mono text-[#8a857b]">{card.evidenceGrade}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#181716]">{card.title}</h4>
                    <div className="bg-[#faf9f6] p-2.5 rounded-lg border border-[#ebe7df] text-xs text-[#5c5851] font-mono my-2">
                      {card.protocol}
                    </div>
                    <div className="text-xs text-[#6e6960] space-y-1">
                      <div><strong>Outcome:</strong> {card.targetOutcome}</div>
                      <div><strong>Timing:</strong> {card.recommendedTiming}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: SAFETY */}
      {activeTab === 'peptides_knowledge' && (
        <div className="space-y-4">
          <div className="bg-[#fdf2f2] border border-[#f5d5d5] p-4 rounded-xl text-xs text-[#8c3232] space-y-1">
            <h4 className="font-bold text-sm">Clinical Safety Framework for Peptides</h4>
            <p>
              AI systems are restricted from prescribing unmonitored peptide injection protocols without physician review. High-risk compounds require clinical laboratory screening and authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localInventory.map((prod) => (
              <div key={prod.id} className="soft-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded",
                    prod.riskLevel === 'high' ? "badge-flag" : "badge-clinical"
                  )}>
                    {prod.category} • {prod.riskLevel.toUpperCase()} RISK
                  </span>
                  <span className="text-xs font-semibold text-[#181716]">${(prod.price || 30.00).toFixed(2)}</span>
                </div>
                <h4 className="text-xs font-bold text-[#181716]">{prod.name}</h4>
                <p className="text-xs text-[#5c5851]">{prod.description}</p>
                <EvidenceGrade product={prod} compact={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#ebe7df] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#f4f2ec]">
              <h3 className="text-sm font-bold text-[#181716]">Log Custom Formulation</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-[#8a857b] hover:text-[#181716]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplement} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#181716] block mb-1">Compound Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Nicotinamide Riboside (NR)" 
                  className="w-full px-3 py-1.5 border border-[#dedad0] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#181716]" 
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#181716] block mb-1">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-[#dedad0] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#181716]"
                >
                  <option value="Nutrition">Nutrition</option>
                  <option value="Recovery">Recovery</option>
                  <option value="Nootropic">Nootropic</option>
                  <option value="Hydration">Hydration</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#181716] block mb-1">Stock (Units)</label>
                  <input 
                    type="number" 
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-[#dedad0] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#181716]" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#181716] block mb-1">Dosage</label>
                  <input 
                    type="text" 
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g. 500mg daily" 
                    className="w-full px-3 py-1.5 border border-[#dedad0] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#181716]" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#181716] block mb-1">Timing Window</label>
                <select 
                  value={newTiming}
                  onChange={(e) => setNewTiming(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#dedad0] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#181716]"
                >
                  <option value="Morning">Morning (Fasted)</option>
                  <option value="Midday">Midday (With Meal)</option>
                  <option value="Evening">Evening (Pre-Sleep)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 py-2 btn-stone text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 btn-ink text-xs font-semibold"
                >
                  Save Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
