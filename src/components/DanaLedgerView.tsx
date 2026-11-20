import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import {
  computeDanaReviewCounts,
  formatCad,
  type DanaLedgerProblem,
  type DanaLedgerSummary,
  type DanaReviewDecision,
} from '../rules';
import { buildDraftRequestFromProblem } from '../drafting';
import { DraftLetterBox } from './DraftLetterBox';

interface DanaLedgerViewProps {
  danaLedger: DanaLedgerSummary;
  decisionsById: Record<string, DanaReviewDecision>;
  onDecisionChange: (problemId: string, decision: DanaReviewDecision | null) => void;
  ledgerFileName: string | null;
  focusedProblemId?: string | null;
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

function getListStatusLabel(
  problem: DanaLedgerProblem,
  decision: DanaReviewDecision | undefined,
): string {
  if (decision) return decision;
  return problem.defaultStatus;
}

function getListStatusChipClass(statusLabel: string): string {
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

export function DanaLedgerView({
  danaLedger,
  decisionsById,
  onDecisionChange,
  ledgerFileName,
  focusedProblemId,
  onResetData,
  isRefreshing = false,
}: DanaLedgerViewProps) {
  const { problems, explained, problemsTotalCad, caughtBy250kCount, totalProblemsCount } =
    danaLedger;

  const allItems = [...problems, ...explained];
  const [selectedId, setSelectedId] = useState<string>(
    () => focusedProblemId ?? problems[0]?.id ?? explained[0]?.id ?? '',
  );

  useEffect(() => {
    if (focusedProblemId && allItems.some((item) => item.id === focusedProblemId)) {
      setSelectedId(focusedProblemId);
    }
  }, [focusedProblemId, allItems]);

  useEffect(() => {
    if (!allItems.some((item) => item.id === selectedId)) {
      setSelectedId(problems[0]?.id ?? explained[0]?.id ?? '');
    }
  }, [allItems, problems, explained, selectedId]);

  const selectedProblem =
    allItems.find((item) => item.id === selectedId) ?? problems[0] ?? explained[0] ?? null;

  const reviewCounts = computeDanaReviewCounts(problems, decisionsById);

  if (isRefreshing) {
    return (
      <main className="flex-1 min-w-0 bg-white px-6 py-6 lg:px-7">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 xl:grid-cols-[316px_1fr] gap-6">
            <div className="space-y-2.5">
              <div className="h-16 bg-slate-100 rounded" />
              <div className="h-16 bg-slate-100 rounded" />
              <div className="h-16 bg-slate-100 rounded" />
            </div>
            <div className="h-96 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 bg-white px-6 py-6 lg:px-7">
      {/* Header + Review Summary Panel */}
      <div className="pb-5 border-b border-slate-200 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Dana: Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Cost Accountant, Plant 2 · Unusual ledger postings ranked by dollar impact
          </p>
          {ledgerFileName && (
            <p className="mt-1.5 text-xs font-medium text-[#D97706]">
              Custom ledger active: {ledgerFileName}
            </p>
          )}
        </div>

        {/* Review Counter Panel */}
        <div
          aria-live="polite"
          className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 font-medium tabular-nums shrink-0"
        >
          Reviewed:{' '}
          <span className="font-mono font-semibold text-[#0F172A]">
            {reviewCounts.reviewedCount} of {reviewCounts.totalCount}
          </span>
          . Marked not a problem:{' '}
          <span className="font-mono font-semibold text-[#0F172A]">
            {reviewCounts.notAProblemCount}
          </span>
        </div>
      </div>

      {/* Two-Column Split: Today List on Left, Open Story Card on Right */}
      <div className="mt-6 flex flex-col xl:flex-row gap-6 items-start">
        {/* Left Column: Today List + 250K Screen Line + Checked & Explained */}
        <section
          aria-label="Today ledger problems"
          className="w-full xl:w-[316px] 2xl:w-[344px] shrink-0"
        >
          {/* Today Header */}
          <div className="flex items-baseline justify-between gap-2 pb-2.5 border-b border-slate-200">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-bold text-[#0F172A]">Today</h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {totalProblemsCount} {totalProblemsCount === 1 ? 'problem' : 'problems'}
              </span>
            </div>
            <div className="text-sm font-bold font-mono tabular-nums text-[#0F172A]">
              {formatCad(problemsTotalCad)}
            </div>
          </div>

          {/* Ranked Problem List */}
          <div className="divide-y divide-slate-200 border-b border-slate-200">
            {problems.map((problem) => {
              const isSelected = selectedProblem?.id === problem.id;
              const decision = decisionsById[problem.id];
              const statusLabel = getListStatusLabel(problem, decision);

              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => setSelectedId(problem.id)}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`w-full text-left px-3 py-3.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0F172A] ${
                    isSelected
                      ? 'bg-slate-100 ring-1 ring-inset ring-slate-300'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-[#0F172A] leading-snug">
                      {problem.title}
                    </span>
                    <span className="text-sm font-bold font-mono tabular-nums text-[#0F172A] shrink-0">
                      {formatCad(problem.amountCad)}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-slate-600 leading-snug">
                    {problem.ruleNames.join(' · ')}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      {problem.patternDetail}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-medium leading-tight rounded border whitespace-nowrap ${getListStatusChipClass(
                        statusLabel,
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </button>
              );
            })}

            {problems.length === 0 && (
              <div className="py-6 px-3 text-xs text-slate-500 text-center space-y-2">
                <p>No ledger problems flagged for the current dataset.</p>
                {onResetData && (
                  <button
                    type="button"
                    onClick={onResetData}
                    className="inline-flex items-center gap-1 font-semibold text-[#0F172A] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset built-in Q3 data
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 250K Screen Coverage Line */}
          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            The 250K screen alone would catch{' '}
            <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
              {caughtBy250kCount}
            </span>{' '}
            of these{' '}
            <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
              {totalProblemsCount}
            </span>{' '}
            problems.
          </p>

          {/* Checked and Explained Section */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-baseline justify-between gap-2 pb-2">
              <h2 className="text-xs font-bold text-[#0F172A]">Checked and explained</h2>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {explained.length}
              </span>
            </div>

            {explained.length > 0 ? (
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {explained.map((item) => {
                  const isSelected = selectedProblem?.id === item.id;
                  const decision = decisionsById[item.id];
                  const statusLabel = getListStatusLabel(item, decision);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={`w-full text-left px-3 py-3 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0F172A] ${
                        isSelected
                          ? 'bg-slate-100 ring-1 ring-inset ring-slate-300'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#0F172A] leading-snug">
                          {item.title}
                        </span>
                        <span className="text-xs font-semibold font-mono tabular-nums text-[#0F172A] shrink-0">
                          {formatCad(item.amountCad)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-slate-500">
                          {item.subtitle}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-medium leading-tight rounded border whitespace-nowrap ${getListStatusChipClass(
                            statusLabel,
                          )}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No size-screen rows cleared automatically.
              </p>
            )}
          </div>
        </section>

        {/* Right Column: Open Story Card + Evidence Rows Used */}
        <section aria-label="Problem story card" className="flex-1 min-w-0 w-full">
          {selectedProblem ? (
            <div>
              {/* Story Card */}
              <div className="rounded-lg border border-slate-200 bg-white">
                {/* Card Header */}
                <div className="px-6 py-5 border-b border-slate-200">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">
                        {selectedProblem.ruleNames.join(' · ')} · {selectedProblem.patternDetail}
                      </div>
                      <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">
                        {selectedProblem.title}
                      </h2>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500">Amount (CAD)</div>
                      <div className="mt-0.5 text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
                        {formatCad(selectedProblem.amountCad)}
                      </div>
                    </div>
                  </div>

                  {/* Three Review Decision Buttons + Draft Letter with Gemini */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-600">
                        Dana&apos;s call:
                      </span>
                      <div
                        role="group"
                        aria-label={`Review decision for ${selectedProblem.title}`}
                        className="flex flex-wrap items-center gap-2"
                      >
                        {REVIEW_BUTTONS.map((btn) => {
                          const isActive = decisionsById[selectedProblem.id] === btn.value;
                          return (
                            <button
                              key={btn.value}
                              type="button"
                              onClick={() =>
                                onDecisionChange(selectedProblem.id, isActive ? null : btn.value)
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

                    <DraftLetterBox payload={buildDraftRequestFromProblem(selectedProblem)} />
                  </div>
                </div>

                {/* Four-Box Paper Trail */}
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="text-xs font-bold text-[#0F172A] mb-3">
                    Paper trail
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {selectedProblem.paperTrail.map((step) => (
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
                    <dd className="text-[#0F172A]">{selectedProblem.story.who}</dd>
                  </div>

                  <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
                    <dt className="text-xs font-semibold text-slate-500">What</dt>
                    <dd className="text-[#0F172A]">{selectedProblem.story.what}</dd>
                  </div>

                  <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
                    <dt className="text-xs font-semibold text-slate-500">Where</dt>
                    <dd className="text-[#0F172A]">
                      <div>
                        {selectedProblem.story.where.plant} ·{' '}
                        {selectedProblem.story.where.department} ·{' '}
                        {selectedProblem.story.where.region}
                      </div>
                      <div className="mt-0.5 text-xs font-mono text-slate-600">
                        GL {selectedProblem.story.where.glAccount} · Cost centre{' '}
                        {selectedProblem.story.where.costCentre}
                      </div>
                    </dd>
                  </div>

                  <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
                    <dt className="text-xs font-semibold text-slate-500">When</dt>
                    <dd className="text-[#0F172A] font-mono text-xs sm:text-sm tabular-nums">
                      {selectedProblem.story.when}
                    </dd>
                  </div>

                  <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
                    <dt className="text-xs font-semibold text-slate-500">
                      One-time or trend
                    </dt>
                    <dd className="text-[#0F172A]">
                      {selectedProblem.story.oneTimeOrTrend}
                    </dd>
                  </div>

                  <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
                    <dt className="text-xs font-semibold text-slate-500">
                      Effect on operating earnings
                    </dt>
                    <dd className="text-[#0F172A] font-medium">
                      {selectedProblem.story.effectOnOperatingEarnings}
                    </dd>
                  </div>

                  <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
                    <dt className="text-xs font-semibold text-slate-500">Why</dt>
                    <dd
                      className={
                        selectedProblem.linkedEvidence.length === 0
                          ? 'text-[#B91C1C] font-medium'
                          : 'text-[#0F172A]'
                      }
                    >
                      {selectedProblem.story.why}
                    </dd>
                  </div>

                  <div className="py-3.5 grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-1 sm:gap-4">
                    <dt className="text-xs font-semibold text-slate-500">
                      How it reached the books
                    </dt>
                    <dd
                      className={
                        selectedProblem.linkedEvidence.length === 0
                          ? 'text-[#B91C1C] font-medium'
                          : 'text-[#0F172A]'
                      }
                    >
                      {selectedProblem.story.howItReachedBooks}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Evidence Rows Used Under the Card */}
              <div className="mt-5">
                <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-[#0F172A]">Evidence used</h3>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {selectedProblem.linkedEvidence.length}{' '}
                    {selectedProblem.linkedEvidence.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                {selectedProblem.linkedEvidence.length > 0 ? (
                  <ul className="divide-y divide-slate-200 border-b border-slate-200">
                    {selectedProblem.linkedEvidence.map((ev) => (
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
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              Select a ledger item from the list to inspect its paper trail and evidence.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
