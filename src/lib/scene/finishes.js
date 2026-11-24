// Procedural body finishes, baked in the browser into the body's own UV layout.
// Sunburst, flame maple, relic wear, metal flake and lacquer smudges.
import * as THREE from 'three';

const S = 1536;

/** Rasterise the body silhouette in UV space and blur it to get an edge-distance field. */
export function bodyLayout(geo) {
	const uv = geo.attributes.uv;
	let umin = Infinity,
		vmin = Infinity,
		umax = -Infinity,
		vmax = -Infinity;
	for (let i = 0; i < uv.count; i++) {
		umin = Math.min(umin, uv.getX(i));
		umax = Math.max(umax, uv.getX(i));
		vmin = Math.min(vmin, uv.getY(i));
		vmax = Math.max(vmax, uv.getY(i));
	}
	const pad = 0.02;
	umin -= pad;
	vmin -= pad;
	const span = Math.max(umax - umin, vmax - vmin) + pad * 2;
	const c = document.createElement('canvas');
	c.width = c.height = S;
	const g = c.getContext('2d', { willReadFrequently: true });
	g.fillStyle = '#000';
	g.fillRect(0, 0, S, S);
	g.fillStyle = '#fff';
	const idx = geo.index ? geo.index.array : null;
	const n = idx ? idx.length : uv.count;
	const P = (k) => {
		const i = idx ? idx[k] : k;
		return [((uv.getX(i) - umin) / span) * S, ((uv.getY(i) - vmin) / span) * S];
	};
	// fill every triangle on its own: top and bottom caps have opposite winding and would cancel out
	g.strokeStyle = '#fff';
	g.lineWidth = 1;
	for (let k = 0; k < n; k += 3) {
		const a = P(k),
			b = P(k + 1),
			d = P(k + 2);
		g.beginPath();
		g.moveTo(a[0], a[1]);
		g.lineTo(b[0], b[1]);
		g.lineTo(d[0], d[1]);
		g.closePath();
		g.fill();
		g.stroke();
	}
	// blur ~ 45 mm so the burst fades in from the edges
	const b2 = document.createElement('canvas');
	b2.width = b2.height = S;
	const h = b2.getContext('2d', { willReadFrequently: true });
	// cheap, portable blur: shrink to a tiny image, then scale back up with smoothing (twice)
	const tiny = document.createElement('canvas');
	tiny.width = tiny.height = 14;
	const tg = tiny.getContext('2d');
	tg.imageSmoothingQuality = 'high';
	tg.drawImage(c, 0, 0, 14, 14);
	const mid = document.createElement('canvas');
	mid.width = mid.height = 56;
	const mg = mid.getContext('2d');
	mg.imageSmoothingQuality = 'high';
	mg.drawImage(tiny, 0, 0, 56, 56);
	h.imageSmoothingQuality = 'high';
	h.drawImage(mid, 0, 0, S, S);
	const sharp = g.getImageData(0, 0, S, S).data;
	const soft = h.getImageData(0, 0, S, S).data;
	const edge = new Float32Array(S * S);
	for (let i = 0; i < S * S; i++) edge[i] = sharp[i * 4] > 127 ? soft[i * 4] / 255 : 0;
	return { size: S, umin, vmin, span, edge };
}

// ---------------------------------------------------------------- noise helpers
function hash(x, y) {
	const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return s - Math.floor(s);
}
function vnoise(x, y) {
	const xi = Math.floor(x),
		yi = Math.floor(y);
	const xf = x - xi,
		yf = y - yi;
	const u = xf * xf * (3 - 2 * xf),
		v = yf * yf * (3 - 2 * yf);
	const a = hash(xi, yi),
		b = hash(xi + 1, yi),
		c = hash(xi, yi + 1),
		d = hash(xi + 1, yi + 1);
	return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) {
	return vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.28 + vnoise(x * 4.3, y * 4.3) * 0.17;
}
const smooth = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
const hex = (h) => {
	const c = new THREE.Color(h);
	return [c.r * 255, c.g * 255, c.b * 255];
};

export const RECIPES = {
	cherry: { base: 'wood', tint: '#8a1626' },
	korina: { base: 'wood', tint: '#f6dcae' },
	tobacco: { base: 'wood', burst: { center: '#d9a55e', edge: '#180a04', width: 0.42 } },
	cherryburst: { base: 'wood', burst: { center: '#d8603e', edge: '#2e0306', width: 0.42 } },
	ocean: { base: 'flame', burst: { center: '#5aa9d6', edge: '#04102a', width: 0.42 } },
	honey: { base: 'flame', burst: { center: '#e9b866', edge: '#4a1c05', width: 0.4 } },
	ebony: { base: 'solid', solid: '#0b0a0c' },
	white: { base: 'solid', solid: '#ece6da' },
	pelham: { base: 'solid', solid: '#5f8fb0' },
	goldtop: { base: 'solid', solid: '#c79b45' },
	plum: { base: 'solid', solid: '#5a2470' }
};

