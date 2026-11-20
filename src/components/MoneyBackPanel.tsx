import {
  computeMoneyBackStatusTotals,
  formatCad,
  type MoneyBackItem,
  type MoneyBackItemId,
  type MoneyBackStatus,
  type RulesEngineResult,
} from '../rules';
import { buildDraftRequestFromMoneyBack } from '../drafting';
import { DraftLetterBox } from './DraftLetterBox';

interface MoneyBackPanelProps {
  items: MoneyBackItem[];
  totalCad: number;
  rulesResult: RulesEngineResult;
  statusById: Record<MoneyBackItemId, MoneyBackStatus>;
  onStatusChange: (id: MoneyBackItemId, status: MoneyBackStatus) => void;
}

const STATUS_OPTIONS: MoneyBackStatus[] = ['Suspected', 'Confirmed', 'Cash received'];

function getChipStyle(status: MoneyBackStatus, active: boolean): string {
  if (!active) {
    return 'bg-transparent text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-200/60';
  }
  if (status === 'Cash received') {
    return 'bg-[#15803D] text-white border-[#15803D] font-semibold';
  }
  if (status === 'Confirmed') {
    return 'bg-[#0F172A] text-white border-[#0F172A] font-semibold';
  }
  return 'bg-[#D97706] text-white border-[#D97706] font-semibold';
}

export function MoneyBackPanel({
  items,
  totalCad,
  rulesResult,
  statusById,
  onStatusChange,
}: MoneyBackPanelProps) {
  const totals = computeMoneyBackStatusTotals(items, statusById);

  return (
    <aside
      aria-label="Money-Back recovery panel"
      className="w-full lg:w-[348px] xl:w-[376px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 flex flex-col lg:sticky lg:top-[104px] lg:self-start lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto"
    >
      {/* Panel Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-200 bg-white">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-[#0F172A]">
            Money-Back
          </h2>
          <span className="text-xs font-medium text-slate-500">CAD</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Direct cash recoveries identified by the Q3 rules engine
        </p>

        <div className="mt-3.5 flex items-baseline justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-slate-500">Total identified</div>
            <div className="mt-0.5 text-2xl font-bold tracking-tight font-mono tabular-nums text-[#0F172A]">
              {formatCad(totalCad)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-medium text-slate-500">Cash received</div>
            <div className="mt-0.5 text-lg font-semibold font-mono tabular-nums text-[#15803D]">
              {formatCad(totals.cashReceivedCad)}
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Line Items */}
      <div className="flex-1 divide-y divide-slate-200">
        {totalCad === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-slate-500">
            No cash recovery items flagged in the current dataset.
          </div>
        ) : (
          items.map((item) => {
            const currentStatus = statusById[item.id] ?? item.defaultStatus;
            const isRecovered = currentStatus === 'Cash received';
            const draftPayload = buildDraftRequestFromMoneyBack(item, rulesResult);

            return (
              <div key={item.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#0F172A] leading-snug">
                      {item.label}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {item.detail}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${
                      isRecovered ? 'text-[#15803D]' : 'text-[#0F172A]'
                    }`}
                  >
                    {formatCad(item.amountCad)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 shrink-0">
                    Owner:{' '}
                    <span className="font-medium text-slate-700">{item.owner}</span>
                  </span>

                  <div
                    role="group"
                    aria-label={`Status for ${item.label}`}
                    className="inline-flex items-center rounded border border-slate-200 bg-slate-100 p-0.5"
                  >
                    {STATUS_OPTIONS.map((option) => {
                      const active = currentStatus === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => onStatusChange(item.id, option)}
                          aria-pressed={active}
                          className={`px-2 py-1 text-[11px] leading-none rounded-[3px] border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F172A] ${getChipStyle(
                            option,
                            active,
                          )}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {item.amountCad > 0 && (
                  <DraftLetterBox payload={draftPayload} compact />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Total & Status Breakdown Footer */}
      <div className="px-5 py-4 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Suspected ({totals.suspectedCount})</span>
          <span className="font-mono tabular-nums font-medium text-[#D97706]">
            {formatCad(totals.suspectedCad)}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-600">
          <span>Confirmed ({totals.confirmedCount})</span>
          <span className="font-mono tabular-nums font-medium text-[#0F172A]">
            {formatCad(totals.confirmedCad)}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-600">
          <span>Cash received ({totals.cashReceivedCount})</span>
          <span className="font-mono tabular-nums font-medium text-[#15803D]">
            {formatCad(totals.cashReceivedCad)}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 flex items-baseline justify-between">
          <span className="text-sm font-bold text-[#0F172A]">Money-Back Total</span>
          <span className="text-base font-bold font-mono tabular-nums text-[#0F172A]">
            {formatCad(totalCad)}
          </span>
        </div>
      </div>
    </aside>
  );
}
