#!/usr/bin/env node
// Screenshot a local HTML page at several viewports and scroll positions, and
// report what the browser console complained about.
//
// Zero dependencies: serves the page's folder over http and drives an installed
// Chrome or Edge through the DevTools protocol. Needs Node 22+ (global WebSocket).
//
//   node shoot.mjs page.html
//   node shoot.mjs page.html --out shots --viewports 1440x900,390x844 --scroll 0,0.5,1 --wait 2500
//   node shoot.mjs page.html --at 0,1500,4000        # same frame over time: judges motion
//   node shoot.mjs page.html --eval "window.__setMode(false)"
//   node shoot.mjs page.html --fps 4000 --dpr 2     # frame pacing: idle, then a scroll sweep
//   node shoot.mjs still.html --viewports 2400x3000 --tiles 2x2
//                                                    # a large still, captured in pieces (see TILES below)
//   node shoot.mjs page.html --wait 0 --when "document.querySelector('#scene.ready')" --fps 4000
//                                                    # pacing from the moment the intro starts
//
// Output: <out>/<name>-<w>x<h>-s<scroll%>[-t<ms>].png and <out>/report.json

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const page = args.find(a => !a.startsWith('--'));
const opt = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
if (!page || !existsSync(page)) {
  console.error('usage: node shoot.mjs <page.html> [--out dir] [--viewports WxH,..] [--scroll 0,0.5,1] [--at ms,..] [--wait ms] [--dpr n] [--eval js] [--when js] [--fps ms] [--tiles CxR]');
  process.exit(2);
}

const file = resolve(page);
const root = dirname(file);
const name = basename(file, extname(file));
const out = resolve(opt('out', join(root, 'shots')));
const viewports = opt('viewports', '1440x900,390x844').split(',').map(v => v.split('x').map(Number));
const scrolls = opt('scroll', '0').split(',').map(Number);
const times = opt('at', '').split(',').filter(Boolean).map(Number);
const wait = Number(opt('wait', 2500));
const dpr = Number(opt('dpr', 1));
const evalJs = opt('eval', '');
const fpsMs = Number(opt('fps', 0));
const whenJs = opt('when', '');
// TILES. One capture above roughly two million device pixels stalled headless Chrome (1200x1500 and
// 1600x1000 returned in seconds; 1800x2250 and 2880x1800 never did). A large still is therefore taken
// as a grid of smaller captures, written as <name>-<label>-r<row>c<col>.png, to be joined afterwards.
const tiles = opt('tiles', '').split('x').map(Number);

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
].filter(Boolean);
const browser = BROWSERS.find(existsSync);
if (!browser) {
  console.error('No Chrome or Edge found. Set CHROME_PATH to a Chromium-based browser.');
  process.exit(2);
}

