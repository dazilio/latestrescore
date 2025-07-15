import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

export default async function extractText(filePath) {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str).filter(Boolean);
      fullText += strings.join(' ') + '\n';
    }

    return fullText.trim();
  } catch (err) {
    console.error('❌ PDF.js failed:', err);
    throw err;
  }
}
