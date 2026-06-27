import React from 'react';
import { FileText, Shield, Sparkles, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

export const TermsView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto my-8" id="terms-view">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
              <Scale className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
                Terms & Conditions
              </h1>
              <p className="text-slate-400 text-xs font-mono tracking-wider uppercase mt-0.5">
                Effective: June 2026
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            By accessing or creating an account on CampusMart, you agree to comply with and be bound by the following trading guidelines.
          </p>
        </div>

        {/* The 6 Core Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="rules-grid">
          
          {/* 1. Public Places */}
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
            <div className="bg-blue-50 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm">
              1
            </div>
            <h3 className="font-sans font-bold text-sm text-slate-900">
              Meet Only in Public Places
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Always conduct transactions during daylight hours in crowded public campus locations. Recommended spots include the main library lobby, central canteen, academic block squares, or student center. Do not invite buyers to hostel rooms alone.
            </p>
          </div>

          {/* 2. Verify Before Payment */}
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
            <div className="bg-blue-50 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm">
              2
            </div>
            <h3 className="font-sans font-bold text-sm text-slate-900">
              Verify Products Before Payment
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Buyers must inspect items thoroughly for damages, performance, working state, and authenticity before transferring any funds. We recommend cash exchanges or direct UPI transfers only after full physical verification.
            </p>
          </div>

          {/* 3. Platform Limits */}
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
            <div className="bg-blue-50 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm">
              3
            </div>
            <h3 className="font-sans font-bold text-sm text-slate-900">
              Website is Only a Marketplace
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              CampusMart is a pure peer-to-peer advertising utility. We do not participate in payments, delivery logistics, shipping, dispute resolution, or coordinate transactions. All financial transfers are negotiated entirely outside the app.
            </p>
          </div>

          {/* 4. No Illegal Items */}
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
            <div className="bg-blue-50 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm">
              4
            </div>
            <h3 className="font-sans font-bold text-sm text-slate-900">
              Strictly No Illegal Items
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Any listings promoting illegal items, substances, academic cheats/forged materials, medicines, weapons, or items violating standard university conduct codes are strictly prohibited and will trigger immediate account bans.
            </p>
          </div>

          {/* 5. No Fake Listings */}
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
            <div className="bg-blue-50 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm">
              5
            </div>
            <h3 className="font-sans font-bold text-sm text-slate-900">
              Authentic Advertisements Only
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Users must list only genuine products in their active possession. Fraudulent advertisements, misleading descriptions, or copying online templates to trick peers is a policy violation and will be investigated immediately.
            </p>
          </div>

          {/* 6. Admin Discretion */}
          <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
            <div className="bg-blue-50 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm">
              6
            </div>
            <h3 className="font-sans font-bold text-sm text-slate-900">
              Admin Powers & Removals
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              System Administrators reserve the absolute right to remove any product listing, terminate listings with spam descriptions, adjust flags, or ban students violating university campus codes or safety regulations instantly.
            </p>
          </div>

        </div>

        {/* Safety Warning */}
        <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-sans font-bold text-xs">Acknowledge Policy Enforcement</h4>
            <p className="text-[11px] text-amber-700 leading-normal mt-0.5">
              Roll numbers and telegram handles are logged permanently during registration. Users posting malicious links, harassing students, or violating terms will be reported to college authorities for disciplinary procedures.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
