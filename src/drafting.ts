import type { CustomsRow, EvidenceRow, LedgerRow } from './data';
import {
  formatCad,
  type DanaLedgerProblem,
  type MoneyBackItem,
  type RulesEngineResult,
} from './rules';

export interface DraftLetterRequest {
  id: string;
  contextType: 'money-back' | 'story-card';
  title: string;
  amountCad: number;
  amountFormatted: string;
  owner: string;
  ruleNames: string[];
  summary: string;
  ledgerRows: Array<{
    entry_id: string;
    post_date: string;
    gl_account: string;
    gl_name: string;
    amount_cad: number;
    vendor_id: string;
    invoice_no: string;
    po_ref: string;
    shipment_ref: string;
    approval_ref: string;
    description: string;
  }>;
  customsRows: Array<{
    entry_id: string;
    route: string;
    goods: string;
    value_cad: number;
    duty_and_tariff_paid: number;
    broker_fee_billed: number;
    agreement_available: string;
    agreement_claimed: string;
    origin_cert_on_file: string;
  }>;
  evidenceRows: Array<{
    evidence_id: string;
    type: string;
    date: string;
    linked_ref: string;
    owner: string;
    summary: string;
  }>;
}

export interface DraftLetterResponse {
  draft: string;
  source: 'gemini' | 'template';
}

function slimLedgerRow(row: LedgerRow) {
  return {
    entry_id: row.entry_id,
    post_date: row.post_date,
    gl_account: row.gl_account,
    gl_name: row.gl_name,
    amount_cad: row.amount_cad,
    vendor_id: row.vendor_id,
    invoice_no: row.invoice_no,
    po_ref: row.po_ref,
    shipment_ref: row.shipment_ref,
    approval_ref: row.approval_ref,
    description: row.description,
  };
}

function slimCustomsRow(row: CustomsRow) {
  return {
    entry_id: row.entry_id,
    route: row.route,
    goods: row.goods,
    value_cad: row.value_cad,
    duty_and_tariff_paid: row.duty_and_tariff_paid,
    broker_fee_billed: row.broker_fee_billed,
    agreement_available: row.agreement_available,
    agreement_claimed: row.agreement_claimed,
    origin_cert_on_file: row.origin_cert_on_file,
  };
}

function slimEvidenceRow(row: EvidenceRow) {
  return {
    evidence_id: row.evidence_id,
    type: row.type,
    date: row.date,
    linked_ref: row.linked_ref,
    owner: row.owner,
    summary: row.summary,
  };
}

export function buildDraftRequestFromProblem(
  problem: DanaLedgerProblem,
): DraftLetterRequest {
  return {
    id: problem.id,
    contextType: 'story-card',
    title: problem.title,
    amountCad: problem.amountCad,
    amountFormatted: formatCad(problem.amountCad),
    owner: problem.ledgerRows[0]?.department || 'Finance',
    ruleNames: problem.ruleNames,
    summary: `${problem.story.what}. ${problem.story.effectOnOperatingEarnings}`,
    ledgerRows: problem.ledgerRows.map(slimLedgerRow),
    customsRows: [],
    evidenceRows: problem.linkedEvidence.map(slimEvidenceRow),
  };
}

export function buildDraftRequestFromMoneyBack(
  item: MoneyBackItem,
  rulesResult: RulesEngineResult,
): DraftLetterRequest {
  const matchedFlags = rulesResult.flags.filter((f) =>
    item.flagIds.includes(f.id),
  );

  const ledgerMap = new Map<string, LedgerRow>();
  const customsMap = new Map<string, CustomsRow>();
  const evMap = new Map<string, EvidenceRow>();

  for (const flag of matchedFlags) {
    for (const r of flag.ledgerRows) {
      if (!ledgerMap.has(r.entry_id)) ledgerMap.set(r.entry_id, r);
    }
    for (const c of flag.customsRows) {
      if (!customsMap.has(c.entry_id)) customsMap.set(c.entry_id, c);
    }
    for (const e of flag.linkedEvidence) {
      if (!evMap.has(e.evidence_id)) evMap.set(e.evidence_id, e);
    }
  }

  return {
    id: `MB-${item.id}`,
    contextType: 'money-back',
    title: item.label,
    amountCad: item.amountCad,
    amountFormatted: formatCad(item.amountCad),
    owner: item.owner,
    ruleNames: [item.ruleName],
    summary: item.detail,
    ledgerRows: Array.from(ledgerMap.values()).map(slimLedgerRow),
    customsRows: Array.from(customsMap.values()).map(slimCustomsRow),
    evidenceRows: Array.from(evMap.values())
      .sort((a, b) => a.evidence_id.localeCompare(b.evidence_id))
      .map(slimEvidenceRow),
  };
}

