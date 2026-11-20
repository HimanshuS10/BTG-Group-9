export interface LedgerRow {
  entry_id: string;
  post_date: string;
  period: number;
  plant: string;
  department: string;
  region: string;
  gl_account: string;
  gl_name: string;
  amount_cad: number;
  preparer: string;
  source: string;
  approval_ref: string;
  po_ref: string;
  vendor_id: string;
  vendor_type: string;
  invoice_no: string;
  shipment_ref: string;
  reversal_ref: string;
  cost_centre: string;
  description: string;
}

export interface CustomsRow {
  entry_id: string;
  direction: string;
  route: string;
  origin_country: string;
  goods: string;
  hs_code: string;
  value_cad: number;
  mfn_rate: number;
  extra_tariff_rate: number;
  agreement_available: string;
  agreement_claimed: string;
  origin_cert_on_file: string;
  incoterm: string;
  duty_and_tariff_paid: number;
  broker_fee_billed: number;
}

export interface EvidenceRow {
  evidence_id: string;
  type: string;
  date: string;
  linked_ref: string;
  owner: string;
  summary: string;
}

export interface SalesTaxRow {
  destination: string;
  tax_rule: string;
  tax_rate: number;
  sales_cad: number;
  sales_tax_cad: number;
  freight_cad: number;
}

export interface OeWalkRow {
  walk: string;
  step: string;
  amount_000s: number;
}

export interface DutyTrendRow {
  quarter: string;
  duty_tariff_broker_000s: number;
}

export interface BrokerContract {
  broker_vendor_id: string;
  fee_rate_of_goods_value: number;
  note: string;
}

export interface SkyTraceDataset {
  ledger: LedgerRow[];
  customs: CustomsRow[];
  evidence: EvidenceRow[];
  salesTax: SalesTaxRow[];
  oeWalk: OeWalkRow[];
  dutyTrend: DutyTrendRow[];
  brokerContract: BrokerContract;
}

