import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, AlertTriangle, RotateCcw, X } from 'lucide-react';
import type { CustomsRow } from '../data';
import {
  computeChinaTariffWhatIf,
  formatCad,
  formatPercent,
  type MarcoDutyTrendSummary,
  type MarcoShipmentEntry,
  type MarcoShipmentsSummary,
} from '../rules';

interface MarcoShipmentsViewProps {
  marcoShipments: MarcoShipmentsSummary;
  customsRows: CustomsRow[];
  customsFileName: string | null;
  focusedShipmentId?: string | null;
  onResetData?: () => void;
  isRefreshing?: boolean;
}

type FeeSortDirection = 'default' | 'desc' | 'asc';

function DutyTrendChart({ trend }: { trend: MarcoDutyTrendSummary }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { points } = trend;

  if (points.length === 0) {
    return (
      <div className="py-6 text-xs text-slate-500 text-center">
        No quarterly duty trend data available.
      </div>
    );
  }

  const width = 420;
  const height = 148;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const minVal = 200;
  const maxVal = Math.max(800, Math.ceil(trend.max000s / 100) * 100);
  const yTicks = [200, 400, 600, 800].filter((t) => t <= maxVal);

  const coords = points.map((pt, idx) => {
    const x =
      points.length === 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (points.length - 1)) * plotW;
    const ratio = (pt.duty_tariff_broker_000s - minVal) / Math.max(1, maxVal - minVal);
    const y = padTop + plotH - ratio * plotH;
    return { ...pt, x, y };
  });

  const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const activePoint =
    hoveredIndex !== null ? coords[hoveredIndex] : coords[coords.length - 1];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="text-xs text-slate-500">
          {activePoint.quarter}:{' '}
          <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
            {formatCad(activePoint.duty_tariff_broker_000s * 1000)}
          </span>
        </div>
        <div className="text-[11px] font-mono tabular-nums text-[#D97706] font-semibold">
          {trend.yoyChange000s >= 0 ? '+' : ''}
          {formatCad(trend.yoyChange000s * 1000)} vs {trend.priorYearQuarter}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block select-none"
        role="img"
        aria-label="Eight-quarter duty, tariff, and broker cost trend"
      >
        {/* Horizontal Gridlines */}
        {yTicks.map((tick) => {
          const ratio = (tick - minVal) / Math.max(1, maxVal - minVal);
          const y = padTop + plotH - ratio * plotH;
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text
                x={padLeft - 6}
                y={y + 3.5}
                textAnchor="end"
                className="fill-slate-400 text-[9.5px] font-mono"
              >
                ${tick}K
              </text>
            </g>
          );
        })}

        {/* Trend Line */}
        <polyline
          fill="none"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polylinePoints}
        />

        {/* Data Points & X Labels */}
        {coords.map((pt, idx) => {
          const isLatest = idx === coords.length - 1;
          const isHovered = hoveredIndex === idx;
          const shortLabel = pt.quarter.replace('20', '');
          return (
            <g
              key={pt.quarter}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Invisible wider hit area */}
              <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isLatest || isHovered ? 4 : 3}
                fill={isLatest ? '#D97706' : isHovered ? '#0F172A' : '#FFFFFF'}
                stroke={isLatest ? '#D97706' : '#0F172A'}
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={height - 7}
                textAnchor="middle"
                className={`text-[9px] font-mono ${
                  isLatest || isHovered ? 'fill-[#0F172A] font-semibold' : 'fill-slate-500'
                }`}
              >
                {shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ShipmentSummaryDrawer({
  entry,
  onClose,
}: {
  entry: MarcoShipmentEntry | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!entry) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shipment-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full overflow-y-auto border-l border-slate-200 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">
              <span className="font-mono font-semibold text-[#0F172A]">{entry.entryId}</span> ·{' '}
              {entry.direction === 'export' ? 'Export' : 'Import'} · Origin: {entry.originCountry} ·
              HS <span className="font-mono">{entry.hsCode}</span>
              {entry.incoterm ? ` · ${entry.incoterm}` : ''}
            </div>
            <h2
              id="shipment-drawer-title"
              className="mt-1 text-lg font-bold tracking-tight text-[#0F172A]"
            >
              {entry.route} — {entry.goods}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shipment summary"
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Special Refund Callout (e.g. E-08 CUSMA cert on file) */}
          {entry.refundClaimNote && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-[#0F172A]">
              <div className="text-xs font-bold text-[#D97706] mb-0.5">
                Trade agreement refund opportunity
              </div>
              {entry.refundClaimNote}
            </div>
          )}

          {/* Section 1: Expected Duty vs Duty Paid */}
          <section>
            <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-[#0F172A]">
                Expected duty vs. duty paid
              </h3>
              <span className="text-[11px] text-slate-500">
                Declared value: <span className="font-mono font-semibold text-[#0F172A] tabular-nums">{formatCad(entry.valueCad)}</span>
              </span>
            </div>

            <dl className="mt-2.5 divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">
                  Normal rate ({formatPercent(entry.mfnRate * 100, 1)} × {formatCad(entry.valueCad)})
                </dt>
                <dd className="font-mono tabular-nums font-medium text-[#0F172A]">
                  {formatCad(entry.expectedNormalDutyCad)}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">
                  Extra tariff ({formatPercent(entry.extraTariffRate * 100, 1)} × {formatCad(entry.valueCad)})
                </dt>
                <dd className="font-mono tabular-nums font-medium text-[#0F172A]">
                  {formatCad(entry.expectedExtraTariffCad)}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="font-semibold text-[#0F172A]">Expected duty and tariff</dt>
                <dd className="font-mono tabular-nums font-bold text-[#0F172A]">
                  {formatCad(entry.expectedTotalDutyCad)}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="font-semibold text-[#0F172A]">Duty and tariff paid</dt>
                <dd className="font-mono tabular-nums font-bold text-[#0F172A]">
                  {formatCad(entry.dutyAndTariffPaidCad)}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">Difference (paid minus expected)</dt>
                <dd
                  className={`font-mono tabular-nums font-semibold ${
                    entry.dutyVarianceCad === 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'
                  }`}
                >
                  {formatCad(entry.dutyVarianceCad, true)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-slate-500">
              Practice rates from the case, verify with CBSA before use.
            </p>
          </section>

          {/* Section 2: Agreement Status */}
          <section>
            <h3 className="text-xs font-bold text-[#0F172A] pb-2 border-b border-slate-200">
              Trade agreement status
            </h3>
            <dl className="mt-2.5 divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">Status</dt>
                <dd
                  className={`font-semibold ${
                    entry.agreementStatus === 'Certificate on file but not claimed'
                      ? 'text-[#D97706]'
                      : entry.agreementStatus === 'Claimed'
                        ? 'text-[#15803D]'
                        : 'text-slate-600'
                  }`}
                >
                  {entry.agreementStatus}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">Agreement available</dt>
                <dd className="font-medium text-[#0F172A]">
                  {entry.agreementAvailable || 'None'}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">Origin certificate on file</dt>
                <dd className="font-mono text-[#0F172A]">{entry.originCertOnFile || 'no'}</dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">Agreement claimed at entry</dt>
                <dd className="font-mono text-[#0F172A]">{entry.agreementClaimed || 'no'}</dd>
              </div>
            </dl>
          </section>

          {/* Section 3: Broker Fee Against Contract */}
          <section>
            <h3 className="text-xs font-bold text-[#0F172A] pb-2 border-b border-slate-200">
              Broker fee against contract
            </h3>
            <dl className="mt-2.5 divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">
                  Contract fee ({formatPercent(entry.contractRatePct, 2)} of value)
                </dt>
                <dd className="font-mono tabular-nums font-medium text-[#0F172A]">
                  {formatCad(entry.contractFeeCad)}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">Broker fee billed</dt>
                <dd className="font-mono tabular-nums font-bold text-[#0F172A]">
                  {formatCad(entry.brokerFeeBilledCad)}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">Over / under contract</dt>
                <dd
                  className={`font-mono tabular-nums font-bold ${
                    entry.brokerVarianceCad > 0
                      ? 'text-[#D97706]'
                      : entry.brokerVarianceCad < 0
                        ? 'text-[#15803D]'
                        : 'text-slate-700'
                  }`}
                >
                  {formatCad(entry.brokerVarianceCad, true)}
                </dd>
              </div>
              <div className="py-2 flex items-center justify-between gap-4">
                <dt className="text-slate-600">Billed fee as % of value</dt>
                <dd
                  className={`font-mono tabular-nums font-bold ${
                    entry.isFeeAboveContract ? 'text-[#D97706]' : 'text-[#0F172A]'
                  }`}
                >
                  {formatPercent(entry.feePctOfValue, 2)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Section 4: Linked Ledger Row for Broker Fee */}
          <section>
            <h3 className="text-xs font-bold text-[#0F172A] pb-2 border-b border-slate-200">
              Linked ledger row (broker fee)
            </h3>
            {entry.linkedLedgerRow ? (
              <dl className="mt-2.5 divide-y divide-slate-100 text-xs">
                <div className="py-2 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Ledger entry</dt>
                  <dd className="font-mono font-semibold text-[#0F172A]">
                    {entry.linkedLedgerRow.entry_id}
                  </dd>
                </div>
                <div className="py-2 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Post date / Period</dt>
                  <dd className="font-mono tabular-nums text-[#0F172A]">
                    {entry.linkedLedgerRow.post_date} (Period {entry.linkedLedgerRow.period})
                  </dd>
                </div>
                <div className="py-2 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">GL account</dt>
                  <dd className="font-mono text-[#0F172A]">
                    {entry.linkedLedgerRow.gl_account} — {entry.linkedLedgerRow.gl_name}
                  </dd>
                </div>
                <div className="py-2 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Invoice / Approval / Vendor</dt>
                  <dd className="font-mono text-[#0F172A]">
                    {entry.linkedLedgerRow.invoice_no} · {entry.linkedLedgerRow.approval_ref || 'None'} ·{' '}
                    {entry.linkedLedgerRow.vendor_id}
                  </dd>
                </div>
                <div className="py-2 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Ledger amount</dt>
                  <dd className="font-mono tabular-nums font-bold text-[#0F172A]">
                    {formatCad(entry.linkedLedgerRow.amount_cad)}
                  </dd>
                </div>
                <div className="py-2 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Description</dt>
                  <dd className="text-right text-[#0F172A]">
                    {entry.linkedLedgerRow.description}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2.5 text-xs text-[#B91C1C]">
                No linked GL 7410 broker fee posting found in ledger_q3.
              </p>
            )}
          </section>

          {/* Linked Evidence */}
          {entry.linkedEvidence.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-[#0F172A] pb-2 border-b border-slate-200">
                Linked evidence
              </h3>
              <ul className="mt-2 divide-y divide-slate-100 text-xs">
                {entry.linkedEvidence.map((ev) => (
                  <li key={ev.evidence_id} className="py-2 flex items-start gap-2.5">
                    <span className="font-mono font-semibold text-[#0F172A] shrink-0 w-13">
                      {ev.evidence_id}
                    </span>
                    <div className="min-w-0">
                      <div className="text-slate-500">
                        {ev.type} · <span className="font-mono tabular-nums">{ev.date}</span>
                      </div>
                      <p className="mt-0.5 text-[#0F172A]">{ev.summary}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export function MarcoShipmentsView({
  marcoShipments,
  customsRows,
  customsFileName,
  focusedShipmentId,
  onResetData,
  isRefreshing = false,
}: MarcoShipmentsViewProps) {
  const [sortDir, setSortDir] = useState<FeeSortDirection>('default');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    () => focusedShipmentId ?? null,
  );
  const [chinaTariffPct, setChinaTariffPct] = useState<number>(25);

  useEffect(() => {
    if (
      focusedShipmentId &&
      marcoShipments.entries.some((e) => e.entryId === focusedShipmentId)
    ) {
      setSelectedEntryId(focusedShipmentId);
    }
  }, [focusedShipmentId, marcoShipments.entries]);

  const whatIf = useMemo(
    () => computeChinaTariffWhatIf(customsRows, chinaTariffPct),
    [customsRows, chinaTariffPct],
  );

  const sortedEntries = useMemo(() => {
    if (sortDir === 'default') return marcoShipments.entries;
    const copy = [...marcoShipments.entries];
    copy.sort((a, b) =>
      sortDir === 'desc'
        ? b.feePctOfValue - a.feePctOfValue
        : a.feePctOfValue - b.feePctOfValue,
    );
    return copy;
  }, [marcoShipments.entries, sortDir]);

  const selectedEntry = useMemo(
    () =>
      selectedEntryId
        ? marcoShipments.entries.find((e) => e.entryId === selectedEntryId) ?? null
        : null,
    [marcoShipments.entries, selectedEntryId],
  );

  if (isRefreshing) {
    return (
      <main className="flex-1 min-w-0 bg-white px-6 py-6 lg:px-7">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-56 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="h-44 bg-slate-100 rounded-lg" />
            <div className="h-44 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-72 bg-slate-100 rounded-lg" />
        </div>
      </main>
    );
  }

  const cycleFeeSort = () => {
    setSortDir((prev) =>
      prev === 'default' ? 'desc' : prev === 'desc' ? 'asc' : 'default',
    );
  };

  const { breakdown, unmatchedBrokerBills, dutyTrend, contractRatePct } = marcoShipments;

  return (
    <main className="flex-1 min-w-0 bg-white px-6 py-6 lg:px-7">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Marco: Shipments
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Customs and Trade Coordinator · Duty checks, broker contract audit, and tariff what-if
          </p>
          {customsFileName && (
            <p className="mt-1.5 text-xs font-medium text-[#D97706]">
              Custom customs data active: {customsFileName}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Practice rates from the case, verify with CBSA before use.
        </p>
      </div>

      {/* Top Row 1: Two Totals Side by Side */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Customs Cost Total & Breakdown */}
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-3 pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-[#0F172A]">Customs cost</h2>
            <span className="text-xl font-bold font-mono tabular-nums text-[#0F172A]">
              {formatCad(breakdown.customsCostTotalCad)}
            </span>
          </div>

          <dl className="mt-3 divide-y divide-slate-100 text-xs">
            <div className="py-2 flex items-center justify-between gap-3">
              <dt className="text-slate-600">Duty at normal rates</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#0F172A]">
                {formatCad(breakdown.normalDutyCad)}
              </dd>
            </div>
            <div className="py-2 flex items-center justify-between gap-3">
              <dt className="text-slate-600">Extra tariffs</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#D97706]">
                {formatCad(breakdown.extraTariffsCad)}
              </dd>
            </div>
            <div className="py-2 flex items-center justify-between gap-3">
              <dt className="text-slate-600">Export duty under DDP</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#0F172A]">
                {formatCad(breakdown.exportDdpDutyCad)}
              </dd>
            </div>
            <div className="py-2 flex items-center justify-between gap-3">
              <dt className="text-slate-600">Broker fees</dt>
              <dd className="font-mono tabular-nums font-semibold text-[#0F172A]">
                {formatCad(breakdown.brokerFeesCad)}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[11px] text-slate-500">
            Practice rates from the case, verify with CBSA before use.
          </p>
        </section>

        {/* Sales Tax Wrongly Mixed into Duty Report */}
        <section className="rounded-lg border border-amber-300/80 bg-amber-50/30 p-5">
          <div className="flex items-baseline justify-between gap-3 pb-3 border-b border-amber-200/80">
            <h2 className="text-sm font-bold text-[#0F172A]">
              Sales tax wrongly mixed into the duty report
            </h2>
            <span className="text-xl font-bold font-mono tabular-nums text-[#D97706] shrink-0">
              {formatCad(breakdown.salesTaxTotalCad)}
            </span>
          </div>

          <p className="mt-2.5 text-xs font-semibold text-[#0F172A]">
            Sales tax is charged to the customer and is not duty.
          </p>

          <dl className="mt-2.5 divide-y divide-amber-200/50 text-xs">
            {breakdown.salesTaxRows.map((row) => (
              <div
                key={row.destination}
                className="py-1.5 flex items-center justify-between gap-3"
              >
                <dt className="text-slate-700">
                  {row.destination}{' '}
                  <span className="text-[11px] text-slate-500">({row.tax_rule})</span>
                </dt>
                <dd className="font-mono tabular-nums font-semibold text-[#0F172A] shrink-0">
                  {formatCad(row.sales_tax_cad)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Top Row 2: Tariff What-If + Eight-Quarter Duty Trend */}
      <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-5">
        {/* Tariff What-If Card */}
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">Tariff what-if</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Extra tariff on{' '}
                <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                  {formatCad(whatIf.chinaVolumeCad)}
                </span>{' '}
                of China-made goods ({whatIf.chinaEntries.join(', ')})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono tabular-nums text-[#D97706]">
                {chinaTariffPct}%
              </span>
              {chinaTariffPct !== 25 && (
                <button
                  type="button"
                  onClick={() => setChinaTariffPct(25)}
                  className="text-[11px] font-medium text-slate-500 hover:text-[#0F172A] underline cursor-pointer"
                >
                  Reset 25%
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="china-tariff-slider" className="sr-only">
              Extra tariff rate on China-made goods (0% to 35%)
            </label>
            <input
              id="china-tariff-slider"
              type="range"
              min={0}
              max={35}
              step={1}
              value={chinaTariffPct}
              onChange={(e) => setChinaTariffPct(Number(e.target.value))}
              className="w-full accent-[#D97706] cursor-pointer"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
              <span>0%</span>
              <span>15%</span>
              <span>25% (current)</span>
              <span>35%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div>
              <div className="text-[11px] text-slate-500">Tariff per quarter</div>
              <div className="mt-0.5 text-base font-bold font-mono tabular-nums text-[#0F172A]">
                {formatCad(whatIf.tariffPerQuarterCad)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Change per quarter</div>
              <div
                className={`mt-0.5 text-base font-bold font-mono tabular-nums ${
                  whatIf.changePerQuarterCad < 0
                    ? 'text-[#15803D]'
                    : whatIf.changePerQuarterCad > 0
                      ? 'text-[#B91C1C]'
                      : 'text-[#0F172A]'
                }`}
              >
                {formatCad(whatIf.changePerQuarterCad, true)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Change per year</div>
              <div
                className={`mt-0.5 text-base font-bold font-mono tabular-nums ${
                  whatIf.changePerYearCad < 0
                    ? 'text-[#15803D]'
                    : whatIf.changePerYearCad > 0
                      ? 'text-[#B91C1C]'
                      : 'text-[#0F172A]'
                }`}
              >
                {formatCad(whatIf.changePerYearCad, true)}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            Assumes the same volume each quarter. Excludes the cost of changing suppliers.
            Practice rates from the case, verify with CBSA before use.
          </p>
        </section>

        {/* Eight-Quarter Duty Trend Line Chart */}
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-[#0F172A]">Eight-quarter duty trend</h2>
            <span className="text-[11px] text-slate-500">Duty, tariffs &amp; broker ($000s)</span>
          </div>
          <div className="mt-3">
            <DutyTrendChart trend={dutyTrend} />
          </div>
        </section>
      </div>

      {/* Quarter Entries Table */}
      <section className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Q3 customs entries ({marcoShipments.entries.length})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Click any shipment to open its summary. Fee percentages above the{' '}
              <span className="font-mono font-semibold text-[#0F172A]">
                {formatPercent(contractRatePct, 2)}
              </span>{' '}
              contract rate are highlighted in amber.
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            Practice rates from the case, verify with CBSA before use.
          </span>
        </div>

        <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[820px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                <th className="py-2.5 pl-3 pr-3 whitespace-nowrap">Route</th>
                <th className="py-2.5 pr-3 whitespace-nowrap">Goods</th>
                <th className="py-2.5 pr-3 text-right whitespace-nowrap">Value</th>
                <th className="py-2.5 pr-3 text-right whitespace-nowrap">Duty &amp; tariff</th>
                <th className="py-2.5 pr-3 text-right whitespace-nowrap">Broker billed</th>
                <th className="py-2.5 pr-3 text-right whitespace-nowrap">At contract</th>
                <th className="py-2.5 pr-3 text-right whitespace-nowrap">Over / under</th>
                <th className="py-2.5 pr-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={cycleFeeSort}
                    className="inline-flex items-center gap-1 font-semibold text-[#0F172A] hover:text-[#D97706] transition-colors cursor-pointer"
                    title="Sort by broker fee % of value"
                  >
                    Fee %
                    {sortDir === 'desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-[#D97706]" />
                    ) : sortDir === 'asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-[#D97706]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 pr-3 whitespace-nowrap">Agreement status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEntries.map((entry) => (
                <tr
                  key={entry.entryId}
                  onClick={() => setSelectedEntryId(entry.entryId)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 pl-3 pr-3 whitespace-nowrap">
                    <span className="font-mono font-semibold text-[#0F172A] mr-1.5">
                      {entry.entryId}
                    </span>
                    <span className="text-slate-700">{entry.route}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-[#0F172A] whitespace-nowrap">
                    {entry.goods}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-[#0F172A] whitespace-nowrap">
                    {formatCad(entry.valueCad)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-[#0F172A] whitespace-nowrap">
                    {formatCad(entry.dutyAndTariffPaidCad)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums font-medium text-[#0F172A] whitespace-nowrap">
                    {formatCad(entry.brokerFeeBilledCad)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {formatCad(entry.contractFeeCad)}
                  </td>
                  <td
                    className={`py-2.5 pr-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap ${
                      entry.brokerVarianceCad > 0
                        ? 'text-[#D97706]'
                        : entry.brokerVarianceCad < 0
                          ? 'text-[#15803D]'
                          : 'text-slate-500'
                    }`}
                  >
                    {formatCad(entry.brokerVarianceCad, true)}
                  </td>
                  <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded font-mono tabular-nums ${
                        entry.isFeeAboveContract
                          ? 'bg-amber-50 text-[#D97706] font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {formatPercent(entry.feePctOfValue, 2)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    {entry.agreementStatus === 'Certificate on file but not claimed' ? (
                      <span className="font-semibold text-[#D97706]">
                        Certificate on file but not claimed
                      </span>
                    ) : entry.agreementStatus === 'Claimed' ? (
                      <span className="font-medium text-[#15803D]">
                        Claimed{entry.agreementAvailable ? ` (${entry.agreementAvailable})` : ''}
                      </span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                </tr>
              ))}
              {sortedEntries.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    <div>No customs entries loaded in the current dataset.</div>
                    {onResetData && (
                      <button
                        type="button"
                        onClick={onResetData}
                        className="mt-2 inline-flex items-center gap-1 font-semibold text-[#0F172A] hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset built-in Q3 data
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-300 bg-slate-50/70 font-semibold text-[#0F172A]">
                <td className="py-2.5 pl-3 pr-3" colSpan={2}>
                  Total ({marcoShipments.entries.length} entries)
                </td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums whitespace-nowrap">
                  {formatCad(marcoShipments.totalValueCad)}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums whitespace-nowrap">
                  {formatCad(marcoShipments.totalDutyPaidCad)}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums whitespace-nowrap">
                  {formatCad(marcoShipments.totalBrokerBilledCad)}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums whitespace-nowrap">
                  {formatCad(marcoShipments.totalBrokerContractCad)}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums whitespace-nowrap">
                  {formatCad(marcoShipments.totalBrokerNetVarianceCad, true)}
                </td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                  {formatPercent(contractRatePct, 2)} std
                </td>
                <td className="py-2.5 pr-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Red "Billed but not on file" Row Under the Table */}
        {unmatchedBrokerBills.length > 0 && (
          <div className="mt-3 space-y-2">
            {unmatchedBrokerBills.map((bill) => (
              <div
                key={bill.entryId}
                className="rounded-md border border-red-300 bg-red-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-bold text-[#B91C1C]">
                      Billed but not on file — {bill.shipmentRef}
                    </div>
                    <div className="mt-0.5 text-red-950">
                      Ledger entry <span className="font-mono font-semibold">{bill.entryId}</span>{' '}
                      · Invoice <span className="font-mono">{bill.invoiceNo}</span> · Vendor{' '}
                      <span className="font-mono">{bill.vendorId}</span> · Posted{' '}
                      <span className="font-mono tabular-nums">{bill.postDate}</span> — no matching
                      customs entry in Q3
                    </div>
                  </div>
                </div>
                <div className="font-mono tabular-nums text-sm font-bold text-[#B91C1C] shrink-0">
                  {formatCad(bill.amountCad)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Side Drawer for Clicked Shipment */}
      <ShipmentSummaryDrawer
        entry={selectedEntry}
        onClose={() => setSelectedEntryId(null)}
      />
    </main>
  );
}
