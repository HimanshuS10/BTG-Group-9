import { useMemo, useState } from 'react';
import { Beaker, HelpCircle, RotateCcw, Upload } from 'lucide-react';
import {
  DEFAULT_DATASET,
  parseCustomsCsv,
  parseLedgerCsv,
  type CustomsRow,
  type LedgerRow,
  type SkyTraceDataset,
} from './data';
import {
  formatCad,
  runRules,
  type DanaReviewDecision,
  type MoneyBackItemId,
  type MoneyBackStatus,
  type RoleOwner,
} from './rules';
import {
  TEST_SCENARIO_IDS,
  createBrokerHighRateTestRows,
  createBrokerNoShipmentTestRow,
  createDuplicateInvoiceTestRow,
} from './testScenarios';
import { DanaLedgerView } from './components/DanaLedgerView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HelenCloseRoomView } from './components/HelenCloseRoomView';
import { HowSkyTraceDecidesModal } from './components/HowSkyTraceDecidesModal';
import { MarcoShipmentsView } from './components/MarcoShipmentsView';
import { MoneyBackPanel } from './components/MoneyBackPanel';
import { UploadCsvModal } from './components/UploadCsvModal';

const STORAGE_KEYS = {
  role: 'skytrace_active_role_v1',
  moneyBackStatuses: 'skytrace_moneyback_statuses_v1',
  danaReviews: 'skytrace_dana_reviews_v1',
  customLedger: 'skytrace_custom_ledger_v1',
  customCustoms: 'skytrace_custom_customs_v1',
};

const DEFAULT_MONEY_BACK_STATUSES: Record<MoneyBackItemId, MoneyBackStatus> = {
  'duplicate-invoice': 'Suspected',
  'broker-no-shipment': 'Suspected',
  'cusma-duty-paid': 'Suspected',
  'broker-overcharges': 'Suspected',
};

const ROLES: { id: RoleOwner; label: string }[] = [
  { id: 'Dana', label: 'Dana: Ledger' },
  { id: 'Marco', label: 'Marco: Shipments' },
  { id: 'Helen', label: 'Helen: Close Room' },
];

interface StoredCsvOverride {
  fileName: string;
  rawCsv: string;
}

function loadStoredRole(): RoleOwner {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.role);
    if (raw === 'Dana' || raw === 'Marco' || raw === 'Helen') {
      return raw;
    }
  } catch {
    // Ignore storage read failures
  }
  return 'Dana';
}

function loadStoredStatuses(): Record<MoneyBackItemId, MoneyBackStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.moneyBackStatuses);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<MoneyBackItemId, MoneyBackStatus>>;
      return {
        ...DEFAULT_MONEY_BACK_STATUSES,
        ...parsed,
      };
    }
  } catch {
    // Ignore storage read failures
  }
  return { ...DEFAULT_MONEY_BACK_STATUSES };
}

function loadStoredLedger(): { rows: LedgerRow[]; fileName: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customLedger);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredCsvOverride;
      const result = parseLedgerCsv(parsed.rawCsv);
      if (!result.error && result.rows.length > 0) {
        return { rows: result.rows, fileName: parsed.fileName };
      }
    }
  } catch {
    // Ignore storage read failures
  }
  return { rows: DEFAULT_DATASET.ledger, fileName: null };
}

function loadStoredCustoms(): { rows: CustomsRow[]; fileName: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customCustoms);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredCsvOverride;
      const result = parseCustomsCsv(parsed.rawCsv);
      if (!result.error && result.rows.length > 0) {
        return { rows: result.rows, fileName: parsed.fileName };
      }
    }
  } catch {
    // Ignore storage read failures
  }
  return { rows: DEFAULT_DATASET.customs, fileName: null };
}

function loadStoredDanaReviews(): Record<string, DanaReviewDecision> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.danaReviews);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      const valid: Record<string, DanaReviewDecision> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (v === 'Real problem' || v === 'Not a problem' || v === 'Explained') {
          valid[k] = v;
        }
      }
      return valid;
    }
  } catch {
    // Ignore storage read failures
  }
  return {};
}

