// /api/check-in.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { 
    res.status(405).json({ ok:false, message:'Method not allowed' }); 
    return; 
  }

  try {
    const { scannedText, target, action } = req.body || {};
    if (!scannedText) {
      res.status(400).json({ ok:false, message:'Missing scannedText' });
      return;
    }
    if (!target && !action) {
      res.status(400).json({ ok:false, message:'Missing target or action' });
      return;
    }

    // Use env var if set, else fall back to your NEW GAS Web App URL
    const GAS_URL = (process.env.GAS_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbxtUesA0WZ2A3C8SjSK3IQFtdGP2NTRrNmC8WB8P-pDYcON1CxIeSQz2SawYckvb7dn/exec').trim();
    const SECRET  = (process.env.CHECKIN_SECRET || 'GMSKL20300').trim();
    if (!GAS_URL) { res.status(500).json({ ok:false, message:'GAS_WEBAPP_URL not set' }); return; }
    if (!SECRET)  { res.status(500).json({ ok:false, message:'CHECKIN_SECRET not set' }); return; }

    const ac = new AbortController();
    const timeoutMs = 30000;
    const kill = setTimeout(() => ac.abort(), timeoutMs);

    const t0 = Date.now();
    console.log('check-in → GAS start', { target, action });

    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ scannedText, target, action, secret: SECRET }),
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

// For Vercel, Node runtime
export const config = { runtime: 'nodejs' };