/**
 * Deterministic fixed-template dispute/credit request letter using only the exact
 * amounts, rows, and evidence_ids supplied in the request.
 */
export function buildTemplateDraft(req: DraftLetterRequest): string {
  const vendorIds = Array.from(
    new Set(req.ledgerRows.map((r) => r.vendor_id).filter(Boolean)),
  );
  const invoices = Array.from(
    new Set(req.ledgerRows.map((r) => r.invoice_no).filter(Boolean)),
  );
  const pos = Array.from(
    new Set(req.ledgerRows.map((r) => r.po_ref).filter(Boolean)),
  );
  const shipments = Array.from(
    new Set([
      ...req.ledgerRows.map((r) => r.shipment_ref).filter(Boolean),
      ...req.customsRows.map((c) => c.entry_id).filter(Boolean),
    ]),
  );
  const entryIds = Array.from(
    new Set(req.ledgerRows.map((r) => r.entry_id).filter(Boolean)),
  );

  const recipient =
    vendorIds.length > 0
      ? `Vendor ${vendorIds.join(', ')} Billing Team`
      : req.customsRows.length > 0
        ? 'Customs Broker / Trade Compliance Team'
        : 'SKYJACK Finance & Operations Team';

  const refs: string[] = [];
  if (invoices.length > 0) refs.push(`Invoice(s): ${invoices.join(', ')}`);
  if (pos.length > 0) refs.push(`PO: ${pos.join(', ')}`);
  if (shipments.length > 0) refs.push(`Shipment(s): ${shipments.join(', ')}`);
  if (entryIds.length > 0) refs.push(`Ledger Entry(s): ${entryIds.join(', ')}`);

  const evidenceLines =
    req.evidenceRows.length > 0
      ? req.evidenceRows
          .map((ev) => `- ${ev.evidence_id} (${ev.type}, ${ev.date}): ${ev.summary}`)
          .join('\n')
      : '- No supporting evidence rows currently linked; please supply documentation before release.';

  const rulesLower = req.ruleNames.map((r) => r.toLowerCase());
  const isCreditRequest =
    req.contextType === 'money-back' ||
    rulesLower.some(
      (r) =>
        r.includes('duplicate') ||
        r.includes('no shipment') ||
        r.includes('contract') ||
        r.includes('trade agreement'),
    );

  const subjectPrefix = isCreditRequest
    ? 'Credit / Refund Request'
    : 'Review & Correction Request';

  const openingLine = isCreditRequest
    ? `We are writing regarding ${req.title} in the amount of ${req.amountFormatted} CAD identified during SKYJACK's Q3 cost review.`
    : `We are writing to request review and correction of ${req.title} in the amount of ${req.amountFormatted} CAD identified during SKYJACK's Q3 ledger close.`;

  const closingLine = isCreditRequest
    ? `Based on the records cited above, please issue a credit note or refund of ${req.amountFormatted} CAD, or provide supporting documentation resolving the discrepancy within five business days.`
    : `Based on the records cited above, please confirm the root cause and required accounting adjustment for ${req.amountFormatted} CAD within one business day so we can finalize the Q3 close.`;

  return [
    `Subject: ${subjectPrefix} — ${req.title} (${req.amountFormatted} CAD)`,
    '',
    `Hello ${recipient},`,
    '',
    openingLine,
    '',
    refs.length > 0 ? `References: ${refs.join(' | ')}` : `Reference: ${req.summary}`,
    '',
    'Supporting records on file:',
    evidenceLines,
    '',
    closingLine,
    '',
    'Thank you,',
    'SKYJACK Finance & Trade Operations',
  ].join('\n');
}

const CLIENT_TIMEOUT_MS = 8000;

/**
 * Calls the server-side Gemini drafting route with an 8-second hard timeout.
 * Never throws or leaves a hanging spinner; falls back cleanly to the fixed code template.
 */
export async function requestDraftLetter(
  payload: DraftLetterRequest,
): Promise<DraftLetterResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const response = await fetch('/api/draft-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        draft: buildTemplateDraft(payload),
        source: 'template',
      };
    }

    const data = (await response.json()) as Partial<DraftLetterResponse>;
    if (typeof data.draft === 'string' && data.draft.trim().length > 0) {
      return {
        draft: data.draft.trim(),
        source: data.source === 'gemini' ? 'gemini' : 'template',
      };
    }

    return {
      draft: buildTemplateDraft(payload),
      source: 'template',
    };
  } catch {
    return {
      draft: buildTemplateDraft(payload),
      source: 'template',
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