export default function App() {
  const [activeRole, setActiveRole] = useState<RoleOwner>(() => loadStoredRole());
  const [statusById, setStatusById] = useState<Record<MoneyBackItemId, MoneyBackStatus>>(
    () => loadStoredStatuses(),
  );
  const [danaDecisions, setDanaDecisions] = useState<Record<string, DanaReviewDecision>>(
    () => loadStoredDanaReviews(),
  );

  const initialLedger = useMemo(() => loadStoredLedger(), []);
  const initialCustoms = useMemo(() => loadStoredCustoms(), []);

  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>(initialLedger.rows);
  const [ledgerFileName, setLedgerFileName] = useState<string | null>(initialLedger.fileName);

  const [customsRows, setCustomsRows] = useState<CustomsRow[]>(initialCustoms.rows);
  const [customsFileName, setCustomsFileName] = useState<string | null>(initialCustoms.fileName);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isHowDecidesOpen, setIsHowDecidesOpen] = useState(false);

  const [focusedProblemId, setFocusedProblemId] = useState<string | null>(null);
  const [focusedShipmentId, setFocusedShipmentId] = useState<string | null>(null);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  const dataset: SkyTraceDataset = useMemo(
    () => ({
      ...DEFAULT_DATASET,
      ledger: ledgerRows,
      customs: customsRows,
    }),
    [ledgerRows, customsRows],
  );

  const rulesResult = useMemo(() => runRules(dataset), [dataset]);

  const hasTestRows = useMemo(() => {
    const hasLedgerTest = ledgerRows.some(
      (r) =>
        r.entry_id === TEST_SCENARIO_IDS.brokerNoShipment ||
        r.entry_id === TEST_SCENARIO_IDS.brokerHighRateLedger ||
        r.entry_id === TEST_SCENARIO_IDS.duplicateInvoiceCopy,
    );
    const hasCustomsTest = customsRows.some(
      (c) => c.entry_id === TEST_SCENARIO_IDS.brokerHighRateCustoms,
    );
    return hasLedgerTest || hasCustomsTest;
  }, [ledgerRows, customsRows]);

  const isDataModified = hasTestRows || Boolean(ledgerFileName || customsFileName);

  const handleRoleChange = (role: RoleOwner) => {
    setActiveRole(role);
    try {
      localStorage.setItem(STORAGE_KEYS.role, role);
    } catch {
      // Ignore storage write failures
    }
  };

  const handleStatusChange = (id: MoneyBackItemId, status: MoneyBackStatus) => {
    setStatusById((prev) => {
      const next = { ...prev, [id]: status };
      try {
        localStorage.setItem(STORAGE_KEYS.moneyBackStatuses, JSON.stringify(next));
      } catch {
        // Ignore storage write failures
      }
      return next;
    });
  };

  const handleDanaDecisionChange = (
    problemId: string,
    decision: DanaReviewDecision | null,
  ) => {
    setDanaDecisions((prev) => {
      const next = { ...prev };
      if (decision === null) {
        delete next[problemId];
      } else {
        next[problemId] = decision;
      }
      try {
        localStorage.setItem(STORAGE_KEYS.danaReviews, JSON.stringify(next));
      } catch {
        // Ignore storage write failures
      }
      return next;
    });
  };

  const handleReplaceLedger = (rows: LedgerRow[], rawCsv: string, fileName: string) => {
    setLedgerRows(rows);
    setLedgerFileName(fileName);
    setFocusedProblemId(null);
    setTestNotice(null);
    try {
      const payload: StoredCsvOverride = { fileName, rawCsv };
      localStorage.setItem(STORAGE_KEYS.customLedger, JSON.stringify(payload));
    } catch {
      // Ignore storage write failures
    }
  };

  const handleReplaceCustoms = (rows: CustomsRow[], rawCsv: string, fileName: string) => {
    setCustomsRows(rows);
    setCustomsFileName(fileName);
    setFocusedShipmentId(null);
    setTestNotice(null);
    try {
      const payload: StoredCsvOverride = { fileName, rawCsv };
      localStorage.setItem(STORAGE_KEYS.customCustoms, JSON.stringify(payload));
    } catch {
      // Ignore storage write failures
    }
  };

  const handleResetDefaults = () => {
    setLedgerRows(DEFAULT_DATASET.ledger);
    setLedgerFileName(null);
    setCustomsRows(DEFAULT_DATASET.customs);
    setCustomsFileName(null);
    setFocusedProblemId(null);
    setFocusedShipmentId(null);
    setTestNotice(
      'Built-in Q3 data restored (Money-Back $402,280 · Today ledger problems $2,818,000).',
    );
    try {
      localStorage.removeItem(STORAGE_KEYS.customLedger);
      localStorage.removeItem(STORAGE_KEYS.customCustoms);
    } catch {
      // Ignore storage write failures
    }
  };

  // Test Check 1: Broker bill with no shipment (GL 7410 row for E-99)
  const handleTestBrokerNoShipment = () => {
    const sampleRow = createBrokerNoShipmentTestRow();
    setLedgerRows((prev) => {
      if (prev.some((r) => r.entry_id === sampleRow.entry_id)) {
        return prev;
      }
      return [...prev, sampleRow];
    });
    setFocusedShipmentId(null);
    setFocusedProblemId(`PROB-${sampleRow.entry_id}`);
    handleRoleChange('Marco');
    setTestNotice(
      `Added GL 7410 row ${sampleRow.entry_id} for shipment E-99 (${formatCad(sampleRow.amount_cad)}). Flagged under "Billed but not on file" in Marco: Shipments and in Money-Back.`,
    );
  };

  // Test Check 2: Broker fee at 0.5% of value (E-14 worth 400,000 billed 2,000)
  const handleTestBrokerHighRate = () => {
    const { customsRow, ledgerRow } = createBrokerHighRateTestRows();
    setCustomsRows((prev) => {
      if (prev.some((c) => c.entry_id === customsRow.entry_id)) {
        return prev;
      }
      return [...prev, customsRow];
    });
    setLedgerRows((prev) => {
      if (prev.some((r) => r.entry_id === ledgerRow.entry_id)) {
        return prev;
      }
      return [...prev, ledgerRow];
    });
    handleRoleChange('Marco');
    setFocusedShipmentId(customsRow.entry_id);
    setTestNotice(
      `Added shipment E-14 ($400,000 value, $2,000 billed = 0.50% vs 0.20% contract = +$1,200 overcharge). Opened in Marco: Shipments and added to Money-Back.`,
    );
  };

  // Test Check 3: Invoice re-keyed with -A
  const handleTestDuplicateInvoice = () => {
    const sampleRow = createDuplicateInvoiceTestRow(ledgerRows);
    const originalRow = ledgerRows.find(
      (r) =>
        r.vendor_id === sampleRow.vendor_id &&
        r.amount_cad === sampleRow.amount_cad &&
        `${r.invoice_no}-A` === sampleRow.invoice_no,
    );
    setLedgerRows((prev) => {
      if (prev.some((r) => r.entry_id === sampleRow.entry_id)) {
        return prev;
      }
      return [...prev, sampleRow];
    });
    const problemTargetId = `PROB-${originalRow?.entry_id ?? sampleRow.entry_id}`;
    setFocusedShipmentId(null);
    setFocusedProblemId(problemTargetId);
    handleRoleChange('Dana');
    setTestNotice(
      `Added re-keyed invoice ${sampleRow.invoice_no} (${formatCad(sampleRow.amount_cad)}). Flagged by Near-duplicate invoice in Dana: Ledger and Money-Back.`,
    );
  };

  const hasBrokerNoShipTest = ledgerRows.some(
    (r) => r.entry_id === TEST_SCENARIO_IDS.brokerNoShipment,
  );
  const hasBrokerHighRateTest = customsRows.some(
    (c) => c.entry_id === TEST_SCENARIO_IDS.brokerHighRateCustoms,
  );
  const hasDupInvoiceTest = ledgerRows.some(
    (r) => r.entry_id === TEST_SCENARIO_IDS.duplicateInvoiceCopy,
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#0F172A] text-white border-b border-slate-800">
        <div className="h-15 px-6 lg:px-8 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Title */}
          <div className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            SkyTrace
          </div>

          {/* Zone 2: Role Switcher */}
          <nav
            aria-label="Role switcher"
            className="flex items-center gap-1 overflow-x-auto"
          >
            {ROLES.map((role) => {
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706] ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {role.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-0 h-0.5 bg-[#D97706] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Upload CSV Control */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#D97706] hover:bg-amber-600 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload CSV
            </button>
          </div>
        </div>
      </header>

      {/* "Test the checks" Bar */}
      <div
        role="region"
        aria-label="Test the checks"
        className="sticky top-15 z-20 bg-slate-50 border-b border-slate-200 px-6 lg:px-8 py-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F172A] mr-1">
              <Beaker className="w-3.5 h-3.5 text-[#D97706]" />
              Test the checks
            </span>

            <button
              type="button"
              onClick={handleTestBrokerNoShipment}
              className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                hasBrokerNoShipTest
                  ? 'bg-red-50 text-[#B91C1C] border-red-300'
                  : 'bg-white text-[#0F172A] border-slate-300 hover:bg-slate-100'
              }`}
            >
              Broker bill with no shipment
            </button>

            <button
              type="button"
              onClick={handleTestBrokerHighRate}
              className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                hasBrokerHighRateTest
                  ? 'bg-amber-50 text-[#D97706] border-amber-300'
                  : 'bg-white text-[#0F172A] border-slate-300 hover:bg-slate-100'
              }`}
            >
              Broker fee at 0.5% of value
            </button>

            <button
              type="button"
              onClick={handleTestDuplicateInvoice}
              className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                hasDupInvoiceTest
                  ? 'bg-red-50 text-[#B91C1C] border-red-300'
                  : 'bg-white text-[#0F172A] border-slate-300 hover:bg-slate-100'
              }`}
            >
              Invoice re-keyed with -A
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isDataModified
                ? 'bg-[#0F172A] text-white border-[#0F172A] hover:bg-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            Reset data
          </button>
        </div>

        {testNotice && (
          <div className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-slate-700 bg-white border border-slate-200 rounded px-2.5 py-1">
            <span>{testNotice}</span>
            <button
              type="button"
              onClick={() => setTestNotice(null)}
              className="text-slate-400 hover:text-[#0F172A] font-medium shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <ErrorBoundary onResetData={handleResetDefaults} viewLabel={`${activeRole} view`}>
          {activeRole === 'Dana' ? (
            <DanaLedgerView
              danaLedger={rulesResult.danaLedger}
              decisionsById={danaDecisions}
              onDecisionChange={handleDanaDecisionChange}
              ledgerFileName={ledgerFileName}
              focusedProblemId={focusedProblemId}
              onResetData={handleResetDefaults}
            />
          ) : activeRole === 'Marco' ? (
            <MarcoShipmentsView
              marcoShipments={rulesResult.marcoShipments}
              customsRows={customsRows}
              customsFileName={customsFileName}
              focusedShipmentId={focusedShipmentId}
              onResetData={handleResetDefaults}
            />
          ) : (
            <HelenCloseRoomView
              helenCloseRoom={rulesResult.helenCloseRoom}
              danaLedger={rulesResult.danaLedger}
              decisionsById={danaDecisions}
              onDecisionChange={handleDanaDecisionChange}
              onResetData={handleResetDefaults}
            />
          )}
        </ErrorBoundary>

        <ErrorBoundary onResetData={handleResetDefaults} viewLabel="Money-Back panel">
          <MoneyBackPanel
            items={rulesResult.moneyBackItems}
            totalCad={rulesResult.moneyBackTotalCad}
            statusById={statusById}
            onStatusChange={handleStatusChange}
            rulesResult={rulesResult}
          />
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>Fictional case data</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <button
            type="button"
            onClick={() => setIsHowDecidesOpen(true)}
            className="inline-flex items-center gap-1.5 text-[#0F172A] font-medium hover:underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            How SkyTrace decides
          </button>
        </div>

        <span>
          {isDataModified ? (
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[#0F172A] font-medium hover:underline cursor-pointer"
            >
              Reset to built-in Q3 dataset
            </button>
          ) : (
            'SKYJACK · Q3 2026'
          )}
        </span>
      </footer>

      <UploadCsvModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        ledgerFileName={ledgerFileName}
        customsFileName={customsFileName}
        ledgerCount={ledgerRows.length}
        customsCount={customsRows.length}
        onReplaceLedger={handleReplaceLedger}
        onReplaceCustoms={handleReplaceCustoms}
        onResetDefaults={handleResetDefaults}
      />

      <HowSkyTraceDecidesModal
        isOpen={isHowDecidesOpen}
        onClose={() => setIsHowDecidesOpen(false)}
      />
    </div>
  );
}