/** Bake colour (+ optional relic wear) into a texture laid out like the body UVs. */
export function bakeFinish(L, wood, r, relic) {
	const N = L.size;
	const c = document.createElement('canvas');
	c.width = c.height = N;
	const g = c.getContext('2d', { willReadFrequently: true });
	// 1) wood base, tiled exactly like the original UV mapping (1 tile per UV unit)
	if (wood && r.base === 'wood') {
		const tile = N / L.span;
		const ox = -L.umin * tile,
			oy = -L.vmin * tile;
		for (let ty = Math.floor(-oy / tile) - 1; ty * tile + oy < N; ty++)
			for (let tx = Math.floor(-ox / tile) - 1; tx * tile + ox < N; tx++)
				g.drawImage(wood, ox + tx * tile, oy + ty * tile, tile, tile);
	} else {
		g.fillStyle = '#ffffff';
		g.fillRect(0, 0, N, N);
	}
	const img = g.getImageData(0, 0, N, N);
	const d = img.data;
	const tint = r.tint ? hex(r.tint) : null;
	const solid = r.solid ? hex(r.solid) : null;
	const bc = r.burst ? hex(r.burst.center) : null;
	const be = r.burst ? hex(r.burst.edge) : null;
	const raw = [226, 196, 150]; // bare wood under the lacquer (relic)
	const rough = new Uint8ClampedArray(N * N);
	const coat = new Uint8ClampedArray(N * N);
	for (let y = 0; y < N; y++) {
		for (let x = 0; x < N; x++) {
			const i = y * N + x,
				p = i * 4;
			const e = L.edge[i];
			let R = d[p],
				G = d[p + 1],
				B = d[p + 2];
			if (r.base === 'flame') {
				// maple: pale wood with flame figure running across the grain
				const u = x / N,
					v = y / N;
				const warp =
					fbm(u * 5, v * 3) * 7 +
					fbm(u * 14, v * 6) * 2.5 +
					Math.sin(u * 7 + fbm(u * 2, v * 2) * 4) * 1.4;
				const band = 0.5 + 0.5 * Math.sin(v * 300 + warp * 7.0);
				const flick = smooth(0.25, 0.8, fbm(u * 3 + 7, v * 9));
				const grain = (fbm(u * 90, v * 8) - 0.5) * 0.08;
				const fig = 0.84 + 0.16 * Math.pow(band, 2.2) * (0.4 + flick) + grain;
				R = 238 * fig;
				G = 214 * fig;
				B = 170 * fig;
			}
			if (solid) {
				R = solid[0];
				G = solid[1];
				B = solid[2];
			}
			if (tint) {
				R = (R * tint[0]) / 255;
				G = (G * tint[1]) / 255;
				B = (B * tint[2]) / 255;
			}
			if (bc && be && r.burst) {
				const t = smooth(0.4, 0.4 + r.burst.width, e);
				const cr = be[0] + (bc[0] - be[0]) * t,
					cg = be[1] + (bc[1] - be[1]) * t,
					cb = be[2] + (bc[2] - be[2]) * t;
				R = ((R * cr) / 255) * 1.08;
				G = ((G * cg) / 255) * 1.08;
				B = ((B * cb) / 255) * 1.08;
			}
			let wear;
			if (relic && e > 0) {
				const u = x / N,
					v = y / N;
				const n1 = fbm(u * 18, v * 18);
				// edges wear through first, plus a forearm patch on the upper treble wing
				const edgeWear = smooth(0.62, 0.5, e) * smooth(0.45, 0.7, n1 + 0.15);
				const ax = u - 0.68,
					ay = v - 0.47;
				const arm =
					smooth(0.12, 0.03, Math.sqrt(ax * ax * 1.4 + ay * ay * 4)) * smooth(0.35, 0.65, n1);
				const chips = smooth(0.82, 0.86, fbm(u * 70, v * 70)) * 0.9;
				wear = Math.min(1, edgeWear + arm + chips);
				if (wear > 0) {
					R = R + (raw[0] * (0.75 + n1 * 0.3) - R) * wear;
					G = G + (raw[1] * (0.75 + n1 * 0.3) - G) * wear;
					B = B + (raw[2] * (0.75 + n1 * 0.3) - B) * wear;
				}
				// lacquer checking / dulling everywhere
				const dull = 0.25 + 0.35 * fbm(u * 9, v * 9);
				rough[i] = Math.min(255, (dull + wear * 0.8) * 255);
				coat[i] = (1 - wear) * 255;
			} else {
				rough[i] = 255;
				coat[i] = 255;
			}
			d[p] = R;
			d[p + 1] = G;
			d[p + 2] = B;
			d[p + 3] = 255;
		}
	}
	g.putImageData(img, 0, 0);
	if (relic) {
		// fine scratches
		g.globalCompositeOperation = 'screen';
		g.strokeStyle = 'rgba(255,240,220,0.08)';
		g.lineWidth = 1;
		for (let k = 0; k < 420; k++) {
			const x = Math.random() * N,
				y = Math.random() * N,
				a = Math.random() * Math.PI,
				l = 8 + Math.random() * 60;
			g.beginPath();
			g.moveTo(x, y);
			g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
			g.stroke();
		}
		g.globalCompositeOperation = 'source-over';
	}
	const color = makeTex(c, L, true);
	const mk = (arr) => {
		const cc = document.createElement('canvas');
		cc.width = cc.height = N;
		const gg = cc.getContext('2d');
		const id = gg.createImageData(N, N);
		for (let i = 0; i < N * N; i++) {
			id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = arr[i];
			id.data[i * 4 + 3] = 255;
		}
		gg.putImageData(id, 0, 0);
		return makeTex(cc, L, false);
	};
	return { color, rough: relic ? mk(rough) : null, coat: relic ? mk(coat) : null };
}

