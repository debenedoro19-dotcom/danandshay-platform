import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function cleanEnv(val) {
  if (!val) return '';
  let s = String(val).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function loadEnvironment() {
  const candidates = [
    '/etc/secrets/.env',
    '/etc/secrets/render.env',
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'render.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../render.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../render.env'),
  ];

  if (fs.existsSync('/etc/secrets')) {
    try {
      const files = fs.readdirSync('/etc/secrets');
      for (const f of files) {
        const full = path.join('/etc/secrets', f);
        if (!candidates.includes(full)) candidates.push(full);
      }
    } catch (e) {}
  }

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const stat = fs.statSync(p);
        if (!stat.isFile()) continue;
        const text = fs.readFileSync(p, 'utf8');
        const lines = text.split(/\r?\n/);
        let loaded = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const idx = trimmed.indexOf('=');
          if (idx > 0) {
            const key = trimmed.slice(0, idx).trim();
            let val = trimmed.slice(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1).trim();
            }
            if (!process.env[key] || process.env[key] === 'YOUR_EMAIL_PASSWORD_HERE' || process.env[key] === '') {
              process.env[key] = val;
              loaded++;
            }
          }
        }
        if (loaded > 0) {
          console.log(`[Env Loader] Loaded ${loaded} variable(s) from ${p}`);
        }
      } catch (err) {}
    }
  }
}

// Load on import
loadEnvironment();
