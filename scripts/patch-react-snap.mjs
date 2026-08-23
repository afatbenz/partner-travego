// Patch react-snap untuk kompatibilitas puppeteer >= 20.
// react-snap 1.23.0 ditulis untuk puppeteer 1.x yang punya API privat `page._client`.
// Puppeteer modern menghapus `_client` — snapshot gagal dengan
// "page._client.send is not a function". Patch: panggil opsional via optional chaining.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reactSnapDir = path.join(__dirname, '..', 'node_modules', 'react-snap');

const patches = [
  {
    // puppeteer >= 20 menghapus API privat `page._client`
    file: path.join(reactSnapDir, 'src', 'puppeteer_utils.js'),
    from: `await page._client.send("ServiceWorker.disable");`,
    to: `await (page._client && page._client.send && page._client.send("ServiceWorker.disable"));`,
  },
  {
    // puppeteer >= 22 menghapus `page.removeListener` (pakai `page.off`)
    file: path.join(reactSnapDir, 'src', 'tracker.js'),
    from: `page.removeListener("request", onStarted);
      page.removeListener("requestfinished", onFinished);
      page.removeListener("requestfailed", onFinished);`,
    to: `page.off("request", onStarted);
      page.off("requestfinished", onFinished);
      page.off("requestfailed", onFinished);`,
  },
];

for (const { file, from, to } of patches) {
  try {
    const src = readFileSync(file, 'utf8');
    if (src.includes(from)) {
      writeFileSync(file, src.replace(from, to), 'utf8');
      console.log(`[patch-react-snap] OK: ${path.basename(file)}`);
    } else if (src.includes(to)) {
      console.log(`[patch-react-snap] ${path.basename(file)} sudah di-patch, skip`);
    } else {
      console.warn(`[patch-react-snap] pola tidak ditemukan di ${file}`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.warn(`[patch-react-snap] gagal di ${file}: ${err.message}`);
    process.exitCode = 1;
  }
}
