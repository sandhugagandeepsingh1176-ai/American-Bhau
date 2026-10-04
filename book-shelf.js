(() => {
if (customElements.get('book-shelf')) return;
const THREE_URL = 'https://unpkg.com/three@0.149.0/build/three.module.js';

const BOOKS = [
  { title: 'What We Do', label: 'Our services', line: 'Video production, community showcase and social media management for your business.', color: '#1f3a5f', foil: '#e39a6c', motif: 'stage',
    points: ['Professional video production', 'Community showcase', 'Social media management'], quote: 'Your business will stand out as premium brand.' },
  { title: 'Consulting', label: 'Social media growth', line: 'Stop talking to an empty room. Come stand on a stage built by a community that trusts us.', color: '#c4552d', foil: '#f3cd8a', motif: 'arrow',
    points: ['Social media strategy', 'Targeted ads', 'Content that converts'], quote: 'Turn your social media from a “ghost town” into a lead-generation machine.' },
  { title: 'Latest Episodes', label: 'New on the podcast', line: 'Tikka House, Sukirt on his YouTube journey, and the English edition of the show.', color: '#1f4d45', foil: '#d7e36a', motif: 'play',
    points: ['Tikka House: 5 restaurants in 12 months', 'Sukirt on his YouTube journey', 'The American Bhau Show (English)'], quote: 'Inspiring stories, told by the people who lived them.' },
  { title: 'Podcast', label: 'Stories & visibility', line: 'Marathi businesses, global audiences, and the entrepreneurs behind them.', color: '#2143a6', foil: '#e2eaf0', motif: 'wave',
    points: ['Business journeys', 'Lessons from founders', 'Community voices'], quote: 'Promoting Marathi businesses and connecting them with global audiences.' },
  { title: 'Brands', label: 'Borrow our audience', line: 'Instant trust, visibility, and new customers from a community that already listens.', color: '#b3342b', foil: '#f4bcb2', motif: 'grid',
    points: ['Tikka House', 'Spicy Tango', 'Partners across the U.S.'], quote: 'You don’t have to build an audience from scratch.' },
  { title: 'About Us', label: 'From Dhule to America', line: 'A Marathi kid from a Dhule village who quit his job in 2023 to start American Bhau.', color: '#2e5a48', foil: '#e8d6a6', motif: 'path',
    points: ['Farming roots near Dhule', 'Started American Bhau in 2023', 'Navalai series in Marathi'], quote: 'The ideas were never the barrier. The language was.' },
  { title: 'Ready to Tell Your Story?', label: 'Let’s grow your brand', line: 'Social media consulting, podcast features and content that works for your business.', color: '#86adc0', foil: '#13293a', ink: '#13293a', motif: 'quote',
    points: ['rahul@americanbhau.com', 'Instagram @american_bhau', 'YouTube @american-bhau'], quote: 'Every day you stay quiet, you become invisible.' }
].map((b, i) => {
  const imgs = ['assets/rahul-hero.webp', 'assets/team/rahul.webp', 'assets/episodes/ep-1.webp', 'assets/rahul-podcast.webp', 'assets/brands-cover.webp', 'assets/podcast-host.webp', 'assets/team/pallavi.webp'];
  const hx = h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16));
  const mix = (a, c, t) => '#' + hx(a).map((v, k) => Math.round(v * (1 - t) + hx(c)[k] * t).toString(16).padStart(2, '0')).join('');
  return { ...b, img: imgs[i], imgRaw: i === 4, leather: mix(b.color, '#0c0b0a', 0.55), tint: mix(b.color, '#ffffff', 0.35) };
}).map((b, i) => ({ ...b, w: 1.02, h: 1.52 + (i % 3) * 0.04, d: 0.24 + (i % 2) * 0.03 }));

