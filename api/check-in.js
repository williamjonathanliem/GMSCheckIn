export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.status(405).json({ ok:false, message:'Method not allowed' });
      return;
    }
    try {
      const { scannedText, target } = req.body || {};
      if (!scannedText || !target) {
        res.status(400).json({ ok:false, message:'Missing scannedText or target' });
        return;
      }
  
      const GAS_URL = process.env.GAS_WEBAPP_URL || process.env.GAS_URL;
      const SECRET  = (process.env.CHECKIN_SECRET || '').trim();
  
      if (!GAS_URL) {
        res.status(500).json({ ok:false, message:'GAS_WEBAPP_URL not set' });
        return;
      }
      if (!SECRET) {
        res.status(500).json({ ok:false, message:'CHECKIN_SECRET not set' });
        return;
      }
  
      const r = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ scannedText, target, secret: SECRET })
      });
  
      const text = await r.text();
      let json;
      try { json = JSON.parse(text); }
      catch { json = { ok:false, message: text || 'Invalid JSON from backend' }; }
  
      res.status(200).json(json);
    } catch (err) {
      res.status(500).json({ ok:false, message:'Proxy error, ' + err.message });
    }
  }
  