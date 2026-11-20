import type {
  CustomsRow,
  DutyTrendRow,
  EvidenceRow,
  LedgerRow,
  SalesTaxRow,
  SkyTraceDataset,
} from './data';

export type FlagStatus = 'Suspected' | 'Explained' | 'Confirmed' | 'Cash received';
export type MoneyBackStatus = 'Suspected' | 'Confirmed' | 'Cash received';
export type RoleOwner = 'Dana' | 'Marco' | 'Helen';

export type RuleName =
  | 'Size screen'
  | 'No approval'
  | 'Near-duplicate invoice'
  | 'Broker fee with no shipment'
  | 'Broker fee against contract'
  | 'Wrong account pattern'
  | 'Suspense not cleared'
  | 'Accrual not reversed'
  | 'Trade agreement not claimed'
  | 'Sales tax in the duty report';

export interface AuditFlag {
  id: string;
  title: string;
  amount: number;
  ruleName: RuleName;
  ledgerRows: LedgerRow[];
  customsRows: CustomsRow[];
  linkedEvidence: EvidenceRow[];
  brokenHandoff: string;
  owner: RoleOwner;
  status: FlagStatus;
  isTrend?: boolean;
  varianceDirection?: 'overcharge' | 'undercharge';
}

export interface BrokerContractLine {
  entryId: string;
  route: string;
  goods: string;
  valueCad: number;
  contractRate: number;
  contractFeeCad: number;
  billedFeeCad: number;
  varianceCad: number;
  status: 'exact' | 'overcharge' | 'undercharge';
}

export interface BrokerReconciliationSummary {
  contractRate: number;
  brokerVendorId: string;
  billedTotalCad: number;
  contractTotalCad: number;
  overchargeTotalCad: number;
  overchargeCount: number;
  underchargeTotalCad: number;
  underchargeEntries: string[];
  netVarianceCad: number;
  exactCount: number;
  totalEntries: number;
  entries: BrokerContractLine[];
}

export interface SalesTaxSummary {
  totalSalesTaxCad: number;
  totalSalesCad: number;
  totalFreightCad: number;
  destinationCount: number;
  customsDutyAndTariffCad: number;
  customsBrokerFeesCad: number;
  customsTotalCostCad: number;
}

export type MoneyBackItemId =
  | 'duplicate-invoice'
  | 'broker-no-shipment'
  | 'cusma-duty-paid'
  | 'broker-overcharges';

export interface MoneyBackItem {
  id: MoneyBackItemId;
  label: string;
  detail: string;
  amountCad: number;
  owner: RoleOwner;
  ruleName: RuleName;
  defaultStatus: MoneyBackStatus;
  flagIds: string[];
}

export interface MoneyBackStatusTotals {
  totalCad: number;
  suspectedCad: number;
  confirmedCad: number;
  cashReceivedCad: number;
  suspectedCount: number;
  confirmedCount: number;
  cashReceivedCount: number;
}

export interface RulesSummary {
  totalFlags: number;
  suspectedFlags: number;
  explainedFlags: number;
  ledgerRowCount: number;
  customsRowCount: number;
  evidenceRowCount: number;
  flagsByOwner: Record<RoleOwner, number>;
}

export type DanaReviewDecision = 'Real problem' | 'Not a problem' | 'Explained';

export interface PaperTrailBox {
  stage: 'Approval' | 'Real event' | 'Outside bill' | 'Ledger line';
  ok: boolean;
  detail: string;
}

export interface DanaLedgerProblem {
  id: string;
  title: string;
  subtitle: string;
  amountCad: number;
  ruleNames: RuleName[];
  pattern: 'One-time' | 'Trend';
  patternDetail: string;
  defaultStatus: 'Suspected' | 'Explained';
  ledgerRows: LedgerRow[];
  linkedEvidence: EvidenceRow[];
  story: {
    who: string;
    what: string;
    where: {
      plant: string;
      department: string;
      region: string;
      glAccount: string;
      costCentre: string;
    };
    when: string;
    why: string;
    howItReachedBooks: string;
    effectOnOperatingEarnings: string;
    oneTimeOrTrend: string;
  };
  paperTrail: [PaperTrailBox, PaperTrailBox, PaperTrailBox, PaperTrailBox];
  caughtBy250kScreen: boolean;
}

export interface DanaLedgerSummary {
  problems: DanaLedgerProblem[];
  explained: DanaLedgerProblem[];
  problemsTotalCad: number;
  caughtBy250kCount: number;
  totalProblemsCount: number;
}

export interface DanaReviewCounts {
  reviewedCount: number;
  totalCount: number;
  notAProblemCount: number;
  realProblemCount: number;
  explainedCount: number;
}

export type AgreementDisplayStatus =
  | 'Claimed'
  | 'Certificate on file but not claimed'
  | 'None';

export interface MarcoShipmentEntry {
  entryId: string;
  direction: string;
  route: string;
  originCountry: string;
  goods: string;
  hsCode: string;
  incoterm: string;
  valueCad: number;
  mfnRate: number;
  extraTariffRate: number;
  expectedNormalDutyCad: number;
  expectedExtraTariffCad: number;
  expectedTotalDutyCad: number;
  dutyAndTariffPaidCad: number;
  dutyVarianceCad: number;
  brokerFeeBilledCad: number;
  contractFeeCad: number;
  brokerVarianceCad: number;
  feePctOfValue: number;
  contractRatePct: number;
  isFeeAboveContract: boolean;
  agreementAvailable: string;
  agreementClaimed: string;
  originCertOnFile: string;
  agreementStatus: AgreementDisplayStatus;
  refundClaimNote: string | null;
  linkedLedgerRow: LedgerRow | null;
  linkedEvidence: EvidenceRow[];
}

export interface MarcoCustomsBreakdown {
  customsCostTotalCad: number;
  normalDutyCad: number;
  extraTariffsCad: number;
  exportDdpDutyCad: number;
  brokerFeesCad: number;
  salesTaxTotalCad: number;
  salesTaxRows: SalesTaxRow[];
}

export interface UnmatchedBrokerBill {
  entryId: string;
  shipmentRef: string;
  invoiceNo: string;
  postDate: string;
  vendorId: string;
  approvalRef: string;
  amountCad: number;
  description: string;
  linkedEvidence: EvidenceRow[];
}

export interface MarcoDutyTrendSummary {
  points: DutyTrendRow[];
  latestQuarter: string;
  latestAmount000s: number;
  priorYearQuarter: string;
  priorYearAmount000s: number;
  yoyChange000s: number;
  min000s: number;
  max000s: number;
}

export interface ChinaTariffWhatIfResult {
  chinaEntries: string[];
  chinaVolumeCad: number;
  baselineRatePercent: number;
  proposedRatePercent: number;
  baselineTariffQuarterCad: number;
  tariffPerQuarterCad: number;
  changePerQuarterCad: number;
  changePerYearCad: number;
}

export interface MarcoShipmentsSummary {
  entries: MarcoShipmentEntry[];
  breakdown: MarcoCustomsBreakdown;
  unmatchedBrokerBills: UnmatchedBrokerBill[];
  dutyTrend: MarcoDutyTrendSummary;
  chinaBaselineWhatIf: ChinaTariffWhatIfResult;
  contractRatePct: number;
  totalValueCad: number;
  totalDutyPaidCad: number;
  totalBrokerBilledCad: number;
  totalBrokerContractCad: number;
  totalBrokerNetVarianceCad: number;
}

export interface OeWalkBar {
  step: string;
  shortLabel: string;
  amount000s: number;
  from000s: number;
  to000s: number;
  isStart: boolean;
  isEnd: boolean;
  isTotal: boolean;
  isMaterial: boolean;
  linkedProblemId: string | null;
}

export interface OeWalkSeries {
  walk: 'yoy' | 'qoq';
  label: string;
  start000s: number;
  end000s: number;
  netChange000s: number;
  materialCount: number;
  maxTop000s: number;
  bars: OeWalkBar[];
}

export type HiddenPileGroupId =
  | 'cash-to-recover'
  | 'accounting-no-cash'
  | 'operational-control';

export interface HiddenPileGroup {
  id: HiddenPileGroupId;
  label: string;
  subtotalCad: number;
  subtotal000s: number;
  problems: DanaLedgerProblem[];
}

export interface NextQuarterSurprise {
  id: string;
  title: string;
  detail: string;
  amountCad: number;
  amountLabel: string;
  problem: DanaLedgerProblem;
}

export interface HelenCloseRoomSummary {
  yoyWalk: OeWalkSeries;
  qoqWalk: OeWalkSeries;
  materialityLineCad: number;
  materialityLine000s: number;
  q3OperatingEarningsCad: number;
  q3OperatingEarnings000s: number;
  hiddenPileTotalCad: number;
  hiddenPileTotal000s: number;
  hiddenPileShareOfOePct: number;
  maxSingleProblemCad: number;
  noneReachesMaterialityLine: boolean;
  hiddenPileGroups: HiddenPileGroup[];
  nextQuarterSurprises: NextQuarterSurprise[];
}

export interface RulesEngineResult {
  flags: AuditFlag[];
  brokerReconciliation: BrokerReconciliationSummary;
  salesTaxSummary: SalesTaxSummary;
  moneyBackItems: MoneyBackItem[];
  moneyBackTotalCad: number;
  summary: RulesSummary;
  danaLedger: DanaLedgerSummary;
  marcoShipments: MarcoShipmentsSummary;
  helenCloseRoom: HelenCloseRoomSummary;
}

const SIZE_SCREEN_THRESHOLD_CAD = 250_000;

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Formats an amount in Canadian dollars with commas (e.g., "$402,280" or "-$2,700").
 */
export function formatCad(amount: number, showSign = false): string {
  const rounded = roundCents(amount);
  const abs = Math.abs(rounded);
  const hasCents = Math.abs(abs - Math.round(abs)) > 0.001;
  const formatted = abs.toLocaleString('en-CA', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });

  if (rounded < 0) {
    return `-$${formatted}`;
  }
  if (showSign && rounded > 0) {
    return `+$${formatted}`;
  }
  return `$${formatted}`;
}

/**
 * Normalizes an invoice number by stripping a trailing "-A" style alphabetic suffix
 * (e.g., "INV-88213-A" -> "INV-88213") while preserving numeric period suffixes
 * such as "RENT-2026-07".
 */
export function normalizeInvoiceForDuplicateCheck(invoiceNo: string): string {
  return invoiceNo.trim().replace(/-[A-Za-z]$/, '').toUpperCase();
}

/**
 * Matches evidence_q3 rows where any semicolon-separated token in linked_ref matches
 * entry_id, invoice_no, vendor_id, gl_account, po_ref, shipment_ref, or extraRefs.
 */
