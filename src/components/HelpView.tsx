import React from 'react';
import { HelpCircle, Mail, ShieldAlert, HeartHandshake, ArrowRight } from 'lucide-react';

interface HelpViewProps {
  onNavigate: (page: string) => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto my-8" id="help-view">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2.5">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl inline-flex">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Got questions about CampusMart or issues with a transaction? We are here for you.
          </p>
        </div>

        {/* Support Card */}
        <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-base text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="h-4.5 w-4.5 text-blue-600" />
              Official Support Email
            </h3>
            <p className="text-slate-500 text-xs">
              Directly contact our team for complaints, reports, or queries.
            </p>
            <p className="text-blue-600 font-mono text-sm font-semibold pt-1">
              help.chetanlaria@gmail.com
            </p>
          </div>
          <a
            href="mailto:help.chetanlaria@gmail.com"
            className="bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
          >
            Send Email
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        {/* FAQs */}
        <div className="space-y-5 border-t border-slate-100 pt-6">
          <h2 className="font-sans font-bold text-base text-slate-900 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-blue-600" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-4 divide-y divide-slate-100">
            <div className="pt-4 first:pt-0 space-y-1.5">
              <h4 className="font-sans font-semibold text-sm text-slate-950">
                Is CampusMart free to use?
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Yes, absolutely! CampusMart is an open-source, non-profit marketplace built exclusively for peers at our campus. There are zero listing fees or commission cuts.
              </p>
            </div>

            <div className="pt-4 space-y-1.5">
              <h4 className="font-sans font-semibold text-sm text-slate-950">
                How do I get in touch with a seller?
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Click the "Get Contact Details" or "Interested" button on any listing. If you are logged in, the seller's secure Telegram username will be displayed immediately. Click it to open a direct message thread.
              </p>
            </div>

            <div className="pt-4 space-y-1.5">
              <h4 className="font-sans font-semibold text-sm text-slate-950">
                Can I edit or delete my listing later?
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Yes! Head over to the <button onClick={() => onNavigate('my-listings')} className="text-blue-600 hover:underline font-semibold cursor-pointer">My Listings</button> page from the navbar. You can edit title, category, price, condition, or mark it as Sold.
              </p>
            </div>

            <div className="pt-4 space-y-1.5">
              <h4 className="font-sans font-semibold text-sm text-slate-950">
                What should I do if a transaction feels unsafe?
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Do not transfer money in advance. Read our <button onClick={() => onNavigate('terms')} className="text-blue-600 hover:underline font-semibold cursor-pointer">Terms & Conditions</button> immediately. Inform support right away if you find suspicious accounts.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer footer */}
        <div className="p-4 bg-red-50/50 border border-red-50 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-sans font-bold text-xs text-red-800">Security Warning</h4>
            <p className="text-[11px] text-red-600 leading-normal mt-0.5">
              Administrators will never ask for your password, bank account OTPs, or payment tokens. Guard your credentials diligently.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