// Serve over http, not file://, so relative fetches (HDRIs, models, JSON) behave as they will when deployed.
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.hdr': 'application/octet-stream',
  '.exr': 'application/octet-stream', '.ktx2': 'image/ktx2', '.bin': 'application/octet-stream',
  '.wasm': 'application/wasm', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg',
};
const server = createServer((req, res) => {
  const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (req.url === '/favicon.ico') { res.writeHead(204).end(); return; }   // not the page's problem
  if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  if (!existsSync(path) || !statSync(path).isFile()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(path).toLowerCase()] || 'application/octet-stream' });
  res.end(readFileSync(path));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/${encodeURIComponent(basename(file))}`;

const profile = mkdtempSync(join(tmpdir(), 'shoot-'));
const chrome = spawn(browser, [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
  // WebGL in headless: use the GPU when there is one, software rendering when there is not.
  '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

const cleanup = () => {
  try { chrome.kill(); } catch {}
  try { server.close(); } catch {}
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
};
process.on('exit', cleanup);

const wsUrl = await new Promise((ok, fail) => {
  let buf = '';
  const timer = setTimeout(() => fail(new Error('browser did not start within 20s')), 20000);
  chrome.stderr.on('data', d => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) { clearTimeout(timer); ok(m[1]); }
  });
  chrome.on('exit', code => fail(new Error('browser exited early, code ' + code)));
});

const ws = new WebSocket(wsUrl);
await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = () => fail(new Error('devtools socket failed')); });
let nextId = 1;
const pending = new Map();
const listeners = [];
ws.onmessage = e => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { ok, fail } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? fail(new Error(msg.error.message)) : ok(msg.result);
  } else if (msg.method) listeners.forEach(fn => fn(msg));
};
const send = (method, params = {}, sessionId) => new Promise((ok, fail) => {
  const id = nextId++;
  pending.set(id, { ok, fail });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (method, params) => send(method, params, sessionId);

const problems = [];
const note = (kind, text) => {
  const line = `${kind}: ${String(text).replace(/\s+/g, ' ').slice(0, 400)}`;
  if (!problems.includes(line)) problems.push(line);
};
listeners.push(msg => {
  if (msg.sessionId !== sessionId) return;
  const p = msg.params;
  if (msg.method === 'Runtime.exceptionThrown') {
    note('exception', p.exceptionDetails.exception?.description || p.exceptionDetails.text);
  } else if (msg.method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'warning')) {
    note('console.' + p.type, p.args.map(a => a.value ?? a.description ?? '').join(' '));
  } else if (msg.method === 'Log.entryAdded' && p.entry.level === 'error') {
    note('log', `${p.entry.text} ${p.entry.url || ''}`);
  }
});
await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Log.enable');

// Frame pacing. Intervals between animation frames, first with the page idle and then while it is
// scrolled from top to bottom. The GPU string matters: a software renderer makes the absolute numbers
// meaningless, though two pages measured the same way can still be compared.
const PROBE = (ms, sweep) => `(async () => {
  const gl = document.createElement('canvas').getContext('webgl2');
  const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unknown';
  const max = document.documentElement.scrollHeight - innerHeight;
  const gaps = [], slowAt = [];
  const start = performance.now();
  let last = start;
  await new Promise(done => {
    const tick = now => {
      const gap = now - last; gaps.push(gap); last = now;
      if (gap > 33.4 && gaps.length > 1) slowAt.push(Math.round(100 * Math.min(1, (now - start) / ${ms})));
      if (${sweep}) scrollTo(0, max * Math.min(1, (now - start) / ${ms}));
      now - start < ${ms} ? requestAnimationFrame(tick) : done();
    };
    requestAnimationFrame(tick);
  });
  gaps.shift();
  const sorted = [...gaps].sort((a, b) => a - b);
  const at = q => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
  return JSON.stringify({
    gpu, frames: gaps.length, fps: 1000 * gaps.length / gaps.reduce((a, b) => a + b, 0),
    median: at(0.5), p95: at(0.95), worst: sorted[sorted.length - 1], over33ms: gaps.filter(g => g > 33.4).length, slowAt,
  });
})()`;
const pacing = [];
const probe = async (label, sweep) => {
  const { result } = await cdp('Runtime.evaluate', { expression: PROBE(fpsMs, sweep), awaitPromise: true, returnByValue: true });
  const r = JSON.parse(result.value);
  pacing.push({ label, ...r });
  console.log(`pace  ${label.padEnd(22)} ${r.fps.toFixed(1).padStart(5)} fps   median ${r.median.toFixed(1)}ms   p95 ${r.p95.toFixed(1)}ms   worst ${r.worst.toFixed(0)}ms   frames over 33ms: ${r.over33ms}/${r.frames}${sweep && r.slowAt.length ? '   at scroll % ' + [...new Set(r.slowAt)].join(',') : ''}`);
  return r.gpu;
};

mkdirSync(out, { recursive: true });
const shots = [];
const shoot = async label => {
  if (tiles.length === 2 && tiles[0] > 0 && tiles[1] > 0) {
    const [cols, rows] = tiles;
    const { result } = await cdp('Runtime.evaluate', { expression: 'JSON.stringify([innerWidth, innerHeight, scrollX, scrollY])', returnByValue: true });
    const [w, h, sx, sy] = JSON.parse(result.value);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const clip = { x: sx + c * w / cols, y: sy + r * h / rows, width: w / cols, height: h / rows, scale: 1 };
      const { data } = await cdp('Page.captureScreenshot', { format: 'png', clip });
      const path = join(out, `${name}-${label}-r${r}c${c}.png`);
      writeFileSync(path, Buffer.from(data, 'base64'));
      shots.push(path);
    }
    return;
  }
  const { data } = await cdp('Page.captureScreenshot', { format: 'png' });
  const path = join(out, `${name}-${label}.png`);
  writeFileSync(path, Buffer.from(data, 'base64'));
  shots.push(path);
};

for (const [width, height] of viewports) {
  await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: width < 768 });
  const loaded = new Promise(ok => {
    const fn = msg => {
      if (msg.sessionId === sessionId && msg.method === 'Page.loadEventFired') {
        listeners.splice(listeners.indexOf(fn), 1);
        ok();
      }
    };
    listeners.push(fn);
  });
  await cdp('Page.navigate', { url });
  await Promise.race([loaded, sleep(20000)]);
  await sleep(wait);
  if (whenJs) {                                  // hold until the page says it is ready, 10s at most
    for (let i = 0; i < 200; i++) {
      const { result } = await cdp('Runtime.evaluate', { expression: `Boolean(${whenJs})`, returnByValue: true });
      if (result.value) break;
      await sleep(50);
    }
  }
  if (evalJs) {
    const { result } = await cdp('Runtime.evaluate', { expression: evalJs, awaitPromise: true, returnByValue: true });
    if (result && result.value !== undefined) console.log('eval  ' + JSON.stringify(result.value));
  }
  if (fpsMs) {
    const gpu = await probe(`${width}x${height}@${dpr} idle`, false);
    await probe(`${width}x${height}@${dpr} scroll`, true);
    console.log('gpu   ' + gpu);
    continue;                                  // a pacing run takes no screenshots
  }

  if (times.length) {
    // One frame over time. Elapsed time is counted from the end of --wait.
    let elapsed = 0;
    for (const t of times) {
      await sleep(Math.max(0, t - elapsed));
      elapsed = t;
      await shoot(`${width}x${height}-s0-t${t}`);
    }
  }
  for (const f of scrolls) {
    await cdp('Runtime.evaluate', {
      expression: `window.scrollTo({ top: ${f} * (document.documentElement.scrollHeight - innerHeight), behavior: 'instant' })`,
    });
    await sleep(f === 0 ? 150 : 900);   // let scrubbed and smoothed scroll animation settle
    await shoot(`${width}x${height}-s${Math.round(f * 100)}`);
  }
}

writeFileSync(join(out, 'report.json'), JSON.stringify({ page: file, shots, problems, pacing }, null, 2));
for (const s of shots) console.log('shot  ' + s);
console.log(`PROBLEMS: ${problems.length}`);
for (const p of problems) console.log('  ' + p);
ws.close();
cleanup();
process.exit(0);