export function matchEvidence(
  ledgerRows: LedgerRow[],
  customsRows: CustomsRow[],
  evidence: EvidenceRow[],
  extraRefs: string[] = [],
): EvidenceRow[] {
  const refSet = new Set<string>();

  const addRef = (value: string | undefined) => {
    const trimmed = (value ?? '').trim();
    if (trimmed) {
      refSet.add(trimmed.toUpperCase());
    }
  };

  for (const row of ledgerRows) {
    addRef(row.entry_id);
    addRef(row.invoice_no);
    addRef(row.vendor_id);
    addRef(row.gl_account);
    addRef(row.po_ref);
    addRef(row.shipment_ref);
  }

  for (const row of customsRows) {
    addRef(row.entry_id);
  }

  for (const ref of extraRefs) {
    addRef(ref);
  }

  if (refSet.size === 0) return [];

  const matched: EvidenceRow[] = [];
  const seenIds = new Set<string>();

  for (const ev of evidence) {
    const tokens = ev.linked_ref
      .split(';')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    if (tokens.some((token) => refSet.has(token))) {
      if (!seenIds.has(ev.evidence_id)) {
        seenIds.add(ev.evidence_id);
        matched.push(ev);
      }
    }
  }

  return matched;
}

/**
 * Computes totals grouped by Money-Back workflow status.
 */
export function computeMoneyBackStatusTotals(
  items: MoneyBackItem[],
  statusById: Record<string, MoneyBackStatus>,
): MoneyBackStatusTotals {
  let totalCad = 0;
  let suspectedCad = 0;
  let confirmedCad = 0;
  let cashReceivedCad = 0;
  let suspectedCount = 0;
  let confirmedCount = 0;
  let cashReceivedCount = 0;

  for (const item of items) {
    const status = statusById[item.id] ?? item.defaultStatus;
    totalCad = roundCents(totalCad + item.amountCad);
    if (status === 'Cash received') {
      cashReceivedCad = roundCents(cashReceivedCad + item.amountCad);
      cashReceivedCount += 1;
    } else if (status === 'Confirmed') {
      confirmedCad = roundCents(confirmedCad + item.amountCad);
      confirmedCount += 1;
    } else {
      suspectedCad = roundCents(suspectedCad + item.amountCad);
      suspectedCount += 1;
    }
  }

  return {
    totalCad,
    suspectedCad,
    confirmedCad,
    cashReceivedCad,
    suspectedCount,
    confirmedCount,
    cashReceivedCount,
  };
}

/**
 * Main deterministic SkyTrace rules engine.
 * Implements rules (a) through (j), size-screen "Explained" exemption,
 * broker contract reconciliation, sales tax separation, and Money-Back rollups.
 */
