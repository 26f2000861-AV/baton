/**
 * Parse-level audit of every TS/TSX file in src/, prisma/, tests/.
 * Uses the TypeScript compiler API directly (no project config, no
 * incremental cache) so swallowed syntax errors surface.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ts = require('typescript');
const DIRS = ['src', 'prisma', 'tests'];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, out);
    } else if (/\.(ts|tsx|mts)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

let bad = 0;
for (const file of walk(path.join(ROOT, DIRS[0]))
  .concat(walk(path.join(ROOT, DIRS[1])))
  .concat(walk(path.join(ROOT, DIRS[2])))) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.ESNext, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const diags = sf.parseDiagnostics || [];
  if (diags.length) {
    bad++;
    console.log(`\n${file} (${diags.length} parse errors)`);
    for (const d of diags.slice(0, 6)) {
      const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
      console.log(`  line ${line + 1}:${character + 1} — ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
      const problemLine = text.split('\n')[line] ?? '';
      console.log(`    > ${problemLine.trim().slice(0, 140)}`);
    }
  }
}
console.log(bad === 0 ? '\nALL FILES PARSE CLEAN' : `\n${bad} file(s) with parse errors`);
