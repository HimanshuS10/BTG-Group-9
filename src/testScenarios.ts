import type { CustomsRow, LedgerRow } from './data';

export const TEST_SCENARIO_IDS = {
  brokerNoShipment: 'AP-459901',
  brokerHighRateCustoms: 'E-14',
  brokerHighRateLedger: 'AP-461400',
  duplicateInvoiceCopy: 'AP-449521',
} as const;

/**
 * Sample 1: "Broker bill with no shipment" — a GL 7410 row for shipment E-99.
 */
export function createBrokerNoShipmentTestRow(): LedgerRow {
  return {
    entry_id: TEST_SCENARIO_IDS.brokerNoShipment,
    post_date: '2026-09-28',
    period: 9,
    plant: 'Plant 1',
    department: 'Customs and Trade',
    region: 'North America',
    gl_account: '7410',
    gl_name: 'Broker fees',
    amount_cad: 95000,
    preparer: 'AP-117',
    source: 'AP',
    approval_ref: 'APR-7999',
    po_ref: '',
    vendor_id: 'V-3300',
    vendor_type: 'broker',
    invoice_no: 'BRK-09-099',
    shipment_ref: 'E-99',
    reversal_ref: '',
    cost_centre: 'CUS-NA',
    description: 'Broker fee, shipment E-99 (sample check)',
  };
}

/**
 * Sample 2: "Broker fee at 0.5% of value" — customs entry E-14 worth 400,000 billed 2,000
 * (0.50% vs 0.20% contract fee of 800 -> +1,200 overcharge) plus its matching GL 7410 row.
 */
export function createBrokerHighRateTestRows(): {
  customsRow: CustomsRow;
  ledgerRow: LedgerRow;
} {
  return {
    customsRow: {
      entry_id: TEST_SCENARIO_IDS.brokerHighRateCustoms,
      direction: 'import',
      route: 'Germany to Guelph',
      origin_country: 'Germany',
      goods: 'Hydraulic valves',
      hs_code: '8481',
      value_cad: 400000,
      mfn_rate: 0.025,
      extra_tariff_rate: 0.0,
      agreement_available: '',
      agreement_claimed: 'no',
      origin_cert_on_file: 'no',
      incoterm: '',
      duty_and_tariff_paid: 10000,
      broker_fee_billed: 2000,
    },
    ledgerRow: {
      entry_id: TEST_SCENARIO_IDS.brokerHighRateLedger,
      post_date: '2026-09-28',
      period: 9,
      plant: 'Plant 1',
      department: 'Customs and Trade',
      region: 'North America',
      gl_account: '7410',
      gl_name: 'Broker fees',
      amount_cad: 2000,
      preparer: 'AP-117',
      source: 'AP',
      approval_ref: 'APR-7514',
      po_ref: '',
      vendor_id: 'V-3300',
      vendor_type: 'broker',
      invoice_no: 'BRK-E-14',
      shipment_ref: TEST_SCENARIO_IDS.brokerHighRateCustoms,
      reversal_ref: '',
      cost_centre: 'CUS-NA',
      description: 'Broker fee, Germany to Guelph (E-14 sample)',
    },
  };
}

/**
 * Sample 3: "Invoice re-keyed with -A" — a copy of an existing paid invoice
 * (AP-449520 / INV-66012 for $143,000) with "-A" added to the invoice number.
 */
export function createDuplicateInvoiceTestRow(existingLedger: LedgerRow[]): LedgerRow {
  const sourceRow =
    existingLedger.find((r) => r.entry_id === 'AP-449520') ??
    existingLedger.find(
      (r) =>
        r.source.toLowerCase() === 'ap' &&
        r.invoice_no.trim() !== '' &&
        !r.invoice_no.endsWith('-A') &&
        r.vendor_id.trim() !== '' &&
        r.vendor_type.toLowerCase() === 'supplier',
    );

  if (sourceRow) {
    return {
      ...sourceRow,
      entry_id: TEST_SCENARIO_IDS.duplicateInvoiceCopy,
      post_date: '2026-09-24',
      invoice_no: `${sourceRow.invoice_no}-A`,
      description: `${sourceRow.description} (re-keyed -A sample)`,
    };
  }

  return {
    entry_id: TEST_SCENARIO_IDS.duplicateInvoiceCopy,
    post_date: '2026-09-24',
    period: 9,
    plant: 'Plant 1',
    department: 'Procurement',
    region: 'Asia',
    gl_account: '5100',
    gl_name: 'Materials - electrical',
    amount_cad: 143000,
    preparer: 'AP-117',
    source: 'AP',
    approval_ref: 'APR-7455',
    po_ref: 'PO-55410',
    vendor_id: 'V-4720',
    vendor_type: 'supplier',
    invoice_no: 'INV-66012-A',
    reversal_ref: '',
    shipment_ref: '',
    cost_centre: 'PRC-AS',
    description: 'Control panel components (re-keyed -A sample)',
  };
}
