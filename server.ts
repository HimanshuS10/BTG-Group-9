import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { buildTemplateDraft, type DraftLetterRequest } from './src/drafting';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const SERVER_GEMINI_TIMEOUT_MS = 7500;

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildUserPrompt(req: DraftLetterRequest): string {
  const ledgerSummary =
    req.ledgerRows.length > 0
      ? req.ledgerRows
          .map(
            (r) =>
              `- Entry ${r.entry_id} (${r.post_date}): GL ${r.gl_account} ${r.gl_name}, Amount $${r.amount_cad.toLocaleString('en-CA')} CAD, Vendor ${r.vendor_id || 'N/A'}, Invoice ${r.invoice_no || 'N/A'}, PO ${r.po_ref || 'N/A'}, Shipment ${r.shipment_ref || 'N/A'}, Approval ${r.approval_ref || 'blank'}, Description: "${r.description}"`,
          )
          .join('\n')
      : '- None';

  const customsSummary =
    req.customsRows.length > 0
      ? req.customsRows
          .map(
            (c) =>
              `- Entry ${c.entry_id}: ${c.route}, ${c.goods}, Value $${c.value_cad.toLocaleString('en-CA')} CAD, Duty & tariff paid $${c.duty_and_tariff_paid.toLocaleString('en-CA')} CAD, Broker fee billed $${c.broker_fee_billed.toLocaleString('en-CA')} CAD, Agreement ${c.agreement_available || 'None'} (cert on file: ${c.origin_cert_on_file}, claimed: ${c.agreement_claimed})`,
          )
          .join('\n')
      : '- None';

  const evidenceSummary =
    req.evidenceRows.length > 0
      ? req.evidenceRows
          .map(
            (e) =>
              `- ${e.evidence_id} (${e.type}, ${e.date}, ref ${e.linked_ref}, owner ${e.owner}): ${e.summary}`,
          )
          .join('\n')
      : '- No evidence rows linked';

  return [
    `Flag / Item: ${req.title}`,
    `Disputed / Flagged Amount: ${req.amountFormatted} CAD`,
    `Triggered Rule(s): ${req.ruleNames.join(', ')}`,
    `Summary: ${req.summary}`,
    '',
    'Triggered Ledger Rows:',
    ledgerSummary,
    '',
    'Triggered Customs Rows:',
    customsSummary,
    '',
    'Linked Evidence Rows:',
    evidenceSummary,
    '',
    'Write a short, polite dispute, credit request, or close-review letter (100 to 160 words) from SKYJACK citing every listed evidence ID and using only the exact amounts and references provided above.',
  ].join('\n');
}

async function generateWithTimeout(
  ai: GoogleGenAI,
  payload: DraftLetterRequest,
): Promise<string | null> {
  const prompt = buildUserPrompt(payload);

  const geminiPromise = ai.models
    .generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'You draft concise, polite business dispute letters, credit requests, and accounting correction notices for SKYJACK (a lift manufacturer). Strict rules: use plain text only (no markdown asterisks or bullet formatting issues), include a clear Subject line, cite the exact evidence IDs provided (such as EV-005), and use ONLY the exact CAD amounts, invoice numbers, PO numbers, shipment IDs, and facts supplied in the prompt. Never invent numbers, dates, or evidence. Keep the letter concise and ready for human review before sending.',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    })
    .then((response) => response.text?.trim() || null)
    .catch(() => null);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), SERVER_GEMINI_TIMEOUT_MS);
  });

  try {
    return await Promise.race([geminiPromise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  app.post('/api/draft-letter', async (req, res) => {
    const payload = req.body as DraftLetterRequest | undefined;
    if (!payload || typeof payload.title !== 'string') {
      res.status(400).json({ error: 'Invalid draft request payload.' });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.json({
        draft: buildTemplateDraft(payload),
        source: 'template',
      });
      return;
    }

    try {
      const text = await generateWithTimeout(ai, payload);
      if (text && text.length > 20) {
        res.json({
          draft: text,
          source: 'gemini',
        });
        return;
      }
      res.json({
        draft: buildTemplateDraft(payload),
        source: 'template',
      });
    } catch {
      res.json({
        draft: buildTemplateDraft(payload),
        source: 'template',
      });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Unique HMR websocket port so several apps can run side by side.
        hmr: process.env.DISABLE_HMR === 'true' ? false : { port: PORT + 21000 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkyTrace server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
