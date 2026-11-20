import { useEffect } from 'react';
import { X } from 'lucide-react';

interface HowSkyTraceDecidesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowSkyTraceDecidesModal({
  isOpen,
  onClose,
}: HowSkyTraceDecidesModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-skytrace-decides-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2
            id="how-skytrace-decides-title"
            className="text-base font-bold text-[#0F172A]"
          >
            How SkyTrace decides
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
          <div>
            <h3 className="text-xs font-bold text-[#0F172A]">
              1. All math is done by fixed rules in code
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Every flag, dollar total, materiality comparison, broker contract check,
              and tariff scenario is calculated deterministically in code from the loaded
              Q3 ledger, customs, sales tax, and operating earnings tables. No AI model
              performs calculations or assigns amounts.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A]">
              2. Gemini only writes drafts from the evidence shown
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              When you click &ldquo;Draft letter with Gemini&rdquo;, the server sends only
              that item&apos;s rows and linked evidence records to Gemini to write an
              editable dispute or credit request. If the call fails or takes more than 8
              seconds, SkyTrace builds the same letter from a fixed code template.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A]">
              3. A person approves everything
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Nothing is ever sent automatically and no journal entry is posted
              automatically. Dana, Marco, and Helen review every flag, edit every draft,
              and approve every action before anything leaves SKYJACK.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A]">
              4. Rates are practice rates from the case
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Duty rates, extra tariff rates, and the 0.2% brokerage schedule are
              fictional practice assumptions from the case appendix. Verify all tariff
              classifications and rates with CBSA and vendor agreements before use.
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 rounded-b-lg flex items-center justify-between">
          <span className="text-xs text-slate-500">Fictional case data · SKYJACK Q3</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F172A] rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
