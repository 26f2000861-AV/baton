/**
 * Embedded Postgres daemon for the Baton sandbox.
 * Data dir: .localpg  (persists across sessions)
 * Port 5433, user/password baton/baton, database baton.
 * Usage: node scripts/pg-daemon.mjs   (long-running; run with nohup)
 */
import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, '.localpg');
const PORT = 5433;

async function main() {
  const firstRun = !fs.existsSync(path.join(DATA_DIR, 'PG_VERSION'));
  // eslint-disable-next-line no-new
  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: 'baton',
    password: 'baton',
    port: PORT,
    persistent: true,
  });
  if (firstRun) {
    console.log('[pg-daemon] initialising data dir ...');
    await pg.initialise();
    await pg.start();
    await pg.createDatabase('baton').catch(() => undefined);
  } else {
    await pg.start();
    await pg.createDatabase('baton').catch(() => undefined);
  }
  console.log(`[pg-daemon] postgres ready on 127.0.0.1:${PORT} (db: baton)`);
  // keep the process alive — the server runs inside this node process
  setInterval(() => undefined, 1 << 30);
}

main().catch((error) => {
  console.error('[pg-daemon] failed:', error);
  process.exit(1);
});