export const LEDGER_Q3_CSV = `entry_id,post_date,period,plant,department,region,gl_account,gl_name,amount_cad,preparer,source,approval_ref,po_ref,vendor_id,vendor_type,invoice_no,shipment_ref,reversal_ref,cost_centre,description
JE-260931,2026-09-29,9,Plant 2,Operations,North America,6410,Scrap and write-offs,900000,PA-2214,manual,APR-7781,,,,,,,P2-OPS,"Scrap write-off, cylinder batch CB-4410"
AP-33071,2026-07-24,7,Plant 1,Logistics,North America,7200,SG&A other,85000,LC-01,AP,APR-6610,,V-6101,carrier,RF-2300,,,LOG-NA,"Rush truck booking week 30, finished lifts"
AP-33072,2026-07-31,7,Plant 1,Logistics,North America,7200,SG&A other,110000,LC-02,AP,APR-6611,,V-6102,carrier,RF-2301,,,LOG-NA,"Rush truck booking week 31, finished lifts"
AP-33073,2026-08-07,8,Plant 1,Logistics,North America,7200,SG&A other,95000,LC-03,AP,APR-6612,,V-6103,carrier,RF-2302,,,LOG-NA,"Rush truck booking week 32, finished lifts"
AP-33074,2026-08-14,8,Plant 1,Logistics,North America,7200,SG&A other,120000,LC-01,AP,APR-6613,,V-6101,carrier,RF-2303,,,LOG-NA,"Rush truck booking week 33, finished lifts"
AP-33075,2026-08-21,8,Plant 1,Logistics,North America,7200,SG&A other,90000,LC-02,AP,APR-6614,,V-6102,carrier,RF-2304,,,LOG-NA,"Rush truck booking week 34, finished lifts"
AP-33076,2026-08-28,8,Plant 1,Logistics,North America,7200,SG&A other,100000,LC-03,AP,APR-6615,,V-6103,carrier,RF-2305,,,LOG-NA,"Rush truck booking week 35, finished lifts"
AP-441820,2026-08-06,8,Plant 1,Procurement,Europe,5100,Materials - steel,265000,AP-117,AP,APR-7012,PO-55231,V-4471,supplier,INV-88213,,,PRC-EU,"Steel plate, August delivery"
AP-441977,2026-08-19,8,Plant 1,Procurement,Europe,5100,Materials - steel,265000,AP-117,AP,APR-7012,PO-55231,V-4471,supplier,INV-88213-A,,,PRC-EU,"Steel plate, August delivery"
BI-28901,2026-07-31,7,Plant 2,Finance,Corporate,2890,Suspense,100000,BATCH-IMPORT,batch,,,,,,,,UNMAPPED,"New plant report, cost-centre code not mapped"
BI-28902,2026-08-31,8,Plant 2,Finance,Corporate,2890,Suspense,115000,BATCH-IMPORT,batch,,,,,,,,UNMAPPED,"New plant report, cost-centre code not mapped"
BI-28903,2026-09-30,9,Plant 2,Finance,Corporate,2890,Suspense,125000,BATCH-IMPORT,batch,,,,,,,,UNMAPPED,"New plant report, cost-centre code not mapped"
AP-450212,2026-09-10,9,Corporate,Sales,Asia,7350,SG&A consulting,185000,AP-122,AP,,,V-9020,consultant,MS-2026-07,,,SLS-AS,"Market study, Asia region"
JE-260644,2026-07-02,7,Corporate,Finance,North America,5600,Warranty expense,410000,CC-031,manual,APR-6990,,,,,,,FIN-NA,"Q2 warranty accrual carried forward, accrual flag blank"
AP-451903,2026-09-22,9,Plant 1,Customs and Trade,North America,7410,Broker fees,118000,AP-117,AP,APR-7699,,V-3300,broker,BRK-09-118,E-13,,CUS-NA,"Broker fee, shipment E-13"
AP-460100,2026-07-08,7,Plant 1,Customs and Trade,North America,7410,Broker fees,2400,AP-117,AP,APR-7501,,V-3300,broker,BRK-E-01,E-01,,CUS-NA,"Broker fee, USA to Guelph"
AP-460200,2026-07-15,7,Plant 1,Customs and Trade,North America,7410,Broker fees,1600,AP-117,AP,APR-7502,,V-3300,broker,BRK-E-02,E-02,,CUS-NA,"Broker fee, Germany to Guelph"
AP-460300,2026-07-22,7,Plant 1,Customs and Trade,North America,7410,Broker fees,1300,AP-117,AP,APR-7503,,V-3300,broker,BRK-E-03,E-03,,CUS-NA,"Broker fee, Germany to Guelph"
AP-460400,2026-07-29,7,Plant 1,Customs and Trade,North America,7410,Broker fees,4500,AP-117,AP,APR-7504,,V-3300,broker,BRK-E-04,E-04,,CUS-NA,"Broker fee, China to Guelph"
AP-460500,2026-08-05,8,Plant 1,Customs and Trade,North America,7410,Broker fees,2500,AP-117,AP,APR-7505,,V-3300,broker,BRK-E-05,E-05,,CUS-NA,"Broker fee, China to Guelph"
AP-460600,2026-08-12,8,Plant 1,Customs and Trade,North America,7410,Broker fees,3500,AP-117,AP,APR-7506,,V-3300,broker,BRK-E-06,E-06,,CUS-NA,"Broker fee, China to Guelph"
AP-460700,2026-08-19,8,Plant 1,Customs and Trade,North America,7410,Broker fees,1100,AP-117,AP,APR-7507,,V-3300,broker,BRK-E-07,E-07,,CUS-NA,"Broker fee, Italy to Guelph"
AP-460800,2026-08-26,8,Plant 1,Customs and Trade,North America,7410,Broker fees,950,AP-117,AP,APR-7508,,V-3300,broker,BRK-E-08,E-08,,CUS-NA,"Broker fee, Mexico to Guelph"
AP-460900,2026-09-02,9,Plant 1,Customs and Trade,North America,7410,Broker fees,870,AP-117,AP,APR-7509,,V-3300,broker,BRK-E-09,E-09,,CUS-NA,"Broker fee, Japan to Guelph"
AP-461000,2026-09-09,9,Plant 1,Customs and Trade,North America,7410,Broker fees,3800,AP-117,AP,APR-7510,,V-3300,broker,BRK-E-10,E-10,,CUS-NA,"Broker fee, Guelph to Brisbane"
AP-461100,2026-09-16,9,Plant 1,Customs and Trade,North America,7410,Broker fees,2100,AP-117,AP,APR-7511,,V-3300,broker,BRK-E-11,E-11,,CUS-NA,"Broker fee, Guelph to Chicago"
AP-461200,2026-09-23,9,Plant 1,Customs and Trade,North America,7410,Broker fees,900,AP-117,AP,APR-7512,,V-3300,broker,BRK-E-12,E-12,,CUS-NA,"Broker fee, South Korea to Guelph"
AP-447001,2026-07-10,7,Plant 1,Procurement,North America,5100,Materials - steel,310000,AP-117,AP,APR-6901,PO-55102,V-4102,supplier,INV-70411,,,PRC-NA,"Steel coil, July delivery"
AP-447020,2026-07-01,7,Plant 2,Operations,North America,6100,Plant rent,42000,AP-122,AP,APR-6001,PO-50010,V-2001,landlord,RENT-2026-07,,,P2-OPS,"Plant 2 warehouse rent, July"
AP-448020,2026-08-01,8,Plant 2,Operations,North America,6100,Plant rent,42000,AP-122,AP,APR-6001,PO-50010,V-2001,landlord,RENT-2026-08,,,P2-OPS,"Plant 2 warehouse rent, August"
AP-449020,2026-09-01,9,Plant 2,Operations,North America,6100,Plant rent,42000,AP-122,AP,APR-6001,PO-50010,V-2001,landlord,RENT-2026-09,,,P2-OPS,"Plant 2 warehouse rent, September"
AP-447115,2026-07-17,7,Plant 1,Logistics,North America,6600,Freight out,61000,LC-01,AP,APR-6622,,V-6101,carrier,FR-1180,,,LOG-NA,"Scheduled freight, finished lifts"
AP-448130,2026-08-18,8,Plant 1,Logistics,North America,6600,Freight out,58500,LC-02,AP,APR-6640,,V-6102,carrier,FR-1214,,,LOG-NA,"Scheduled freight, finished lifts"
AP-447230,2026-07-21,7,Plant 2,Operations,North America,6300,Maintenance,27400,PA-2201,AP,APR-6710,PO-55140,V-5120,supplier,MT-3391,,,P2-OPS,Weld cell maintenance
AP-448310,2026-08-11,8,Plant 1,Procurement,Europe,5100,Materials - hydraulics,96000,AP-117,AP,APR-7020,PO-55260,V-4480,supplier,INV-51900,,,PRC-EU,Hydraulic fittings
AP-449410,2026-09-04,9,Corporate,Sales,Europe,7300,SG&A marketing,38000,AP-122,AP,APR-7402,PO-55390,V-9105,agency,MK-0904,,,SLS-EU,Trade show booth
JE-260702,2026-07-31,7,Plant 2,Operations,North America,6200,Plant utilities,74500,PA-2201,manual,APR-6800,,,,,,JE-260801,P2-OPS,"Utilities accrual, July (reversed in August)"
AP-449520,2026-09-15,9,Plant 1,Procurement,Asia,5100,Materials - electrical,143000,AP-117,AP,APR-7455,PO-55410,V-4720,supplier,INV-66012,,,PRC-AS,Control panel components
AP-449610,2026-09-18,9,Plant 2,Operations,North America,6410,Scrap and write-offs,18200,PA-2201,AP,APR-7470,,,,,,,P2-OPS,"Routine scrap, September"`;

