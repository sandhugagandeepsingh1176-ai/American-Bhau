(() => {
if (customElements.get('book-intro')) return;
const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";
const CSS = `
:host{all:initial}
*{box-sizing:border-box}
.stage{position:absolute;left:0;right:0;top:0;height:100%;display:grid;place-items:center;background:var(--color-bg,#fbfbfb);cursor:pointer;overflow:hidden;font-family:var(--font-body,Inter,system-ui,sans-serif);color:#141414}
.book{position:relative;width:calc(var(--w)*2);height:var(--h);opacity:0}
.ground{position:absolute;left:calc(var(--w)*.06);right:calc(var(--w)*.06);bottom:calc(var(--h)*-.06);height:calc(var(--h)*.1);border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.2),transparent);filter:blur(6px)}
.sheet{position:absolute;top:0;left:var(--w);width:var(--w);height:100%}
.flip{transform-origin:0 50%;transform-style:preserve-3d}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.back{transform:rotateY(180deg)}
.paper{background:${NOISE},linear-gradient(90deg,rgba(0,0,0,.07),transparent 9%),#f6f5f1}
.paper.l{background:${NOISE},linear-gradient(270deg,rgba(0,0,0,.08),transparent 10%),#f6f5f1}
.shade{position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,0) 70%)}
.gloss{position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.55) 48%,transparent 62%)}
.cover{background:${NOISE},repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 3px),linear-gradient(90deg,rgba(0,0,0,.45),rgba(255,255,255,.05) 3.5%,rgba(0,0,0,.08) 5%,transparent 12%),#161616;color:#f2f2f2;border-radius:0 6px 6px 0;padding:9% 10% 9% 14%;display:flex;flex-direction:column;justify-content:space-between;box-shadow:inset 0 0 0 1px rgba(255,255,255,.04)}
.endpaper{background:${NOISE},repeating-linear-gradient(45deg,rgba(20,20,20,.05) 0 1px,transparent 1px 10px),#e7e5df;border-radius:6px 0 0 6px}
.k{font-size:calc(var(--h)*.018);letter-spacing:.18em;text-transform:uppercase;opacity:.72}
.name{font-size:calc(var(--h)*.075);line-height:1;letter-spacing:-.03em;font-weight:500}
.rule{width:18%;height:1px;background:currentColor;opacity:.7;margin:calc(var(--h)*.03) 0}
.pg{padding:10% 10% 9% 12%;display:flex;flex-direction:column;height:100%}
.pg.l{padding:10% 12% 9% 10%}
.center{justify-content:center;align-items:center;text-align:center;gap:calc(var(--h)*.02)}
.hl{font-size:calc(var(--h)*.064);line-height:1.08;letter-spacing:-.02em;font-weight:500;margin:auto 0 0}
.sub{font-size:calc(var(--h)*.022);line-height:1.5;opacity:.72;margin-top:calc(var(--h)*.03);max-width:32ch}
.folio{margin-top:auto;font-size:calc(var(--h)*.016);letter-spacing:.14em;text-transform:uppercase;opacity:.5}
.photo{flex:1;border-radius:3px;background:#2a1c10 center 20%/cover no-repeat;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
.skip{position:absolute;right:16px;bottom:14px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#949494}
`;
class BookIntro extends HTMLElement {
  connectedCallback() {
    if (this._r) return; this._r = true;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || window.__bookIntroPlayed || this.getAttribute('disabled') === 'true') { this.style.display = 'none'; window.__bookIntroDone = true; dispatchEvent(new CustomEvent('bookintro:done')); return; }
    window.__bookIntroPlayed = true;
    Object.assign(this.style, { position: 'absolute', inset: '0', display: 'block', pointerEvents: 'auto' });
    const photo = this.getAttribute('photo') || '';
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style>
<div class="stage" part="stage" role="img" aria-label="American Bhau sketchbook opening">
  <div class="book">
    <div class="ground"></div>
    <div class="sheet paper"><div class="pg">
      <div class="photo" style="background-image:url('${photo}')"></div>
      <div class="folio" style="margin-top:calc(var(--h)*.03)">Rahul Patil · American Bhau</div>
    </div><div class="shade s-under"></div></div>
    <div class="sheet flip leaf" style="z-index:2">
      <div class="face paper"><div class="pg center">
        <div class="k">The American Bhau</div>
        <div class="name" style="font-size:calc(var(--h)*.06)">Podcast · Consulting · Community</div>
        <div class="rule"></div>
        <div class="k">Marathi stories, global audiences</div>
      </div><div class="shade s-leaf"></div></div>
      <div class="face back paper l"><div class="pg l">
        <div class="k">Vol. 01</div>
        <h1 class="hl">Helping businesses earn more using social media.</h1>
        <div class="sub">Promoting Marathi businesses and connecting them with global audiences.</div>
        <div class="folio">americanbhau.com</div>
      </div></div>
    </div>
    <div class="sheet flip cover-el" style="z-index:3">
      <div class="face cover">
        <div class="k">Vol. 01 · Sketchbook</div>
        <div><div class="name">American<br>Bhau</div><div class="rule"></div><div class="k">Stories · Growth · Community</div></div>
        <div class="k" style="opacity:.5">Est. 2023</div>
        <div class="gloss g-cover"></div>
      </div>
      <div class="face back endpaper"></div>
    </div>
  </div>
  <div class="skip">Click to skip</div>
</div>`;
    this._root = root;
    this._size();
    this._ro = new ResizeObserver(() => this._size()); this._ro.observe(this);
    root.querySelector('.stage').addEventListener('click', () => this._finish(true));
    this._timers = [];
    const img = new Image(); img.src = photo;
    const start = () => { if (!this._started) { this._started = true; this._play(); } };
    img.decode ? img.decode().then(start, start) : start();
    this._timers.push(setTimeout(start, 250));
    this._failsafe = setTimeout(() => this._finish(true), 8000);
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); (this._timers || []).forEach(clearTimeout); clearTimeout(this._failsafe); (this._anims || []).forEach(a => a.cancel()); if (!this._done) this._signal(); }
  _signal() { if (window.__bookIntroDone) return; window.__bookIntroDone = true; dispatchEvent(new CustomEvent('bookintro:done')); }
  _size() {
    const r = this.getBoundingClientRect(), s = this._root.querySelector('.stage');
    const top = Math.max(r.top, 0), visH = Math.max(240, Math.min(r.bottom, innerHeight) - top);
    s.style.top = (top - r.top) + 'px'; s.style.height = visH + 'px';
    let h = Math.min(visH * 0.82, r.height * 0.8, 600), w = h * 0.72;
    if (w * 2 > r.width * 0.92) { w = r.width * 0.46; h = w / 0.72; }
    s.style.setProperty('--w', w + 'px'); s.style.setProperty('--h', h + 'px');
    this._w = w;
  }
  _a(sel, frames, opts) {
    const el = this._root.querySelector(sel);
    const a = el.animate(frames, { fill: 'both', ...opts });
    (this._anims = this._anims || []).push(a); return a;
  }
  _play() {
    const w = () => this._w, P = 'perspective(2600px) ';
    const e1 = 'cubic-bezier(.2,.8,.2,1)', flipE = 'cubic-bezier(.55,.05,.25,1)';
    const half = `translateX(${-w() / 2}px)`;
    this._a('.book', [{ opacity: 0, transform: `${half} translateY(28px) scale(.96)` }, { opacity: 1, transform: `${half} translateY(0) scale(1)` }], { duration: 750, easing: e1 });
    this._a('.g-cover', [{ opacity: 0, transform: 'translateX(-60%)' }, { opacity: 1, offset: .5 }, { opacity: 0, transform: 'translateX(60%)' }], { duration: 900, delay: 250, easing: 'ease-in-out' });
    const t1 = 1000, d1 = 1350;
    this._a('.book', [{ opacity: 1, transform: `${half} translateY(0) scale(1)` }, { opacity: 1, transform: 'translateX(0) translateY(0) scale(1)' }], { duration: d1, delay: t1, easing: flipE, composite: 'replace' });
    this._a('.cover-el', [{ transform: P + 'rotateY(0deg) skewY(0deg)' }, { transform: P + 'rotateY(-95deg) skewY(-1.2deg)', offset: .5 }, { transform: P + 'rotateY(-180deg) skewY(0deg)' }], { duration: d1, delay: t1, easing: flipE });
    this._a('.s-leaf', [{ opacity: .55 }, { opacity: 0 }], { duration: d1 * .8, delay: t1 + d1 * .2, easing: 'ease-out' });
    const t2 = t1 + d1 + 150, d2 = 1050;
    this._timers.push(setTimeout(() => { const l = this._root.querySelector('.leaf'); if (l) l.style.zIndex = 4; }, t2 + d2 * 0.5));
    this._a('.leaf', [{ transform: P + 'rotateY(0deg) skewY(0deg)' }, { transform: P + 'rotateY(-92deg) skewY(-1.6deg)', offset: .5 }, { transform: P + 'rotateY(-180deg) skewY(0deg)' }], { duration: d2, delay: t2, easing: flipE });
    this._a('.s-under', [{ opacity: .5 }, { opacity: .25, offset: .5 }, { opacity: 0 }], { duration: d2, delay: t2, easing: 'ease-out' });
    this._a('.photo', [{ opacity: .0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 900, delay: t2 + d2 * .45, easing: e1 });
    const t3 = t2 + d2 + 650;
    this._timers.push(setTimeout(() => this._finish(false), t3));
  }
  _finish(fast) {
    if (this._done) return; this._done = true;
    (this._timers || []).forEach(clearTimeout); clearTimeout(this._failsafe);
    this.style.pointerEvents = 'none';
    setTimeout(() => { this.style.display = 'none'; this._signal(); }, 1200);
    const st = this._root.querySelector('.stage'), bk = this._root.querySelector('.book');
    const d = fast ? 320 : 750;
    const cs = getComputedStyle(bk).transform;
    bk.animate([{ transform: cs === 'none' ? 'none' : cs, opacity: getComputedStyle(bk).opacity }, { transform: 'translateX(0) scale(1.14)', opacity: 0 }], { duration: d, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    st.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d, delay: fast ? 0 : 120, easing: 'ease-out', fill: 'forwards' })
      .onfinish = () => { this.style.display = 'none'; this._signal(); };
  }
}
customElements.define('book-intro', BookIntro);
})();
