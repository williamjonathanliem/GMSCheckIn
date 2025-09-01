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
  
      const GAS_URL = process.env.GAS_URL || "https://script.google.com/macros/s/AKfycbx1hzJBPNRsFkZnxxQTbhykXDT8T562XP5KkNzt4v-j/dev";     // your Apps Script /exec
      const SECRET  = process.env.GMSKL20300;     // must match Apps Script
  
      const r = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ scannedText, target, secret: SECRET })
      });
  
      const text = await r.text();
      let json;
      try { json = JSON.parse(text); } catch (_) { json = { ok:false, message: text || 'Invalid JSON from backend' }; }
  
      res.status(200).json(json);
    } catch (err) {
      res.status(500).json({ ok:false, message:'Proxy error, ' + err.message });
    }
  }
  