export const CUSTOMS_Q3_CSV = `entry_id,direction,route,origin_country,goods,hs_code,value_cad,mfn_rate,extra_tariff_rate,agreement_available,agreement_claimed,origin_cert_on_file,incoterm,duty_and_tariff_paid,broker_fee_billed
E-01,import,USA to Guelph,USA,Steel plate,7208,1200000,0.0,0.0,CUSMA,yes,yes,,0,2400
E-02,import,Germany to Guelph,Germany,Hydraulic cylinders,8412,800000,0.025,0.0,,no,no,,20000,1600
E-03,import,Germany to Guelph,Germany,Hydraulic cylinders,8412,650000,0.025,0.0,,no,no,,16250,1300
E-04,import,China to Guelph,China,Electric motors,8501,900000,0.035,0.25,,no,no,,256500,4500
E-05,import,China to Guelph,China,Control modules,8537,500000,0.0,0.25,,no,no,,125000,2500
E-06,import,China to Guelph,China,Electric motors,8501,700000,0.035,0.25,,no,no,,199500,3500
E-07,import,Italy to Guelph,Italy,Scissor-arm parts,7326,420000,0.029,0.0,,no,no,,12180,1100
E-08,import,Mexico to Guelph,Mexico,Wire harnesses,8544,380000,0.029,0.0,CUSMA,no,yes,,11020,950
E-09,import,Japan to Guelph,Japan,Engine parts,8408,290000,0.0,0.0,CPTPP,yes,yes,,0,870
E-10,export,Guelph to Brisbane,Canada,Boom lifts,8427,1500000,0.04,0.0,,no,no,DDP,60000,3800
E-11,export,Guelph to Chicago,Canada,Scissor lifts,8427,2400000,0.0,0.0,CUSMA,yes,yes,DAP,0,2100
E-12,import,South Korea to Guelph,South Korea,Bearings,8482,240000,0.045,0.0,,no,no,,10800,900`;

