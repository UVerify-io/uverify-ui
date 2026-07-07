import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const outputDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/og',
);

const templates = [
  { id: 'default', label: 'Verified Certificate' },
  { id: 'monochrome', label: 'Verified Certificate' },
  { id: 'diploma', label: 'Verified Diploma' },
  { id: 'productVerification', label: 'Authentic Product' },
  { id: 'petNecklace', label: 'Pet Identity' },
  { id: 'laboratoryReport', label: 'Laboratory Report' },
  { id: 'digitalProductPassport', label: 'Digital Product Passport' },
  { id: 'certificateOfInsurance', label: 'Certificate of Insurance' },
  { id: 'agentReceipt', label: 'Agent Receipt' },
  { id: 'documentIntegrity', label: 'Document Integrity' },
  { id: 'tokenizableCertificate', label: 'Tokenized Certificate' },
  { id: 'fractionizedCertificate', label: 'Fractionized Certificate' },
  { id: 'IdentityAuth', label: 'Identity Binding' },
];

const html = (label) => `<!doctype html><html><head><style>
  body { margin: 0; width: 1200px; height: 630px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; font-family: -apple-system, 'Segoe UI', sans-serif;
    background: radial-gradient(ellipse at bottom left, rgba(143,193,254,0.35), transparent 60%),
      radial-gradient(ellipse at top right, rgba(74,222,128,0.25), transparent 55%), rgb(3,8,18); }
  h1 { color: white; font-size: 64px; margin: 0 0 12px; }
  p { color: rgba(255,255,255,0.75); font-size: 30px; margin: 0; }
</style></head><body><h1>${label}</h1><p>Verified on Cardano · uverify.io</p></body></html>`;

fs.mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const template of templates) {
  await page.setContent(html(template.label));
  await page.screenshot({
    path: path.join(outputDirectory, `${template.id}.png`),
  });
  console.log(`generated og/${template.id}.png`);
}
await browser.close();