const LEAVES = 2, SPREADS = LEAVES + 1;
const ease = t => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SANS = (w, s) => `${w} ${s}px Inter, system-ui, sans-serif`;
const SERIF = s => `400 ${s}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
const num = i => String(i + 1).padStart(2, '0');
const PAPER = '#f1ede4', PINK = '#1a1a1a', MUTE = '#7a766e';

function lines(ctx, text, maxW) {
  const out = []; let line = '';
  for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}

function motif(ctx, b, cx, cy, s) {
  ctx.save(); ctx.strokeStyle = b.foil; ctx.fillStyle = b.foil; ctx.lineWidth = 4;
  const m = b.motif;
  if (m === 'stage') {
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = 1 - i * 0.16; ctx.beginPath(); ctx.arc(cx, cy + s * 0.6, s * (0.3 + i * 0.2), Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.fillRect(cx - s * 0.9, cy + s * 0.6, s * 1.8, 4); ctx.beginPath(); ctx.arc(cx, cy + s * 0.12, 12, 0, 7); ctx.fill();
  } else if (m === 'arrow') {
    ctx.beginPath(); ctx.moveTo(cx - s * 0.8, cy + s * 0.6); ctx.lineTo(cx - s * 0.2, cy); ctx.lineTo(cx + s * 0.15, cy + s * 0.3); ctx.lineTo(cx + s * 0.75, cy - s * 0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + s * 0.4, cy - s * 0.48); ctx.lineTo(cx + s * 0.78, cy - s * 0.48); ctx.lineTo(cx + s * 0.78, cy - s * 0.1); ctx.stroke();
    ctx.globalAlpha = 0.35; for (let i = 0; i < 4; i++) ctx.fillRect(cx - s * 0.8, cy + s * 0.75 - i * s * 0.4, s * 1.6, 2);
  } else if (m === 'play') {
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.7, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s * 0.2, cy - s * 0.32); ctx.lineTo(cx + s * 0.34, cy); ctx.lineTo(cx - s * 0.2, cy + s * 0.32); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(cx, cy, s * 0.92, -0.6, 0.6); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, s * 0.92, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke();
  } else if (m === 'wave') {
    [0.25, 0.5, 0.85, 0.6, 1, 0.7, 0.4, 0.8, 0.3].forEach((h, i) => ctx.fillRect(cx - s * 0.8 + i * s * 0.2 - 5, cy - h * s * 0.5, 10, h * s));
  } else if (m === 'grid') {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x = cx - s * 0.66 + c * s * 0.48, y = cy - s * 0.66 + r * s * 0.48;
      ctx.globalAlpha = (r + c) % 2 ? 0.45 : 1;
      (r + c) % 2 ? ctx.strokeRect(x, y, s * 0.36, s * 0.36) : ctx.fillRect(x, y, s * 0.36, s * 0.36);
    }
  } else if (m === 'path') {
    ctx.beginPath(); ctx.moveTo(cx - s * 0.85, cy + s * 0.7);
    ctx.bezierCurveTo(cx - s * 0.2, cy + s * 0.7, cx - s * 0.3, cy - s * 0.2, cx + s * 0.1, cy - s * 0.1);
    ctx.bezierCurveTo(cx + s * 0.5, cy, cx + s * 0.3, cy - s * 0.7, cx + s * 0.8, cy - s * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx - s * 0.85, cy + s * 0.7, 9, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + s * 0.8, cy - s * 0.7, 14, 0, 7); ctx.stroke();
  } else if (m === 'quote') {
    ctx.beginPath(); ctx.moveTo(cx - s * 0.8, cy - s * 0.55); ctx.lineTo(cx + s * 0.8, cy - s * 0.55); ctx.lineTo(cx + s * 0.8, cy + s * 0.35); ctx.lineTo(cx - s * 0.2, cy + s * 0.35); ctx.lineTo(cx - s * 0.55, cy + s * 0.72); ctx.lineTo(cx - s * 0.5, cy + s * 0.35); ctx.lineTo(cx - s * 0.8, cy + s * 0.35); ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 0.5; for (let i = 0; i < 3; i++) ctx.fillRect(cx - s * 0.55, cy - s * 0.3 + i * s * 0.2, s * (i === 2 ? 0.6 : 1.1), 4);
  } else {
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.7, 0, 7); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(cx, cy, s * 0.46, 0, 7); ctx.stroke();
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7); ctx.fill();
  }
  ctx.restore();
}

function pageBase(x, W, H, i, side) {
  x.fillStyle = PAPER; x.fillRect(0, 0, W, H);
  const g = side === 'right' ? x.createLinearGradient(0, 0, 70, 0) : x.createLinearGradient(W, 0, W - 70, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.13)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = MUTE; x.font = SANS(500, 13); x.fillText('AMERICAN BHAU  /  ' + num(i), 60, 70);
  x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(60, 88, W - 120, 1); x.fillRect(60, H - 70, W - 120, 1);
}

class BookShelf extends HTMLElement {
  connectedCallback() {
    if (this._init) return; this._init = true;
    Object.assign(this.style, { display: 'block', position: 'relative', height: this.style.height || '100%', touchAction: 'pan-y', outline: 'none', userSelect: 'none' });
    this.tabIndex = 0;
    this.setAttribute('role', 'application');
    this.setAttribute('aria-label', 'American Bhau book collection. Left and right arrows to browse, Enter to open, Escape to close.');
    this._showLoader();
    const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
    idle(() => { this._threeP = this._threeP || import(THREE_URL); }, { timeout: 1500 });
    let near = false, introOk = !window.__bookIntroPlayed || window.__bookIntroDone;
    const go = () => { if (near && introOk && !this._booted) { this._booted = true; this._boot(); } };
    this._onIntro = () => { introOk = true; go(); };
    addEventListener('bookintro:done', this._onIntro);
    setTimeout(this._onIntro, 6000);
    this._lazyIO = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { near = true; this._lazyIO.disconnect(); go(); } }, { rootMargin: '300px 0px' });
    this._lazyIO.observe(this);
  }
  _showLoader() {
    if (this._loader) return;
    const l = this._loader = document.createElement('div');
    l.setAttribute('aria-hidden', 'true');
    Object.assign(l.style, { position: 'absolute', inset: '0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3.2%', paddingBottom: '16%', pointerEvents: 'none', transition: 'opacity 500ms ease' });
    for (let k = 0; k < 5; k++) {
      const b = document.createElement('div'), mid = k === 2;
      Object.assign(b.style, { width: mid ? '15%' : '11%', aspectRatio: '2 / 3', maxHeight: mid ? '70%' : '58%', borderRadius: '4px 8px 8px 4px', background: 'linear-gradient(100deg, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0.10) 70%) 0 0 / 300% 100%', opacity: String(mid ? 1 : 0.6 - Math.abs(k - 2) * 0.12) });
      b.animate && b.animate([{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], { duration: 1400, iterations: Infinity, easing: 'ease-in-out' });
      l.appendChild(b);
    }
    this.appendChild(l);
  }
  _hideLoader() {
    const l = this._loader; if (!l) return; this._loader = null;
    l.style.opacity = '0'; setTimeout(() => l.remove(), 520);
  }
  disconnectedCallback() {
    cancelAnimationFrame(this._raf);
    this._ro && this._ro.disconnect(); this._io && this._io.disconnect(); this._lazyIO && this._lazyIO.disconnect();
    removeEventListener('bookintro:done', this._onIntro); this._booted = false;
    removeEventListener('bookshelf:command', this._onCmd); removeEventListener('pointerup', this._onUp); removeEventListener('pointercancel', this._onCancel);
    if (this._scene) this._scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { m.map && m.map.dispose(); m.dispose(); }); });
    this._renderer && this._renderer.dispose();
    this._init = false;
  }
  _tex(draw, w = 768, h = 1152) {
    const T = this.T, c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = this._renderer.capabilities.getMaxAnisotropy();
    return t;
  }
  _cover(b, i) {
    const img = this._imgs && this._imgs[i];
    return this._tex((x, W, H) => {
      const leather = b.leather;
      x.fillStyle = leather; x.fillRect(0, 0, W, H);
      for (let k = 0; k < 260; k++) {
        const rx = Math.random() * W, ry = Math.random() * H, rr = 20 + Math.random() * 110;
        const g = x.createRadialGradient(rx, ry, 0, rx, ry, rr);
        g.addColorStop(0, k % 3 ? 'rgba(0,0,0,0.10)' : 'rgba(255,235,200,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(rx - rr, ry - rr, rr * 2, rr * 2);
      }
      const id = x.getImageData(0, 0, W, H), d = id.data;
      for (let p = 0; p < d.length; p += 4) { const n = (Math.random() - 0.5) * 22; d[p] += n; d[p + 1] += n; d[p + 2] += n; }
      x.putImageData(id, 0, 0);
      x.lineWidth = 1;
      for (let k = 0; k < 140; k++) {
        let px = Math.random() * W, py = Math.random() * H; x.beginPath(); x.moveTo(px, py);
        for (let s = 0; s < 5; s++) { px += (Math.random() - 0.5) * 40; py += (Math.random() - 0.5) * 40; x.lineTo(px, py); }
        x.strokeStyle = k % 4 ? 'rgba(0,0,0,0.16)' : 'rgba(255,240,210,0.05)'; x.stroke();
      }
      const v = x.createRadialGradient(W / 2, H * 0.45, W * 0.2, W / 2, H / 2, H * 0.78);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(46, 0, 3, H); x.fillStyle = 'rgba(255,230,190,0.07)'; x.fillRect(50, 0, 2, H);
      const gold = (y0, y1) => { const g = x.createLinearGradient(0, y0, W, y1); g.addColorStop(0, '#7a5a24'); g.addColorStop(0.3, '#e8cf8c'); g.addColorStop(0.5, '#a5813c'); g.addColorStop(0.72, '#f1dc9f'); g.addColorStop(1, '#80602a'); return g; };
      const G = gold(0, H);
      const emboss = draw => { x.save(); x.translate(2, 3); x.fillStyle = x.strokeStyle = 'rgba(0,0,0,0.6)'; draw(); x.restore(); x.save(); x.fillStyle = x.strokeStyle = G; draw(); x.restore(); };
      const L = 70, T0 = 46, Rr = W - 46, B0 = H - 46;
      emboss(() => { x.lineWidth = 3; x.strokeRect(L, T0, Rr - L, B0 - T0); x.lineWidth = 1.2; x.strokeRect(L + 14, T0 + 14, Rr - L - 28, B0 - T0 - 28); });
      const fleuron = () => {
        x.lineWidth = 2.4; x.beginPath(); x.moveTo(0, 70); x.bezierCurveTo(0, 30, 10, 10, 40, 6); x.bezierCurveTo(56, 4, 62, 20, 50, 28); x.bezierCurveTo(42, 34, 32, 26, 38, 18); x.stroke();
        x.beginPath(); x.moveTo(70, 0); x.bezierCurveTo(30, 0, 10, 10, 6, 40); x.bezierCurveTo(4, 56, 20, 62, 28, 50); x.bezierCurveTo(34, 42, 26, 32, 18, 38); x.stroke();
        x.beginPath(); x.moveTo(14, 14); x.quadraticCurveTo(34, 20, 44, 44); x.quadraticCurveTo(20, 34, 14, 14); x.fill();
        x.beginPath(); x.arc(8, 8, 5, 0, 7); x.fill();
      };
      [[L + 14, T0 + 14, 1, 1], [Rr - 14, T0 + 14, -1, 1], [L + 14, B0 - 14, 1, -1], [Rr - 14, B0 - 14, -1, -1]].forEach(([cx, cy, sx, sy]) => emboss(() => { x.translate(cx, cy); x.scale(sx, sy); fleuron(); }));
      const diamond = (cx, cy, s) => { x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s * 0.6, cy); x.lineTo(cx, cy + s); x.lineTo(cx - s * 0.6, cy); x.closePath(); x.fill(); };
      emboss(() => { diamond((L + Rr) / 2, T0 + 7, 9); diamond((L + Rr) / 2, B0 - 7, 9); diamond(L + 7, H / 2, 9); diamond(Rr - 7, H / 2, 9); });
      const cx = (L + Rr) / 2;
      x.font = '600 18px Cinzel, "Trajan Pro", Georgia, serif'; x.textAlign = 'center';
      try { x.letterSpacing = '6px'; } catch (e) {}
      emboss(() => x.fillText('AMERICAN BHAU', cx, 118));
      const aw = 420, ax = cx - aw / 2, s0 = 400, ab = 690, r = aw * 0.56;
      const h = Math.sqrt(r * r - (aw / 2 - r) * (aw / 2 - r));
      const arch = (inset) => {
        const X = ax + inset, w = aw - inset * 2, rr = r - inset, hh = Math.sqrt(rr * rr - (w / 2 - rr) * (w / 2 - rr));
        x.beginPath(); x.moveTo(X, ab - inset); x.lineTo(X, s0);
        const aL = Math.atan2(-hh, w / 2 - rr) + Math.PI * 2, aR = Math.atan2(-hh, rr - w / 2) + Math.PI * 2;
        x.arc(X + rr, s0, rr, Math.PI, aL); x.arc(X + w - rr, s0, rr, aR, Math.PI * 2);
        x.lineTo(X + w, ab - inset); x.closePath();
      };
      x.save(); arch(10); x.clip();
      x.fillStyle = '#0d0c0b'; x.fillRect(ax, s0 - h, aw, ab - s0 + h);
      if (img && img.naturalWidth) {
        const bw = aw, bh = ab - s0 + h, by = s0 - h;
        const sc = Math.max(bw / img.naturalWidth, bh / img.naturalHeight);
        const iw = img.naturalWidth * sc, ih = img.naturalHeight * sc;
        if (b.imgRaw) {
          x.fillStyle = '#f4f1ea'; x.fillRect(ax, by, bw, bh);
          const s2 = Math.min(bw / img.naturalWidth, bh / img.naturalHeight) * 1.55;
          const w2 = img.naturalWidth * s2, h2 = img.naturalHeight * s2;
          x.drawImage(img, ax + (bw - w2) / 2, by + (bh - h2) / 2 + 18, w2, h2);
          x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(236,222,190,0.55)'; x.fillRect(ax, by, bw, bh);
          x.globalCompositeOperation = 'source-over';
        } else {
        x.filter = 'grayscale(1) contrast(1.18) brightness(0.92)';
        x.drawImage(img, ax + (bw - iw) / 2, by + (bh - ih) * (b.imgY ?? 0.3), iw, ih);
        x.filter = 'none';
        x.globalCompositeOperation = 'multiply'; x.fillStyle = b.tint; x.fillRect(ax, by, bw, bh);
        x.globalCompositeOperation = 'soft-light'; x.fillStyle = 'rgba(232,200,130,0.55)'; x.fillRect(ax, by, bw, bh);
        x.globalCompositeOperation = 'source-over';
        }
        const iv = x.createRadialGradient(cx, by + bh * 0.55, bw * 0.2, cx, by + bh * 0.55, bh * 0.75);
        iv.addColorStop(0, 'rgba(0,0,0,0)'); iv.addColorStop(1, b.imgRaw ? 'rgba(40,24,10,0.45)' : 'rgba(0,0,0,0.75)'); x.fillStyle = iv; x.fillRect(ax, by, bw, bh);
      }
      x.restore();
      emboss(() => { x.lineWidth = 3; arch(0); x.stroke(); x.lineWidth = 1.2; arch(10); x.stroke(); });
      emboss(() => { x.beginPath(); x.arc(cx, s0 - h - 18, 7, 0, 7); x.fill(); diamond(cx, s0 - h - 38, 8); });
      const tf = s => `500 ${s}px "Grenze Gotisch", "UnifrakturMaguntia", "Old English Text MT", Georgia, serif`;
      try { x.letterSpacing = '0px'; } catch (e) {}
      let size = 86; x.font = tf(size); let ls = lines(x, b.title, Rr - L - 90);
      if (ls.length > 2) { size = 66; x.font = tf(size); ls = lines(x, b.title, Rr - L - 80); }
      const lh = size * 1.0, ty = 800 + (ls.length === 1 ? 26 : 0);
      emboss(() => ls.forEach((l, k) => x.fillText(l, cx, ty + k * lh)));
      const yl = ty + (ls.length - 1) * lh + 52;
      emboss(() => { x.fillRect(cx - 120, yl - 6, 90, 1.5); x.fillRect(cx + 30, yl - 6, 90, 1.5); diamond(cx, yl - 5, 6); });
      x.font = '500 17px Cinzel, Georgia, serif'; try { x.letterSpacing = '4px'; } catch (e) {}
      emboss(() => x.fillText(b.label.toUpperCase(), cx, yl + 36));
      x.font = '600 16px Cinzel, Georgia, serif'; try { x.letterSpacing = '5px'; } catch (e) {}
      emboss(() => x.fillText('VOL · ' + ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i], cx, B0 - 40));
      x.textAlign = 'left'; try { x.letterSpacing = '0px'; } catch (e) {}
    });
  }
  _pageTex(b, i, kind) {
    return this._tex((x, W, H) => {
      const side = kind === 'contents' || kind === 'quote' ? 'left' : 'right';
      pageBase(x, W, H, i, side);
      x.fillStyle = PINK;
      if (kind === 'title') {
        x.fillStyle = MUTE; x.font = SANS(500, 14); x.fillText(b.label.toUpperCase(), 60, 250);
        x.fillStyle = PINK; x.font = SERIF(60); const tl = lines(x, b.title, W - 120); tl.forEach((l, k) => x.fillText(l, 58, 330 + k * 64));
        x.fillStyle = MUTE; x.font = SERIF(26); lines(x, b.line, W - 150).forEach((l, k) => x.fillText(l, 60, 560 + k * 38));
      } else if (kind === 'contents') {
        x.globalAlpha = 0.08; x.font = SERIF(340); x.fillText(num(i), 40, H - 120); x.globalAlpha = 1;
        x.fillStyle = MUTE; x.font = SANS(500, 14); x.fillText('IN THIS VOLUME', 60, 250);
        x.fillStyle = PINK; x.font = SERIF(34);
        b.points.forEach((p, k) => { x.fillStyle = MUTE; x.font = SANS(500, 14); x.fillText(num(k), 60, 330 + k * 90); x.fillStyle = PINK; x.font = SERIF(30); lines(x, p, W - 170).forEach((l, j) => x.fillText(l, 110, 332 + k * 90 + j * 36)); });
      } else if (kind === 'inside') {
        x.fillStyle = MUTE; x.font = SANS(500, 14); x.fillText('WHAT’S INSIDE', 60, 250);
        x.fillStyle = PINK; x.font = SERIF(46); x.fillText(b.title.replace('?', ''), 58, 320);
        let y = 420;
        b.points.forEach(p => { x.fillStyle = b.color; x.fillRect(60, y - 12, 26, 3); x.fillStyle = PINK; x.font = SANS(400, 24); lines(x, p, W - 170).forEach(l => { x.fillText(l, 104, y); y += 34; }); y += 26; });
        x.globalAlpha = 0.12; for (let k = 0; k < 5; k++) x.fillRect(60, y + 40 + k * 36, (W - 120) * (k === 4 ? 0.5 : 1), 8); x.globalAlpha = 1;
      } else if (kind === 'quote') {
        x.fillStyle = b.color; x.fillRect(60, 250, 60, 4);
        x.fillStyle = PINK; x.font = SERIF(46); const ql = lines(x, '“' + b.quote + '”', W - 130); ql.forEach((l, k) => x.fillText(l, 58, 340 + k * 56));
        x.fillStyle = MUTE; x.font = SANS(500, 14); x.fillText('AMERICAN BHAU', 60, 340 + ql.length * 56 + 40);
      } else {
        x.fillStyle = MUTE; x.font = SANS(500, 14); x.fillText('NEXT STEP', 60, 250);
        x.fillStyle = PINK; x.font = SERIF(54); (b.noPage ? ['Ready when', 'you are'] : ['Continue on', 'the full page']).forEach((l, k) => x.fillText(l, 58, 330 + k * 60));
        x.fillStyle = MUTE; x.font = SERIF(26); lines(x, b.noPage ? 'Open the Contact Us volume to tell us about your business.' : 'Use “Open full page” to read everything about ' + b.title.replace('?', '') + '.', W - 150).forEach((l, k) => x.fillText(l, 60, 500 + k * 38));
        x.fillStyle = b.color; x.fillRect(60, H - 160, 120, 4);
      }
    }, 640, 960);
  }
  _ensurePages(s, i) {
    if (s.pagesReady) return; s.pagesReady = true;
    const set = (m, t) => { m.map = t; m.needsUpdate = true; };
    set(s.leafMats[0][0], this._pageTex(s.b, i, 'title'));
    set(s.leafMats[0][1], this._pageTex(s.b, i, 'contents'));
    set(s.leafMats[1][0], this._pageTex(s.b, i, 'inside'));
    set(s.leafMats[1][1], this._pageTex(s.b, i, 'quote'));
    set(s.endMat, this._pageTex(s.b, i, 'end'));
  }
  async _boot() {
    const timeout = (p, ms) => Promise.race([p, new Promise(res => setTimeout(res, ms))]);
    let fontLink = document.querySelector('link[data-gothic-fonts]');
    if (!fontLink) {
      fontLink = document.createElement('link'); fontLink.rel = 'stylesheet'; fontLink.dataset.gothicFonts = '';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@500&family=Cinzel:wght@500;600&display=swap';
      document.head.appendChild(fontLink);
    }
    const fontsP = new Promise(res => { if (fontLink.sheet) res(); else { fontLink.addEventListener('load', res); fontLink.addEventListener('error', res); } })
      .then(() => Promise.all([document.fonts.load('500 80px "Grenze Gotisch"'), document.fonts.load('600 18px Cinzel'), document.fonts.load('500 17px Inter')])).catch(() => {});
    const loadImg = src => new Promise(res => { if (!src) return res(null); const im = new Image(); im.decoding = 'async'; im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => res(im)); im.onerror = () => res(null); im.src = src; });
    const rawP = BOOKS.map(b => loadImg(b.img));
    const T = this.T = await (this._threeP = this._threeP || import(THREE_URL));
    await timeout(fontsP, 700);
    this._imgs = BOOKS.map(() => null);
    const redraw = i => {
      if (!this.isConnected || !this._books || !this._books[i]) return;
      const m = this._books[i].coverMat; if (!m) return;
      const old = m.map; m.map = this._cover(this._books[i].b, i); m.needsUpdate = true; old && old.dispose();
    };
    rawP.forEach((p, i) => p.then(im => { if (im) { this._imgs[i] = im; redraw(i); } }));
    fontsP.then(() => { if (this._books) this._books.forEach((s, i) => redraw(i)); });
    if (!this.isConnected) return;
    const COARSE = matchMedia('(pointer: coarse)').matches;
    const r = this._renderer = new T.WebGLRenderer({ antialias: !(COARSE && devicePixelRatio > 1.5), alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, COARSE ? 1.5 : 1.75)); r.outputEncoding = T.sRGBEncoding;
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    Object.assign(r.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    this.appendChild(r.domElement);
    const scene = this._scene = new T.Scene();
    this._cam = new T.PerspectiveCamera(30, 1, 0.1, 60);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a8a8a, 0.78));
    const key = new T.DirectionalLight(0xfff4e8, 0.9); key.position.set(-2.5, 6, 5); key.castShadow = true;
    key.shadow.mapSize.set(COARSE ? 768 : 1536, COARSE ? 768 : 1536); key.shadow.radius = 6; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
    Object.assign(key.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 0.5, far: 20 });
    scene.add(key);
    const fill = new T.DirectionalLight(0xe8f0ff, 0.28); fill.position.set(4, 1, 5); scene.add(fill);
    this._floorY = -0.95;
    const floor = new T.Mesh(new T.PlaneGeometry(40, 20), new T.ShadowMaterial({ opacity: 0.22 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = this._floorY; floor.receiveShadow = true; scene.add(floor);

    const edgeTex = this._tex((x, W, H) => { x.fillStyle = '#ece7dc'; x.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 3) { x.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.05})`; x.fillRect(0, y, W, 1); } }, 64, 256);
    this._targets = []; this._books = [];
    BOOKS.forEach((b, i) => {
      const mats = [];
      const M = (o, Cls) => { const m = new (Cls || T.MeshStandardMaterial)(o); m.userData.base = m.color.clone(); mats.push(m); return m; };
      const cloth = M({ color: b.leather, roughness: 0.72 });
      const edgeMat = M({ map: edgeTex, roughness: 0.95 });
      const endMat = M({ color: 0xffffff, roughness: 0.95 });
      const coverMat = M({ map: this._cover(b, i), roughness: 0.8 });
      const insideMat = M({ color: new T.Color(b.color).lerp(new T.Color(0xffffff), 0.82), roughness: 0.92 });
      const root = new T.Group();
      const pd = b.d * 0.7, front = pd / 2;
      const pages = new T.Mesh(new T.BoxGeometry(b.w * 0.95, b.h * 0.96, pd), [edgeMat, edgeMat, edgeMat, edgeMat, endMat, edgeMat]);
      pages.position.x = b.w * 0.015;
      const back = new T.Mesh(new T.BoxGeometry(b.w, b.h, 0.022), cloth); back.position.z = -b.d / 2 + 0.011;
      const spine = new T.Mesh(new T.BoxGeometry(0.036, b.h + 0.004, b.d + 0.006), cloth); spine.position.x = -b.w / 2 + 0.015;
      const pivot = new T.Group(); pivot.position.set(-b.w / 2, 0, b.d / 2 - 0.011);
      const cover = new T.Mesh(new T.BoxGeometry(b.w, b.h, 0.022), [cloth, cloth, cloth, cloth, coverMat, insideMat]);
      cover.position.x = b.w / 2; pivot.add(cover);
      const leaves = [], leafMats = [];
      const pw = b.w * 0.93, ph = b.h * 0.95, lg = new T.PlaneGeometry(pw, ph);
      for (let L = 0; L < LEAVES; L++) {
        const lp = new T.Group(); lp.position.set(-b.w * 0.46, 0, front + 0.004 * (LEAVES - L));
        const fm = M({ color: 0xffffff, roughness: 0.95 }), bm = M({ color: 0xffffff, roughness: 0.95 });
        const f = new T.Mesh(lg, fm); f.position.x = pw / 2;
        const bk = new T.Mesh(lg, bm); bk.position.set(pw / 2, 0, -0.001); bk.rotation.y = Math.PI;
        [f, bk].forEach(m => { m.castShadow = true; m.userData.index = i; m.userData.leaf = true; this._targets.push(m); });
        lp.add(f, bk); root.add(lp); lp.visible = false;
        leaves.push({ g: lp, t: 0 }); leafMats.push([fm, bm]);
      }
      [pages, back, spine, cover].forEach(m => { m.castShadow = true; m.receiveShadow = m !== spine; m.userData.index = i; this._targets.push(m); });
      root.add(pages, back, spine, pivot);
      scene.add(root);
      this._books.push({ b, coverMat, root, pivot, mats, leaves, leafMats, endMat, lift: 0, focus: 0, open: 0, away: 0, shade: 1, phase: i * 1.7 });
    });

    this._active = Math.floor((BOOKS.length - 1) / 2); this._pos = this._active;
    this._sel = -1; this._coverOpen = false; this._spread = 0; this._hover = -1;
    this._m = { x: 0, y: 0, tx: 0, ty: 0 };
    this._focusPos = new T.Vector3(); this._focusScale = 1; this._tmp = new T.Vector3();
    this._ray = new T.Raycaster(); this._ndc = new T.Vector2(9, 9);
    const setNdc = e => { const bb = this.getBoundingClientRect(); this._ndc.set(((e.clientX - bb.left) / bb.width) * 2 - 1, -((e.clientY - bb.top) / bb.height) * 2 + 1); this._pick = true; };
    this.addEventListener('pointermove', e => {
      setNdc(e);
      if (this._drag) {
        const dx = e.clientX - this._drag.x;
        if (Math.abs(dx) > 6) this._drag.moved = true;
        if (this._drag.moved && this._sel < 0) this._dragPos = clamp(this._drag.pos - dx / Math.max(90, this.clientWidth * 0.13), -0.4, BOOKS.length - 0.6);
      }
    });
    this.addEventListener('pointerleave', () => { this._ndc.set(9, 9); this._pick = true; this._m.tx = 0; this._m.ty = 0; this._wheelPos = null; });
    this.addEventListener('pointerdown', e => { setNdc(e); this._drag = { x: e.clientX, pos: this._pos, moved: false }; });
    this._onUp = e => {
      const d = this._drag; this._drag = null;
      if (!d) return;
      if (d.moved) { if (this._dragPos != null) { this._center(Math.round(this._dragPos)); this._dragPos = null; } return; }
      this._doPick();
      const h = this._hover;
      if (this._sel >= 0) {
        if (h !== this._sel) { this.focus(-1); return; }
        if (!this._coverOpen) { this.cover(true); return; }
        const s = this._books[this._sel], local = s.root.worldToLocal(this._hitPoint.clone());
        this.page(local.x > -s.b.w / 2 ? 1 : -1);
        return;
      }
      if (h < 0) return;
      if (h === this._active) this.focus(h); else this._center(h);
    };
    addEventListener('pointerup', this._onUp);
    this._onCancel = () => { this._drag = null; if (this._dragPos != null) { this._center(Math.round(this._dragPos)); this._dragPos = null; } };
    addEventListener('pointercancel', this._onCancel);
    this.addEventListener('wheel', e => {
      if (this._sel >= 0) { e.preventDefault(); return; }
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const d = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
      const cur = this._wheelPos != null ? this._wheelPos : this._active;
      if ((d < 0 && cur <= 0.001) || (d > 0 && cur >= BOOKS.length - 1.001)) { this._wheelPos = null; return; }
      e.preventDefault();
      this._wheelPos = clamp(cur + d * 0.0045, 0, BOOKS.length - 1);
      const rr = Math.round(this._wheelPos);
      if (rr !== this._active) { this._active = rr; this._emit(); }
      clearTimeout(this._wheelIdle);
      this._wheelIdle = setTimeout(() => { this._wheelPos = null; }, 180);
    }, { passive: false });
    this.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault(); const d = e.key === 'ArrowRight' ? 1 : -1;
        if (this._sel >= 0) { if (this._coverOpen) this.page(d); } else this._center(this._active + d);
      } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (this._sel < 0) this.focus(this._active); else this.cover(!this._coverOpen); }
      else if (e.key === 'Escape') this.focus(-1);
    });
    this._onCmd = e => {
      const d = e.detail || {};
      if (typeof d.open === 'number') this.focus(d.open);
      if (typeof d.focus === 'number') this.focus(d.focus);
      if (typeof d.center === 'number') this._center(d.center);
      if (typeof d.step === 'number') this._center(this._active + d.step);
      if (typeof d.cover === 'boolean') this.cover(d.cover);
      if (typeof d.page === 'number') this.page(d.page);
      if (d.reset) { this._m.tx = 0; this._m.ty = 0; }
    };
    addEventListener('bookshelf:command', this._onCmd);

    this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(this); this._resize();
    this._vis = true; this._io = new IntersectionObserver(es => { this._vis = es[0].isIntersecting; }); this._io.observe(this);
    this._emit();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let last = performance.now(), time = 0;
    const loop = now => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!this._vis || document.hidden) return;
      time += dt;
      if (this._pick) this._doPick();
      const k = reduce ? 1 : 1 - Math.exp(-dt * 7);
      const mk = reduce ? 1 : 1 - Math.exp(-dt * 4);
      this._m.x += (this._m.tx - this._m.x) * mk; this._m.y += (this._m.ty - this._m.y) * mk;
      const damp = this._sel >= 0 ? 0.3 : 1, mx = this._m.x * damp, my = this._m.y * damp;
      const cam = this._cam;
      cam.position.x = mx * 0.35; cam.position.y = this._camY + my * 0.18; cam.lookAt(0, -0.05, 0);
      const live = this._sel < 0 && this._wheelPos != null;
      const targetPos = this._dragPos != null ? this._dragPos : live ? this._wheelPos : this._active;
      this._pos += (targetPos - this._pos) * (this._dragPos != null ? 1 - Math.exp(-dt * 20) : live ? (reduce ? 1 : 1 - Math.exp(-dt * 12)) : k);
      const narrow = cam.aspect < 1, gap1 = narrow ? 0.95 : 1.3, gapN = narrow ? 0.5 : 0.72;
      this._books.forEach((s, i) => {
        const b = s.b, selected = i === this._sel;
        const off = i - this._pos, a = Math.abs(off), sg = Math.sign(off), hl = Math.max(0, 1 - a);
        s.lift += ((i === this._hover && i === this._active && this._sel < 0 ? 1 : 0) - s.lift) * k;
        s.focus += ((selected ? 1 : s.open < 0.2 ? 0 : s.focus) - s.focus) * k * 0.9;
        const wantOpen = selected && this._coverOpen && s.focus > 0.7;
        s.open += ((wantOpen ? 1 : 0) - s.open) * k * (wantOpen ? 0.8 : 1.2);
        s.away += ((this._sel >= 0 && !selected ? 1 : 0) - s.away) * k;
        const depth = 1 - Math.min(a, 3) / 3;
        const x = sg * (a < 1 ? a * gap1 : gap1 + (a - 1) * gapN);
        const z = -Math.min(a, 3.5) * 0.5 + hl * 0.45 + s.lift * 0.12 - s.away * 0.8;
        const sc = (1 - Math.min(a, 3.5) * 0.07) * (1 + hl * 0.14);
        const y = this._floorY + (b.h * sc) / 2 + 0.02 + hl * 0.06 + s.lift * 0.05 + (reduce ? 0 : Math.sin(time * 0.8 + s.phase) * 0.012 * hl) - s.away * 0.05;
        this._tmp.set(x + mx * 0.12 * (1 - depth * 0.5), y + my * 0.05 * depth, z);
        const f = ease(clamp(s.focus, 0, 1));
        s.root.position.lerpVectors(this._tmp, this._focusPos, f);
        s.root.rotation.set((-0.04 - my * 0.14 * (0.4 + depth * 0.6)) * (1 - f) + my * 0.05 * f, (-clamp(off, -1, 1) * 0.55 + mx * 0.3 * (0.4 + depth * 0.6)) * (1 - f) + f * (0.28 - ease(clamp(s.open, 0, 1)) * 0.2 + mx * 0.12), mx * -0.02 * depth * (1 - f));
        s.root.scale.setScalar(sc + (this._focusScale - sc) * f);
        s.root.visible = (a < 4.2 && s.away < 0.98) || f > 0.01;
        const o = ease(clamp(s.open, 0, 1));
        s.pivot.rotation.y = -o * Math.PI * 0.99;
        s.leaves.forEach((lf, L) => {
          const want = selected && this._coverOpen && L < this._spread ? 1 : 0;
          lf.t += (want - lf.t) * k * 0.85;
          lf.g.visible = s.open > 0.05;
          lf.g.rotation.y = -ease(clamp(lf.t, 0, 1)) * Math.PI * (0.975 - L * 0.012);
          lf.g.position.z = (s.b.d * 0.35) + 0.004 * (LEAVES - L) + ease(clamp(lf.t, 0, 1)) * 0.004 * L;
        });
        const shadeT = Math.max(f, (1 - Math.min(a, 1) * 0.4) - Math.max(0, a - 1) * 0.07) * (1 - s.away * 0.4);
        s.shade += (shadeT - s.shade) * k;
        const v = clamp(s.shade, 0.3, 1);
        s.mats.forEach(m => m.color.copy(m.userData.base).multiplyScalar(v));
      });
      this.style.cursor = this._drag && this._drag.moved ? 'grabbing' : this._hover >= 0 ? 'pointer' : this._sel >= 0 ? 'default' : 'grab';
      r.render(scene, cam);
      if (this._loader) this._hideLoader();
    };
    this._raf = requestAnimationFrame(loop);
  }
  _emit() {
    dispatchEvent(new CustomEvent('bookshelf:state', { detail: { active: this._active, selected: this._sel, open: this._coverOpen, spread: this._spread, spreads: SPREADS } }));
  }
  _center(i) {
    i = clamp(i, 0, BOOKS.length - 1);
    if (this._sel >= 0) return;
    this._wheelPos = null;
    if (i !== this._active) { this._active = i; this._emit(); }
  }
  _doPick() {
    this._pick = false;
    this._ray.setFromCamera(this._ndc, this._cam);
    const hit = this._ray.intersectObjects(this._targets.filter(t => { const s = this._books[t.userData.index]; return s.root.visible && (!t.userData.leaf || t.parent.visible); }), false)[0];
    this._hover = hit ? hit.object.userData.index : -1;
    this._hitPoint = hit ? hit.point : null;
  }
  focus(i) {
    if (!this._books) return;
    i = i >= 0 && i < BOOKS.length ? i : -1;
    if (i === this._sel) return;
    this._wheelPos = null;
    if (i >= 0) { this._active = i; this._ensurePages(this._books[i], i); }
    this._sel = i; this._coverOpen = false; this._spread = 0;
    this._layoutFocus(); this._emit();
  }
  cover(open) {
    if (this._sel < 0) return;
    this._coverOpen = !!open; if (!open) this._spread = 0;
    this._layoutFocus(); this._emit();
  }
  page(d) {
    if (this._sel < 0) return;
    if (!this._coverOpen) { if (d > 0) this.cover(true); return; }
    const n = clamp(this._spread + d, 0, SPREADS - 1);
    if (d < 0 && this._spread === 0) { this.cover(false); return; }
    if (n !== this._spread) { this._spread = n; this._emit(); }
  }
  _layoutFocus() {
    if (!this._cam) return;
    const b = BOOKS[Math.max(0, this._sel)], cam = this._cam;
    const z = 1.2, dist = cam.position.z - z, tanH = Math.tan(cam.fov * Math.PI / 360);
    const halfH = dist * tanH, halfW = halfH * cam.aspect, wide = cam.aspect >= 1.15;
    const spreadW = this._coverOpen ? b.w * 2 : b.w * 1.1;
    let s, cx, cy;
    if (wide) { const free = halfW * 2 * 0.56; s = Math.min(2, (free * 0.86) / spreadW, (halfH * 1.6) / b.h); cx = -halfW + free / 2; cy = -0.02; }
    else { s = Math.min(1.6, (halfW * 1.8) / spreadW, (halfH * 0.95) / b.h); cx = 0; cy = halfH * 0.42; }
    this._focusScale = s;
    const shift = this._coverOpen ? (b.w / 2) * s : 0;
    this._focusPos.set(cx + shift, cy, z);
  }
  _resize() {
    const w = this.clientWidth || 1, h = this.clientHeight || 1, cam = this._cam;
    this._renderer.setSize(w, h, false);
    cam.aspect = w / h;
    const tanH = Math.tan(cam.fov * Math.PI / 360);
    const needW = cam.aspect < 1 ? 3.4 : 6.6, needH = 2.6;
    const d = Math.max((needW / 2) / (tanH * cam.aspect), (needH / 2) / tanH);
    this._camY = 0.1; cam.position.set(0, 0.1, d); cam.lookAt(0, -0.05, 0);
    cam.updateProjectionMatrix();
    this._layoutFocus();
  }
}
customElements.define('book-shelf', BookShelf);
})();
