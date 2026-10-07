// Local stand-in for Hostinger: serves the site and handles POST /contact.php like contact.php does.
// Run: node dev-server.js   (set BIRD_KEY to really send mail; without it the enquiry is just logged)
const http = require('http'), fs = require('fs'), path = require('path');
const cfg = { key: process.env.BIRD_KEY, from: process.env.BIRD_FROM || 'onboarding@messagebird.dev', to: process.env.BIRD_TO || 'rahul@americanbhau.com' };
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json' };
const esc = s => String(s || '').trim().replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');

async function contact(body) {
  const p = new URLSearchParams(body);
  if (p.get('website')) return 200; // honeypot
  const g = k => esc(p.get(k));
  if (!g('firstName') || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g('email'))) return 400;
  const f = { name: `${g('firstName')} ${g('lastName')}`.trim(), email: g('email'), whatsapp: `${g('countryCode')} ${g('phone')}`.trim(), message: g('message') };
  if (!cfg.key) { console.log('[dry-run] enquiry:', f); return 200; }
  const r = await fetch('https://us1.platform.bird.com/email', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + cfg.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: { email: cfg.from, name: 'American Bhau Website' }, to: [cfg.to], subject: 'New enquiry: ' + f.name,
      html: Object.entries(f).map(([k, v]) => `<p><b>${k}:</b> ${v}</p>`).join(''),
    }),
  });
  return r.status === 202 ? 200 : 502;
}

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  if (req.method === 'POST' && url === '/contact.php') {
    let body = ''; for await (const c of req) body += c;
    // multipart from FormData: pull name="x" values out; fine for plain text fields
    const fields = new URLSearchParams();
    for (const m of body.matchAll(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n--/g)) fields.append(m[1], m[2]);
    res.writeHead(await contact(fields)).end();
    return;
  }
  const file = path.join(__dirname, url === '/' ? 'American Bhau.dc.html' : decodeURIComponent(url));
  if (!file.startsWith(__dirname) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(3000, () => console.log('http://localhost:3000' + (cfg.key ? '' : '  (no BIRD_KEY: dry-run, emails are only logged)')));
