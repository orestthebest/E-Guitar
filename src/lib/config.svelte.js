export const FINISHES = [
	{ id: 'cherry', label: 'Cherry', price: 0, swatch: '#8f1d2c' },
	{ id: 'korina', label: 'Natural Korina', price: 350, swatch: '#e3bd84' },
	{
		id: 'tobacco',
		label: 'Tobacco Burst',
		price: 390,
		swatch: 'radial-gradient(circle at 45% 40%, #e7a64a 0 30%, #5a2a0c 62%, #1f0d05 80%)'
	},
	{
		id: 'cherryburst',
		label: 'Cherry Burst',
		price: 390,
		swatch: 'radial-gradient(circle at 45% 40%, #e0553a 0 28%, #7a0d14 60%, #3a0408 80%)'
	},
	{
		id: 'ocean',
		label: 'Ocean Flame Maple',
		price: 690,
		swatch: 'repeating-linear-gradient(170deg, #4aa3d8 0 3px, #2a6f9e 3px 6px)',
		note: 'flame maple top'
	},
	{
		id: 'honey',
		label: 'Honey Flame Maple',
		price: 690,
		swatch: 'repeating-linear-gradient(170deg, #f2b54e 0 3px, #b8651c 3px 6px)',
		note: 'flame maple top'
	},
	{ id: 'ebony', label: 'Ebony', price: 0, swatch: '#0d0c0e' },
	{ id: 'white', label: 'Classic White', price: 120, swatch: '#ece6da' },
	{ id: 'pelham', label: 'Pelham Blue', price: 220, swatch: '#5f8fb0', note: 'metallic' },
	{ id: 'goldtop', label: 'Gold Metallic', price: 220, swatch: '#c9a14a', note: 'metallic' },
	{ id: 'plum', label: 'Plum Metallic', price: 220, swatch: '#5a2470', note: 'metallic' },
	{ id: 'custom', label: 'Custom colour', price: 290 }
];
export const SURFACES = [
	{ id: 'gloss', label: 'Gloss', price: 0 },
	{ id: 'satin', label: 'Satin', price: 80 },
	{ id: 'matte', label: 'Matte', price: 80, note: 'Soft, velvety open-pore feel' },
	{ id: 'flake', label: 'Metal flake', price: 260, note: 'Glitter flakes under a deep clear coat' },
	{
		id: 'relic',
		label: 'Relic',
		price: 450,
		note: 'Aged by hand: worn edges, arm wear, checked lacquer'
	}
];
export const STYLES = [
	{ id: '67', label: "'67 layout", price: 0, note: 'Big pickguard, knobs in a triangle' },
	{ id: '58', label: "'58 layout", price: 300, note: 'Knobs in a row, pickup rings, jack plate' }
];
export const HEADSTOCKS = [
	{ id: 'pointed', label: 'Pointed', price: 0 },
	{ id: 'rounded', label: 'Rounded', price: 150 },
	{ id: 'split', label: 'Split', price: 150 }
];
export const BOARDS = [
	{ id: 'rosewood', label: 'Rosewood', price: 0, swatch: '#5a3626' },
	{ id: 'ebony', label: 'Ebony', price: 180, swatch: '#1d1a19' },
	{ id: 'maple', label: 'Maple', price: 90, swatch: '#e6c58c' }
];
export const INLAYS = [
	{ id: 'dots', label: 'Dots', price: 0 },
	{ id: 'blocks', label: 'Blocks', price: 150 }
];
export const TAILPIECES = [
	{ id: 'stop', label: 'Stopbar', price: 0 },
	{ id: 'v', label: "'58 V-plate", price: 190, note: 'Strings through the body' },
	{ id: 'vib', label: 'Vibrola', price: 290, note: 'Drag the arm to bend' }
];
export const HARDWARE = [
	{ id: 'nickel', label: 'Nickel', price: 0, swatch: '#d9d9d6' },
	{ id: 'gold', label: 'Gold', price: 240, swatch: '#e9bd6e' },
	{ id: 'black', label: 'Black', price: 120, swatch: '#2a2a2e' },
	{
		id: 'aged',
		label: 'Aged nickel',
		price: 180,
		swatch: 'linear-gradient(135deg, #b9b2a2, #7d776a)'
	}
];
export const PICKUPS = [
	{ id: 'covered', label: 'Covered', price: 0 },
	{ id: 'open', label: 'Open, black', price: 40 },
	{ id: 'zebra', label: 'Open, zebra', price: 60 }
];
export const GUARDS = [
	{ id: 'white', label: 'White', price: 0, swatch: '#ece9e0' },
	{ id: 'black', label: 'Black', price: 0, swatch: '#141414' },
	{ id: 'cream', label: 'Cream', price: 40, swatch: '#e9dcc0' },
	{
		id: 'tortoise',
		label: 'Tortoise',
		price: 60,
		swatch: 'radial-gradient(circle at 30% 30%, #c2621e 0 18%, #3a1206 45%, #7a3410 70%)'
	},
	{
		id: 'pearl',
		label: 'White pearloid',
		price: 80,
		swatch: 'linear-gradient(135deg, #f4efe4, #d9d4cc 40%, #fbf7ef 60%, #cfc9be)'
	}
];
export const KNOBS = [
	{ id: 'black', label: 'Black top hats', price: 0, swatch: '#0a0a0a' },
	{ id: 'gold', label: 'Gold top hats', price: 60, swatch: '#c8a050' },
	{ id: 'amber', label: 'Amber', price: 40, swatch: '#c46a1c' }
];

