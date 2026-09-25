/**
 * Build Script: Fetch HSK 3.0 Word Lists from krmanik/HSK-3.0
 * Merges with curated Vietnamese curriculum data to generate public/data/hsk_vocab_corpus.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TSV_BASE_URL = 'https://raw.githubusercontent.com/krmanik/HSK-3.0/main/Scripts%20and%20data/tsv/';

const TSV_FILES = [
  { file: 'HSK 1.tsv', level: 1 },
  { file: 'HSK 2.tsv', level: 2 },
  { file: 'HSK 3.tsv', level: 3 },
  { file: 'HSK 4.tsv', level: 4 },
  { file: 'HSK 5.tsv', level: 5 },
  { file: 'HSK 6.tsv', level: 6 },
  { file: 'HSK 7-9.tsv', level: 7 }
];

async function fetchTSV(fileName) {
  const url = TSV_BASE_URL + encodeURIComponent(fileName);
  console.log(`[Fetching] ${fileName} from ${url}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${fileName}: HTTP ${res.status}`);
  }
  return await res.text();
}

async function main() {
  const existingCorpusPath = path.resolve(__dirname, '../public/data/hsk_vocab_corpus.json');
  let existingMap = new Map();
  if (fs.existsSync(existingCorpusPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(existingCorpusPath, 'utf8'));
      if (Array.isArray(existing)) {
        for (const item of existing) {
          if (item.hanzi) existingMap.set(item.hanzi, item);
        }
      }
    } catch (e) {
      console.warn('Could not read existing corpus file:', e.message);
    }
  }

  const allWords = [];
  const seenHanzi = new Set();

  for (const { file, level } of TSV_FILES) {
    try {
      const tsvContent = await fetchTSV(file);
      const lines = tsvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      let count = 0;

      for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length < 3) continue;

        const trad = parts[0]?.trim() || '';
        const simp = parts[1]?.trim() || parts[0]?.trim() || '';
        const pinyin = parts[2]?.trim() || '';
        const meaningEn = parts[3]?.trim() || '';

        if (!simp) continue;

        // Deduplicate within same level or keep earliest level
        if (seenHanzi.has(simp)) continue;
        seenHanzi.add(simp);

        // Check if we have rich curated Vietnamese item
        const existing = existingMap.get(simp);

        const wordObj = {
          hanzi: simp,
          traditional: trad && trad !== simp ? trad : undefined,
          pinyin: pinyin,
          hanviet: existing?.hanviet || '',
          meaning: existing?.meaning || meaningEn,
          meaning_en: meaningEn,
          level: existing?.level || level,
          radical: existing?.radical || '',
          stroke_count: existing?.stroke_count || (simp.length * 6),
          example_zh: existing?.example_zh || '',
          example_pinyin: existing?.example_pinyin || '',
          example_vi: existing?.example_vi || '',
          notes: existing?.notes || ''
        };

        allWords.push(wordObj);
        count++;
      }

      console.log(`✓ Processed ${file}: ${count} words added (Level ${level})`);
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  }

  console.log(`\nTotal unique vocabulary items: ${allWords.length}`);

  // Write out to public/data/hsk_vocab_corpus.json
  const targetPath = path.resolve(__dirname, '../public/data/hsk_vocab_corpus.json');
  fs.writeFileSync(targetPath, JSON.stringify(allWords, null, 2), 'utf8');
  const sizeMb = (fs.statSync(targetPath).size / 1024 / 1024).toFixed(2);
  console.log(`✓ Successfully generated ${targetPath} (${sizeMb} MB)`);
}

main().catch(err => {
  console.error('Fatal error in build_corpus:', err);
  process.exit(1);
});