function makeTex(c, L, srgb) {
	const t = new THREE.CanvasTexture(c);
	t.flipY = false;
	t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
	t.anisotropy = 8;
	t.repeat.set(1 / L.span, 1 / L.span);
	t.offset.set(-L.umin / L.span, -L.vmin / L.span);
	t.needsUpdate = true;
	return t;
}

/** Metal-flake normal map: tiny randomly tilted platelets under the clear coat. */
export function flakeNormal() {
	const N = 256,
		cell = 2;
	const c = document.createElement('canvas');
	c.width = c.height = N;
	const g = c.getContext('2d');
	for (let y = 0; y < N; y += cell)
		for (let x = 0; x < N; x += cell) {
			const a = Math.random() * Math.PI * 2,
				s = Math.random() * 0.55;
			const nx = Math.cos(a) * s,
				ny = Math.sin(a) * s;
			g.fillStyle = `rgb(${(nx * 0.5 + 0.5) * 255},${(ny * 0.5 + 0.5) * 255},255)`;
			g.fillRect(x, y, cell, cell);
		}
	const t = new THREE.CanvasTexture(c);
	t.wrapS = t.wrapT = THREE.RepeatWrapping;
	t.repeat.set(26, 26);
	t.colorSpace = THREE.NoColorSpace;
	t.flipY = false;
	return t;
}

/** Faint fingerprints / polish swirls for the gloss coat (clearcoat roughness map, G channel). */
export function smudgeMap() {
	const N = 512;
	const c = document.createElement('canvas');
	c.width = c.height = N;
	const g = c.getContext('2d');
	g.fillStyle = 'rgb(30,30,30)';
	g.fillRect(0, 0, N, N);
	for (let k = 0; k < 26; k++) {
		const x = Math.random() * N,
			y = Math.random() * N,
			r = 10 + Math.random() * 26;
		const grd = g.createRadialGradient(x, y, 0, x, y, r);
		grd.addColorStop(0, 'rgba(255,255,255,0.35)');
		grd.addColorStop(1, 'rgba(255,255,255,0)');
		g.fillStyle = grd;
		g.beginPath();
		g.arc(x, y, r, 0, Math.PI * 2);
		g.fill();
	}
	g.strokeStyle = 'rgba(255,255,255,0.06)';
	for (let k = 0; k < 90; k++) {
		g.beginPath();
		g.arc(N / 2, N / 2, 20 + Math.random() * 240, Math.random() * 6, Math.random() * 6 + 0.6);
		g.stroke();
	}
	const t = new THREE.CanvasTexture(c);
	t.wrapS = t.wrapT = THREE.RepeatWrapping;
	t.repeat.set(2, 2);
	t.colorSpace = THREE.NoColorSpace;
	t.flipY = false;
	return t;
}