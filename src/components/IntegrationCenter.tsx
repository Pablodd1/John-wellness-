import React, { useState } from 'react';
import { UserProfile, WearableIntegration, UploadedDocument } from '../types';
import { INITIAL_WEARABLES, INITIAL_DOCUMENTS } from '../data';
import { 
  Activity, 
  Disc, 
  Watch, 
  HeartPulse, 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  AlertCircle,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';

export function IntegrationCenter({ user }: { user: UserProfile }) {
  const [wearables, setWearables] = useState<WearableIntegration[]>(INITIAL_WEARABLES);
  const [documents, setDocuments] = useState<UploadedDocument[]>(INITIAL_DOCUMENTS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const toggleConnection = (id: string) => {
    setWearables(prev => prev.map(w => {
      if (w.id === id) {
        const nextConnected = !w.connected;
        return {
          ...w,
          connected: nextConnected,
          lastSynced: nextConnected ? 'Just now' : 'Never',
          dataQualityScore: nextConnected ? 95 : 0,
          recordsCount: nextConnected ? '1,250 sync records' : '0 records'
        };
      }
      return w;
    }));
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setWearables(prev => prev.map(w => w.connected ? { ...w, lastSynced: 'Just now' } : w));
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const newDoc: UploadedDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: file.name.endsWith('.pdf') ? 'bloodwork' : 'medical_record',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'processed',
      factsExtracted: Math.floor(Math.random() * 15) + 5
    };

    setDocuments(prev => [newDoc, ...prev]);
  };

  const connectedCount = wearables.filter(w => w.connected).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Multimodal Integration Center</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Sync wearables, medical lab PDFs, and AI chat logs to build a unified physiological dataset.
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing All Sources..." : "Force Sync All"}
        </button>
      </div>

      {/* Integration Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block mb-1 font-medium">Active Connected Devices</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{connectedCount}</span>
            <span className="text-xs text-slate-400">/ {wearables.length} sources</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block mb-1 font-medium">Data Completeness Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">{user.dataCompleteness}%</span>
            <span className="text-xs text-emerald-600 font-medium">High Fidelity</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block mb-1 font-medium">Documents & AI Imports</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{documents.length}</span>
            <span className="text-xs text-slate-400">files extracted</span>
          </div>
        </div>
      </div>

      {/* Wearables Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Wearable & Biometric Connectors</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wearables.map(wearable => (
            <div 
              key={wearable.id} 
              className={cn(
                "bg-white p-6 rounded-2xl border transition-all flex flex-col justify-between shadow-sm",
                wearable.connected ? "border-emerald-200" : "border-slate-200 opacity-80"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl text-white font-bold",
                      wearable.connected ? "bg-slate-900" : "bg-slate-300"
                    )}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{wearable.name}</h4>
                      <span className="text-xs text-slate-400">Last synced: {wearable.lastSynced}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleConnection(wearable.id)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative p-1",
                      wearable.connected ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform shadow-md",
                      wearable.connected ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Records Imported:</span>
                    <span className="font-semibold text-slate-900">{wearable.recordsCount}</span>
                  </div>

                  {wearable.connected && (
                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Data Quality Score:</span>
                        <span className="font-bold text-emerald-600">{wearable.dataQualityScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${wearable.dataQualityScore}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                    {wearable.metricsProvided.map((metric, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document & Health Record Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Medical PDFs, Bloodwork & AI Imports</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Dropzone */}
          <div 
            className={cn(
              "md:col-span-1 border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer relative",
              dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-300"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
          >
            <input 
              type="file" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".pdf,.json,.txt,.png,.jpg"
            />
            <div className="p-3 bg-white text-indigo-600 rounded-full shadow-sm mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Upload Laboratory & Medical Files</h4>
            <p className="text-xs text-slate-500 mb-3">
              PDF blood panels, DEXA Scans, DNA/Genetics, Gut Bacteria, Heavy Metals, or chat history.
            </p>
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Browse Files</span>
          </div>

          {/* Document list */}
          <div className="md:col-span-2 space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                    <p className="text-xs text-slate-400">Uploaded {doc.uploadDate} • {doc.factsExtracted} clinical facts extracted</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