export function runRules(dataset: SkyTraceDataset): RulesEngineResult {
  const { ledger, customs, evidence, salesTax, brokerContract } = dataset;
  const flags: AuditFlag[] = [];

  // Track ledger entry_ids that trip any non-size-screen rule so Rule 3 can determine
  // whether a size-screen row trips no other rule.
  const ledgerEntryIdsWithOtherRule = new Set<string>();

  const customsById = new Map<string, CustomsRow>();
  for (const row of customs) {
    const id = row.entry_id.trim();
    if (id) customsById.set(id.toUpperCase(), row);
  }

  const brokerLedgerByShipment = new Map<string, LedgerRow[]>();
  for (const row of ledger) {
    if (row.gl_account.trim() === '7410' && row.shipment_ref.trim()) {
      const key = row.shipment_ref.trim().toUpperCase();
      const existing = brokerLedgerByShipment.get(key) ?? [];
      existing.push(row);
      brokerLedgerByShipment.set(key, existing);
    }
  }

  // ---------------------------------------------------------------------------
  // Rule b: No approval
  // Ledger row with a blank approval_ref and source not "batch".
  // ---------------------------------------------------------------------------
  const noApprovalFlags: AuditFlag[] = [];
  for (const row of ledger) {
    const hasApproval = row.approval_ref.trim().length > 0;
    const isBatch = row.source.trim().toLowerCase() === 'batch';
    if (!hasApproval && !isBatch) {
      ledgerEntryIdsWithOtherRule.add(row.entry_id);
      noApprovalFlags.push({
        id: `NO-APR-${row.entry_id}`,
        title: `Unapproved posting: ${row.description || row.entry_id}`,
        amount: roundCents(row.amount_cad),
        ruleName: 'No approval',
        ledgerRows: [row],
        customsRows: [],
        linkedEvidence: matchEvidence([row], [], evidence),
        brokenHandoff: `${row.department || 'Requester'} to Accounts Payable (posted without approval reference)`,
        owner: 'Dana',
        status: 'Suspected',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Rule c: Near-duplicate invoice
  // Same vendor and amount, and invoice numbers equal after removing a trailing "-A" style suffix.
  // ---------------------------------------------------------------------------
  const duplicateFlags: AuditFlag[] = [];
  const invoiceGroups = new Map<string, LedgerRow[]>();
  for (const row of ledger) {
    const vendor = row.vendor_id.trim().toUpperCase();
    const invoice = row.invoice_no.trim();
    if (!vendor || !invoice) continue;
    const baseInvoice = normalizeInvoiceForDuplicateCheck(invoice);
    const key = `${vendor}|${roundCents(row.amount_cad)}|${baseInvoice}`;
    const group = invoiceGroups.get(key) ?? [];
    group.push(row);
    invoiceGroups.set(key, group);
  }

  let duplicateIndex = 1;
  for (const group of invoiceGroups.values()) {
    if (group.length >= 2) {
      for (const row of group) {
        ledgerEntryIdsWithOtherRule.add(row.entry_id);
      }
      const duplicateAmount = roundCents(group[0].amount_cad * (group.length - 1));
      const invoiceList = group.map((r) => r.invoice_no).join(' / ');
      duplicateFlags.push({
        id: `DUP-INV-${duplicateIndex++}`,
        title: `Near-duplicate invoice ${invoiceList} (${group[0].vendor_id})`,
        amount: duplicateAmount,
        ruleName: 'Near-duplicate invoice',
        ledgerRows: group,
        customsRows: [],
        linkedEvidence: matchEvidence(group, [], evidence),
        brokenHandoff: 'Receiving to Accounts Payable (second invoice suffix paid against one PO receipt)',
        owner: 'Dana',
        status: 'Suspected',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Rule d: Broker fee with no shipment
  // GL 7410 row whose shipment_ref is not an entry_id in customs_q3.
  // ---------------------------------------------------------------------------
  const brokerNoShipmentFlags: AuditFlag[] = [];
  for (const row of ledger) {
    if (row.gl_account.trim() !== '7410') continue;
    const shipmentKey = row.shipment_ref.trim().toUpperCase();
    if (!shipmentKey || !customsById.has(shipmentKey)) {
      ledgerEntryIdsWithOtherRule.add(row.entry_id);
      brokerNoShipmentFlags.push({
        id: `BRK-NOSHIP-${row.entry_id}`,
        title: `Broker fee for missing shipment ${row.shipment_ref || '(blank)'}`,
        amount: roundCents(row.amount_cad),
        ruleName: 'Broker fee with no shipment',
        ledgerRows: [row],
        customsRows: [],
        linkedEvidence: matchEvidence([row], [], evidence),
        brokenHandoff: 'Customs and Trade to Accounts Payable (broker bill paid without matching customs entry)',
        owner: 'Marco',
        status: 'Suspected',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Rule e: Broker fee against contract
  // For each customs entry, billed fee minus value times the contract rate.
  // ---------------------------------------------------------------------------
  const brokerContractFlags: AuditFlag[] = [];
  const brokerLines: BrokerContractLine[] = [];
  let billedTotalCad = 0;
  let contractTotalCad = 0;
  let overchargeTotalCad = 0;
  let overchargeCount = 0;
  let underchargeTotalCad = 0;
  const underchargeEntries: string[] = [];
  let exactCount = 0;

  for (const entry of customs) {
    const contractFeeCad = roundCents(entry.value_cad * brokerContract.fee_rate_of_goods_value);
    const billedFeeCad = roundCents(entry.broker_fee_billed);
    const varianceCad = roundCents(billedFeeCad - contractFeeCad);

    billedTotalCad = roundCents(billedTotalCad + billedFeeCad);
    contractTotalCad = roundCents(contractTotalCad + contractFeeCad);

    let lineStatus: BrokerContractLine['status'] = 'exact';
    if (varianceCad > 0) {
      lineStatus = 'overcharge';
      overchargeTotalCad = roundCents(overchargeTotalCad + varianceCad);
      overchargeCount += 1;
    } else if (varianceCad < 0) {
      lineStatus = 'undercharge';
      underchargeTotalCad = roundCents(underchargeTotalCad + Math.abs(varianceCad));
      underchargeEntries.push(entry.entry_id);
    } else {
      exactCount += 1;
    }

    brokerLines.push({
      entryId: entry.entry_id,
      route: entry.route,
      goods: entry.goods,
      valueCad: roundCents(entry.value_cad),
      contractRate: brokerContract.fee_rate_of_goods_value,
      contractFeeCad,
      billedFeeCad,
      varianceCad,
      status: lineStatus,
    });

    if (varianceCad !== 0) {
      const matchedLedgerRows = brokerLedgerByShipment.get(entry.entry_id.trim().toUpperCase()) ?? [];
      for (const lr of matchedLedgerRows) {
        ledgerEntryIdsWithOtherRule.add(lr.entry_id);
      }

      const isOvercharge = varianceCad > 0;
      brokerContractFlags.push({
        id: `BRK-RATE-${entry.entry_id}`,
        title: isOvercharge
          ? `Broker overcharge on ${entry.entry_id} (${entry.route})`
          : `Broker undercharge on ${entry.entry_id} (${entry.route})`,
        amount: varianceCad,
        ruleName: 'Broker fee against contract',
        ledgerRows: matchedLedgerRows,
        customsRows: [entry],
        linkedEvidence: matchEvidence(matchedLedgerRows, [entry], evidence, [
          brokerContract.broker_vendor_id,
        ]),
        brokenHandoff: isOvercharge
          ? 'Broker billing to Customs and Trade (billed above 0.2% contract fee schedule)'
          : 'Broker billing to Customs and Trade (billed below 0.2% contract fee schedule)',
        owner: 'Marco',
        status: 'Suspected',
        varianceDirection: isOvercharge ? 'overcharge' : 'undercharge',
      });
    }
  }

  const brokerReconciliation: BrokerReconciliationSummary = {
    contractRate: brokerContract.fee_rate_of_goods_value,
    brokerVendorId: brokerContract.broker_vendor_id,
    billedTotalCad,
    contractTotalCad,
    overchargeTotalCad,
    overchargeCount,
    underchargeTotalCad,
    underchargeEntries,
    netVarianceCad: roundCents(billedTotalCad - contractTotalCad),
    exactCount,
    totalEntries: customs.length,
    entries: brokerLines,
  };

  // ---------------------------------------------------------------------------
  // Rule f: Wrong account pattern
  // Rows where vendor_type is "carrier" but gl_account is not 6600. Group into one trend flag.
  // ---------------------------------------------------------------------------
  const wrongAccountRows = ledger.filter(
    (row) =>
      row.vendor_type.trim().toLowerCase() === 'carrier' &&
      row.gl_account.trim() !== '6600',
  );
  const wrongAccountFlags: AuditFlag[] = [];
  if (wrongAccountRows.length > 0) {
    let totalWrongAccount = 0;
    for (const row of wrongAccountRows) {
      ledgerEntryIdsWithOtherRule.add(row.entry_id);
      totalWrongAccount = roundCents(totalWrongAccount + row.amount_cad);
    }
    wrongAccountFlags.push({
      id: 'TREND-WRONG-ACCT-CARRIER',
      title: `Carrier invoices coded outside GL 6600 (${wrongAccountRows.length} postings)`,
      amount: totalWrongAccount,
      ruleName: 'Wrong account pattern',
      ledgerRows: wrongAccountRows,
      customsRows: [],
      linkedEvidence: matchEvidence(wrongAccountRows, [], evidence, ['6600']),
      brokenHandoff: 'Logistics to Finance (carrier rush freight coded to SG&A instead of 6600 Freight out)',
      owner: 'Dana',
      status: 'Suspected',
      isTrend: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Rule g: Suspense not cleared
  // Rows in GL 2890, grouped into one trend flag.
  // ---------------------------------------------------------------------------
  const suspenseRows = ledger.filter((row) => row.gl_account.trim() === '2890');
  const suspenseFlags: AuditFlag[] = [];
  if (suspenseRows.length > 0) {
    let totalSuspense = 0;
    for (const row of suspenseRows) {
      ledgerEntryIdsWithOtherRule.add(row.entry_id);
      totalSuspense = roundCents(totalSuspense + row.amount_cad);
    }
    suspenseFlags.push({
      id: 'TREND-SUSPENSE-2890',
      title: `Uncleared GL 2890 Suspense balance (${suspenseRows.length} batch imports)`,
      amount: totalSuspense,
      ruleName: 'Suspense not cleared',
      ledgerRows: suspenseRows,
      customsRows: [],
      linkedEvidence: matchEvidence(suspenseRows, [], evidence),
      brokenHandoff: 'Plant 2 ERP import to Corporate Close (unmapped cost-centre batch left in suspense)',
      owner: 'Helen',
      status: 'Suspected',
      isTrend: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Rule h: Accrual not reversed
  // Manual rows whose description contains "accrual" and whose reversal_ref is blank.
  // ---------------------------------------------------------------------------
  const accrualFlags: AuditFlag[] = [];
  for (const row of ledger) {
    const isManual = row.source.trim().toLowerCase() === 'manual';
    const mentionsAccrual = row.description.toLowerCase().includes('accrual');
    const blankReversal = row.reversal_ref.trim() === '';
    if (isManual && mentionsAccrual && blankReversal) {
      ledgerEntryIdsWithOtherRule.add(row.entry_id);
      accrualFlags.push({
        id: `ACCR-NOREV-${row.entry_id}`,
        title: `Manual accrual not reversed: ${row.entry_id}`,
        amount: roundCents(row.amount_cad),
        ruleName: 'Accrual not reversed',
        ledgerRows: [row],
        customsRows: [],
        linkedEvidence: matchEvidence([row], [], evidence),
        brokenHandoff: 'Corporate Finance Q2 close to Q3 close (manual accrual template missing auto-reversal)',
        owner: 'Helen',
        status: 'Suspected',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Rule i: Trade agreement not claimed
  // Customs entry with origin_cert_on_file "yes" and agreement_claimed "no".
  // ---------------------------------------------------------------------------
  const tradeAgreementFlags: AuditFlag[] = [];
  for (const entry of customs) {
    const hasCert = entry.origin_cert_on_file.trim().toLowerCase() === 'yes';
    const notClaimed = entry.agreement_claimed.trim().toLowerCase() === 'no';
    if (hasCert && notClaimed) {
      const agreement = entry.agreement_available.trim() || 'Trade agreement';
      tradeAgreementFlags.push({
        id: `TRADE-UNCLAIMED-${entry.entry_id}`,
        title: `${agreement} not claimed on ${entry.entry_id} (${entry.goods})`,
        amount: roundCents(entry.duty_and_tariff_paid),
        ruleName: 'Trade agreement not claimed',
        ledgerRows: [],
        customsRows: [entry],
        linkedEvidence: matchEvidence([], [entry], evidence),
        brokenHandoff: 'Supplier / Trade Compliance to Customs Broker (origin certificate on file not presented at entry)',
        owner: 'Marco',
        status: 'Suspected',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Rule j: Sales tax in the duty report
  // Total of sales_tax_q3.sales_tax_cad, reported separately from customs cost.
  // ---------------------------------------------------------------------------
  let totalSalesTaxCad = 0;
  let totalSalesCad = 0;
  let totalFreightCad = 0;
  for (const row of salesTax) {
    totalSalesTaxCad = roundCents(totalSalesTaxCad + row.sales_tax_cad);
    totalSalesCad = roundCents(totalSalesCad + row.sales_cad);
    totalFreightCad = roundCents(totalFreightCad + row.freight_cad);
  }

  let customsDutyAndTariffCad = 0;
  for (const entry of customs) {
    customsDutyAndTariffCad = roundCents(customsDutyAndTariffCad + entry.duty_and_tariff_paid);
  }
  const customsTotalCostCad = roundCents(customsDutyAndTariffCad + billedTotalCad);

  const salesTaxSummary: SalesTaxSummary = {
    totalSalesTaxCad,
    totalSalesCad,
    totalFreightCad,
    destinationCount: salesTax.length,
    customsDutyAndTariffCad,
    customsBrokerFeesCad: billedTotalCad,
    customsTotalCostCad,
  };

  const salesTaxFlags: AuditFlag[] = [];
  if (totalSalesTaxCad > 0) {
    salesTaxFlags.push({
      id: 'SALESTAX-SEPARATE-Q3',
      title: `Domestic sales tax reported separately from customs cost (${salesTax.length} provinces)`,
      amount: totalSalesTaxCad,
      ruleName: 'Sales tax in the duty report',
      ledgerRows: [],
      customsRows: [],
      linkedEvidence: [],
      brokenHandoff: 'Domestic Sales Tax reporting to Customs and Duty reporting (must remain segregated from import duty)',
      owner: 'Helen',
      status: 'Suspected',
      isTrend: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Rule a: Size screen (+ Rule 3 "Explained" exemption)
  // Any single ledger row of 250,000 or more.
  // A row that trips the size screen but has an approval, a PO, matching evidence,
  // and trips no other rule gets status "Explained", not "Suspected".
  // ---------------------------------------------------------------------------
  const sizeScreenFlags: AuditFlag[] = [];
  for (const row of ledger) {
    if (row.amount_cad >= SIZE_SCREEN_THRESHOLD_CAD) {
      const linkedEvidence = matchEvidence([row], [], evidence);
      const hasApproval = row.approval_ref.trim().length > 0;
      const hasPo = row.po_ref.trim().length > 0;
      const hasEvidence = linkedEvidence.length > 0;
      const tripsNoOtherRule = !ledgerEntryIdsWithOtherRule.has(row.entry_id);

      const isExplained = hasApproval && hasPo && hasEvidence && tripsNoOtherRule;
      const owner: RoleOwner = row.plant === 'Plant 2' || row.source === 'AP' ? 'Dana' : 'Helen';

      sizeScreenFlags.push({
        id: `SIZE-${row.entry_id}`,
        title: `${row.entry_id}: ${row.description || row.gl_name}`,
        amount: roundCents(row.amount_cad),
        ruleName: 'Size screen',
        ledgerRows: [row],
        customsRows: [],
        linkedEvidence,
        brokenHandoff: isExplained
          ? 'No broken handoff — approval, PO, and receiving evidence complete'
          : !hasPo && row.source === 'manual'
            ? `${row.plant} Operations to Finance (large manual posting requires full paper-trail review)`
            : 'Procurement to Accounts Payable (flagged by another control rule)',
        owner,
        status: isExplained ? 'Explained' : 'Suspected',
      });
    }
  }

  // Combine all flags in clear rule order (a through j)
  flags.push(
    ...sizeScreenFlags,
    ...noApprovalFlags,
    ...duplicateFlags,
    ...brokerNoShipmentFlags,
    ...brokerContractFlags,
    ...wrongAccountFlags,
    ...suspenseFlags,
    ...accrualFlags,
    ...tradeAgreementFlags,
    ...salesTaxFlags,
  );

  // ---------------------------------------------------------------------------
  // Money-Back Panel Items (strictly calculated from rule outputs)
  // ---------------------------------------------------------------------------
  const duplicateInvoiceTotal = roundCents(
    duplicateFlags.reduce((sum, f) => sum + f.amount, 0),
  );
  const brokerNoShipmentTotal = roundCents(
    brokerNoShipmentFlags.reduce((sum, f) => sum + f.amount, 0),
  );
  const cusmaDutyPaidTotal = roundCents(
    tradeAgreementFlags.reduce((sum, f) => sum + f.amount, 0),
  );
  const brokerOverchargeTotal = brokerReconciliation.overchargeTotalCad;

  const duplicateDetail =
    duplicateFlags.length > 0
      ? duplicateFlags
          .map((f) => f.ledgerRows.map((r) => r.invoice_no).join(' & '))
          .join('; ')
      : 'No near-duplicate invoices found';

  const brokerNoShipDetail =
    brokerNoShipmentFlags.length > 0
      ? brokerNoShipmentFlags
          .map((f) => `${f.ledgerRows[0]?.entry_id ?? ''} (${f.ledgerRows[0]?.shipment_ref || 'blank'})`)
          .join(', ')
      : 'All broker bills match customs entries';

  const cusmaDetail =
    tradeAgreementFlags.length > 0
      ? tradeAgreementFlags
          .map((f) => `${f.customsRows[0]?.entry_id ?? ''} · ${f.customsRows[0]?.goods ?? ''}`)
          .join(', ')
      : 'No unclaimed certificates on file';

  const overchargeDetail =
    brokerReconciliation.overchargeCount > 0
      ? `${brokerReconciliation.overchargeCount} of ${brokerReconciliation.totalEntries} entries above ${(brokerReconciliation.contractRate * 100).toFixed(1)}% rate`
      : 'No entries billed above contract rate';

  const moneyBackItems: MoneyBackItem[] = [
    {
      id: 'duplicate-invoice',
      label: 'Duplicate invoice',
      detail: duplicateDetail,
      amountCad: duplicateInvoiceTotal,
      owner: 'Dana',
      ruleName: 'Near-duplicate invoice',
      defaultStatus: 'Suspected',
      flagIds: duplicateFlags.map((f) => f.id),
    },
    {
      id: 'broker-no-shipment',
      label: 'Broker fee with no shipment',
      detail: brokerNoShipDetail,
      amountCad: brokerNoShipmentTotal,
      owner: 'Marco',
      ruleName: 'Broker fee with no shipment',
      defaultStatus: 'Suspected',
      flagIds: brokerNoShipmentFlags.map((f) => f.id),
    },
    {
      id: 'cusma-duty-paid',
      label: 'Duty paid with a CUSMA certificate on file',
      detail: cusmaDetail,
      amountCad: cusmaDutyPaidTotal,
      owner: 'Marco',
      ruleName: 'Trade agreement not claimed',
      defaultStatus: 'Suspected',
      flagIds: tradeAgreementFlags.map((f) => f.id),
    },
    {
      id: 'broker-overcharges',
      label: 'Broker overcharges above contract',
      detail: overchargeDetail,
      amountCad: brokerOverchargeTotal,
      owner: 'Marco',
      ruleName: 'Broker fee against contract',
      defaultStatus: 'Suspected',
      flagIds: brokerContractFlags
        .filter((f) => f.varianceDirection === 'overcharge')
        .map((f) => f.id),
    },
  ];

  const moneyBackTotalCad = roundCents(
    moneyBackItems.reduce((sum, item) => sum + item.amountCad, 0),
  );

  const flagsByOwner: Record<RoleOwner, number> = {
    Dana: 0,
    Marco: 0,
    Helen: 0,
  };
  let suspectedFlags = 0;
  let explainedFlags = 0;

  for (const flag of flags) {
    flagsByOwner[flag.owner] += 1;
    if (flag.status === 'Explained') {
      explainedFlags += 1;
    } else {
      suspectedFlags += 1;
    }
  }

  const summary: RulesSummary = {
    totalFlags: flags.length,
    suspectedFlags,
    explainedFlags,
    ledgerRowCount: ledger.length,
    customsRowCount: customs.length,
    evidenceRowCount: evidence.length,
    flagsByOwner,
  };

  const danaLedger = buildDanaLedgerSummary(flags, dataset);
  const marcoShipments = buildMarcoShipmentsSummary(dataset);
  const helenCloseRoom = buildHelenCloseRoomSummary(
    dataset,
    danaLedger,
    brokerReconciliation,
  );

  return {
    flags,
    brokerReconciliation,
    salesTaxSummary,
    moneyBackItems,
    moneyBackTotalCad,
    summary,
    danaLedger,
    marcoShipments,
    helenCloseRoom,
  };
}

const LEDGER_PROBLEM_RULES = new Set<RuleName>([
  'Size screen',
  'No approval',
  'Near-duplicate invoice',
  'Broker fee with no shipment',
  'Wrong account pattern',
  'Suspense not cleared',
  'Accrual not reversed',
]);

const WHY_EVIDENCE_TYPES = new Set([
  'Quality report',
  'Logistics note',
  'Goods receipt',
  'Budget',
  'Shipment register',
  'Purchase order',
  'Origin certificate',
]);

const HOW_EVIDENCE_TYPES = new Set([
  'Posting log',
  'Chart of accounts',
  'Payment record',
  'Import log',
  'Close template',
  'Broker contract',
]);

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const trimmed = v.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      out.push(trimmed);
    }
  }
  return out;
}

function splitEvidenceSentences(summary: string): string[] {
  return summary
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function deriveWhyAndHowFromEvidence(linkedEvidence: EvidenceRow[]): {
  why: string;
  howItReachedBooks: string;
} {
  if (linkedEvidence.length === 0) {
    return {
      why: 'Cause unresolved: no evidence linked',
      howItReachedBooks: 'Cause unresolved: no evidence linked',
    };
  }

  const whyRows = linkedEvidence.filter((e) => WHY_EVIDENCE_TYPES.has(e.type.trim()));
  const howRows = linkedEvidence.filter((e) => HOW_EVIDENCE_TYPES.has(e.type.trim()));

  const formatRow = (e: EvidenceRow) => `${e.evidence_id}: ${e.summary}`;

  if (whyRows.length > 0 && howRows.length > 0) {
    return {
      why: whyRows.map(formatRow).join(' '),
      howItReachedBooks: howRows.map(formatRow).join(' '),
    };
  }

  // All linked evidence is in a single category (e.g. EV-008, EV-009, EV-010, EV-014):
  // split verbatim sentences across Why and How without inventing any text.
  const combined = linkedEvidence.flatMap((e) =>
    splitEvidenceSentences(e.summary).map((sentence) => ({
      evidenceId: e.evidence_id,
      sentence,
    })),
  );

  if (combined.length >= 2) {
    const first = combined[0];
    const rest = combined.slice(1);
    const restByEvidence = rest
      .map((item, idx) =>
        idx === 0 || item.evidenceId !== rest[idx - 1].evidenceId
          ? `${item.evidenceId}: ${item.sentence}`
          : item.sentence,
      )
      .join(' ');
    return {
      why: `${first.evidenceId}: ${first.sentence}`,
      howItReachedBooks: restByEvidence,
    };
  }

  const singleText = linkedEvidence.map(formatRow).join(' ');
  return {
    why: singleText,
    howItReachedBooks: singleText,
  };
}

function buildPaperTrail(
  ledgerRows: LedgerRow[],
  ruleNames: RuleName[],
  linkedEvidence: EvidenceRow[],
  isExplained: boolean,
): [PaperTrailBox, PaperTrailBox, PaperTrailBox, PaperTrailBox] {
  const ruleSet = new Set(ruleNames);
  const firstRow = ledgerRows[0];
  const approvals = uniqueNonEmpty(ledgerRows.map((r) => r.approval_ref));
  const invoices = uniqueNonEmpty(ledgerRows.map((r) => r.invoice_no));
  const pos = uniqueNonEmpty(ledgerRows.map((r) => r.po_ref));
  const vendors = uniqueNonEmpty(ledgerRows.map((r) => r.vendor_id));
  const gls = uniqueNonEmpty(ledgerRows.map((r) => `${r.gl_account} ${r.gl_name}`));

  // 1. Approval box
  let approvalBox: PaperTrailBox;
  if (ruleSet.has('No approval')) {
    const budgetEv = linkedEvidence.find((e) => e.type.toLowerCase().includes('budget'));
    approvalBox = {
      stage: 'Approval',
      ok: false,
      detail: budgetEv
        ? `Approval reference blank (${budgetEv.evidence_id}: not in budget)`
        : 'Approval reference blank on non-batch posting',
    };
  } else if (approvals.length === 0) {
    approvalBox = {
      stage: 'Approval',
      ok: false,
      detail:
        firstRow?.source.toLowerCase() === 'batch'
          ? 'No approval reference (unmapped batch import)'
          : 'Approval reference missing',
    };
  } else if (approvals.length === 1) {
    approvalBox = {
      stage: 'Approval',
      ok: true,
      detail: `${approvals[0]} recorded`,
    };
  } else {
    approvalBox = {
      stage: 'Approval',
      ok: true,
      detail: `${approvals[0]} to ${approvals[approvals.length - 1]} (${approvals.length} refs)`,
    };
  }

  // 2. Real event box
  let realEventBox: PaperTrailBox;
  if (isExplained) {
    const ev = linkedEvidence[0];
    realEventBox = {
      stage: 'Real event',
      ok: true,
      detail: ev ? `${ev.evidence_id}: ${ev.type} confirms receipt` : 'PO and receipt confirmed',
    };
  } else if (ruleSet.has('Broker fee with no shipment')) {
    const shipRef = firstRow?.shipment_ref || '(blank)';
    realEventBox = {
      stage: 'Real event',
      ok: false,
      detail: `No shipment ${shipRef} in customs_q3 or ERP`,
    };
  } else if (ruleSet.has('Accrual not reversed')) {
    realEventBox = {
      stage: 'Real event',
      ok: false,
      detail: 'No Q3 event — Q2 warranty accrual carried forward',
    };
  } else if (ruleSet.has('Suspense not cleared')) {
    realEventBox = {
      stage: 'Real event',
      ok: false,
      detail: 'Cost-centre codes unmapped from new plant report',
    };
  } else if (ruleSet.has('No approval')) {
    realEventBox = {
      stage: 'Real event',
      ok: false,
      detail: 'No purchase order or approved project on file',
    };
  } else if (ruleSet.has('Near-duplicate invoice')) {
    const receiptEv = linkedEvidence.find((e) => e.type.toLowerCase().includes('goods receipt'));
    realEventBox = {
      stage: 'Real event',
      ok: true,
      detail: receiptEv
        ? `${receiptEv.evidence_id}: one delivery received (${pos[0] || 'PO'})`
        : 'Single delivery received against PO',
    };
  } else if (ruleSet.has('Wrong account pattern')) {
    const logEv = linkedEvidence.find((e) => e.type.toLowerCase().includes('logistics'));
    realEventBox = {
      stage: 'Real event',
      ok: true,
      detail: logEv
        ? `${logEv.evidence_id}: late rush trucks booked, weeks 30–35`
        : `${ledgerRows.length} carrier shipments recorded`,
    };
  } else {
    const qualityEv = linkedEvidence.find((e) => e.type.toLowerCase().includes('quality'));
    if (qualityEv) {
      realEventBox = {
        stage: 'Real event',
        ok: true,
        detail: `${qualityEv.evidence_id}: weld inspection failed, batch scrapped`,
      };
    } else if (linkedEvidence.length > 0) {
      realEventBox = {
        stage: 'Real event',
        ok: true,
        detail: `${linkedEvidence[0].evidence_id}: ${linkedEvidence[0].type} on file`,
      };
    } else {
      realEventBox = {
        stage: 'Real event',
        ok: false,
        detail: 'No operational event evidence linked',
      };
    }
  }

  // 3. Outside bill box
  let outsideBillBox: PaperTrailBox;
  if (isExplained) {
    outsideBillBox = {
      stage: 'Outside bill',
      ok: true,
      detail: `${invoices[0] || 'Invoice'} from ${vendors[0] || 'supplier'} (${pos[0] || 'PO'})`,
    };
  } else if (ruleSet.has('Near-duplicate invoice')) {
    outsideBillBox = {
      stage: 'Outside bill',
      ok: false,
      detail: `${invoices.join(' & ')} — duplicate bill against one receipt`,
    };
  } else if (ruleSet.has('Broker fee with no shipment')) {
    outsideBillBox = {
      stage: 'Outside bill',
      ok: false,
      detail: `${invoices[0] || 'Broker invoice'} billed with no matching customs entry`,
    };
  } else if (invoices.length > 0) {
    outsideBillBox = {
      stage: 'Outside bill',
      ok: true,
      detail:
        invoices.length === 1
          ? `Invoice ${invoices[0]} from ${vendors[0] || 'vendor'}`
          : `${invoices.length} invoices (${invoices[0]} to ${invoices[invoices.length - 1]})`,
    };
  } else {
    outsideBillBox = {
      stage: 'Outside bill',
      ok: false,
      detail:
        firstRow?.source.toLowerCase() === 'manual'
          ? 'No PO or outside vendor bill (manual journal)'
          : 'No vendor invoice or PO linked',
    };
  }

  // 4. Ledger line box
  let ledgerLineBox: PaperTrailBox;
  if (isExplained) {
    ledgerLineBox = {
      stage: 'Ledger line',
      ok: true,
      detail: `${firstRow?.entry_id ?? ''} posted to GL ${gls[0] ?? ''}`,
    };
  } else if (ruleSet.has('Wrong account pattern')) {
    ledgerLineBox = {
      stage: 'Ledger line',
      ok: false,
      detail: `${ledgerRows.length} rows posted to GL ${firstRow?.gl_account} instead of 6600`,
    };
  } else if (ruleSet.has('Suspense not cleared')) {
    ledgerLineBox = {
      stage: 'Ledger line',
      ok: false,
      detail: `${ledgerRows.length} batch imports uncleared in GL 2890 Suspense`,
    };
  } else if (ruleSet.has('Accrual not reversed')) {
    ledgerLineBox = {
      stage: 'Ledger line',
      ok: false,
      detail: `${firstRow?.entry_id}: manual accrual with blank reversal_ref`,
    };
  } else if (ruleSet.has('Near-duplicate invoice')) {
    ledgerLineBox = {
      stage: 'Ledger line',
      ok: false,
      detail: `${ledgerRows.map((r) => r.entry_id).join(' & ')} posted twice to GL ${firstRow?.gl_account}`,
    };
  } else if (ruleSet.has('Broker fee with no shipment')) {
    ledgerLineBox = {
      stage: 'Ledger line',
      ok: false,
      detail: `${firstRow?.entry_id} posted to GL 7410 for missing shipment ${firstRow?.shipment_ref}`,
    };
  } else if (ruleSet.has('No approval')) {
    ledgerLineBox = {
      stage: 'Ledger line',
      ok: true,
      detail: `${firstRow?.entry_id} posted to GL ${gls[0] ?? ''}`,
    };
  } else {
    const postingEv = linkedEvidence.find((e) => e.type.toLowerCase().includes('posting log'));
    if (postingEv) {
      ledgerLineBox = {
        stage: 'Ledger line',
        ok: false,
        detail: `${postingEv.evidence_id}: posted 18:42 by unusual preparer ${firstRow?.preparer ?? ''}`,
      };
    } else {
      ledgerLineBox = {
        stage: 'Ledger line',
        ok: false,
        detail: `${firstRow?.entry_id ?? 'Entry'} exceeds $250,000 without PO support`,
      };
    }
  }

  return [approvalBox, realEventBox, outsideBillBox, ledgerLineBox];
}

function deriveOperatingEarningsEffect(
  ledgerRows: LedgerRow[],
  amountCad: number,
  ruleNames: RuleName[],
  dataset: SkyTraceDataset,
  isExplained: boolean,
): string {
  const firstRow = ledgerRows[0];
  const gl = firstRow?.gl_account.trim() ?? '';
  const ruleSet = new Set(ruleNames);

  if (gl.startsWith('2')) {
    return `$0 currently in Q3 operating earnings (sits in balance sheet GL ${gl} Suspense; up to ${formatCad(amountCad)} of unallocated Plant 2 costs could reduce operating earnings once mapped)`;
  }

  if (isExplained) {
    return `Reduces Q3 operating earnings by ${formatCad(amountCad)} (normal materials cost in GL ${gl}, backed by PO and goods receipt)`;
  }

  // Check if oe_walk.csv explicitly calls out this item
  const yoyWalk = dataset.oeWalk.filter((w) => w.walk === 'yoy');
  if (gl === '6410' && amountCad === 900_000) {
    const scrapWalk = yoyWalk.find((w) => w.step.toLowerCase().includes('scrap'));
    if (scrapWalk) {
      return `Reduces Q3 operating earnings by ${formatCad(amountCad)} (recorded in YoY OE walk as "${scrapWalk.step}": ${formatCad(scrapWalk.amount_000s * 1000)})`;
    }
  }

  if (ruleSet.has('Wrong account pattern')) {
    const freightWalk = yoyWalk.find((w) => w.step.toLowerCase().includes('rush freight'));
    if (freightWalk) {
      return `Reduces Q3 operating earnings by ${formatCad(amountCad)} and distorts SG&A vs. Freight out (recorded in YoY OE walk as "${freightWalk.step}": ${formatCad(freightWalk.amount_000s * 1000)})`;
    }
    return `Reduces Q3 operating earnings by ${formatCad(amountCad)} (misclassified in GL ${gl} instead of 6600 Freight out)`;
  }

  if (ruleSet.has('Near-duplicate invoice')) {
    return `Overstates Q3 materials cost and reduces operating earnings by ${formatCad(amountCad)} (recoverable duplicate payment)`;
  }

  if (ruleSet.has('Accrual not reversed')) {
    return `Overstates Q3 warranty expense and reduces operating earnings by ${formatCad(amountCad)} (unreversed Q2 accrual)`;
  }

  if (ruleSet.has('Broker fee with no shipment')) {
    return `Reduces Q3 operating earnings by ${formatCad(amountCad)} (unmatched broker charge in GL 7410)`;
  }

  return `Reduces Q3 operating earnings by ${formatCad(amountCad)} (posted to GL ${gl} ${firstRow?.gl_name ?? ''})`;
}

function buildProblemTitleAndSubtitle(
  ledgerRows: LedgerRow[],
  ruleNames: RuleName[],
  isExplained: boolean,
): { title: string; subtitle: string } {
  const firstRow = ledgerRows[0];
  const ruleSet = new Set(ruleNames);

  if (isExplained) {
    return {
      title: firstRow?.description || firstRow?.gl_name || firstRow?.entry_id || 'Explained entry',
      subtitle: `${firstRow?.entry_id ?? ''} · ${firstRow?.po_ref || firstRow?.invoice_no || ''}`,
    };
  }

  if (ruleSet.has('Near-duplicate invoice')) {
    const invoices = uniqueNonEmpty(ledgerRows.map((r) => r.invoice_no)).join(' & ');
    return {
      title: 'Duplicate invoice',
      subtitle: `${invoices} · ${firstRow?.vendor_id ?? ''}`,
    };
  }

  if (ruleSet.has('Wrong account pattern')) {
    const isRush = ledgerRows.some((r) => r.description.toLowerCase().includes('rush'));
    return {
      title: isRush ? 'Rush freight' : 'Carrier invoices in wrong account',
      subtitle: `${ledgerRows.length} invoices · GL ${firstRow?.gl_account ?? ''} instead of 6600`,
    };
  }

  if (ruleSet.has('Suspense not cleared')) {
    return {
      title: 'Suspense balance',
      subtitle: `${ledgerRows.length} batch imports · GL 2890`,
    };
  }

  if (ruleSet.has('Accrual not reversed')) {
    const isWarranty = (firstRow?.gl_name ?? '').toLowerCase().includes('warranty');
    return {
      title: isWarranty ? 'Warranty accrual' : 'Unreversed accrual',
      subtitle: `${firstRow?.entry_id ?? ''} · GL ${firstRow?.gl_account ?? ''}`,
    };
  }

  if (ruleSet.has('No approval')) {
    const isConsultant = (firstRow?.vendor_type ?? '').toLowerCase() === 'consultant';
    return {
      title: isConsultant ? 'Consultant with no approval' : 'Posting with no approval',
      subtitle: `${firstRow?.entry_id ?? ''} · ${firstRow?.vendor_id || firstRow?.gl_name || ''}`,
    };
  }

  if (ruleSet.has('Broker fee with no shipment')) {
    return {
      title: 'Broker fee with no shipment',
      subtitle: `${firstRow?.entry_id ?? ''} · shipment ${firstRow?.shipment_ref || '(blank)'}`,
    };
  }

  if ((firstRow?.gl_account ?? '') === '6410' || (firstRow?.description ?? '').toLowerCase().includes('scrap')) {
    return {
      title: 'Scrap write-off',
      subtitle: `${firstRow?.entry_id ?? ''} · ${firstRow?.plant ?? ''}`,
    };
  }

  return {
    title: firstRow?.description || firstRow?.gl_name || firstRow?.entry_id || 'Ledger exception',
    subtitle: `${firstRow?.entry_id ?? ''} · GL ${firstRow?.gl_account ?? ''}`,
  };
}

function buildSingleDanaProblem(
  clusterFlags: AuditFlag[],
  dataset: SkyTraceDataset,
  isExplained: boolean,
): DanaLedgerProblem {
  // Deduplicate ledger rows preserving original ledger order
  const rowMap = new Map<string, LedgerRow>();
  for (const flag of clusterFlags) {
    for (const row of flag.ledgerRows) {
      if (!rowMap.has(row.entry_id)) {
        rowMap.set(row.entry_id, row);
      }
    }
  }
  const ledgerRows = Array.from(rowMap.values());

  // Deduplicate rule names preserving stable order
  const ruleNames: RuleName[] = [];
  for (const flag of clusterFlags) {
    if (!ruleNames.includes(flag.ruleName)) {
      ruleNames.push(flag.ruleName);
    }
  }

  // Deduplicate linked evidence rows preserving evidence_id order
  const evMap = new Map<string, EvidenceRow>();
  for (const flag of clusterFlags) {
    for (const ev of flag.linkedEvidence) {
      if (!evMap.has(ev.evidence_id)) {
        evMap.set(ev.evidence_id, ev);
      }
    }
  }
  const linkedEvidence = Array.from(evMap.values()).sort((a, b) =>
    a.evidence_id.localeCompare(b.evidence_id),
  );

  // Amount calculation:
  // If near-duplicate invoice is present, exposure is the duplicate invoice flag amount (e.g. $265,000).
  // Otherwise, sum the unique ledger rows in the merged problem.
  const duplicateFlag = clusterFlags.find((f) => f.ruleName === 'Near-duplicate invoice');
  const amountCad = duplicateFlag
    ? duplicateFlag.amount
    : roundCents(ledgerRows.reduce((sum, r) => sum + r.amount_cad, 0));

  const isTrend = clusterFlags.some((f) => f.isTrend);
  const pattern: 'One-time' | 'Trend' = isTrend ? 'Trend' : 'One-time';
  const patternDetail = isTrend
    ? ruleNames.includes('Suspense not cleared')
      ? `Trend · ${ledgerRows.length} imports`
      : `Trend · ${ledgerRows.length} invoices`
    : 'One-time';

  const { title, subtitle } = buildProblemTitleAndSubtitle(ledgerRows, ruleNames, isExplained);
  const { why, howItReachedBooks } = deriveWhyAndHowFromEvidence(linkedEvidence);
  const paperTrail = buildPaperTrail(ledgerRows, ruleNames, linkedEvidence, isExplained);

  const preparers = uniqueNonEmpty(ledgerRows.map((r) => r.preparer));
  const vendors = uniqueNonEmpty(
    ledgerRows.map((r) =>
      r.vendor_id ? `${r.vendor_id}${r.vendor_type ? ` (${r.vendor_type})` : ''}` : '',
    ),
  );
  const sources = uniqueNonEmpty(ledgerRows.map((r) => r.source));

  const whoParts = [`Preparer: ${preparers.join(', ') || 'Unknown'}`];
  if (vendors.length > 0) {
    whoParts.push(`Vendor: ${vendors.join(', ')}`);
  }
  if (sources.length > 0) {
    whoParts.push(`Source: ${sources.join(', ')}`);
  }

  const descriptions = uniqueNonEmpty(ledgerRows.map((r) => r.description));
  const entryIds = ledgerRows.map((r) => r.entry_id);
  const whatText =
    ledgerRows.length === 1
      ? `${descriptions[0] || ledgerRows[0].gl_name} (${entryIds[0]})`
      : `${descriptions.length === 1 ? descriptions[0] : `${ledgerRows.length} postings`} (${entryIds[0]} to ${entryIds[entryIds.length - 1]})`;

  const dates = uniqueNonEmpty(ledgerRows.map((r) => r.post_date)).sort();
  const periods = Array.from(new Set(ledgerRows.map((r) => r.period))).sort((a, b) => a - b);
  const dateDisplay =
    dates.length <= 1 ? (dates[0] ?? 'Unknown') : `${dates[0]} to ${dates[dates.length - 1]}`;
  const periodDisplay =
    periods.length === 1
      ? `Period ${periods[0]}`
      : `Periods ${periods[0]}–${periods[periods.length - 1]}`;

  const plants = uniqueNonEmpty(ledgerRows.map((r) => r.plant));
  const departments = uniqueNonEmpty(ledgerRows.map((r) => r.department));
  const regions = uniqueNonEmpty(ledgerRows.map((r) => r.region));
  const glAccounts = uniqueNonEmpty(ledgerRows.map((r) => `${r.gl_account} — ${r.gl_name}`));
  const costCentres = uniqueNonEmpty(ledgerRows.map((r) => r.cost_centre));

  // A problem counts for the 250K screen if any single row is >= 250,000
  // or has no approval reference (non-batch, matching Rule b).
  const caughtBy250kScreen = ledgerRows.some(
    (row) =>
      row.amount_cad >= SIZE_SCREEN_THRESHOLD_CAD ||
      (row.approval_ref.trim() === '' && row.source.trim().toLowerCase() !== 'batch'),
  );

  const stableId = isExplained
    ? `EXPLAINED-${entryIds.join('-')}`
    : `PROB-${entryIds[0]}`;

  return {
    id: stableId,
    title,
    subtitle,
    amountCad,
    ruleNames,
    pattern,
    patternDetail,
    defaultStatus: isExplained ? 'Explained' : 'Suspected',
    ledgerRows,
    linkedEvidence,
    story: {
      who: whoParts.join(' · '),
      what: whatText,
      where: {
        plant: plants.join(', ') || '—',
        department: departments.join(', ') || '—',
        region: regions.join(', ') || '—',
        glAccount: glAccounts.join(', ') || '—',
        costCentre: costCentres.join(', ') || '—',
      },
      when: `${dateDisplay} (${periodDisplay})`,
      why,
      howItReachedBooks,
      effectOnOperatingEarnings: deriveOperatingEarningsEffect(
        ledgerRows,
        amountCad,
        ruleNames,
        dataset,
        isExplained,
      ),
      oneTimeOrTrend: isTrend
        ? `${patternDetail} — recurring pattern across ${periodDisplay.toLowerCase()}`
        : 'One-time event',
    },
    paperTrail,
    caughtBy250kScreen,
  };
}

/**
 * Merges ledger-based flags that point to the same ledger rows into ranked "Today" problems
 * for Dana's Ledger view, separating "Explained" items into "Checked and explained".
 */
export function buildDanaLedgerSummary(
  flags: AuditFlag[],
  dataset: SkyTraceDataset,
): DanaLedgerSummary {
  const ledgerFlags = flags.filter(
    (f) => LEDGER_PROBLEM_RULES.has(f.ruleName) && f.ledgerRows.length > 0,
  );

  const explainedFlags = ledgerFlags.filter((f) => f.status === 'Explained');
  const activeFlags = ledgerFlags.filter((f) => f.status !== 'Explained');

  // Connected-components merge: two active flags merge if they share any ledger entry_id
  const parent = activeFlags.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  const entryToFirstFlagIdx = new Map<string, number>();
  activeFlags.forEach((flag, idx) => {
    for (const row of flag.ledgerRows) {
      const existing = entryToFirstFlagIdx.get(row.entry_id);
      if (existing !== undefined) {
        union(existing, idx);
      } else {
        entryToFirstFlagIdx.set(row.entry_id, idx);
      }
    }
  });

  const clusters = new Map<number, AuditFlag[]>();
  activeFlags.forEach((flag, idx) => {
    const root = find(idx);
    const list = clusters.get(root) ?? [];
    list.push(flag);
    clusters.set(root, list);
  });

  const problems = Array.from(clusters.values())
    .map((cluster) => buildSingleDanaProblem(cluster, dataset, false))
    .sort((a, b) => b.amountCad - a.amountCad);

  const explained = explainedFlags
    .map((flag) => buildSingleDanaProblem([flag], dataset, true))
    .sort((a, b) => b.amountCad - a.amountCad);

  const problemsTotalCad = roundCents(
    problems.reduce((sum, p) => sum + p.amountCad, 0),
  );
  const caughtBy250kCount = problems.filter((p) => p.caughtBy250kScreen).length;

  return {
    problems,
    explained,
    problemsTotalCad,
    caughtBy250kCount,
    totalProblemsCount: problems.length,
  };
}

/**
 * Computes Dana's review counts from stored decisions for the "Today" problem list.
 */
export function computeDanaReviewCounts(
  problems: DanaLedgerProblem[],
  decisionsById: Record<string, DanaReviewDecision>,
): DanaReviewCounts {
  let reviewedCount = 0;
  let notAProblemCount = 0;
  let realProblemCount = 0;
  let explainedCount = 0;

  for (const problem of problems) {
    const decision = decisionsById[problem.id];
    if (!decision) continue;
    reviewedCount += 1;
    if (decision === 'Not a problem') notAProblemCount += 1;
    else if (decision === 'Real problem') realProblemCount += 1;
    else if (decision === 'Explained') explainedCount += 1;
  }

  return {
    reviewedCount,
    totalCount: problems.length,
    notAProblemCount,
    realProblemCount,
    explainedCount,
  };
}

/**
 * Formats a percentage cleanly (e.g., 0.2 -> "0.20%", 25 -> "25.0%").
 */
export function formatPercent(percentValue: number, decimals = 2): string {
  return `${percentValue.toFixed(decimals)}%`;
}

/**
 * Calculates the China extra tariff what-if scenario from customs_q3.
 */
export function computeChinaTariffWhatIf(
  customs: CustomsRow[],
  proposedRatePercent: number,
): ChinaTariffWhatIfResult {
  const chinaRows = customs.filter(
    (row) => row.origin_country.trim().toLowerCase() === 'china',
  );

  let chinaVolumeCad = 0;
  let baselineTariffQuarterCad = 0;

  for (const row of chinaRows) {
    chinaVolumeCad = roundCents(chinaVolumeCad + row.value_cad);
    baselineTariffQuarterCad = roundCents(
      baselineTariffQuarterCad + row.value_cad * row.extra_tariff_rate,
    );
  }

  const baselineRatePercent =
    chinaVolumeCad > 0
      ? roundCents((baselineTariffQuarterCad / chinaVolumeCad) * 100)
      : 25;

  const tariffPerQuarterCad = roundCents(
    chinaVolumeCad * (proposedRatePercent / 100),
  );
  const changePerQuarterCad = roundCents(
    tariffPerQuarterCad - baselineTariffQuarterCad,
  );
  const changePerYearCad = roundCents(changePerQuarterCad * 4);

  return {
    chinaEntries: chinaRows.map((r) => r.entry_id),
    chinaVolumeCad,
    baselineRatePercent,
    proposedRatePercent,
    baselineTariffQuarterCad,
    tariffPerQuarterCad,
    changePerQuarterCad,
    changePerYearCad,
  };
}

/**
 * Builds all deterministic data for Marco: Shipments from customs_q3, ledger_q3,
 * sales_tax_q3, duty_trend, evidence_q3, and broker_contract.
 */
export function buildMarcoShipmentsSummary(
  dataset: SkyTraceDataset,
): MarcoShipmentsSummary {
  const { customs, ledger, evidence, salesTax, dutyTrend, brokerContract } = dataset;
  const contractRate = brokerContract.fee_rate_of_goods_value;
  const contractRatePct = roundCents(contractRate * 100);

  const ledgerBrokerByShipment = new Map<string, LedgerRow>();
  for (const row of ledger) {
    if (row.gl_account.trim() === '7410' && row.shipment_ref.trim()) {
      ledgerBrokerByShipment.set(row.shipment_ref.trim().toUpperCase(), row);
    }
  }

  const customsEntryIds = new Set<string>();
  const entries: MarcoShipmentEntry[] = [];

  let normalDutyCad = 0;
  let extraTariffsCad = 0;
  let exportDdpDutyCad = 0;
  let brokerFeesCad = 0;
  let totalValueCad = 0;
  let totalDutyPaidCad = 0;
  let totalBrokerContractCad = 0;

  for (const row of customs) {
    const idKey = row.entry_id.trim().toUpperCase();
    if (idKey) customsEntryIds.add(idKey);

    const expectedNormalDutyCad = roundCents(row.value_cad * row.mfn_rate);
    const expectedExtraTariffCad = roundCents(row.value_cad * row.extra_tariff_rate);
    const expectedTotalDutyCad = roundCents(
      expectedNormalDutyCad + expectedExtraTariffCad,
    );
    const dutyAndTariffPaidCad = roundCents(row.duty_and_tariff_paid);
    const dutyVarianceCad = roundCents(dutyAndTariffPaidCad - expectedTotalDutyCad);

    const contractFeeCad = roundCents(row.value_cad * contractRate);
    const brokerFeeBilledCad = roundCents(row.broker_fee_billed);
    const brokerVarianceCad = roundCents(brokerFeeBilledCad - contractFeeCad);
    const feePctOfValue =
      row.value_cad > 0 ? (brokerFeeBilledCad / row.value_cad) * 100 : 0;
    const isFeeAboveContract = brokerVarianceCad > 0;

    const claimed = row.agreement_claimed.trim().toLowerCase() === 'yes';
    const hasCert = row.origin_cert_on_file.trim().toLowerCase() === 'yes';

    let agreementStatus: AgreementDisplayStatus = 'None';
    if (claimed) {
      agreementStatus = 'Claimed';
    } else if (hasCert && !claimed) {
      agreementStatus = 'Certificate on file but not claimed';
    }

    let refundClaimNote: string | null = null;
    if (agreementStatus === 'Certificate on file but not claimed') {
      const ag = row.agreement_available.trim() || 'trade agreement';
      const formattedDuty = dutyAndTariffPaidCad.toLocaleString('en-CA');
      refundClaimNote = `Duty paid ${formattedDuty} with a ${ag} certificate on file. Refund claim to review.`;
    }

    const linkedLedgerRow = ledgerBrokerByShipment.get(idKey) ?? null;
    const linkedEvidence = matchEvidence(
      linkedLedgerRow ? [linkedLedgerRow] : [],
      [row],
      evidence,
      [brokerContract.broker_vendor_id],
    );

    if (row.direction.trim().toLowerCase() === 'export') {
      exportDdpDutyCad = roundCents(exportDdpDutyCad + dutyAndTariffPaidCad);
    } else {
      normalDutyCad = roundCents(normalDutyCad + expectedNormalDutyCad);
    }
    extraTariffsCad = roundCents(extraTariffsCad + expectedExtraTariffCad);
    brokerFeesCad = roundCents(brokerFeesCad + brokerFeeBilledCad);
    totalValueCad = roundCents(totalValueCad + row.value_cad);
    totalDutyPaidCad = roundCents(totalDutyPaidCad + dutyAndTariffPaidCad);
    totalBrokerContractCad = roundCents(totalBrokerContractCad + contractFeeCad);

    entries.push({
      entryId: row.entry_id,
      direction: row.direction,
      route: row.route,
      originCountry: row.origin_country,
      goods: row.goods,
      hsCode: row.hs_code,
      incoterm: row.incoterm,
      valueCad: roundCents(row.value_cad),
      mfnRate: row.mfn_rate,
      extraTariffRate: row.extra_tariff_rate,
      expectedNormalDutyCad,
      expectedExtraTariffCad,
      expectedTotalDutyCad,
      dutyAndTariffPaidCad,
      dutyVarianceCad,
      brokerFeeBilledCad,
      contractFeeCad,
      brokerVarianceCad,
      feePctOfValue,
      contractRatePct,
      isFeeAboveContract,
      agreementAvailable: row.agreement_available,
      agreementClaimed: row.agreement_claimed,
      originCertOnFile: row.origin_cert_on_file,
      agreementStatus,
      refundClaimNote,
      linkedLedgerRow,
      linkedEvidence,
    });
  }

  let salesTaxTotalCad = 0;
  for (const row of salesTax) {
    salesTaxTotalCad = roundCents(salesTaxTotalCad + row.sales_tax_cad);
  }

  const customsCostTotalCad = roundCents(totalDutyPaidCad + brokerFeesCad);

  const breakdown: MarcoCustomsBreakdown = {
    customsCostTotalCad,
    normalDutyCad,
    extraTariffsCad,
    exportDdpDutyCad,
    brokerFeesCad,
    salesTaxTotalCad,
    salesTaxRows: salesTax,
  };

  // Unmatched GL 7410 broker bills (e.g. E-13, $118,000)
  const unmatchedBrokerBills: UnmatchedBrokerBill[] = [];
  for (const row of ledger) {
    if (row.gl_account.trim() !== '7410') continue;
    const refKey = row.shipment_ref.trim().toUpperCase();
    if (!refKey || !customsEntryIds.has(refKey)) {
      unmatchedBrokerBills.push({
        entryId: row.entry_id,
        shipmentRef: row.shipment_ref || '(blank)',
        invoiceNo: row.invoice_no,
        postDate: row.post_date,
        vendorId: row.vendor_id,
        approvalRef: row.approval_ref,
        amountCad: roundCents(row.amount_cad),
        description: row.description,
        linkedEvidence: matchEvidence([row], [], evidence),
      });
    }
  }

  // Eight-quarter duty trend summary
  const trendValues = dutyTrend.map((d) => d.duty_tariff_broker_000s);
  const latestPoint = dutyTrend[dutyTrend.length - 1];
  const priorYearPoint =
    dutyTrend.length >= 5 ? dutyTrend[dutyTrend.length - 5] : dutyTrend[0];

  const dutyTrendSummary: MarcoDutyTrendSummary = {
    points: dutyTrend,
    latestQuarter: latestPoint?.quarter ?? '',
    latestAmount000s: latestPoint?.duty_tariff_broker_000s ?? 0,
    priorYearQuarter: priorYearPoint?.quarter ?? '',
    priorYearAmount000s: priorYearPoint?.duty_tariff_broker_000s ?? 0,
    yoyChange000s: roundCents(
      (latestPoint?.duty_tariff_broker_000s ?? 0) -
        (priorYearPoint?.duty_tariff_broker_000s ?? 0),
    ),
    min000s: trendValues.length > 0 ? Math.min(...trendValues) : 0,
    max000s: trendValues.length > 0 ? Math.max(...trendValues) : 0,
  };

  const baselineWhatIf = computeChinaTariffWhatIf(customs, 25);

  return {
    entries,
    breakdown,
    unmatchedBrokerBills,
    dutyTrend: dutyTrendSummary,
    chinaBaselineWhatIf: baselineWhatIf,
    contractRatePct,
    totalValueCad,
    totalDutyPaidCad,
    totalBrokerBilledCad: brokerFeesCad,
    totalBrokerContractCad,
    totalBrokerNetVarianceCad: roundCents(brokerFeesCad - totalBrokerContractCad),
  };
}

const OE_MATERIALITY_LINE_000S = 1_000;
const OE_MATERIALITY_LINE_CAD = 1_000_000;

function shortenWalkStep(step: string): string {
  const lower = step.toLowerCase();
  if (lower.startsWith('start: q3 2025')) return 'Q3 25 OE';
  if (lower.startsWith('start: q2 2026')) return 'Q2 26 OE';
  if (lower.startsWith('end: q3 2026')) return 'Q3 26 OE';
  if (lower === 'sales: volume') return 'Sales vol';
  if (lower === 'sales: price') return 'Price';
  if (lower === 'sales: exchange rates') return 'Sales FX';
  if (lower === 'variable costs: volume') return 'Var vol';
  if (lower === 'variable costs: material prices') return 'Mat price';
  if (lower === 'variable costs: exchange rates') return 'Var FX';
  if (lower === 'variable costs: efficiency gains') return 'Efficiency';
  if (lower === 'fixed plant: wage increases') return 'Wages';
  if (lower === 'fixed plant: seasonal overtime') return 'Overtime';
  if (lower.includes('one-time scrap')) return 'Scrap';
  if (lower === 'fixed plant: underspend') return 'Underspend';
  if (lower === 'fixed plant: other') return 'Plant oth';
  if (lower.includes('rush freight')) return 'Rush frt';
  if (lower === 'sg&a: other') return 'SG&A oth';
  if (lower === 'amortization') return 'Amort';
  return step.length > 10 ? `${step.slice(0, 9)}…` : step;
}

function buildOeWalkSeries(
  dataset: SkyTraceDataset,
  walk: 'yoy' | 'qoq',
  label: string,
  danaLedger: DanaLedgerSummary,
): OeWalkSeries {
  const rows = dataset.oeWalk.filter((r) => r.walk.trim().toLowerCase() === walk);
  const scrapProblem = danaLedger.problems.find(
    (p) =>
      p.title.toLowerCase().includes('scrap') ||
      p.ledgerRows.some((r) => r.gl_account === '6410'),
  );
  const rushFreightProblem = danaLedger.problems.find((p) =>
    p.ruleNames.includes('Wrong account pattern'),
  );

  const bars: OeWalkBar[] = [];
  let running = 0;
  let start000s = 0;
  let end000s = 0;
  let materialCount = 0;
  let maxTop000s = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const stepLower = row.step.toLowerCase();
    const isStart = i === 0 || stepLower.startsWith('start:');
    const isEnd = i === rows.length - 1 || stepLower.startsWith('end:');
    const isTotal = isStart || isEnd;

    let from000s = 0;
    let to000s = 0;

    if (isStart) {
      from000s = 0;
      to000s = row.amount_000s;
      running = row.amount_000s;
      start000s = row.amount_000s;
    } else if (isEnd) {
      from000s = 0;
      to000s = row.amount_000s;
      running = row.amount_000s;
      end000s = row.amount_000s;
    } else {
      from000s = running;
      to000s = roundCents(running + row.amount_000s);
      running = to000s;
    }

    const isMaterial = !isTotal && Math.abs(row.amount_000s) >= OE_MATERIALITY_LINE_000S;
    if (isMaterial) materialCount += 1;

    maxTop000s = Math.max(maxTop000s, from000s, to000s);

    let linkedProblemId: string | null = null;
    if (stepLower.includes('scrap') && scrapProblem) {
      linkedProblemId = scrapProblem.id;
    } else if (stepLower.includes('rush freight') && rushFreightProblem) {
      linkedProblemId = rushFreightProblem.id;
    }

    bars.push({
      step: row.step,
      shortLabel: shortenWalkStep(row.step),
      amount000s: row.amount_000s,
      from000s,
      to000s,
      isStart,
      isEnd,
      isTotal,
      isMaterial,
      linkedProblemId,
    });
  }

  return {
    walk,
    label,
    start000s,
    end000s,
    netChange000s: roundCents(end000s - start000s),
    materialCount,
    maxTop000s,
    bars,
  };
}

function buildUnderchargeStoryCard(
  entryId: string,
  dataset: SkyTraceDataset,
  brokerReconciliation: BrokerReconciliationSummary,
): DanaLedgerProblem | null {
  const line = brokerReconciliation.entries.find(
    (e) => e.entryId.toUpperCase() === entryId.toUpperCase() && e.varianceCad < 0,
  );
  if (!line) return null;

  const customsRow = dataset.customs.find(
    (c) => c.entry_id.toUpperCase() === entryId.toUpperCase(),
  );
  const ledgerRow = dataset.ledger.find(
    (l) =>
      l.gl_account.trim() === '7410' &&
      l.shipment_ref.trim().toUpperCase() === entryId.toUpperCase(),
  );

  const linkedEvidence = matchEvidence(
    ledgerRow ? [ledgerRow] : [],
    customsRow ? [customsRow] : [],
    dataset.evidence,
    [dataset.brokerContract.broker_vendor_id],
  );

  const underchargeCad = Math.abs(line.varianceCad);
  const { why, howItReachedBooks } = deriveWhyAndHowFromEvidence(linkedEvidence);

  const paperTrail: [PaperTrailBox, PaperTrailBox, PaperTrailBox, PaperTrailBox] = [
    {
      stage: 'Approval',
      ok: Boolean(ledgerRow?.approval_ref.trim()),
      detail: ledgerRow?.approval_ref
        ? `${ledgerRow.approval_ref} recorded`
        : 'Approval reference missing',
    },
    {
      stage: 'Real event',
      ok: Boolean(customsRow),
      detail: customsRow
        ? `${customsRow.entry_id}: ${customsRow.route} (${formatCad(customsRow.value_cad)})`
        : `Shipment ${entryId} not found`,
    },
    {
      stage: 'Outside bill',
      ok: false,
      detail: `Billed ${formatCad(line.billedFeeCad)} vs. contract ${formatCad(line.contractFeeCad)} (${formatCad(line.varianceCad, true)})`,
    },
    {
      stage: 'Ledger line',
      ok: false,
      detail: ledgerRow
        ? `${ledgerRow.entry_id} posted ${formatCad(ledgerRow.amount_cad)}; ${formatCad(underchargeCad)} short of 0.2% contract`
        : 'No matching GL 7410 row posted',
    },
  ];

  return {
    id: `SURPRISE-UNDERCHARGE-${line.entryId}`,
    title: `${line.entryId} broker undercharge`,
    subtitle: `${line.route} · ${ledgerRow?.invoice_no ?? line.entryId}`,
    amountCad: underchargeCad,
    ruleNames: ['Broker fee against contract'],
    pattern: 'One-time',
    patternDetail: 'One-time',
    defaultStatus: 'Suspected',
    ledgerRows: ledgerRow ? [ledgerRow] : [],
    linkedEvidence,
    story: {
      who: ledgerRow
        ? `Preparer: ${ledgerRow.preparer} · Vendor: ${ledgerRow.vendor_id} (${ledgerRow.vendor_type}) · Source: ${ledgerRow.source}`
        : `Vendor: ${dataset.brokerContract.broker_vendor_id} (broker)`,
      what: `Broker fee on ${line.entryId} (${line.route}, ${line.goods}) billed at ${formatCad(line.billedFeeCad)} instead of ${formatCad(line.contractFeeCad)} at 0.2% contract rate`,
      where: {
        plant: ledgerRow?.plant || 'Plant 1',
        department: ledgerRow?.department || 'Customs and Trade',
        region: ledgerRow?.region || 'North America',
        glAccount: ledgerRow
          ? `${ledgerRow.gl_account} — ${ledgerRow.gl_name}`
          : '7410 — Broker fees',
        costCentre: ledgerRow?.cost_centre || 'CUS-NA',
      },
      when: ledgerRow
        ? `${ledgerRow.post_date} (Period ${ledgerRow.period})`
        : 'Q3 2026',
      why,
      howItReachedBooks,
      effectOnOperatingEarnings: `Q3 broker expense is understated by ${formatCad(underchargeCad)}; a catch-up broker bill in Q4 would reduce Q4 operating earnings by ${formatCad(underchargeCad)}`,
      oneTimeOrTrend: 'One-time billing shortfall (may be rebilled in a later quarter)',
    },
    paperTrail,
    caughtBy250kScreen: false,
  };
}

/**
 * Builds all deterministic metrics for Helen: Close Room:
 * OE waterfall walks (YoY & QoQ), Hidden Pile meter & 3 groups, and Next Quarter's Surprises.
 */
export function buildHelenCloseRoomSummary(
  dataset: SkyTraceDataset,
  danaLedger: DanaLedgerSummary,
  brokerReconciliation: BrokerReconciliationSummary,
): HelenCloseRoomSummary {
  const yoyWalk = buildOeWalkSeries(
    dataset,
    'yoy',
    'Q3 2025 to Q3 2026',
    danaLedger,
  );
  const qoqWalk = buildOeWalkSeries(
    dataset,
    'qoq',
    'Q2 2026 to Q3 2026',
    danaLedger,
  );

  const q3OperatingEarnings000s = yoyWalk.end000s || qoqWalk.end000s || 20_700;
  const q3OperatingEarningsCad = roundCents(q3OperatingEarnings000s * 1000);

  const hiddenPileTotalCad = danaLedger.problemsTotalCad;
  const hiddenPileTotal000s = roundCents(hiddenPileTotalCad / 1000);
  const hiddenPileShareOfOePct =
    q3OperatingEarningsCad > 0
      ? Math.round((hiddenPileTotalCad / q3OperatingEarningsCad) * 1000) / 10
      : 0;

  const maxSingleProblemCad = danaLedger.problems.reduce(
    (max, p) => Math.max(max, p.amountCad),
    0,
  );
  const noneReachesMaterialityLine =
    danaLedger.problems.length > 0 && maxSingleProblemCad < OE_MATERIALITY_LINE_CAD;

  // Split the hidden pile into the three labelled groups
  const cashToRecover: DanaLedgerProblem[] = [];
  const accountingNoCash: DanaLedgerProblem[] = [];
  const operationalControl: DanaLedgerProblem[] = [];

  for (const problem of danaLedger.problems) {
    const rules = new Set(problem.ruleNames);
    if (
      rules.has('Near-duplicate invoice') ||
      rules.has('Broker fee with no shipment')
    ) {
      cashToRecover.push(problem);
    } else if (
      rules.has('Accrual not reversed') ||
      rules.has('Suspense not cleared') ||
      rules.has('Wrong account pattern')
    ) {
      accountingNoCash.push(problem);
    } else {
      operationalControl.push(problem);
    }
  }

  const makeGroup = (
    id: HiddenPileGroupId,
    label: string,
    items: DanaLedgerProblem[],
  ): HiddenPileGroup => {
    const subtotalCad = roundCents(items.reduce((sum, p) => sum + p.amountCad, 0));
    return {
      id,
      label,
      subtotalCad,
      subtotal000s: roundCents(subtotalCad / 1000),
      problems: items,
    };
  };

  const hiddenPileGroups: HiddenPileGroup[] = [
    makeGroup('cash-to-recover', 'Cash to recover', cashToRecover),
    makeGroup(
      'accounting-no-cash',
      'Accounting corrections, no cash',
      accountingNoCash,
    ),
    makeGroup('operational-control', 'Operational or control', operationalControl),
  ];

  // Next quarter's surprises
  const nextQuarterSurprises: NextQuarterSurprise[] = [];

  const accrualProblem = danaLedger.problems.find((p) =>
    p.ruleNames.includes('Accrual not reversed'),
  );
  if (accrualProblem) {
    nextQuarterSurprises.push({
      id: 'surprise-warranty-accrual',
      title: 'Warranty accrual still unreversed',
      detail: `${accrualProblem.ledgerRows[0]?.entry_id ?? 'JE-260644'} carried from Q2 with blank accrual flag and no automatic reversal.`,
      amountCad: accrualProblem.amountCad,
      amountLabel: formatCad(accrualProblem.amountCad),
      problem: accrualProblem,
    });
  }

  const suspenseProblem = danaLedger.problems.find((p) =>
    p.ruleNames.includes('Suspense not cleared'),
  );
  if (suspenseProblem) {
    const monthlyK = [...suspenseProblem.ledgerRows]
      .sort((a, b) => a.period - b.period)
      .map((r) => roundCents(r.amount_cad / 1000).toLocaleString('en-CA'));
    nextQuarterSurprises.push({
      id: 'surprise-suspense-growth',
      title: 'Suspense balance growing each month',
      detail: `GL 2890 unmapped batch imports rose across Periods 7–9 (${monthlyK.join(', ')} thousand) and remain uncleared.`,
      amountCad: suspenseProblem.amountCad,
      amountLabel: formatCad(suspenseProblem.amountCad),
      problem: suspenseProblem,
    });
  }

  const rushFreightProblem = danaLedger.problems.find((p) =>
    p.ruleNames.includes('Wrong account pattern'),
  );
  if (rushFreightProblem) {
    nextQuarterSurprises.push({
      id: 'surprise-rush-freight',
      title: 'Rush freight trend continuing',
      detail: `${rushFreightProblem.ledgerRows.length} consecutive weekly carrier rush premiums coded to SG&A (GL 7200) instead of 6600 Freight out.`,
      amountCad: rushFreightProblem.amountCad,
      amountLabel: formatCad(rushFreightProblem.amountCad),
      problem: rushFreightProblem,
    });
  }

  for (const underEntryId of brokerReconciliation.underchargeEntries) {
    const underCard = buildUnderchargeStoryCard(
      underEntryId,
      dataset,
      brokerReconciliation,
    );
    if (underCard) {
      nextQuarterSurprises.push({
        id: `surprise-broker-undercharge-${underEntryId}`,
        title: `${underEntryId} broker undercharge may be billed later`,
        detail: `Broker billed below the 0.2% contract rate on ${underEntryId}; a catch-up invoice of ${formatCad(underCard.amountCad)} could land next quarter.`,
        amountCad: underCard.amountCad,
        amountLabel: formatCad(underCard.amountCad),
        problem: underCard,
      });
    }
  }

  return {
    yoyWalk,
    qoqWalk,
    materialityLineCad: OE_MATERIALITY_LINE_CAD,
    materialityLine000s: OE_MATERIALITY_LINE_000S,
    q3OperatingEarningsCad,
    q3OperatingEarnings000s,
    hiddenPileTotalCad,
    hiddenPileTotal000s,
    hiddenPileShareOfOePct,
    maxSingleProblemCad,
    noneReachesMaterialityLine,
    hiddenPileGroups,
    nextQuarterSurprises,
  };
}



