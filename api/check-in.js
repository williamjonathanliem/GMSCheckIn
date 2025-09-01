export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, message: 'Method not allowed' });
      return;
    }
    try {
      const { scannedText, target } = req.body || {};
      if (!scannedText || !target) {
        res.status(400).json({ ok: false, message: 'Missing scannedText or target' });
        return;
      }
  
      const GAS_URL = (process.env.GAS_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbz-S_b4KB3yqmx8F12HhxpoEn7eKFw2efCTKnIH4XjeQb7t1sJPd0trmuCRA2T6OPo_hQ/exec').trim();
      const SECRET  = (process.env.CHECKIN_SECRET || 'GMSKL20300').trim();
  
      if (!GAS_URL) { res.status(500).json({ ok: false, message: 'GAS_WEBAPP_URL not set' }); return; }
      if (!SECRET)  { res.status(500).json({ ok: false, message: 'CHECKIN_SECRET not set' }); return; }
  
      const r = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannedText, target, secret: SECRET })
      });
  
      const text = await r.text();
      let json;
      try { json = JSON.parse(text); }
      catch { json = { ok: false, message: text || 'Invalid JSON from backend' }; }
  
      res.status(200).json(json);
    } catch (err) {
      res.status(500).json({ ok: false, message: 'Proxy error, ' + err.message });
    }
  }
  