export const EVIDENCE_Q3_CSV = `evidence_id,type,date,linked_ref,owner,summary
EV-001,Quality report,2026-09-25,JE-260931,"Quality, Plant 2",Cylinder batch CB-4410 failed weld inspection. Batch scrapped.
EV-002,Posting log,2026-09-29,JE-260931,ERP,"Posted Tuesday 18:42 by PA-2214, who does not normally post to the Plant 2 ledger. No reversal reference."
EV-003,Logistics note,2026-08-29,V-6101;V-6102;V-6103,Logistics,"Trucks booked late for finished lifts waiting in the yard, weeks 30 to 35. Three carriers charged rush premiums."
EV-004,Chart of accounts,2026-01-01,6600,Finance,"Carrier invoices belong in 6600 Freight out, not 7200 SG&A other."
EV-005,Payment record,2026-08-12,INV-88213,Accounts payable,"Payment of 265,000 released to V-4471 against PO-55231."
EV-006,Payment record,2026-08-25,INV-88213-A,Accounts payable,"Second payment of 265,000 released to V-4471 against the same PO-55231."
EV-007,Goods receipt,2026-08-04,PO-55231,Receiving,One delivery of steel plate received against PO-55231.
EV-008,Import log,2026-09-30,2890,ERP,Batch import from the new plant report used cost-centre codes with no mapping. Balance not cleared at close.
EV-009,Budget,2026-01-15,V-9020,Sales,No market study in the 2026 Asia budget. No purchase order raised. Approver not recorded.
EV-010,Close template,2026-06-30,JE-260644,Corporate controller,"Q2 warranty accrual of 410,000 booked. Template has no accrual flag, so no automatic reversal was created."
EV-011,Shipment register,2026-09-30,E-13,Customs and Trade,No shipment E-13 in the ERP or in the broker's twelve Q3 entries.
EV-012,Broker contract,2025-01-01,V-3300,Customs and Trade,Brokerage fee is 0.2% of the value of the goods per entry.
EV-013,Origin certificate,2026-06-18,E-08,Customs and Trade,"CUSMA certificate of origin for wire harnesses from the Mexican supplier, on file in email. Not presented at entry."
EV-014,Purchase order,2026-06-20,PO-55102,Procurement,"Steel coil order, 310,000, approved. Goods received July 9."`;

