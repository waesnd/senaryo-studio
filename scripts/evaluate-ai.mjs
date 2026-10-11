import fs from 'node:fs/promises';
import { callGroq } from '../lib/groq.js';
import { aiOperations } from '../lib/server/aiOperations.js';

const args = process.argv.slice(2);
if (!args.includes('--live')) {
  console.log('Canlı AI değerlendirmesi kapalı. Sentetik briefleri inceleyin veya --live --limit 3 ile çalıştırın.');
  process.exit(0);
}
if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY ortam değişkeni gerekli; anahtarı dosyaya yazmayın.');
const at = args.indexOf('--limit');
const limit = at < 0 ? 3 : Number(args[at + 1]);
if (!Number.isInteger(limit) || limit < 1 || limit > 30) throw new Error('Limit 1–30 arasında tam sayı olmalı.');
const cases = JSON.parse(await fs.readFile(new URL('../evals/turkish-scenarios.json', import.meta.url), 'utf8')).slice(0, limit);
const rows = [];
for (const item of cases) {
  const definition = aiOperations.generate;
  const started = Date.now();
  try {
    const input = definition.inputSchema.parse(item.input);
    const output = await callGroq(definition.buildPrompt(input), definition.options);
    const validated = definition.outputSchema.safeParse(output);
    rows.push({ id: item.id, model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', latencyMs: Date.now() - started, schemaValid: validated.success, output: validated.success ? validated.data : null, review: item.review });
  } catch {
    rows.push({ id: item.id, latencyMs: Date.now() - started, schemaValid: false, error: 'Generation failed; no prompt, credential or provider body logged.' });
  }
  console.log(item.id, rows.at(-1).schemaValid ? 'schema valid' : 'failed', rows.at(-1).latencyMs + 'ms');
}
await fs.mkdir('.artifacts', { recursive: true });
await fs.writeFile('.artifacts/ai-evaluation.json', JSON.stringify({ createdAt: new Date().toISOString(), rows }, null, 2));
if (rows.some(row => !row.schemaValid)) process.exitCode = 1;
