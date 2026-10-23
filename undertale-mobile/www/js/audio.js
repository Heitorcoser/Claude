// Sons sintetizados com WebAudio (sem arquivos externos).
'use strict';

const Sfx = (() => {
  let ac = null, master = null, musicGain = null;
  let music = null; // {timer, name}

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.35; musicGain.connect(master);
  }

  function tone(freq, dur, type = 'square', vol = 0.2, slide = 0, dest) {
    if (!ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, vol = 0.2) {
    if (!ac) return;
    const t = ac.currentTime;
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g); g.connect(master); s.start(t);
  }

  const voices = {
    narr: () => tone(520, 0.04, 'square', 0.06),
    instr: () => tone(180 + Math.random() * 30, 0.06, 'triangle', 0.18),
    musg: () => tone(120 + Math.random() * 40, 0.05, 'sawtooth', 0.06),
    ghost: () => tone(700 + Math.random() * 200, 0.05, 'sine', 0.08),
  };

  const S = {
    init,
    blip(v) { (voices[v] || voices.narr)(); },
    move() { tone(880, 0.04, 'square', 0.06); },
    select() { tone(660, 0.05, 'square', 0.1); setTimeout(() => tone(990, 0.06, 'square', 0.1), 50); },
    back() { tone(330, 0.06, 'square', 0.08); },
    encounter() { tone(1200, 0.08, 'square', 0.15); setTimeout(() => tone(1200, 0.08, 'square', 0.15), 110); },
    slash() { noise(0.25, 0.25); tone(900, 0.2, 'sawtooth', 0.08, -700); },
    hit() { tone(140, 0.25, 'square', 0.2, -100); noise(0.15, 0.2); },
    hurt() { tone(220, 0.15, 'square', 0.18, -150); },
    heal() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'triangle', 0.15), i * 70)); },
    save() { [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'sine', 0.15), i * 90)); },
    dust() { noise(0.6, 0.15); },
    spare() { [392, 523, 659].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.15), i * 90)); },
    magic() { [1047, 1319, 1568, 2093].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 60)); },
    breakHeart() { tone(300, 0.3, 'square', 0.2, -250); setTimeout(() => noise(0.4, 0.25), 300); },
    fall() { tone(800, 1.2, 'sine', 0.15, -700); },
    levelUp() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.1, 'square', 0.1), i * 60)); },
    stopMusic() { if (music) { clearInterval(music.timer); music = null; } },
    playMusic(name) {
      if (!ac) return;
      if (music && music.name === name) return;
      S.stopMusic();
      const song = SONGS[name]; if (!song) return;
      let step = 0;
      const stepDur = 60 / song.bpm / 2;
      const tick = () => {
        const n = song.mel[step % song.mel.length];
        const b = song.bass[step % song.bass.length];
        if (n) tone(midi(n), stepDur * 0.9, song.lead, 0.12, 0, musicGain);
        if (b) tone(midi(b), stepDur * 1.6, 'triangle', 0.2, 0, musicGain);
        step++;
      };
      tick();
      music = { name, timer: setInterval(tick, stepDur * 1000) };
    },
  };

  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  // 0 = pausa. Melodias originais simples.
  const SONGS = {
    title: { bpm: 80, lead: 'triangle',
      mel: [69, 0, 72, 0, 76, 0, 74, 72, 71, 0, 72, 0, 69, 0, 0, 0, 67, 0, 69, 0, 71, 0, 72, 74, 72, 0, 71, 0, 69, 0, 0, 0],
      bass: [45, 0, 0, 0, 52, 0, 0, 0, 41, 0, 0, 0, 48, 0, 0, 0, 43, 0, 0, 0, 50, 0, 0, 0, 45, 0, 0, 0, 52, 0, 0, 0] },
    ruins: { bpm: 96, lead: 'square',
      mel: [64, 0, 67, 0, 71, 0, 69, 0, 67, 0, 64, 0, 62, 0, 0, 0, 64, 0, 67, 0, 72, 0, 71, 69, 67, 0, 0, 0, 0, 0, 0, 0],
      bass: [40, 0, 47, 0, 40, 0, 47, 0, 36, 0, 43, 0, 36, 0, 43, 0, 38, 0, 45, 0, 38, 0, 45, 0, 40, 0, 47, 0, 40, 0, 47, 0] },
    instr: { bpm: 88, lead: 'triangle',
      mel: [72, 0, 76, 0, 79, 0, 76, 0, 77, 0, 74, 0, 71, 0, 0, 0, 72, 0, 74, 0, 76, 77, 79, 0, 76, 0, 72, 0, 0, 0, 0, 0],
      bass: [48, 0, 55, 0, 48, 0, 55, 0, 43, 0, 50, 0, 43, 0, 50, 0, 45, 0, 52, 0, 41, 0, 48, 0, 43, 0, 50, 0, 48, 0, 0, 0] },
    battle: { bpm: 150, lead: 'square',
      mel: [69, 69, 72, 69, 74, 69, 72, 69, 67, 67, 71, 67, 74, 72, 71, 67, 69, 69, 72, 69, 76, 74, 72, 74, 76, 0, 79, 0, 77, 76, 74, 72],
      bass: [45, 0, 45, 57, 45, 0, 45, 57, 43, 0, 43, 55, 43, 0, 43, 55, 41, 0, 41, 53, 41, 0, 41, 53, 40, 0, 40, 52, 40, 0, 44, 0] },
  };

  return S;
})();
