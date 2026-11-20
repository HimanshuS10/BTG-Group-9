import { useRef, useState } from 'react';
import { Upload, X, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  parseCustomsCsv,
  parseLedgerCsv,
  type CustomsRow,
  type LedgerRow,
} from '../data';

export type CsvTarget = 'ledger' | 'customs';

interface UploadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgerFileName: string | null;
  customsFileName: string | null;
  ledgerCount: number;
  customsCount: number;
  onReplaceLedger: (rows: LedgerRow[], rawCsv: string, fileName: string) => void;
  onReplaceCustoms: (rows: CustomsRow[], rawCsv: string, fileName: string) => void;
  onResetDefaults: () => void;
}

export function UploadCsvModal({
  isOpen,
  onClose,
  ledgerFileName,
  customsFileName,
  ledgerCount,
  customsCount,
  onReplaceLedger,
  onReplaceCustoms,
  onResetDefaults,
}: UploadCsvModalProps) {
  const [target, setTarget] = useState<CsvTarget>('ledger');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const hasCustomData = Boolean(ledgerFileName || customsFileName);

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const text = await file.text();
      if (target === 'ledger') {
        const result = parseLedgerCsv(text);
        if (result.error) {
          setErrorMessage(result.error);
          return;
        }
        onReplaceLedger(result.rows, text, file.name);
        setSuccessMessage(
          `Loaded ${result.rows.length} ledger rows from ${file.name}. All rules recalculated.`,
        );
      } else {
        const result = parseCustomsCsv(text);
        if (result.error) {
          setErrorMessage(result.error);
          return;
        }
        onReplaceCustoms(result.rows, text, file.name);
        setSuccessMessage(
          `Loaded ${result.rows.length} customs entries from ${file.name}. All rules recalculated.`,
        );
      }
    } catch {
      setErrorMessage('Could not read the selected CSV file.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-csv-title"
    >
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="upload-csv-title" className="text-base font-bold text-[#0F172A]">
              Upload CSV
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Replace the ledger or customs table and rerun every rule immediately
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload dialog"
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Dataset Target Selector */}
          <div>
            <span className="block text-xs font-semibold text-[#0F172A] mb-2">
              Target dataset
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-md bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTarget('ledger');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-3 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  target === 'ledger'
                    ? 'bg-[#0F172A] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ledger (ledger_q3.csv)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTarget('customs');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-3 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  target === 'customs'
                    ? 'bg-[#0F172A] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customs (customs_q3.csv)
              </button>
            </div>
          </div>

          {/* Current Loaded Status */}
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <span>Active ledger:</span>
              <span className="font-mono font-medium text-[#0F172A]">
                {ledgerFileName ?? 'Built-in ledger_q3.csv'} ({ledgerCount} rows)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active customs:</span>
              <span className="font-mono font-medium text-[#0F172A]">
                {customsFileName ?? 'Built-in customs_q3.csv'} ({customsCount} entries)
              </span>
            </div>
          </div>

          {/* File Picker */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              id="skytrace-csv-input"
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
            />
            <label
              htmlFor="skytrace-csv-input"
              className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-6 py-7 text-center hover:border-[#D97706] hover:bg-amber-50/30 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5 text-[#D97706] mb-2" />
              <span className="text-sm font-semibold text-[#0F172A]">
                Choose a {target === 'ledger' ? 'ledger' : 'customs'} CSV file
              </span>
              <span className="mt-1 text-xs text-slate-500">
                {target === 'ledger'
                  ? 'Requires entry_id, gl_account, amount_cad, source, approval_ref, vendor_id, invoice_no, shipment_ref, description'
                  : 'Requires entry_id, value_cad, agreement_claimed, origin_cert_on_file, duty_and_tariff_paid, broker_fee_billed'}
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-[#B91C1C]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-md border border-green-200 bg-green-50 px-3.5 py-2.5 text-xs text-[#15803D]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
          {hasCustomData ? (
            <button
              type="button"
              onClick={() => {
                onResetDefaults();
                setErrorMessage(null);
                setSuccessMessage('Restored built-in Q3 ledger and customs data.');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B91C1C] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to built-in data
            </button>
          ) : (
            <span className="text-xs text-slate-500">
              Using built-in Q3 case files
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] rounded hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
