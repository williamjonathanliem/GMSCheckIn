// /api/check-in.js
export default async function handler(req, res) {
  // CORS, safe default. If same origin, no effect.
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

    const GAS_URL = (process.env.GAS_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycby975FkbGZjQw-tWgkqMUm6Anb8rHwp-MgOALwcmR8STXG921gMM6OwI39iQGuvDR37/exec').trim();
    const SECRET  = (process.env.CHECKIN_SECRET || 'GMSKL20300').trim();
    if (!GAS_URL) { res.status(500).json({ ok:false, message:'GAS_WEBAPP_URL not set' }); return; }
    if (!SECRET)  { res.status(500).json({ ok:false, message:'CHECKIN_SECRET not set' }); return; }

    // Timeout guard
    const ac = new AbortController();
    const t  = setTimeout(() => ac.abort(), 12_000);

    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ scannedText, target, secret: SECRET }),
      signal: ac.signal,
      cache: 'no-store'
    }).catch(err => {
      throw new Error('Fetch to GAS failed, ' + err.message);
    });
    clearTimeout(t);

    const text = await r.text();
    let json; try { json = JSON.parse(text); } catch { json = { ok:false, message:text || 'Invalid JSON from backend' }; }

    // Pass through non-200s to help debugging
    res.status(r.ok ? 200 : r.status).json(json);
  } catch (err) {
    res.status(500).json({ ok:false, message:'Proxy error, ' + err.message });
  }
}
