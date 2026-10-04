(() => {
if (customElements.get('paper-sheet')) return;
const THREE_URL = 'https://unpkg.com/three@0.149.0/build/three.module.js';

const VERT = `
uniform float uTime; uniform float uPress; uniform vec2 uMouse;
varying vec2 vUv; varying vec3 vN; varying vec3 vPos; varying float vCurl;
float disp(vec2 p, vec2 uv, out float curl){
  float z = sin(p.x*2.2 + uTime*0.8)*0.028 + sin(p.y*2.7 - uTime*0.6 + p.x*0.8)*0.022;
  z += sin((p.x+p.y)*4.0 + uTime*1.3)*0.006;
  float d = (uv.x + (1.0-uv.y))*0.5;
  curl = smoothstep(0.52, 1.0, d);
  z += curl*curl*(0.05 + uPress*0.22 + max(uMouse.x,0.0)*0.04);
  float t = smoothstep(0.6, 1.0, uv.y) * (1.0-uv.x);
  z += t*t*0.03*sin(uTime*0.9+1.3);
  return z;
}
void main(){
  vUv = uv;
  vec3 p = position; float c; float cx; float cy;
  float e = 0.004;
  float z  = disp(p.xy, uv, c);
  float zx = disp(p.xy+vec2(e,0.), uv+vec2(e/1.0,0.), cx);
  float zy = disp(p.xy+vec2(0.,e), uv+vec2(0.,e/1.414), cy);
  vec3 tx = vec3(e,0.,zx-z), ty = vec3(0.,e,zy-z);
  vCurl = c;
  p.z += z;
  vN = normalize(normalMatrix * normalize(cross(tx,ty)));
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  vPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = `
uniform sampler2D uMap; uniform float uTime;
varying vec2 vUv; varying vec3 vN; varying vec3 vPos; varying float vCurl;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
void main(){
  vec3 N = normalize(vN); if(!gl_FrontFacing) N = -N;
  vec3 L = normalize(vec3(-0.4, 0.6, 1.0));
  vec3 V = normalize(-vPos);
  float diff = clamp(dot(N,L),0.,1.);
  float spec = pow(clamp(dot(reflect(-L,N),V),0.,1.), 28.0)*0.12;
  vec3 paper = vec3(0.955,0.948,0.93);
  vec4 front = texture2D(uMap, vUv);
  vec4 back = texture2D(uMap, vec2(1.0-vUv.x, vUv.y));
  float fib = n(vUv*vec2(420.,600.))*0.5 + n(vUv*vec2(60.,90.))*0.5;
  vec3 col;
  if (gl_FrontFacing) {
    col = front.rgb;
    col = mix(col, col*0.93 + paper*0.07, 0.25);
    col = mix(col, paper, 0.0);
    col += (back.rgb - paper) * -0.0;
  } else {
    col = mix(paper, back.rgb, 0.16);
  }
  float light = 0.72 + diff*0.34;
  col *= light;
  col *= 0.975 + fib*0.04;
  col += spec;
  col += vec3(1.0,0.99,0.96) * vCurl * 0.05;
  gl_FragColor = vec4(col, 1.0);
}`;

class PaperSheet extends HTMLElement {
  static get observedAttributes() { return ['accent']; }
  connectedCallback() {
    if (this._init) return; this._init = true;
    this.style.display = 'block'; this.style.position = 'relative';
    if (!this.style.height) this.style.height = '100%';
    this.style.touchAction = 'pan-y';
    this.style.cursor = 'grab';
    this._lazyIO = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting) || this._booted) return;
      this._booted = true; this._lazyIO.disconnect();
      const idle = window.requestIdleCallback || (f => setTimeout(f, 60));
      idle(() => this._boot(), { timeout: 600 });
    }, { rootMargin: '200px 0px' });
    this._lazyIO.observe(this);
  }
  attributeChangedCallback() { if (this._ctx) this._draw(); }
  disconnectedCallback() {
    cancelAnimationFrame(this._raf); this._ro && this._ro.disconnect(); this._io && this._io.disconnect(); this._lazyIO && this._lazyIO.disconnect(); this._booted = false;
    this._renderer && this._renderer.dispose(); this._init = false;
  }
  async _boot() {
    const THREE = await import(THREE_URL);
    this.THREE = THREE;
    try { await Promise.race([Promise.all([document.fonts.load('500 120px Inter'), document.fonts.load('400 30px Inter')]), new Promise(r => setTimeout(r, 500))]); } catch (e) {}
    if (!this.isConnected) return;
    document.fonts && document.fonts.ready.then(() => { if (this._ctx) { this._draw(); if (this._tex) this._tex.needsUpdate = true; } });
    const COARSE = matchMedia('(pointer: coarse)').matches;
    const r = new THREE.WebGLRenderer({ antialias: !(COARSE && devicePixelRatio > 1.5), alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, COARSE ? 1.5 : 1.75));
    r.outputEncoding = THREE.sRGBEncoding;
    Object.assign(r.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    this.appendChild(r.domElement);
    this._renderer = r;
    this._scene = new THREE.Scene();
    this._cam = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1448;
    this._cv = cv; this._ctx = cv.getContext('2d');
    this._tex = new THREE.CanvasTexture(cv);
    this._tex.encoding = THREE.sRGBEncoding;
    this._tex.anisotropy = r.capabilities.getMaxAnisotropy();
    this._draw();
    this._u = { uTime: { value: 0 }, uPress: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uMap: { value: this._tex } };
    const geo = new THREE.PlaneGeometry(1, 1.414, 80, 112);
    const mat = new THREE.ShaderMaterial({ uniforms: this._u, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide });
    this._mesh = new THREE.Mesh(geo, mat);
    this._scene.add(this._mesh);
    this._target = { x: 0, y: 0, p: 0 }; this._cur = { x: 0, y: 0, p: 0 };
    const pos = e => { const b = this.getBoundingClientRect();
      this._target.x = ((e.clientX - b.left) / b.width) * 2 - 1; this._target.y = ((e.clientY - b.top) / b.height) * 2 - 1; };
    this.addEventListener('pointermove', pos);
    this.addEventListener('pointerleave', () => { this._target.x = 0; this._target.y = 0; this._target.p = 0; this.style.cursor = 'grab'; });
    this.addEventListener('pointerdown', e => { pos(e); this._target.p = 1; this.style.cursor = 'grabbing'; });
    addEventListener('pointerup', () => { this._target.p = 0; this.style.cursor = 'grab'; });
    addEventListener('pointercancel', () => { this._target.p = 0; this.style.cursor = 'grab'; });
    this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(this); this._resize();
    this._visible = true;
    this._io = new IntersectionObserver(es => { this._visible = es[0].isIntersecting; }); this._io.observe(this);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    let lastT = performance.now();
    const loop = now => {
      this._raf = requestAnimationFrame(loop);
      now = now || performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      if (!this._visible || document.hidden) return;
      const fr = dt * 60, c = this._cur, t = this._target, k = 1 - Math.pow(0.93, fr), kp = 1 - Math.pow(0.91, fr);
      c.x += (t.x - c.x) * k; c.y += (t.y - c.y) * k; c.p += (t.p - c.p) * kp;
      const time = (performance.now() - t0) / 1000 * (reduce ? 0.2 : 1);
      this._u.uTime.value = time; this._u.uPress.value = c.p; this._u.uMouse.value.set(c.x, c.y);
      this._mesh.rotation.y = -0.28 + c.x * 0.32 + Math.sin(time * 0.35) * 0.04;
      this._mesh.rotation.x = -0.08 + c.y * 0.22 + Math.sin(time * 0.28) * 0.03;
      this._mesh.rotation.z = 0.05 + Math.sin(time * 0.22) * 0.015;
      this._mesh.position.y = Math.sin(time * 0.6) * 0.012 + c.p * 0.02;
      this._mesh.position.z = c.p * 0.06;
      r.render(this._scene, this._cam);
    };
    loop();
  }
  _resize() {
    const w = this.clientWidth || 1, h = this.clientHeight || 1;
    this._renderer.setSize(w, h, false);
    this._cam.aspect = w / h;
    const fit = 1.414 * 1.18, fov = this._cam.fov * Math.PI / 180;
    let d = (fit / 2) / Math.tan(fov / 2);
    const dW = (1.25 / 2) / (Math.tan(fov / 2) * this._cam.aspect);
    this._cam.position.set(0, 0, Math.max(d, dW));
    this._cam.updateProjectionMatrix();
  }
  _draw() {
    const x = this._ctx, W = 1024, H = 1448;
    const lime = this.getAttribute('accent') || '#c6f432';
    const ink = '#141414', mute = '#6b6b6b', paper = '#f4f2ec';
    const F = (w, s) => `${w} ${s}px Inter, system-ui, sans-serif`;
    x.fillStyle = paper; x.fillRect(0, 0, W, H);
    const M = 80;
    x.fillStyle = ink; x.textBaseline = 'alphabetic';
    x.font = F(500, 26); x.fillText('AMERICAN BHAU', M, 118);
    x.textAlign = 'right'; x.fillStyle = mute; x.fillText('SEASON 2025', W - M, 118); x.textAlign = 'left';
    x.fillStyle = ink; x.fillRect(M, 146, W - 2 * M, 3);
    x.font = F(500, 150); x.fillText('Featured', M - 6, 330); x.fillText('Business', M - 6, 480);
    x.fillStyle = mute; x.font = F(400, 30);
    x.fillText('Marathi businesses in the USA, told through', M, 560);
    x.fillText('video, vlogs, podcasts and reels/shorts.', M, 602);
    const cx = W - M - 120, cy = 290;
    x.fillStyle = lime; x.beginPath(); x.arc(cx, cy, 120, 0, Math.PI * 2); x.fill();
    x.fillStyle = ink; x.textAlign = 'center';
    x.font = F(500, 22); x.fillText('ON THE', cx, cy - 30);
    x.font = F(500, 50); x.fillText('STAGE', cx, cy + 20);
    x.font = F(500, 22); x.fillText('2025', cx, cy + 58); x.textAlign = 'left';
    x.fillStyle = mute; x.font = F(500, 22); x.fillText('AWARDED TO', M, 700);
    x.fillStyle = ink; x.font = F(500, 58); x.fillText('Your Business', M, 780);
    x.fillRect(M, 808, W - 2 * M, 2);
    const rows = ['Professional video production', 'Community showcase', 'Social media management', 'Podcast feature'];
    rows.forEach((t, i) => {
      const y = 890 + i * 74;
      x.fillStyle = lime; x.fillRect(M, y - 34, 40, 40);
      x.strokeStyle = ink; x.lineWidth = 5; x.beginPath(); x.moveTo(M + 9, y - 14); x.lineTo(M + 17, y - 5); x.lineTo(M + 32, y - 25); x.stroke();
      x.fillStyle = ink; x.font = F(400, 32); x.fillText(t, M + 66, y);
      x.fillStyle = 'rgba(20,20,20,0.12)'; x.fillRect(M, y + 20, W - 2 * M, 1);
    });
    const yb = 1210;
    x.fillStyle = mute; x.font = F(500, 20);
    x.fillText('HOST', M, yb); x.fillText('CONTACT', M + 300, yb);
    x.fillStyle = ink; x.font = F(400, 28);
    x.fillText('Rahul Patil', M, yb + 40); x.fillText('rahul@americanbhau.com', M + 300, yb + 40);
    let bx = W - M - 180; const seed = [3,1,2,1,4,1,1,3,2,1,1,2,3,1,2,1,1,4,1,2,1,3,1,1,2,1,3,2,1,1];
    x.fillStyle = ink; seed.forEach((s, i) => { if (i % 2 === 0) x.fillRect(bx, yb - 20, s * 2.4, 70); bx += s * 2.4 + 2; });
    x.fillStyle = lime; x.fillRect(M, H - 110, W - 2 * M, 14);
    x.fillStyle = mute; x.font = F(400, 20); x.fillText('americanbhau.com', M, H - 60);
    x.textAlign = 'right'; x.fillText('No. 001', W - M, H - 60); x.textAlign = 'left';
    if (this._tex) this._tex.needsUpdate = true;
  }
}
customElements.define('paper-sheet', PaperSheet);
})();