export const BASE_PRICE = 2490;

export const DEFAULTS = {
	finish: 'cherry',
	custom: '#2b6b5a',
	surface: 'gloss',
	style: '67',
	shoulders: 0,
	wings: 0,
	headstock: 'pointed',
	board: 'rosewood',
	inlays: 'dots',
	binding: false,
	tail: 'stop',
	hardware: 'nickel',
	pickups: 'covered',
	guard: 'white',
	knobs: 'black',
	stickers: []
};

export const config = $state({ ...DEFAULTS, stickers: [] });

export const ui = $state({
	mode: 'hero',
	scene: 'studio',
	sound: true,
	turntable: false,
	summary: false,
	tab: 'body',
	stickerTool: null,
	stickerSize: 0.07,
	view: 'full',
	toast: '',
	loaded: false,
	explode: false
});

const find = (list, id) => list.find((o) => o.id === id) ?? list[0];

export function lineItems(c) {
	const items = [
		{
			group: 'Finish',
			label: c.finish === 'custom' ? `Custom ${c.custom}` : find(FINISHES, c.finish).label,
			price: find(FINISHES, c.finish).price
		},
		{
			group: 'Surface',
			label: find(SURFACES, c.surface).label,
			price: find(SURFACES, c.surface).price
		},
		{ group: 'Layout', label: find(STYLES, c.style).label, price: find(STYLES, c.style).price },
		{
			group: 'Body shape',
			label:
				c.shoulders < 0.05 && c.wings < 0.05
					? "Classic '67"
					: `Shoulders ${Math.round(c.shoulders * 100)} %, wings ${Math.round(c.wings * 100)} %`,
			price: c.shoulders > 0.05 || c.wings > 0.05 ? 250 : 0
		},
		{
			group: 'Headstock',
			label: find(HEADSTOCKS, c.headstock).label,
			price: find(HEADSTOCKS, c.headstock).price
		},
		{ group: 'Fretboard', label: find(BOARDS, c.board).label, price: find(BOARDS, c.board).price },
		{ group: 'Inlays', label: find(INLAYS, c.inlays).label, price: find(INLAYS, c.inlays).price },
		{ group: 'Binding', label: c.binding ? 'Cream binding' : 'None', price: c.binding ? 120 : 0 },
		{
			group: 'Tailpiece',
			label: find(TAILPIECES, c.tail).label,
			price: find(TAILPIECES, c.tail).price
		},
		{
			group: 'Hardware',
			label: find(HARDWARE, c.hardware).label,
			price: find(HARDWARE, c.hardware).price
		},
		{
			group: 'Pickups',
			label: find(PICKUPS, c.pickups).label,
			price: find(PICKUPS, c.pickups).price
		},
		{ group: 'Pickguard', label: find(GUARDS, c.guard).label, price: find(GUARDS, c.guard).price },
		{ group: 'Knobs', label: find(KNOBS, c.knobs).label, price: find(KNOBS, c.knobs).price },
		{
			group: 'Stickers',
			label: c.stickers.length ? `${c.stickers.length} placed` : 'None',
			price: c.stickers.length * 15
		}
	];
	return items;
}

