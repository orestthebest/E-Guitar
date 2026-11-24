// Plucked-string synth (Karplus–Strong) with a small cabinet-ish filter chain.
let ctx = null;
let out = null;
const cache = new Map();

// open strings, index 0 = string 1 (high E) ... 5 = string 6 (low E)
export const OPEN = [329.63, 246.94, 196.0, 146.83, 110.0, 82.41];
// E major chord, same string order
export const E_MAJOR = [329.63, 246.94, 207.65, 164.81, 123.47, 82.41];

function init() {
	if (ctx) return ctx;
	ctx = new AudioContext();
	const comp = ctx.createDynamicsCompressor();
	comp.threshold.value = -18;
	comp.ratio.value = 3;
	const tone = ctx.createBiquadFilter();
	tone.type = 'lowpass';
	tone.frequency.value = 5200;
	tone.Q.value = 0.6;
	const body = ctx.createBiquadFilter();
	body.type = 'peaking';
	body.frequency.value = 220;
	body.gain.value = 3;
	out = ctx.createGain();
	out.gain.value = 0.7;
	out.connect(body).connect(tone).connect(comp).connect(ctx.destination);
	return ctx;
}

function pluckBuffer(freq, bend = 0) {
	const key = `${freq.toFixed(2)}|${bend.toFixed(3)}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const c = init();
	const sr = c.sampleRate;
	const dur = 3.2;
	const buf = c.createBuffer(1, Math.floor(sr * dur), sr);
	const d = buf.getChannelData(0);
	const N = Math.max(2, Math.round(sr / freq));
	const ring = new Float32Array(N);
	// pick position ~1/7 of the string: comb the noise burst
	for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
	const pick = Math.floor(N / 7);
	for (let i = N - 1; i >= pick; i--) ring[i] = ring[i] - ring[i - pick] * 0.6;
	let idx = 0;
	const decay = 0.996 + Math.min(0.0035, freq / 200000);
	for (let i = 0; i < d.length; i++) {
		const a = ring[idx];
		const b = ring[(idx + 1) % N];
		const v = (a + b) * 0.5 * decay;
		d[i] = a;
		ring[idx] = v;
		idx = (idx + 1) % N;
	}
	// soft attack + fade
	for (let i = 0; i < 64; i++) d[i] *= i / 64;
	cache.set(key, buf);
	return buf;
}

export function pluck(freq, when = 0, gain = 0.9) {
	const c = init();
	if (c.state === 'suspended') c.resume();
	const src = c.createBufferSource();
	src.buffer = pluckBuffer(freq);
	const g = c.createGain();
	g.gain.value = gain;
	src.connect(g).connect(out);
	src.start(c.currentTime + when);
	return src;
}

let active = [];
export function playString(i, freq = OPEN[i]) {
	const s = pluck(freq);
	active.push(s);
	if (active.length > 18) active.shift();
	return s;
}

/** vibrato arm: bend all ringing notes (semitone fraction, -1..1) */
export function bend(amount) {
	if (!ctx) return;
	for (const s of active) {
		try {
			s.playbackRate.setTargetAtTime(Math.pow(2, amount / 12), ctx.currentTime, 0.02);
		} catch {
			/* finished */
		}
	}
}