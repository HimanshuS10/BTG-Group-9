import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, RotateCcw, X, XCircle } from 'lucide-react';
import {
  computeDanaReviewCounts,
  formatCad,
  type DanaLedgerProblem,
  type DanaLedgerSummary,
  type DanaReviewDecision,
  type HelenCloseRoomSummary,
  type OeWalkBar,
  type OeWalkSeries,
} from '../rules';
import { buildDraftRequestFromProblem } from '../drafting';
import { DraftLetterBox } from './DraftLetterBox';

interface HelenCloseRoomViewProps {
  helenCloseRoom: HelenCloseRoomSummary;
  danaLedger: DanaLedgerSummary;
  decisionsById: Record<string, DanaReviewDecision>;
  onDecisionChange: (problemId: string, decision: DanaReviewDecision | null) => void;
  onResetData?: () => void;
  isRefreshing?: boolean;
}

const REVIEW_BUTTONS: {
  value: DanaReviewDecision;
  activeClass: string;
}[] = [
  {
    value: 'Real problem',
    activeClass: 'bg-[#B91C1C] text-white border-[#B91C1C]',
  },
  {
    value: 'Not a problem',
    activeClass: 'bg-[#0F172A] text-white border-[#0F172A]',
  },
  {
    value: 'Explained',
    activeClass: 'bg-[#15803D] text-white border-[#15803D]',
  },
];

function formatThousands(val000s: number, showSign = false): string {
  const abs = Math.abs(val000s).toLocaleString('en-CA');
  if (val000s < 0) return `-$${abs}K`;
  if (showSign && val000s > 0) return `+$${abs}K`;
  return `$${abs}K`;
}

function getDecisionChipStyle(statusLabel: string): string {
  if (statusLabel === 'Explained') {
    return 'bg-green-50 text-[#15803D] border-green-200';
  }
  if (statusLabel === 'Real problem') {
    return 'bg-red-50 text-[#B91C1C] border-red-200';
  }
  if (statusLabel === 'Not a problem') {
    return 'bg-slate-100 text-slate-700 border-slate-300';
  }
  return 'bg-amber-50 text-[#D97706] border-amber-200';
}

