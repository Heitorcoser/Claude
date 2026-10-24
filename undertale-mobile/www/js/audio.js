// Áudio sintetizado com WebAudio: efeitos + sequenciador de músicas com vários
// instrumentos (sino, piano, flauta, cordas, metais, pizzicato, baixo, bateria) e reverb.
'use strict';

const Sfx = (() => {
  let ac = null, master = null, sfxBus = null, musicMaster = null, reverb = null, revSend = null;
  let song = null; // {name, bus, timer, step, next}
  let musicOn = true, sfxOn = true;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = 0.8; master.connect(comp);
    sfxBus = ac.createGain(); sfxBus.gain.value = sfxOn ? 0.55 : 0; sfxBus.connect(master);
    musicMaster = ac.createGain(); musicMaster.gain.value = musicOn ? 0.5 : 0; musicMaster.connect(master);
    // reverb (resposta ao impulso gerada)
    reverb = ac.createConvolver();
    const len = ac.sampleRate * 2.2, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    reverb.buffer = ir;
    revSend = ac.createGain(); revSend.gain.value = 0.35;
    revSend.connect(reverb); reverb.connect(musicMaster);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    if (pendingSong) { const n = pendingSong; pendingSong = null; S.playMusic(n); }
  }
  let noiseBuf = null, pendingSong = null;

  // ---------- efeitos simples ----------
  function tone(freq, dur, type = 'square', vol = 0.2, slide = 0, dest) {
    if (!ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = 0.2, filt = 0, dest) {
    if (!ac) return;
    const t = ac.currentTime;
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = noiseBuf; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    let n = s;
    if (filt) { const f = ac.createBiquadFilter(); f.type = filt > 0 ? 'highpass' : 'lowpass'; f.frequency.value = Math.abs(filt); s.connect(f); n = f; }
    n.connect(g); g.connect(dest || sfxBus); s.start(t); s.stop(t + dur + 0.05);
  }

  const voices = {
    narr: () => tone(520, 0.04, 'square', 0.06),
    instr: () => tone(180 + Math.random() * 30, 0.06, 'triangle', 0.18),
    musg: () => tone(120 + Math.random() * 40, 0.05, 'sawtooth', 0.06),
    ghost: () => tone(700 + Math.random() * 200, 0.05, 'sine', 0.08),
    fire: () => tone(330 + Math.random() * 160, 0.05, 'sawtooth', 0.07),
    ice: () => tone(140 + Math.random() * 20, 0.08, 'sine', 0.2),
    dragon: () => tone(110 + Math.random() * 40, 0.06, 'square', 0.08),
    deep: () => tone(70 + Math.random() * 10, 0.09, 'sawtooth', 0.12),
    peng: () => tone(900 + Math.random() * 300, 0.04, 'square', 0.05),
    robot: () => tone([660, 880, 990, 1320][(Math.random() * 4) | 0], 0.04, 'square', 0.06),
    robot2: () => tone([520, 780][(Math.random() * 2) | 0], 0.05, 'triangle', 0.12),
    bully: () => tone(160 + Math.random() * 40, 0.05, 'square', 0.08),
    kid: () => tone(600 + Math.random() * 200, 0.04, 'triangle', 0.1),
    soft: () => tone(740 + Math.random() * 60, 0.05, 'sine', 0.1),
    harsh: () => tone(200 + Math.random() * 30, 0.05, 'sawtooth', 0.09),
    posh: () => tone(130 + Math.random() * 20, 0.08, 'square', 0.09),
    old: () => tone(420 + Math.random() * 30, 0.08, 'sine', 0.12),
    spider: () => tone(980 + Math.random() * 200, 0.03, 'triangle', 0.08),
    bones: () => tone([392, 523, 659][(Math.random() * 3) | 0], 0.05, 'square', 0.07),
    fox: () => tone(560 + Math.random() * 80, 0.06, 'sine', 0.12),
  };

  // ---------- INSTRUMENTOS ----------
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  function env(g, t, a, peak, d, sus, rel, end) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sus), t + a + d);
    g.gain.setValueAtTime(Math.max(0.0001, peak * sus), end);
    g.gain.exponentialRampToValueAtTime(0.0001, end + rel);
  }
  function osc(type, f, t, end, dest, detune = 0) {
    const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    o.connect(dest); o.start(t); o.stop(end + 0.05); return o;
  }
  function out(bus, wet) {
    const g = ac.createGain(); g.connect(bus);
    if (wet) { const w = ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(revSend); }
    return g;
  }
  function vibrato(o, t, depth = 8, rate = 5.5, delay = 0.15, end) {
    const l = ac.createOscillator(), lg = ac.createGain();
    l.frequency.value = rate; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(depth, t + delay + 0.1);
    l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(end + 0.1);
  }

  const INST = {
    bell(bus, n, t, d, v) {
      const f = midi(n), end = t + Math.max(d, 1.2);
      const g = out(bus, 0.5); env(g, t, 0.003, v * 0.5, 1.2, 0.001, 0.1, t + 1.2);
      const car = ac.createOscillator(); car.frequency.value = f; car.type = 'sine';
      const mod = ac.createOscillator(); mod.frequency.value = f * 3.5;
      const mg = ac.createGain(); mg.gain.setValueAtTime(f * 1.5, t); mg.gain.exponentialRampToValueAtTime(1, t + 0.8);
      mod.connect(mg); mg.connect(car.frequency); car.connect(g);
      car.start(t); mod.start(t); car.stop(end); mod.stop(end);
    },
    piano(bus, n, t, d, v) {
      const f = midi(n), end = t + d;
      const g = out(bus, 0.3); env(g, t, 0.004, v * 0.45, 0.8, 0.25, 0.25, end);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(4000, t); lp.frequency.exponentialRampToValueAtTime(900, t + 0.8);
      lp.connect(g);
      osc('triangle', f, t, end + 0.3, lp); const g2 = ac.createGain(); g2.gain.value = 0.25; g2.connect(lp);
      osc('square', f * 2, t, end + 0.3, g2, 3);
    },
    flute(bus, n, t, d, v) {
      const f = midi(n), end = t + d * 0.95;
      const g = out(bus, 0.35); env(g, t, 0.05, v * 0.42, 0.1, 0.8, 0.12, end);
      const o = osc('sine', f, t, end + 0.15, g); vibrato(o, t, 10, 5, 0.18, end);
      const g2 = ac.createGain(); g2.gain.value = 0.18; g2.connect(g); const o2 = osc('triangle', f * 2, t, end + 0.15, g2); vibrato(o2, t, 10, 5, 0.18, end);
    },
    square(bus, n, t, d, v) {
      const f = midi(n), end = t + d * 0.92;
      const g = out(bus, 0.2); env(g, t, 0.01, v * 0.22, 0.08, 0.7, 0.08, end);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(g);
      const o = osc('square', f, t, end + 0.1, lp); vibrato(o, t, 12, 6, 0.2, end);
    },
    brass(bus, n, t, d, v) {
      const f = midi(n), end = t + d * 0.92;
      const g = out(bus, 0.25); env(g, t, 0.03, v * 0.3, 0.15, 0.75, 0.1, end);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2600, t + 0.06); lp.frequency.exponentialRampToValueAtTime(1400, t + 0.3);
      lp.connect(g);
      const o = osc('sawtooth', f, t, end + 0.12, lp); vibrato(o, t, 6, 5.5, 0.25, end);
      osc('sawtooth', f, t, end + 0.12, lp, 7);
    },
    pizz(bus, n, t, d, v) {
      const f = midi(n), end = t + 0.3;
      const g = out(bus, 0.4); env(g, t, 0.003, v * 0.45, 0.25, 0.001, 0.05, end);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(500, t + 0.25); lp.connect(g);
      osc('sawtooth', f, t, end, lp); osc('triangle', f, t, end, lp);
    },
    harp(bus, n, t, d, v) {
      const f = midi(n), end = t + 0.9;
      const g = out(bus, 0.5); env(g, t, 0.002, v * 0.3, 0.9, 0.001, 0.05, end);
      osc('triangle', f, t, end, g);
      const g2 = ac.createGain(); g2.gain.value = 0.3; g2.connect(g); osc('sine', f * 2, t, end, g2);
    },
    marimba(bus, n, t, d, v) {
      const f = midi(n), end = t + 0.45;
      const g = out(bus, 0.3); env(g, t, 0.002, v * 0.45, 0.4, 0.001, 0.05, end);
      osc('sine', f, t, end, g);
      const g2 = ac.createGain(); g2.gain.setValueAtTime(0.4, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.06); g2.connect(g); osc('sine', f * 4, t, end, g2);
    },
    strings(bus, notes, t, d, v) {
      const end = t + d;
      const g = out(bus, 0.6); env(g, t, 0.35, v * 0.09, 0.3, 0.85, 0.5, end);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.connect(g);
      for (const n of notes) for (const dt of [-9, 0, 9]) { const o = osc('sawtooth', midi(n), t, end + 0.6, lp, dt); vibrato(o, t, 5, 5, 0.3, end); }
    },
    organ(bus, notes, t, d, v) {
      const end = t + d;
      const g = out(bus, 0.4); env(g, t, 0.05, v * 0.08, 0.2, 0.8, 0.3, end);
      for (const n of notes) { osc('sine', midi(n), t, end + 0.4, g); const h = ac.createGain(); h.gain.value = 0.4; h.connect(g); osc('sine', midi(n) * 2, t, end + 0.4, h); }
    },
    bassTri(bus, n, t, d, v) {
      const end = t + d * 0.9;
      const g = out(bus, 0); env(g, t, 0.005, v * 0.55, 0.2, 0.7, 0.06, end);
      osc('triangle', midi(n), t, end + 0.1, g);
      const g2 = ac.createGain(); g2.gain.value = 0.15; g2.connect(g); osc('square', midi(n), t, end + 0.1, g2);
    },
    bassSaw(bus, n, t, d, v) {
      const end = t + d * 0.85;
      const g = out(bus, 0); env(g, t, 0.005, v * 0.4, 0.15, 0.6, 0.05, end);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 4;
      lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.18); lp.connect(g);
      osc('sawtooth', midi(n), t, end + 0.08, lp);
    },
    bassPluck(bus, n, t, d, v) {
      const end = t + Math.min(d, 0.5);
      const g = out(bus, 0.05); env(g, t, 0.003, v * 0.6, 0.3, 0.05, 0.05, end);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1200, t); lp.frequency.exponentialRampToValueAtTime(250, t + 0.3); lp.connect(g);
      osc('triangle', midi(n), t, end + 0.08, lp); osc('sawtooth', midi(n), t, end + 0.08, lp);
    },
    kick(bus, t, v) {
      const g = out(bus, 0); g.gain.setValueAtTime(v * 0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      const o = ac.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      o.connect(g); o.start(t); o.stop(t + 0.4);
    },
    snare(bus, t, v) {
      const g = out(bus, 0.25); g.gain.setValueAtTime(v * 0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      const s = ac.createBufferSource(); s.buffer = noiseBuf; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.7;
      s.connect(bp); bp.connect(g); s.start(t, Math.random() * 0.5); s.stop(t + 0.2);
      const g2 = out(bus, 0); g2.gain.setValueAtTime(v * 0.3, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc('triangle', 190, t, t + 0.1, g2);
    },
    hat(bus, t, v, open) {
      const dur = open ? 0.25 : 0.045;
      const g = out(bus, 0.1); g.gain.setValueAtTime(v * 0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      const s = ac.createBufferSource(); s.buffer = noiseBuf; const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7500;
      s.connect(hp); hp.connect(g); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    },
    tom(bus, t, v) {
      const g = out(bus, 0.2); g.gain.setValueAtTime(v * 0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      const o = ac.createOscillator(); o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.25);
      o.connect(g); o.start(t); o.stop(t + 0.32);
    },
  };

  // ---------- acordes ----------
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteNum(s) { // "C#5" -> midi
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) return null;
    return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  function chordNotes(name) { // retorna intervalos a partir da raiz (pitch class)
    const m = /^([A-G][#b]?)(.*)$/.exec(name);
    const root = NOTE[m[1][0]] + (m[1][1] === '#' ? 1 : m[1][1] === 'b' ? -1 : 0);
    const q = m[2];
    let iv = [0, 4, 7];
    if (q === 'm') iv = [0, 3, 7];
    else if (q === '7') iv = [0, 4, 7, 10];
    else if (q === 'm7') iv = [0, 3, 7, 10];
    else if (q === 'maj7') iv = [0, 4, 7, 11];
    else if (q === 'dim') iv = [0, 3, 6];
    else if (q === 'sus4') iv = [0, 5, 7];
    else if (q === 'add9') iv = [0, 4, 7, 14];
    return { root, iv };
  }

  // ---------- MÚSICAS ----------
  // Cada compasso: "Acorde: 8 colcheias". Nota inicia; '.' prolonga; '-' pausa.
  const SONGS = {
    title: { bpm: 72, lead: 'bell', pad: 'strings', arp: 'harp', bass: 'bassTri', bassPat: 'root', drums: null, leadVol: 0.9,
      bars: `Am: E5 . A5 . C6 . B5 A5 | F: C6 . . A5 F5 . A5 . | C: G5 . E5 . C5 . E5 G5 | G: D5 . . . B4 . D5 . |
             Am: E5 . A5 . C6 . E6 . | F: D6 . C6 . A5 . F5 . | E: G#5 . B5 . E6 . D6 B5 | E: G#5 . . . E5 . - -` },
    ruins: { bpm: 92, lead: 'flute', pad: 'strings', arp: 'harp', bass: 'bassTri', bassPat: 'rootfifth', drums: 'soft',
      bars: `Em: B4 . E5 . G5 . F#5 E5 | C: G5 . . . E5 . - - | G: D5 . G5 . B5 . A5 G5 | D: F#5 . . . D5 . - - |
             Em: E5 . G5 . B5 . A5 G5 | C: C6 . B5 . G5 . E5 . | Am: A5 . G5 . E5 . C5 . | B7: D#5 . . . F#5 . B4 .` },
    instr: { bpm: 84, lead: 'piano', pad: 'strings', arp: null, bass: 'bassTri', bassPat: 'root', drums: null, lead2: 'flute',
      bars: `C: E5 . G5 . C6 . B5 . | Am: A5 . . . E5 . . . | F: F5 . A5 . C6 . A5 . | G: G5 . . . D5 . - - |
             C: E5 . G5 . C6 . E6 . | E7: D6 . B5 . G#5 . E5 . | F: A5 . C6 . F6 . E6 D6 | G: C6 . . . B5 . - -` },
    battle: { bpm: 152, lead: 'square', pad: 'strings', arp: null, bass: 'bassSaw', bassPat: 'eighths', drums: 'rock',
      bars: `Am: A4 C5 E5 A5 G5 E5 C5 E5 | F: F5 . A5 . C6 . A5 F5 | G: G5 . D5 . B4 . D5 G5 | Em: E5 . . . B4 . E5 . |
             Am: A5 . G5 A5 C6 . B5 A5 | F: A5 . F5 . C5 . F5 A5 | G: B5 . G5 . D5 . G5 B5 | E: G#5 . E5 . B4 . E5 G#5` },
    dragoncity: { bpm: 116, lead: 'brass', lead2: 'bell', pad: 'organ', arp: 'marimba', bass: 'bassPluck', bassPat: 'rootfifth', drums: 'pop',
      bars: `F: A5 . C6 . A5 G5 F5 . | C: G5 . E5 . C5 . E5 G5 | Dm: F5 . A5 . D6 . C6 A5 | Bb: Bb5 . . . A5 . G5 . |
             F: A5 . C6 . F6 . E6 D6 | C: C6 . G5 . E5 . G5 . | Bb: F5 . G5 . A5 . Bb5 . | C: C6 . . . - - G5 . |
             Bb: D6 . . C6 Bb5 . A5 . | F: A5 . . . F5 . - - | C: G5 . . A5 G5 . E5 . | Dm: F5 . . . D5 . - - |
             Bb: D6 . C6 . Bb5 . D6 . | F: C6 . A5 . F5 . A5 . | Gm: Bb5 . A5 . G5 . A5 . | C: G5 . . . C6 . - -` },
    ghosts: { bpm: 108, lead: 'pizz', lead2: 'bell', pad: null, arp: null, bass: 'bassPluck', bassPat: 'walk', drums: 'tick',
      bars: `Dm: D5 - F5 - A5 - F5 - | A7: E5 - G5 - C#5 - E5 - | Dm: D5 - F5 - A5 - D6 - | A7: C#6 - A5 - G5 - E5 - |
             Gm: G5 - Bb5 - D6 - Bb5 - | Dm: A5 - F5 - D5 - F5 - | E7: G#5 - B5 - D6 - B5 - | A7: A5 . . . - - - -` },
    cinzas: { bpm: 96, lead: 'flute', lead2: 'bell', pad: 'strings', arp: 'harp', bass: 'bassTri', bassPat: 'root', drums: 'tribal',
      bars: `Am: A4 . . C5 E5 . D5 C5 | G: D5 . . . B4 . G4 . | F: A4 . C5 . F5 . E5 D5 | E: E5 . . . G#4 . . . |
             Am: C5 . E5 . A5 . G5 E5 | G: G5 . . D5 B4 . D5 . | Dm: F5 . E5 . D5 . A4 . | E: B4 . . . G#4 . E4 .` },
    house: { bpm: 66, lead: 'bell', pad: 'strings', arp: null, bass: 'bassTri', bassPat: 'root', drums: null, leadVol: 0.7,
      bars: `Am: E5 . . . A5 . . . | Dm: F5 . . . D5 . . . | E: G#5 . . . B5 . . . | Am: A5 . . . - - - - |
             F: C6 . . . A5 . . . | Dm: D6 . . . F5 . . . | E: E5 . . . G#5 . B5 . | E: E6 . . . - - - -` },
    boss: { bpm: 168, lead: 'square', lead2: 'brass', pad: 'strings', arp: 'marimba', bass: 'bassSaw', bassPat: 'eighths', drums: 'boss',
      bars: `Dm: D5 D5 F5 D5 A5 . G5 F5 | Bb: F5 . D5 . Bb4 . D5 F5 | C: E5 E5 G5 E5 C6 . Bb5 A5 | A: C#6 . A5 . E5 . A5 C#6 |
             Dm: D6 . C6 D6 A5 . F5 A5 | Bb: Bb5 . A5 Bb5 F5 . D5 F5 | Gm: G5 . A5 Bb5 D6 . C6 Bb5 | A7: A5 . G5 . E5 . C#5 E5 |
             F: A5 . . . C6 . A5 . | C: G5 . . . E5 . C5 . | Dm: F5 . E5 . D5 . A5 . | Bb: Bb5 . . . D6 . . . |
             F: C6 . A5 . F5 . A5 C6 | C: E6 . D6 . C6 . G5 . | Bb: F5 . G5 . A5 . Bb5 . | A: C#6 . . . E6 . . .` },
    colonia: { bpm: 100, lead: 'bell', lead2: 'flute', pad: 'strings', arp: 'harp', bass: 'bassTri', bassPat: 'root', drums: 'soft', leadVol: 0.9,
      bars: `C: E5 . G5 . C6 . B5 G5 | Am: A5 . . . E5 . . . | F: F5 . A5 . C6 . A5 F5 | G: G5 . . . D5 . . . |
             C: E5 . G5 . C6 . E6 . | Em: D6 . B5 . G5 . E5 . | F: A5 . C6 . A5 . F5 . | G: G5 . . . - - - -` },
    icetheme: { bpm: 84, lead: 'brass', lead2: 'bell', pad: 'strings', arp: null, bass: 'bassSaw', bassPat: 'root', drums: 'tribal',
      bars: `Em: E5 . . . G5 . F#5 E5 | C: E5 . . . C5 . . . | Am: A4 . C5 . E5 . D5 C5 | B7: B4 . . . D#5 . F#5 . |
             Em: G5 . . . B5 . A5 G5 | C: G5 . E5 . C5 . . . | D: F#5 . A5 . D6 . C6 A5 | B7: B5 . . . - - - -` },
    puzzle: { bpm: 120, lead: 'pizz', lead2: 'bell', pad: null, arp: null, bass: 'bassPluck', bassPat: 'walk', drums: 'tick',
      bars: `F: A4 - C5 - F5 - A5 - | Dm: D5 - F5 - A5 - F5 - | Gm: G5 - Bb5 - D6 - Bb5 - | C7: C6 - Bb5 - G5 - E5 - |
             F: F5 - A5 - C6 - A5 - | Dm: D6 - A5 - F5 - D5 - | Bb: D5 - F5 - Bb5 - D6 - | C7: C6 . . . - - - -` },
    nevasca: { bpm: 132, lead: 'flute', lead2: 'bell', pad: 'strings', arp: 'harp', bass: 'bassSaw', bassPat: 'rootfifth', drums: 'pop',
      bars: `Dm: D5 . F5 . A5 . . G5 | Bb: F5 . D5 . . . Bb4 . | F: C5 . F5 . A5 . C6 . | C: G5 . . . E5 . . . |
             Dm: D6 . C6 . A5 . F5 . | Bb: D5 . F5 . Bb5 . D6 . | C: E6 . D6 . C6 . G5 . | A: A5 . . . C#6 . E6 .` },
    futuro: { bpm: 112, lead: 'square', lead2: 'bell', pad: 'organ', arp: 'marimba', bass: 'bassSaw', bassPat: 'eighths', drums: 'pop',
      bars: `Am: E5 . A5 . C6 . B5 A5 | F: C6 . . . A5 . F5 . | C: G5 . E5 . G5 . C6 . | G: B5 . . . D6 . - - |
             Am: A5 . C6 . E6 . D6 C6 | F: A5 . F5 . C6 . A5 . | Dm: F5 . A5 . D6 . C6 A5 | E: G#5 . . . B5 . E5 .` },
    bit: { bpm: 126, lead: 'bell', lead2: 'pizz', pad: null, arp: 'marimba', bass: 'bassPluck', bassPat: 'rootfifth', drums: 'tick',
      bars: `C: C6 . E6 . G6 . E6 . | F: F6 . A5 . C6 . A5 . | G: G5 . B5 . D6 . B5 . | C: C6 . . . G5 . - - |
             Am: A5 . C6 . E6 . C6 . | Dm: D6 . F6 . A5 . F6 . | G7: G5 . B5 . D6 . F6 . | C: E6 . C6 . - - - -` },
    escola: { bpm: 132, lead: 'flute', lead2: 'bell', pad: 'strings', arp: 'harp', bass: 'bassPluck', bassPat: 'walk', drums: 'pop',
      bars: `G: B4 . D5 . G5 . A5 B5 | C: C6 . B5 . A5 . G5 . | D: F#5 . A5 . D6 . C6 . | G: B5 . . . G5 . - - |
             Em: G5 . B5 . E6 . D6 . | C: E6 . C6 . A5 . G5 . | A7: A5 . C#6 . E6 . G5 . | D: F#5 . . . D5 . - -` },
    cinema: { bpm: 76, lead: 'brass', lead2: 'bell', pad: 'strings', arp: 'harp', bass: 'bassTri', bassPat: 'root', drums: 'tribal',
      bars: `C: G4 . C5 . E5 . . . | Am: E5 . A5 . C6 . . . | F: C6 . A5 . F5 . A5 . | G: B5 . . . D6 . . . |
             C: E6 . . . C6 . G5 . | Am: A5 . . . E5 . C5 . | F: F5 . A5 . G5 . F5 . | G: G5 . . . . . - -` },
    valentoes: { bpm: 172, lead: 'square', lead2: 'brass', pad: 'strings', arp: null, bass: 'bassSaw', bassPat: 'eighths', drums: 'boss',
      bars: `Em: E5 E5 G5 E5 B5 . A5 G5 | C: G5 . E5 . C5 . E5 G5 | D: F#5 F#5 A5 F#5 D6 . C6 A5 | B: D#6 . B5 . F#5 . B5 D#6 |
             Em: E6 . D6 E6 B5 . G5 B5 | C: C6 . B5 C6 G5 . E5 G5 | Am: A5 . B5 C6 E6 . D6 C6 | B7: B5 . A5 . F#5 . D#5 F#5 |
             C: G5 . . . C6 . G5 . | G: B5 . . . D6 . B5 . | Am: C6 . B5 . A5 . E5 . | Em: G5 . . . B5 . . . |
             C: E6 . D6 . C6 . G5 . | D: F#6 . E6 . D6 . A5 . | Am: C6 . D6 . E6 . F#6 . | B: D#6 . . . F#6 . . .` },
    doce: { bpm: 96, lead: 'bell', lead2: 'piano', pad: 'organ', arp: 'harp', bass: 'bassTri', bassPat: 'rootfifth', drums: 'tick', leadVol: 0.8,
      bars: `C: E5 . G5 . C6 . G5 . | Am: A5 . E5 . C5 . E5 . | Dm: F5 . A5 . D6 . A5 . | G7: G5 . B5 . F5 . D5 . |
             C: E5 . G5 . C6 . E6 . | Fm: Ab5 . F5 . C6 . Ab5 . | C: G5 . E5 . C5 . G4 . | G: D5 . . . - - - -` },
    campo: { bpm: 60, lead: 'piano', pad: 'strings', arp: null, bass: 'bassTri', bassPat: 'root', drums: null, leadVol: 0.8,
      bars: `Dm: A4 . . . D5 . . . | Bb: F5 . . . D5 . . . | Gm: D5 . . . Bb4 . . . | A: C#5 . . . E5 . . . |
             Dm: F5 . . . A5 . . . | Gm: G5 . . . Bb4 . . . | Dm: A4 . . . F4 . . . | A7: E4 . . . - - - -` },
    fuga: { bpm: 104, lead: 'pizz', pad: 'strings', arp: null, bass: 'bassPluck', bassPat: 'walk', drums: 'tick',
      bars: `Em: E4 - G4 - B4 - G4 - | C: E4 - G4 - C5 - G4 - | Am: A4 - C5 - E5 - C5 - | B7: D#5 - B4 - F#4 - B4 - |
             Em: G4 - B4 - E5 - B4 - | C: C5 - E5 - G5 - E5 - | D: F#5 - D5 - A4 - D5 - | B7: B4 . . . - - - -` },
    resistencia: { bpm: 112, lead: 'brass', lead2: 'bell', pad: 'strings', arp: 'harp', bass: 'bassSaw', bassPat: 'rootfifth', drums: 'pop',
      bars: `D: F#5 . A5 . D6 . . . | Bm: D6 . C#6 . B5 . F#5 . | G: G5 . B5 . D6 . E6 . | A: C#6 . . . E6 . . . |
             D: F#6 . E6 . D6 . A5 . | G: B5 . D6 . G6 . F#6 . | Em: E6 . D6 . B5 . G5 . | A: A5 . . . C#6 . E6 .` },
    macaron: { bpm: 140, lead: 'brass', lead2: 'square', pad: 'strings', arp: 'marimba', bass: 'bassSaw', bassPat: 'eighths', drums: 'boss',
      bars: `Cm: C5 C5 Eb5 C5 G5 . F5 Eb5 | Ab: Eb5 . C5 . Ab4 . C5 Eb5 | Bb: D5 D5 F5 D5 Bb5 . Ab5 G5 | G: B4 . D5 . G5 . B5 D6 |
             Cm: C6 . Bb5 C6 G5 . Eb5 G5 | Fm: Ab5 . G5 Ab5 F5 . C5 F5 | G: G5 . F5 . D5 . B4 . | G7: B4 . D5 . F5 . G5 . |
             Ab: C6 . . . Eb6 . C6 . | Eb: Bb5 . . . G5 . Eb5 . | Fm: Ab5 . G5 . F5 . C6 . | G: B5 . . . D6 . . . |
             Ab: Eb6 . D6 . C6 . Ab5 . | Bb: F6 . Eb6 . D6 . Bb5 . | Cm: Eb6 . D6 . C6 . G5 . | G: B5 . . . D6 . G6 .` },
    memoria: { bpm: 66, lead: 'piano', lead2: 'bell', pad: 'strings', arp: 'harp', bass: 'bassTri', bassPat: 'root', drums: null, leadVol: 0.7,
      bars: `C: E5 . . . G5 . . . | Am: A5 . . . E5 . . . | F: F5 . . . A5 . C6 . | G: B5 . . . D6 . . . |
             C: C6 . . . G5 . E5 . | Em: G5 . . . B5 . . . | F: A5 . . . F5 . . . | C: E5 . . . . . - -` },
    caverna: { bpm: 70, lead: 'harp', lead2: 'bell', pad: 'strings', arp: null, bass: 'bassTri', bassPat: 'root', drums: 'tribal', leadVol: 0.8,
      bars: `Am: E5 . . . C5 . . . | F: A4 . . . C5 . . . | G: B4 . . . D5 . . . | E: G#4 . . . B4 . . . |
             Am: A5 . . . E5 . . . | Dm: F5 . . . D5 . A4 . | E: B4 . . . G#4 . . . | Am: A4 . . . - - - -` },
    aranhas: { bpm: 100, lead: 'pizz', lead2: 'harp', pad: 'strings', arp: null, bass: 'bassPluck', bassPat: 'rootfifth', drums: null,
      bars: `Dm: D5 F5 A5 F5 D6 . A5 . | Bb: D5 F5 Bb5 F5 D6 . Bb5 . | C: E5 G5 C6 G5 E6 . C6 . | A: C#5 E5 A5 E5 C#6 . A5 . |
             Dm: F5 A5 D6 A5 F6 . D6 . | Gm: D5 G5 Bb5 G5 D6 . Bb5 . | A7: C#5 E5 G5 E5 A5 . G5 . | Dm: D5 . . . - - - -` },
    ossos: { bpm: 126, lead: 'marimba', lead2: 'pizz', pad: null, arp: null, bass: 'bassPluck', bassPat: 'walk', drums: 'tick',
      bars: `Em: E5 G5 B5 G5 E5 . B4 . | Am: A4 C5 E5 C5 A4 . E5 . | B7: B4 D#5 F#5 A5 B5 . F#5 . | Em: G5 . E5 . B4 . - - |
             C: C5 E5 G5 E5 C6 . G5 . | D: D5 F#5 A5 F#5 D6 . A5 . | B7: D#6 . B5 . F#5 . D#5 . | Em: E5 . . . - - - -` },
    guerra: { bpm: 88, lead: 'brass', pad: 'strings', arp: null, bass: 'bassSaw', bassPat: 'root', drums: 'tribal',
      bars: `Cm: C5 . . . Eb5 . D5 C5 | Ab: Ab4 . . . C5 . . . | Fm: F4 . Ab4 . C5 . Bb4 Ab4 | G: G4 . . . B4 . . . |
             Cm: Eb5 . . . G5 . F5 Eb5 | Ab: C5 . . . Eb5 . . . | G: D5 . B4 . G4 . B4 . | Cm: C5 . . . - - - -` },
    irmaos: { bpm: 160, lead: 'square', lead2: 'bell', pad: 'strings', arp: 'marimba', bass: 'bassSaw', bassPat: 'eighths', drums: 'boss',
      bars: `Em: E5 E5 G5 E5 B5 . A5 G5 | C: G5 . E5 . C5 . E5 G5 | Dm: D5 D5 F5 D5 A5 . G5 F5 | A: C#6 . A5 . E5 . A5 C#6 |
             Em: E6 . D6 E6 B5 . G5 B5 | C: C6 . B5 C6 G5 . E5 G5 | B7: D#6 . B5 . F#5 . D#5 F#5 | E: G#5 . B5 . E6 . . . |
             Am: C6 . . . E6 . C6 . | F: A5 . . . C6 . A5 . | G: B5 . D6 . G6 . F6 . | E: E6 . . . G#6 . . . |
             Am: A6 . G6 . E6 . C6 . | F: F6 . E6 . C6 . A5 . | B7: D#6 . F#6 . B6 . A6 . | E: G#6 . . . B6 . . .` },
    tristeza: { bpm: 58, lead: 'piano', pad: 'strings', arp: 'harp', bass: 'bassTri', bassPat: 'root', drums: null, leadVol: 0.7,
      bars: `Am: E5 . . . A5 . . . | F: C6 . . . A5 . . . | C: G5 . . . E5 . . . | G: D5 . . . B4 . . . |
             Am: C5 . . . E5 . . . | Dm: F5 . . . A5 . . . | E: G#5 . . . B5 . . . | Am: A5 . . . - - - -` },
    sakura: { bpm: 92, lead: 'flute', lead2: 'bell', pad: 'strings', arp: 'harp', bass: 'bassTri', bassPat: 'root', drums: 'soft',
      bars: `Am: A4 . C5 . D5 . E5 . | Am: G5 . E5 . D5 . C5 . | Dm: D5 . E5 . G5 . A5 . | Em: G5 . . . E5 . . . |
             Am: A5 . G5 . E5 . D5 . | F: C5 . D5 . E5 . G5 . | G: A5 . G5 . E5 . D5 . | Am: E5 . . . A4 . . .` },
    festival: { bpm: 128, lead: 'pizz', lead2: 'bell', pad: 'organ', arp: 'marimba', bass: 'bassPluck', bassPat: 'rootfifth', drums: 'march',
      bars: `Am: A5 A5 C6 A5 D6 . C6 A5 | G: G5 G5 A5 G5 E5 . D5 . | F: C5 D5 E5 G5 A5 . G5 E5 | E: E5 . . . G5 . A5 . |
             Am: C6 . A5 . G5 . E5 . | G: D6 . C6 . A5 . G5 . | F: A5 . G5 . E5 . D5 . | Am: A5 . . . - - - -` },
    fuga7: { bpm: 176, lead: 'square', pad: 'strings', arp: null, bass: 'bassSaw', bassPat: 'eighths', drums: 'boss',
      bars: `Am: A5 . E5 . A5 . C6 B5 | F: A5 . F5 . C5 . F5 A5 | G: B5 . G5 . D5 . G5 B5 | E: G#5 . E5 . B4 . E5 G#5 |
             Am: C6 . B5 . A5 . E5 . | Dm: D6 . C6 . A5 . F5 . | E: E6 . D6 . B5 . G#5 . | Am: A5 . . . - - - -` },
    victory: { bpm: 120, lead: 'brass', lead2: 'bell', pad: 'organ', arp: 'harp', bass: 'bassPluck', bassPat: 'rootfifth', drums: 'pop',
      bars: `C: C5 . E5 . G5 . C6 . | F: A5 . . . F5 . A5 . | G: B5 . D6 . G5 . B5 . | C: C6 . . . . . - -` },
  };

  const DRUMS = {
    soft: { k: 'k.......k.......', s: '................', h: '....h.......h...' },
    rock: { k: 'k.......k.k.....', s: '....s.......s...', h: 'h.h.h.h.h.h.h.h.' },
    pop: { k: 'k.....k.k.......', s: '....s.......s...', h: '..h...h...h...ho' },
    tick: { k: 'k.......k.......', s: '............s...', h: '..h...h...h...h.' },
    tribal: { k: 'k.......k..k....', s: '................', h: '................', t: '......t.......t.' },
    march: { k: 'k...k...k...k...', s: '....s.......s.ss', h: '..h...h...h...h.' },
    boss: { k: 'k.k...k.k.k...k.', s: '....s.......s..s', h: 'hhhhhhhhhhhhhhhh' },
  };

  function parseSong(def) {
    return def.bars.split('|').map(b => b.trim()).filter(Boolean).map(b => {
      const [ch, mel] = b.split(':');
      const toks = mel.trim().split(/\s+/);
      const notes = [];
      for (let i = 0; i < toks.length; i++) {
        const n = noteNum(toks[i]);
        if (n === null) continue;
        let len = 1; while (toks[i + len] === '.') len++;
        notes.push({ i, n, len });
      }
      return { chord: chordNotes(ch.trim()), notes };
    });
  }

  function scheduleStep(sg, step, t) {
    const def = sg.def, bars = sg.bars;
    const spb = 60 / def.bpm / 4; // duração de uma semicolcheia
    const bar = bars[Math.floor(step / 16) % bars.length], s = step % 16;
    const bus = sg.bus, ch = bar.chord;
    const rootBass = 36 + ((ch.root + 12 - 0) % 12);
    // melodia (colcheias)
    if (s % 2 === 0) {
      for (const nt of bar.notes) if (nt.i === s / 2) {
        const d = nt.len * spb * 2;
        INST[def.lead](bus, nt.n, t, d, def.leadVol || 1);
        if (def.lead2) INST[def.lead2](bus, nt.n + (def.lead2 === 'bell' ? 12 : 0), t, d, 0.35);
      }
    }
    // acordes
    if (def.pad && s === 0) {
      const notes = ch.iv.slice(0, 4).map(iv => 60 + ((ch.root + iv) % 12) - (((ch.root + iv) % 12) > 7 ? 12 : 0));
      INST[def.pad](bus, notes, t, spb * 16, 1);
    }
    // arpejo
    if (def.arp && s % 2 === 0) {
      const tones = ch.iv.map(iv => 72 + ((ch.root + iv) % 12) - 12);
      const seq = tones.concat(tones.map(x => x + 12));
      const k = (s / 2) % 8, idx = k < 4 ? k : 7 - k;
      INST[def.arp](bus, seq[idx % seq.length], t, spb * 2, 0.28);
    }
    // baixo
    const b5 = rootBass + 7, b8 = rootBass + 12;
    const bp = def.bassPat;
    if (bp === 'root' && (s === 0 || s === 8)) INST[def.bass](bus, rootBass, t, spb * 8, 1);
    if (bp === 'rootfifth' && s % 4 === 0) INST[def.bass](bus, [rootBass, b5, b8, b5][s / 4], t, spb * 3.5, 1);
    if (bp === 'eighths' && s % 2 === 0) INST[def.bass](bus, s % 4 === 2 ? b8 : rootBass, t, spb * 2, 0.9);
    if (bp === 'walk' && s % 4 === 0) INST[def.bass](bus, rootBass + [0, ch.iv[1], 7, 9][s / 4], t, spb * 3, 1);
    // bateria
    const dp = def.drums && DRUMS[def.drums];
    if (dp) {
      if (dp.k[s] === 'k') INST.kick(bus, t, 1);
      if (dp.s[s] === 's') INST.snare(bus, t, 1);
      if (dp.h[s] === 'h') INST.hat(bus, t, s % 4 === 0 ? 1 : 0.6);
      if (dp.h[s] === 'o') INST.hat(bus, t, 0.8, true);
      if (dp.t && dp.t[s] === 't') INST.tom(bus, t, 1);
    }
  }

  const S = {
    init,
    get musicOn() { return musicOn; },
    setMusic(on) { musicOn = on; if (musicMaster) musicMaster.gain.value = on ? 0.5 : 0; },
    setSfx(on) { sfxOn = on; if (sfxBus) sfxBus.gain.value = on ? 0.55 : 0; },
    blip(v) { (voices[v] || voices.narr)(); },
    move() { tone(880, 0.04, 'square', 0.06); },
    select() { tone(660, 0.05, 'square', 0.1); setTimeout(() => tone(990, 0.06, 'square', 0.1), 50); },
    back() { tone(330, 0.06, 'square', 0.08); },
    encounter() { tone(1200, 0.08, 'square', 0.15); setTimeout(() => tone(1200, 0.08, 'square', 0.15), 110); },
    slash() { noise(0.25, 0.25, 2000); tone(900, 0.2, 'sawtooth', 0.08, -700); },
    hit() { tone(140, 0.25, 'square', 0.2, -100); noise(0.15, 0.2); },
    hurt() { tone(220, 0.15, 'square', 0.18, -150); },
    heal() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'triangle', 0.15), i * 70)); },
    save() { [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'sine', 0.15), i * 90)); },
    dust() { noise(0.6, 0.15, 1500); },
    spare() { [392, 523, 659].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.15), i * 90)); },
    magic() { [1047, 1319, 1568, 2093].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 60)); },
    breakHeart() { tone(300, 0.3, 'square', 0.2, -250); setTimeout(() => noise(0.4, 0.25), 300); },
    fall() { tone(800, 1.2, 'sine', 0.15, -700); },
    levelUp() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.1, 'square', 0.1), i * 60)); },
    roar() { tone(160, 0.7, 'sawtooth', 0.22, -90); noise(0.6, 0.18, -900); setTimeout(() => tone(220, 0.4, 'square', 0.1, -120), 120); },
    whoosh() { noise(0.5, 0.2, -2500); tone(300, 0.5, 'sine', 0.06, 500); },
    fire() { noise(0.45, 0.25, -1800); tone(200, 0.35, 'sawtooth', 0.08, 300); },
    freeze() { [2093, 1760, 2349, 1976].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'sine', 0.1), i * 50)); },
    wind() { noise(0.7, 0.2, 1200); },
    laugh() { [0, 1, 2, 3].forEach(i => setTimeout(() => tone(500 - i * 40, 0.08, 'sawtooth', 0.09, 60), i * 110)); },
    boo() { noise(0.9, 0.5, -3000); tone(90, 0.9, 'sawtooth', 0.35, -40); tone(600, 0.6, 'square', 0.15, -500); },
    step() { tone(90, 0.06, 'triangle', 0.18, -30); },
    knock() { tone(160, 0.05, 'square', 0.2, -60); setTimeout(() => tone(160, 0.05, 'square', 0.2, -60), 180); },
    bridge() { noise(1.2, 0.3, -400); [196, 262, 330, 392].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'triangle', 0.15), 300 + i * 120)); },
    puff() { noise(0.4, 0.2, -800); },
    ring() { [0, 1, 2, 3, 4, 5].forEach(i => setTimeout(() => tone(i % 2 ? 1320 : 1760, 0.07, 'square', 0.09), i * 80)); },
    splash() { noise(0.7, 0.35, -1200); tone(400, 0.4, 'sine', 0.12, -300); },
    crack() { noise(0.15, 0.3, 3000); tone(1200, 0.08, 'square', 0.08, -800); },
    toggle() { tone(760, 0.06, 'triangle', 0.12); },
    buzz() { tone(110, 0.25, 'sawtooth', 0.14); },
    push() { noise(0.2, 0.15, -600); },
    robotSong() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => setTimeout(() => { tone(f, 0.16, 'square', 0.08); tone(f / 2, 0.16, 'triangle', 0.1); }, i * 110)); },
    schoolBell() { [0, 1, 2, 3, 4, 5, 6, 7].forEach(i => setTimeout(() => tone(1400, 0.06, 'square', 0.12), i * 70)); },
    beep() { tone(1320, 0.05, 'square', 0.08); setTimeout(() => tone(990, 0.05, 'square', 0.08), 70); },
    whistle() { tone(2200, 0.5, 'sine', 0.15, 200); setTimeout(() => tone(2400, 0.4, 'sine', 0.12, -200), 500); },
    alarm() { [0, 1, 2, 3].forEach(i => setTimeout(() => tone(i % 2 ? 660 : 880, 0.2, 'square', 0.12), i * 220)); },
    cut() { tone(1600, 0.08, 'square', 0.1, -1000); noise(0.12, 0.25, 3000); },
    rumble() { noise(1.4, 0.35, -300); tone(60, 1.2, 'sawtooth', 0.15, -20); },
    siren() { [0, 1, 2, 3, 4, 5].forEach(i => setTimeout(() => tone(i % 2 ? 520 : 780, 0.32, 'sawtooth', 0.09), i * 340)); },
    icicle() { tone(2400, 0.3, 'sine', 0.08, -1800); setTimeout(() => noise(0.25, 0.25, 2500), 280); },
    stopMusic() {
      if (!song) return;
      clearInterval(song.timer);
      const bus = song.bus;
      if (ac) { bus.gain.setTargetAtTime(0, ac.currentTime, 0.05); setTimeout(() => bus.disconnect(), 600); }
      song = null;
    },
    get current() { return song ? song.name : null; },
    playMusic(name) {
      if (!ac) { pendingSong = name; return; }
      if (song && song.name === name) return;
      S.stopMusic();
      const def = SONGS[name]; if (!def) return;
      const bus = ac.createGain(); bus.gain.value = 1; bus.connect(musicMaster);
      const sg = { name, def, bars: parseSong(def), bus, step: 0, next: ac.currentTime + 0.08 };
      const spb = 60 / def.bpm / 4;
      sg.timer = setInterval(() => {
        if (sg.next < ac.currentTime - 0.3) sg.next = ac.currentTime + 0.05;
        while (sg.next < ac.currentTime + 0.18) { scheduleStep(sg, sg.step, sg.next); sg.step++; sg.next += spb; }
      }, 30);
      song = sg;
    },
  };
  return S;
})();