export const SALES_TAX_Q3_CSV = `destination,tax_rule,tax_rate,sales_cad,sales_tax_cad,freight_cad
"Calgary, Alberta",GST 5%,0.05,2200000,110000,18400
"Vancouver, British Columbia",GST 5% + PST 7%,0.12,1600000,192000,27900
"Montreal, Quebec",GST 5% + QST 9.975%,0.14975,1900000,284525,19600
"Halifax, Nova Scotia",HST 15%,0.15,700000,105000,14300
"Winnipeg, Manitoba",GST 5% + RST 7%,0.12,900000,108000,15200`;

export const OE_WALK_CSV = `walk,step,amount_000s
yoy,Start: Q3 2025 operating earnings,15200
yoy,Sales: volume,13800
yoy,Sales: price,2400
yoy,Sales: exchange rates,900
yoy,Variable costs: volume,-6300
yoy,Variable costs: material prices,-900
yoy,Variable costs: exchange rates,-400
yoy,Variable costs: efficiency gains,500
yoy,Fixed plant: wage increases,-1400
yoy,Fixed plant: one-time scrap (IR-01),-900
yoy,Fixed plant: other,-300
yoy,SG&A: rush freight (IR-02),-600
yoy,SG&A: other,-500
yoy,Amortization,-800
yoy,End: Q3 2026 operating earnings,20700
qoq,Start: Q2 2026 operating earnings,16500
qoq,Sales: volume,8400
qoq,Sales: price,1700
qoq,Sales: exchange rates,1200
qoq,Variable costs: volume,-4600
qoq,Variable costs: material prices,-300
qoq,Variable costs: exchange rates,-200
qoq,Variable costs: efficiency gains,-100
qoq,Fixed plant: seasonal overtime,-700
qoq,Fixed plant: one-time scrap,-600
qoq,Fixed plant: underspend,300
qoq,SG&A: rush freight,-400
qoq,SG&A: other,-200
qoq,Amortization,-300
qoq,End: Q3 2026 operating earnings,20700`;

export const DUTY_TREND_CSV = `quarter,duty_tariff_broker_000s
Q4 2024,298
Q1 2025,281
Q2 2025,305
Q3 2025,312
Q4 2025,327
Q1 2026,402
Q2 2026,588
Q3 2026,737`;

export const BROKER_CONTRACT_JSON = `{"broker_vendor_id": "V-3300", "fee_rate_of_goods_value": 0.002, "note": "Practice assumption from the case appendix"}`;

/**
 * RFC-4180 compliant CSV parser supporting quoted fields with embedded commas and escaped quotes.
 */
export function parseCsv(csvText: string): Record<string, string>[] {
  const cleaned = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleaned) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (ch === '\r' && next === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += ch;
      }
    }
  }

  currentRow.push(currentField);
  if (currentRow.some((cell) => cell.trim() !== '')) {
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const records: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every((cell) => cell.trim() === '')) continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = (row[c] ?? '').trim();
    }
    records.push(obj);
  }

  return records;
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

const REQUIRED_LEDGER_COLUMNS = [
  'entry_id',
  'gl_account',
  'amount_cad',
  'source',
  'approval_ref',
  'vendor_id',
  'invoice_no',
  'shipment_ref',
  'description',
];

const REQUIRED_CUSTOMS_COLUMNS = [
  'entry_id',
  'value_cad',
  'agreement_claimed',
  'origin_cert_on_file',
  'duty_and_tariff_paid',
  'broker_fee_billed',
];

export function parseLedgerCsv(csvText: string): { rows: LedgerRow[]; error?: string } {
  const records = parseCsv(csvText);
  if (records.length === 0) {
    return { rows: [], error: 'The uploaded ledger CSV contains no data rows.' };
  }

  const headers = Object.keys(records[0]);
  const missing = REQUIRED_LEDGER_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    return {
      rows: [],
      error: `Missing required ledger columns: ${missing.join(', ')}`,
    };
  }

  const rows: LedgerRow[] = records.map((r) => ({
    entry_id: r.entry_id ?? '',
    post_date: r.post_date ?? '',
    period: toNumber(r.period),
    plant: r.plant ?? '',
    department: r.department ?? '',
    region: r.region ?? '',
    gl_account: r.gl_account ?? '',
    gl_name: r.gl_name ?? '',
    amount_cad: toNumber(r.amount_cad),
    preparer: r.preparer ?? '',
    source: r.source ?? '',
    approval_ref: r.approval_ref ?? '',
    po_ref: r.po_ref ?? '',
    vendor_id: r.vendor_id ?? '',
    vendor_type: r.vendor_type ?? '',
    invoice_no: r.invoice_no ?? '',
    shipment_ref: r.shipment_ref ?? '',
    reversal_ref: r.reversal_ref ?? '',
    cost_centre: r.cost_centre ?? '',
    description: r.description ?? '',
  }));

  return { rows };
}

