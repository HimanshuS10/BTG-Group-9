import { useEffect, useState } from 'react';
import { Check, Copy, FileText, Loader2, X } from 'lucide-react';
import {
  requestDraftLetter,
  type DraftLetterRequest,
  type DraftLetterResponse,
} from '../drafting';

interface DraftLetterBoxProps {
  payload: DraftLetterRequest;
  compact?: boolean;
}

export function DraftLetterBox({ payload, compact = false }: DraftLetterBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftSource, setDraftSource] = useState<DraftLetterResponse['source'] | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  // Reset open draft if the user switches to a different flag / story card
  useEffect(() => {
    setIsOpen(false);
    setIsLoading(false);
    setDraftText('');
    setDraftSource(null);
    setCopied(false);
  }, [payload.id, payload.amountCad]);

  const handleDraft = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setCopied(false);

    const result = await requestDraftLetter(payload);
    setDraftText(result.draft);
    setDraftSource(result.source);
    setIsLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be blocked in restricted iframes; text remains directly selectable
    }
  };

  return (
    <div className={compact ? 'mt-2.5' : ''}>
      <button
        type="button"
        onClick={handleDraft}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F172A] ${
          compact
            ? 'px-2.5 py-1 text-[11px] bg-white text-[#0F172A] border-slate-300 hover:border-[#0F172A] hover:bg-slate-50'
            : 'px-3 py-1.5 text-xs bg-white text-[#0F172A] border-slate-300 hover:border-[#0F172A] hover:bg-slate-50'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D97706]" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-[#D97706]" />
        )}
        {isLoading ? 'Drafting letter…' : 'Draft letter with Gemini'}
      </button>

      {isOpen && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <label
                htmlFor={`draft-textarea-${payload.id}`}
                className="text-xs font-bold text-[#0F172A]"
              >
                Draft: review before sending
              </label>
              {draftSource === 'template' && !isLoading && (
                <span className="text-[11px] font-medium text-slate-500">
                  · Template draft
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {!isLoading && draftText && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#15803D]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close draft"
                className="p-1 text-slate-500 hover:text-[#0F172A] rounded hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-5 flex items-center gap-2.5 text-xs text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-[#D97706] shrink-0" />
              <span>
                Writing draft from {payload.evidenceRows.length} linked evidence{' '}
                {payload.evidenceRows.length === 1 ? 'record' : 'records'}…
              </span>
            </div>
          ) : (
            <>
              <textarea
                id={`draft-textarea-${payload.id}`}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={compact ? 9 : 10}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs text-[#0F172A] leading-relaxed font-sans focus:outline-2 focus:outline-[#0F172A] resize-y"
              />
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>Editable draft — nothing is sent automatically.</span>
                <button
                  type="button"
                  onClick={handleDraft}
                  className="font-medium text-[#0F172A] hover:underline cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