export function total(c) {
	return BASE_PRICE + lineItems(c).reduce((s, i) => s + i.price, 0);
}

export const euro = (n) =>
	new Intl.NumberFormat('de-AT', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	}).format(n);

// ---- share link: config <-> URL hash (base64url JSON of changed fields only)
export function encode(c) {
	const diff = {};
	for (const k of Object.keys(DEFAULTS)) {
		if (k === 'stickers') {
			if (c.stickers.length)
				diff.stickers = c.stickers.map((st) => ({
					...st,
					p: st.p.map((v) => +v.toFixed(4)),
					n: st.n.map((v) => +v.toFixed(3)),
					r: +st.r.toFixed(2),
					s: +st.s.toFixed(3)
				}));
		} else if (c[k] !== DEFAULTS[k]) diff[k] = c[k];
	}
	const json = JSON.stringify(diff);
	return btoa(unescape(encodeURIComponent(json)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export function decode(hash) {
	try {
		const b = hash.replace(/^#?b=/, '').replace(/-/g, '+').replace(/_/g, '/');
		const obj = JSON.parse(decodeURIComponent(escape(atob(b))));
		const out = {};
		for (const k of Object.keys(DEFAULTS)) {
			if (k in obj && typeof obj[k] === typeof DEFAULTS[k]) out[k] = obj[k];
		}
		if (out.stickers)
			out.stickers = (Array.isArray(out.stickers) ? out.stickers : [])
				.filter(
					(st) =>
						st &&
						typeof st.id === 'string' &&
						Array.isArray(st.p) &&
						st.p.length === 3 &&
						Array.isArray(st.n) &&
						st.n.length === 3
				)
				.slice(0, 60);
		return out;
	} catch {
		return null;
	}
}

export function toast(msg) {
	ui.toast = msg;
	setTimeout(() => {
		if (ui.toast === msg) ui.toast = '';
	}, 2200);
}

// camera views (three.js world, metres). Guitar stands upright, front faces +Z.
export const VIEWS = {
	full: { label: 'Full guitar', pos: [0.6, 0.06, 2.75], target: [0.0, -0.03, 0] },
	headstock: { label: 'Headstock', pos: [0.24, 0.52, 0.62], target: [0, 0.44, 0] },
	neck: { label: 'Neck', pos: [0.32, 0.2, 0.62], target: [0, 0.14, 0.01] },
	pickups: { label: 'Pickups', pos: [0.3, -0.04, 0.68], target: [0, -0.19, 0.01] },
	bridge: { label: 'Bridge', pos: [0.3, -0.16, 0.56], target: [0.02, -0.29, 0.01] },
	controls: { label: 'Controls', pos: [0.42, -0.22, 0.6], target: [0.08, -0.33, 0.0] },
	back: { label: 'Back', pos: [-0.5, 0.0, -2.1], target: [0, -0.04, 0] },
	stickers: { label: 'Body', pos: [0.2, -0.22, 1.25], target: [0.0, -0.33, 0] },
	explode: { label: 'Exploded', pos: [1.25, 0.42, 2.75], target: [0.0, -0.02, 0.08] }
};

export const TAB_VIEW = {
	body: 'full',
	neck: 'headstock',
	hardware: 'bridge',
	electronics: 'controls',
	stickers: 'stickers'
};