function OeWaterfallChart({
  series,
  onSelectProblemId,
}: {
  series: OeWalkSeries;
  onSelectProblemId: (problemId: string) => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { bars } = series;

  if (bars.length === 0) {
    return (
      <div className="py-8 text-xs text-slate-500 text-center">
        No operating earnings walk data available.
      </div>
    );
  }

  const width = 860;
  const height = 274;
  const padLeft = 56;
  const padRight = 18;
  const padTop = 34;
  const padBottom = 60;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const yMax = Math.ceil(series.maxTop000s / 5000) * 5000;
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += 5000) {
    yTicks.push(v);
  }

  const toY = (val000s: number) =>
    padTop + plotH - (Math.max(0, val000s) / Math.max(1, yMax)) * plotH;

  const stepW = plotW / bars.length;
  const barW = Math.min(36, stepW * 0.62);

  const activeBar: OeWalkBar | null = hoveredIdx !== null ? bars[hoveredIdx] : null;

  return (
    <div>
      {/* Hover Readout & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs">
        <div className="min-h-[20px] text-slate-600">
          {activeBar ? (
            <span>
              <span className="font-semibold text-[#0F172A]">{activeBar.step}</span>:{' '}
              <span className="font-mono font-bold tabular-nums text-[#0F172A]">
                {formatThousands(activeBar.amount000s, !activeBar.isTotal)}
              </span>{' '}
              ({formatCad(activeBar.amount000s * 1000, !activeBar.isTotal)})
              {activeBar.isMaterial && (
                <span className="ml-2 font-semibold text-[#D97706]">Material (≥ $1,000K)</span>
              )}
              {activeBar.linkedProblemId && (
                <span className="ml-2 text-slate-500">· Click to open story card</span>
              )}
            </span>
          ) : (
            <span>
              Hover any bar for detail ·{' '}
              <span className="font-mono font-semibold text-[#0F172A]">
                {series.materialCount}
              </span>{' '}
              bridge lines ≥ $1,000K marked{' '}
              <span className="font-semibold text-[#D97706]">Material</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-600 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0F172A]" />
            Start / End OE
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#15803D]" />
            Positive
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#B91C1C]" />
            Negative
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#D97706]" />
            Material (≥ $1,000K)
          </span>
        </div>
      </div>

      {/* Responsive SVG Waterfall */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[680px] h-auto block select-none"
          role="img"
          aria-label={`Operating earnings waterfall chart for ${series.label}`}
        >
          {/* Y Gridlines */}
          {yTicks.map((tick) => {
            const y = toY(tick);
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
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  ${tick.toLocaleString('en-CA')}K
                </text>
              </g>
            );
          })}

          {/* Connector lines between sequential bars */}
          {bars.map((bar, idx) => {
            if (idx === bars.length - 1) return null;
            const x1 = padLeft + idx * stepW + stepW / 2 + barW / 2;
            const x2 = padLeft + (idx + 1) * stepW + stepW / 2 - barW / 2;
            const yConn = toY(bar.to000s);
            return (
              <line
                key={`conn-${bar.step}`}
                x1={x1}
                y1={yConn}
                x2={x2}
                y2={yConn}
                stroke="#CBD5E1"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            );
          })}

          {/* Bars */}
          {bars.map((bar, idx) => {
            const centerX = padLeft + idx * stepW + stepW / 2;
            const x = centerX - barW / 2;
            const topVal = Math.max(bar.from000s, bar.to000s);
            const botVal = Math.min(bar.from000s, bar.to000s);
            const yTop = toY(topVal);
            const yBot = toY(botVal);
            const rectH = Math.max(2.5, yBot - yTop);
            const isHovered = hoveredIdx === idx;
            const isClickable = Boolean(bar.linkedProblemId);

            const fill = bar.isTotal
              ? '#0F172A'
              : bar.amount000s >= 0
                ? '#15803D'
                : '#B91C1C';

            const valLabel = bar.isTotal
              ? `${bar.amount000s.toLocaleString('en-CA')}`
              : `${bar.amount000s > 0 ? '+' : ''}${bar.amount000s.toLocaleString('en-CA')}`;

            return (
              <g
                key={`${series.walk}-${bar.step}`}
                className={isClickable ? 'cursor-pointer' : 'cursor-default'}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => {
                  if (bar.linkedProblemId) onSelectProblemId(bar.linkedProblemId);
                }}
              >
                {/* Hover column highlight */}
                {isHovered && (
                  <rect
                    x={padLeft + idx * stepW + 2}
                    y={padTop - 16}
                    width={stepW - 4}
                    height={plotH + 20}
                    fill="#F8FAFC"
                    rx="3"
                  />
                )}

                <rect
                  x={x}
                  y={yTop}
                  width={barW}
                  height={rectH}
                  fill={fill}
                  rx="2"
                  opacity={bar.isTotal || bar.isMaterial || isHovered ? 1 : 0.72}
                />

                {/* Material amber marker bar directly above bar */}
                {bar.isMaterial && (
                  <rect
                    x={x}
                    y={yTop - 5}
                    width={barW}
                    height={3}
                    fill="#D97706"
                    rx="1"
                  />
                )}

                {/* Value label above bar */}
                <text
                  x={centerX}
                  y={bar.isMaterial ? yTop - 9 : yTop - 5}
                  textAnchor="middle"
                  className={`text-[9.5px] font-mono ${
                    bar.isMaterial
                      ? 'fill-[#D97706] font-bold'
                      : bar.isTotal
                        ? 'fill-[#0F172A] font-bold'
                        : 'fill-slate-600'
                  }`}
                >
                  {valLabel}
                </text>

                {/* X-axis label */}
                <text
                  x={centerX}
                  y={padTop + plotH + 15}
                  textAnchor="end"
                  transform={`rotate(-35 ${centerX} ${padTop + plotH + 15})`}
                  className={`text-[9.5px] ${
                    bar.isMaterial || bar.isTotal
                      ? 'fill-[#0F172A] font-semibold'
                      : 'fill-slate-500'
                  }`}
                >
                  {bar.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Explicit Material Lines Strip */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        <span className="font-semibold text-[#D97706]">Material lines (≥ $1,000K):</span>
        {bars
          .filter((b) => b.isMaterial)
          .map((b) => (
            <span key={b.step} className="text-slate-700">
              {b.step}{' '}
              <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                {formatThousands(b.amount000s, true)}
              </span>
            </span>
          ))}
      </div>
    </div>
  );
}

function StoryCardModal({
  problem,
  decision,
  onDecisionChange,
  onClose,
}: {
  problem: DanaLedgerProblem | null;
  decision: DanaReviewDecision | undefined;
  onDecisionChange: (problemId: string, next: DanaReviewDecision | null) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!problem) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [problem, onClose]);

  if (!problem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="helen-story-card-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white h-full overflow-y-auto border-l border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">
              {problem.ruleNames.join(' · ')} · {problem.patternDetail}
            </div>
            <h2
              id="helen-story-card-title"
              className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]"
            >
              {problem.title}
            </h2>
          </div>

          <div className="flex items-start gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-500">Amount (CAD)</div>
              <div className="mt-0.5 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
                {formatCad(problem.amountCad)}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close story card"
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Review Buttons + Draft Letter with Gemini */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-600">
              Dana&apos;s call:
            </span>
            <div
              role="group"
              aria-label={`Review decision for ${problem.title}`}
              className="flex flex-wrap items-center gap-2"
            >
              {REVIEW_BUTTONS.map((btn) => {
                const isActive = decision === btn.value;
                return (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() =>
                      onDecisionChange(problem.id, isActive ? null : btn.value)
                    }
                    aria-pressed={isActive}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F172A] ${
                      isActive
                        ? btn.activeClass
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {btn.value}
                  </button>
                );
              })}
            </div>
          </div>

          <DraftLetterBox payload={buildDraftRequestFromProblem(problem)} />
        </div>

        {/* Four-Box Paper Trail */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-xs font-bold text-[#0F172A] mb-3">Paper trail</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {problem.paperTrail.map((step) => (
              <div
                key={step.stage}
                className={`rounded-md border px-3 py-2.5 ${
                  step.ok
                    ? 'border-green-300 bg-green-50/70'
                    : 'border-red-300 bg-red-50/70'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-xs font-bold ${
                      step.ok ? 'text-[#15803D]' : 'text-[#B91C1C]'
                    }`}
                  >
                    {step.stage}
                  </span>
                  {step.ok ? (
                    <CheckCircle2
                      aria-label="Record exists"
                      className="w-3.5 h-3.5 text-[#15803D] shrink-0"
                    />
                  ) : (
                    <XCircle
                      aria-label="Missing or mismatched"
                      className="w-3.5 h-3.5 text-[#B91C1C] shrink-0"
                    />
                  )}
                </div>
                <p
                  className={`mt-1.5 text-[11px] leading-snug ${
                    step.ok ? 'text-green-950' : 'text-red-950'
                  }`}
                >
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Fields */}
        <dl className="divide-y divide-slate-100 px-6 text-sm">
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
            <dt className="text-xs font-semibold text-slate-500">Who</dt>
            <dd className="text-[#0F172A]">{problem.story.who}</dd>
          </div>
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
            <dt className="text-xs font-semibold text-slate-500">What</dt>
            <dd className="text-[#0F172A]">{problem.story.what}</dd>
          </div>
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
            <dt className="text-xs font-semibold text-slate-500">Where</dt>
            <dd className="text-[#0F172A]">
              <div>
                {problem.story.where.plant} · {problem.story.where.department} ·{' '}
                {problem.story.where.region}
              </div>
              <div className="mt-0.5 text-xs font-mono text-slate-600">
                GL {problem.story.where.glAccount} · Cost centre{' '}
                {problem.story.where.costCentre}
              </div>
            </dd>
          </div>
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
            <dt className="text-xs font-semibold text-slate-500">When</dt>
            <dd className="text-[#0F172A] font-mono text-xs sm:text-sm tabular-nums">
              {problem.story.when}
            </dd>
          </div>
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
            <dt className="text-xs font-semibold text-slate-500">
              One-time or trend
            </dt>
            <dd className="text-[#0F172A]">{problem.story.oneTimeOrTrend}</dd>
          </div>
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
            <dt className="text-xs font-semibold text-slate-500">
              Effect on operating earnings
            </dt>
            <dd className="text-[#0F172A] font-medium">
              {problem.story.effectOnOperatingEarnings}
            </dd>
          </div>
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
            <dt className="text-xs font-semibold text-slate-500">Why</dt>
            <dd
              className={
                problem.linkedEvidence.length === 0
                  ? 'text-[#B91C1C] font-medium'
                  : 'text-[#0F172A]'
              }
            >
              {problem.story.why}
            </dd>
          </div>
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
            <dt className="text-xs font-semibold text-slate-500">
              How it reached the books
            </dt>
            <dd
              className={
                problem.linkedEvidence.length === 0
                  ? 'text-[#B91C1C] font-medium'
                  : 'text-[#0F172A]'
              }
            >
              {problem.story.howItReachedBooks}
            </dd>
          </div>
        </dl>

        {/* Evidence Used */}
        <div className="px-6 py-5 border-t border-slate-200 bg-slate-50/40">
          <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold text-[#0F172A]">Evidence used</h3>
            <span className="text-xs text-slate-500 tabular-nums">
              {problem.linkedEvidence.length}{' '}
              {problem.linkedEvidence.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          {problem.linkedEvidence.length > 0 ? (
            <ul className="divide-y divide-slate-200">
              {problem.linkedEvidence.map((ev) => (
                <li key={ev.evidence_id} className="py-3 flex items-start gap-3 text-xs">
                  <span className="font-mono font-semibold text-[#0F172A] shrink-0 w-14">
                    {ev.evidence_id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-500">
                      <span className="font-semibold text-slate-700">{ev.type}</span> ·{' '}
                      {ev.owner} · <span className="font-mono tabular-nums">{ev.date}</span> ·{' '}
                      Ref: <span className="font-mono">{ev.linked_ref}</span>
                    </div>
                    <p className="mt-1 text-[#0F172A] leading-relaxed">{ev.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-3 text-xs text-[#B91C1C] font-medium">
              Cause unresolved: no evidence linked.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function HelenCloseRoomView({
  helenCloseRoom,
  danaLedger,
  decisionsById,
  onDecisionChange,
  onResetData,
  isRefreshing = false,
}: HelenCloseRoomViewProps) {
  const [selectedWalk, setSelectedWalk] = useState<'yoy' | 'qoq'>('yoy');
  const [openProblem, setOpenProblem] = useState<DanaLedgerProblem | null>(null);

  if (isRefreshing) {
    return (
      <main className="flex-1 min-w-0 bg-white px-6 py-6 lg:px-7">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-56 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-100 rounded-lg" />
          <div className="h-56 bg-slate-100 rounded-lg" />
        </div>
      </main>
    );
  }

  const activeWalkSeries =
    selectedWalk === 'yoy' ? helenCloseRoom.yoyWalk : helenCloseRoom.qoqWalk;

  const reviewCounts = computeDanaReviewCounts(danaLedger.problems, decisionsById);

  // Meter scaling for Hidden Pile vs 1,000K materiality line
  const meterScale000s = Math.max(
    3_000,
    Math.ceil(helenCloseRoom.hiddenPileTotal000s / 500) * 500,
  );
  const materialityPct =
    (helenCloseRoom.materialityLine000s / meterScale000s) * 100;

  const cashGroup = helenCloseRoom.hiddenPileGroups.find(
    (g) => g.id === 'cash-to-recover',
  );
  const accountingGroup = helenCloseRoom.hiddenPileGroups.find(
    (g) => g.id === 'accounting-no-cash',
  );
  const operationalGroup = helenCloseRoom.hiddenPileGroups.find(
    (g) => g.id === 'operational-control',
  );

  const cashBarPct = ((cashGroup?.subtotal000s ?? 0) / meterScale000s) * 100;
  const accountingBarPct =
    ((accountingGroup?.subtotal000s ?? 0) / meterScale000s) * 100;
  const operationalBarPct =
    ((operationalGroup?.subtotal000s ?? 0) / meterScale000s) * 100;

  const handleOpenById = (problemId: string) => {
    const found =
      danaLedger.problems.find((p) => p.id === problemId) ??
      helenCloseRoom.nextQuarterSurprises.find((s) => s.problem.id === problemId)
        ?.problem ??
      null;
    if (found) setOpenProblem(found);
  };

  return (
    <main className="flex-1 min-w-0 bg-white px-6 py-6 lg:px-7">
      {/* Header + 1-Business-Day Metric */}
      <div className="pb-5 border-b border-slate-200 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Helen: Close Room
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Group Controller · Materiality bridge, hidden cost pile, and next-quarter surprises
          </p>
        </div>

        {/* Flags Explained Within One Business Day */}
        <div
          aria-live="polite"
          className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2.5 text-right shrink-0"
        >
          <div className="text-xs font-medium text-slate-700 tabular-nums">
            Flags explained within one business day:{' '}
            <span className="font-mono font-bold text-[#0F172A]">
              {reviewCounts.reviewedCount} of {reviewCounts.totalCount}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
            Real problem: {reviewCounts.realProblemCount} · Explained:{' '}
            {reviewCounts.explainedCount} · Not a problem: {reviewCounts.notAProblemCount}
          </div>
        </div>
      </div>

      {/* TOP: Operating Earnings Walk Waterfall Chart */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Operating earnings walk ($000s CAD)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {activeWalkSeries.label}:{' '}
              <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                {formatThousands(activeWalkSeries.start000s)}
              </span>{' '}
              to{' '}
              <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                {formatThousands(activeWalkSeries.end000s)}
              </span>{' '}
              (
              <span className="font-mono font-semibold text-[#15803D] tabular-nums">
                {formatThousands(activeWalkSeries.netChange000s, true)}
              </span>
              )
            </p>
          </div>

          {/* Walk Toggle */}
          <div
            role="group"
            aria-label="Operating earnings walk period"
            className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 p-0.5"
          >
            <button
              type="button"
              onClick={() => setSelectedWalk('yoy')}
              aria-pressed={selectedWalk === 'yoy'}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedWalk === 'yoy'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Q3 2025 to Q3 2026
            </button>
            <button
              type="button"
              onClick={() => setSelectedWalk('qoq')}
              aria-pressed={selectedWalk === 'qoq'}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedWalk === 'qoq'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Q2 2026 to Q3 2026
            </button>
          </div>
        </div>

        <div className="mt-4">
          <OeWaterfallChart
            series={activeWalkSeries}
            onSelectProblemId={handleOpenById}
          />
        </div>
      </section>

      {/* MIDDLE: Hidden Pile Meter + Three Labelled Groups */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">Hidden pile</h2>
            <p className="mt-1 text-xs font-semibold text-[#D97706]">
              {helenCloseRoom.noneReachesMaterialityLine
                ? 'None of the seven reaches the line on its own'
                : `Largest single irregular item: ${formatCad(helenCloseRoom.maxSingleProblemCad)}`}
            </p>
          </div>

          <div className="flex flex-wrap items-baseline gap-6">
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Seven irregular problems</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#0F172A]">
                {formatCad(helenCloseRoom.hiddenPileTotalCad)}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({helenCloseRoom.hiddenPileTotal000s.toLocaleString('en-CA')} thousand)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Share of Q3 operating earnings</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#D97706]">
                {helenCloseRoom.hiddenPileShareOfOePct.toFixed(1)}%{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({helenCloseRoom.hiddenPileTotal000s.toLocaleString('en-CA')} /{' '}
                  {helenCloseRoom.q3OperatingEarnings000s.toLocaleString('en-CA')})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Meter vs 1,000 Thousand Materiality Line */}
        <div className="mt-5">
          <div className="relative h-8 w-full rounded bg-slate-100 overflow-visible border border-slate-200">
            {/* Stacked Bar */}
            <div className="h-full flex rounded overflow-hidden">
              <div
                style={{ width: `${cashBarPct}%` }}
                className="bg-[#15803D] h-full"
                title={`Cash to recover: ${formatCad(cashGroup?.subtotalCad ?? 0)}`}
              />
              <div
                style={{ width: `${accountingBarPct}%` }}
                className="bg-[#D97706] h-full"
                title={`Accounting corrections, no cash: ${formatCad(accountingGroup?.subtotalCad ?? 0)}`}
              />
              <div
                style={{ width: `${operationalBarPct}%` }}
                className="bg-[#0F172A] h-full"
                title={`Operational or control: ${formatCad(operationalGroup?.subtotalCad ?? 0)}`}
              />
            </div>

            {/* 1,000K Materiality Vertical Line */}
            <div
              style={{ left: `${materialityPct}%` }}
              className="absolute -top-2 -bottom-2 w-0.5 bg-[#B91C1C]"
              aria-hidden="true"
            />
          </div>

          {/* Axis & Materiality Marker Labels */}
          <div className="relative mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
            <span>$0</span>
            <span
              style={{ left: `${materialityPct}%` }}
              className="absolute -translate-x-1/2 font-sans font-semibold text-[#B91C1C] whitespace-nowrap"
            >
              1,000 thousand materiality line
            </span>
            <span>${meterScale000s.toLocaleString('en-CA')}K</span>
          </div>
        </div>

        {/* Three Labelled Groups */}
        <div className="mt-7 grid grid-cols-1 xl:grid-cols-3 gap-4">
          {helenCloseRoom.hiddenPileGroups.map((group) => {
            const accentSwatch =
              group.id === 'cash-to-recover'
                ? 'bg-[#15803D]'
                : group.id === 'accounting-no-cash'
                  ? 'bg-[#D97706]'
                  : 'bg-[#0F172A]';

            return (
              <div
                key={group.id}
                className="rounded-md border border-slate-200 bg-slate-50/50 flex flex-col"
              >
                <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-md flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-[2px] shrink-0 ${accentSwatch}`} />
                    <h3 className="text-xs font-bold text-[#0F172A] leading-snug">
                      {group.label}
                    </h3>
                  </div>
                  <span className="text-xs font-bold font-mono tabular-nums text-[#0F172A] shrink-0">
                    {formatCad(group.subtotalCad)}
                  </span>
                </div>

                <div className="divide-y divide-slate-200 flex-1">
                  {group.problems.map((problem) => {
                    const statusLabel = decisionsById[problem.id] ?? problem.defaultStatus;
                    const displayTitle =
                      problem.ruleNames.includes('Wrong account pattern')
                        ? 'Rush freight reclassification'
                        : problem.title;

                    return (
                      <button
                        key={problem.id}
                        type="button"
                        onClick={() => setOpenProblem(problem)}
                        className="w-full text-left px-4 py-3 hover:bg-white transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0F172A]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-[#0F172A] group-hover:underline leading-snug">
                            {displayTitle}
                          </span>
                          <span className="text-xs font-bold font-mono tabular-nums text-[#0F172A] shrink-0">
                            {formatCad(problem.amountCad)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500">
                            {problem.patternDetail}
                          </span>
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded border whitespace-nowrap ${getDecisionChipStyle(
                              statusLabel,
                            )}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {group.problems.length === 0 && (
                    <div className="px-4 py-4 text-xs text-slate-500">
                      No items in this group.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Required Note */}
        <p className="mt-4 text-xs text-slate-600">
          These are cost balances. They are not added to the walk, which shows changes between
          periods.
        </p>
      </section>

      {/* BOTTOM: Next Quarter's Surprises */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-baseline justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Next quarter&apos;s surprises
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Carryover risks and unbilled items that could hit Q4 if left open. Click any item to
              open its story card.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {helenCloseRoom.nextQuarterSurprises.length} items
          </span>
        </div>

        <div className="mt-2 divide-y divide-slate-200">
          {helenCloseRoom.nextQuarterSurprises.map((surprise) => (
            <button
              key={surprise.id}
              type="button"
              onClick={() => setOpenProblem(surprise.problem)}
              className="w-full text-left py-3.5 px-2 -mx-2 rounded hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0F172A]"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#0F172A] group-hover:underline">
                  {surprise.title}
                </div>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  {surprise.detail}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold font-mono tabular-nums text-[#B91C1C]">
                  {surprise.amountLabel}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F172A]" />
              </div>
            </button>
          ))}
          {helenCloseRoom.nextQuarterSurprises.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">
              <p>No carryover surprises flagged for the current dataset.</p>
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
            </div>
          )}
        </div>
      </section>

      {/* Shared Story Card Modal (same card Dana sees) */}
      <StoryCardModal
        problem={openProblem}
        decision={openProblem ? decisionsById[openProblem.id] : undefined}
        onDecisionChange={onDecisionChange}
        onClose={() => setOpenProblem(null)}
      />
    </main>
  );
}
