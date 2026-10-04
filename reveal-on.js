(() => {
if (customElements.get('reveal-on')) return;
class RevealOn extends HTMLElement {
  connectedCallback() {
    if (this._r) return; this._r = true;
    this.style.display = 'block';
    this.style.perspective = '1400px';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    if (this.hasAttribute('each')) { this._each(); return; }
    const card = () => this.querySelector('[data-reveal-card]') || this.firstElementChild;
    const hide = () => {
      const c = card(); if (!c) return;
      c.style.opacity = '0';
      this.querySelectorAll('[data-reveal]').forEach(el => { el.style.opacity = '0'; });
    };
    hide();
    this._io = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      this._io.disconnect(); this._play(card());
    }, { threshold: 0.35 });
    this._io.observe(this);
  }
  disconnectedCallback() { this._io && this._io.disconnect(); this._mo && this._mo.disconnect(); }
  _each() {
    const seen = new WeakSet();
    this._io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      this._io.unobserve(e.target); this._playOne(e.target);
    }), { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
    const scan = () => this.querySelectorAll('[data-reveal-card]').forEach(c => {
      if (seen.has(c)) return; seen.add(c);
      c.style.opacity = '0'; this._io.observe(c);
    });
    scan();
    this._mo = new MutationObserver(scan); this._mo.observe(this, { childList: true, subtree: true });
  }
  _playOne(c) {
    c.animate([
      { opacity: 0, transform: 'translateY(64px) scale(.96)', filter: 'blur(6px)' },
      { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
    ], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
  }
  _play(c) {
    if (!c) return;
    const ease = 'cubic-bezier(.2,.8,.2,1)';
    c.style.transformOrigin = '50% 100%';
    c.animate([
      { opacity: 0, transform: 'translateY(56px) rotateX(24deg) rotateZ(-2.5deg) scale(.94)', clipPath: 'inset(100% 0 0 0 round 14px)' },
      { opacity: 1, offset: .35 },
      { opacity: 1, transform: 'translateY(0) rotateX(0) rotateZ(-0.6deg) scale(1)', clipPath: 'inset(0 0 0 0 round 14px)' }
    ], { duration: 1100, easing: ease, fill: 'forwards' });
    const sheen = c.querySelector('[data-reveal-sheen]');
    if (sheen) sheen.animate([{ transform: 'translateX(-120%)', opacity: 0 }, { opacity: .9, offset: .4 }, { transform: 'translateX(120%)', opacity: 0 }], { duration: 1300, delay: 600, easing: 'ease-in-out', fill: 'forwards' });
    this.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.animate([{ opacity: 0, transform: 'translateY(14px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 700, delay: 520 + i * 140, easing: ease, fill: 'forwards' });
    });
  }
}
customElements.define('reveal-on', RevealOn);
})();