export function parseCustomsCsv(csvText: string): { rows: CustomsRow[]; error?: string } {
  const records = parseCsv(csvText);
  if (records.length === 0) {
    return { rows: [], error: 'The uploaded customs CSV contains no data rows.' };
  }

  const headers = Object.keys(records[0]);
  const missing = REQUIRED_CUSTOMS_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    return {
      rows: [],
      error: `Missing required customs columns: ${missing.join(', ')}`,
    };
  }

  const rows: CustomsRow[] = records.map((r) => ({
    entry_id: r.entry_id ?? '',
    direction: r.direction ?? '',
    route: r.route ?? '',
    origin_country: r.origin_country ?? '',
    goods: r.goods ?? '',
    hs_code: r.hs_code ?? '',
    value_cad: toNumber(r.value_cad),
    mfn_rate: toNumber(r.mfn_rate),
    extra_tariff_rate: toNumber(r.extra_tariff_rate),
    agreement_available: r.agreement_available ?? '',
    agreement_claimed: r.agreement_claimed ?? '',
    origin_cert_on_file: r.origin_cert_on_file ?? '',
    incoterm: r.incoterm ?? '',
    duty_and_tariff_paid: toNumber(r.duty_and_tariff_paid),
    broker_fee_billed: toNumber(r.broker_fee_billed),
  }));

  return { rows };
}

export function parseEvidenceCsv(csvText: string): EvidenceRow[] {
  return parseCsv(csvText).map((r) => ({
    evidence_id: r.evidence_id ?? '',
    type: r.type ?? '',
    date: r.date ?? '',
    linked_ref: r.linked_ref ?? '',
    owner: r.owner ?? '',
    summary: r.summary ?? '',
  }));
}

export function parseSalesTaxCsv(csvText: string): SalesTaxRow[] {
  return parseCsv(csvText).map((r) => ({
    destination: r.destination ?? '',
    tax_rule: r.tax_rule ?? '',
    tax_rate: toNumber(r.tax_rate),
    sales_cad: toNumber(r.sales_cad),
    sales_tax_cad: toNumber(r.sales_tax_cad),
    freight_cad: toNumber(r.freight_cad),
  }));
}

export function parseOeWalkCsv(csvText: string): OeWalkRow[] {
  return parseCsv(csvText).map((r) => ({
    walk: r.walk ?? '',
    step: r.step ?? '',
    amount_000s: toNumber(r.amount_000s),
  }));
}

export function parseDutyTrendCsv(csvText: string): DutyTrendRow[] {
  return parseCsv(csvText).map((r) => ({
    quarter: r.quarter ?? '',
    duty_tariff_broker_000s: toNumber(r.duty_tariff_broker_000s),
  }));
}

export const DEFAULT_BROKER_CONTRACT: BrokerContract = JSON.parse(BROKER_CONTRACT_JSON);

export const DEFAULT_DATASET: SkyTraceDataset = {
  ledger: parseLedgerCsv(LEDGER_Q3_CSV).rows,
  customs: parseCustomsCsv(CUSTOMS_Q3_CSV).rows,
  evidence: parseEvidenceCsv(EVIDENCE_Q3_CSV),
  salesTax: parseSalesTaxCsv(SALES_TAX_Q3_CSV),
  oeWalk: parseOeWalkCsv(OE_WALK_CSV),
  dutyTrend: parseDutyTrendCsv(DUTY_TREND_CSV),
  brokerContract: DEFAULT_BROKER_CONTRACT,
};
