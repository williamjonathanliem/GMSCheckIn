// /api/check-in.js
export default async function handler(req, res) {
  // CORS (safe; no effect for same-origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok:false, message:'Method not allowed' }); return; }

  try {
    const { scannedText, target } = req.body || {};
    if (!scannedText || !target) {
      res.status(400).json({ ok:false, message:'Missing scannedText or target' });
      return;
    }

    const GAS_URL = (process.env.GAS_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbyOqrTKPUMgEsOFvyUp2ehU83wxjcZGBYCVNp_pj0j7jZ40SG1TalNXFYAp17-hiIBp/exec').trim();
    const SECRET  = (process.env.CHECKIN_SECRET   || 'GMSKL20300').trim();
    if (!GAS_URL) { res.status(500).json({ ok:false, message:'GAS_WEBAPP_URL not set' }); return; }
    if (!SECRET)  { res.status(500).json({ ok:false, message:'CHECKIN_SECRET not set' }); return; }

    // Give GAS room to cold-start / Wait on LockService
    const ac = new AbortController();
    const timeoutMs = 30000; // 30s (you can raise to 45000 if needed)
    const kill = setTimeout(() => ac.abort(), timeoutMs);

    const t0 = Date.now();
    console.log('check-in → GAS start', { target });

    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ scannedText, target, secret: SECRET }),
      signal: ac.signal,
      cache: 'no-store'
    }).catch(err => {
      throw new Error('Fetch to GAS failed, ' + err.message);
    });

    clearTimeout(kill);
    const ms = Date.now() - t0;
    console.log('check-in ← GAS', { status: r.status, ms });

    const text = await r.text();
    let json;
    try { json = JSON.parse(text); }
    catch { json = { ok:false, message: text || 'Invalid JSON from backend' }; }

    res.status(r.ok ? 200 : r.status).json(json);
  } catch (err) {
    console.error('check-in error', err);
    res.status(500).json({ ok:false, message:'Proxy error, ' + err.message });
  }
}

// For Vercel: ensure Node runtime (not Edge)
export const config = { runtime: 'nodejs18.x' };
