// Original die-cut sticker designs, drawn on canvas (no external images, no real logos).
const C = 256;
const star = (g, cx, cy, r1, r2, n = 5, rot = -Math.PI / 2) => {
	g.beginPath();
	for (let i = 0; i < n * 2; i++) {
		const r = i % 2 ? r2 : r1,
			a = rot + (i * Math.PI) / n;
		g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
	}
	g.closePath();
};

export const STICKERS = [
	{
		id: 'bolt',
		label: 'Lightning',
		draw: (g) => {
			g.beginPath();
			g.moveTo(150, 18);
			g.lineTo(62, 140);
			g.lineTo(120, 140);
			g.lineTo(96, 238);
			g.lineTo(196, 104);
			g.lineTo(136, 104);
			g.lineTo(168, 18);
			g.closePath();
			g.fillStyle = '#ffd23f';
			g.fill();
			g.lineWidth = 7;
			g.strokeStyle = '#1b1b1b';
			g.lineJoin = 'round';
			g.stroke();
		}
	},
	{
		id: 'star',
		label: 'Nova star',
		draw: (g) => {
			star(g, 128, 132, 112, 50);
			g.fillStyle = '#e0358f';
			g.fill();
			g.lineWidth = 7;
			g.strokeStyle = '#2a0d22';
			g.lineJoin = 'round';
			g.stroke();
			g.fillStyle = '#fff';
			g.font = '800 34px "Unbounded Variable", sans-serif';
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillText('NOVA', 128, 138);
		}
	},
	{
		id: 'flame',
		label: 'Flame',
		draw: (g) => {
			const f = (s, col) => {
				g.save();
				g.translate(128, 236);
				g.scale(s, s);
				g.beginPath();
				g.moveTo(0, 0);
				g.bezierCurveTo(-95, -10, -90, -110, -40, -150);
				g.bezierCurveTo(-44, -110, -20, -96, -12, -92);
				g.bezierCurveTo(-30, -160, 10, -200, 20, -220);
				g.bezierCurveTo(30, -170, 90, -150, 80, -80);
				g.bezierCurveTo(78, -40, 60, -5, 0, 0);
				g.fillStyle = col;
				g.fill();
				g.restore();
			};
			f(1, '#e8361c');
			f(0.68, '#ff8a1f');
			f(0.38, '#ffd84a');
		}
	},
	{
		id: 'heart',
		label: 'Heart',
		draw: (g) => {
			g.beginPath();
			g.moveTo(128, 222);
			g.bezierCurveTo(20, 150, 20, 60, 78, 50);
			g.bezierCurveTo(108, 45, 124, 66, 128, 82);
			g.bezierCurveTo(132, 66, 148, 45, 178, 50);
			g.bezierCurveTo(236, 60, 236, 150, 128, 222);
			g.fillStyle = '#e3242b';
			g.fill();
			g.beginPath();
			g.ellipse(86, 92, 18, 10, -0.6, 0, Math.PI * 2);
			g.fillStyle = 'rgba(255,255,255,0.55)';
			g.fill();
		}
	},
	{
		id: 'checker',
		label: 'Checker',
		draw: (g) => {
			g.save();
			g.beginPath();
			g.arc(128, 128, 110, 0, Math.PI * 2);
			g.clip();
			for (let y = 0; y < 8; y++)
				for (let x = 0; x < 8; x++) {
					g.fillStyle = (x + y) % 2 ? '#111' : '#f4f1ea';
					g.fillRect(18 + x * 27.5, 18 + y * 27.5, 27.5, 27.5);
				}
			g.restore();
			g.beginPath();
			g.arc(128, 128, 110, 0, Math.PI * 2);
			g.lineWidth = 6;
			g.strokeStyle = '#111';
			g.stroke();
		}
	},
	{
		id: 'peace',
		label: 'Peace',
		draw: (g) => {
			g.beginPath();
			g.arc(128, 128, 108, 0, Math.PI * 2);
			g.fillStyle = '#5ec4a8';
			g.fill();
			g.lineWidth = 16;
			g.strokeStyle = '#fff';
			g.lineCap = 'round';
			g.beginPath();
			g.arc(128, 128, 80, 0, Math.PI * 2);
			g.stroke();
			g.beginPath();
			g.moveTo(128, 48);
			g.lineTo(128, 208);
			g.moveTo(128, 128);
			g.lineTo(72, 184);
			g.moveTo(128, 128);
			g.lineTo(184, 184);
			g.stroke();
		}
	},
	{
		id: 'vinyl',
		label: 'Record',
		draw: (g) => {
			g.beginPath();
			g.arc(128, 128, 112, 0, Math.PI * 2);
			g.fillStyle = '#121212';
			g.fill();
			g.strokeStyle = 'rgba(255,255,255,0.1)';
			g.lineWidth = 1.5;
			for (let r = 50; r < 108; r += 6) {
				g.beginPath();
				g.arc(128, 128, r, 0, Math.PI * 2);
				g.stroke();
			}
			g.beginPath();
			g.arc(128, 128, 40, 0, Math.PI * 2);
			g.fillStyle = '#e8b96a';
			g.fill();
			g.beginPath();
			g.arc(128, 128, 6, 0, Math.PI * 2);
			g.fillStyle = '#121212';
			g.fill();
			g.beginPath();
			g.arc(128, 128, 96, -2.4, -1.6);
			g.strokeStyle = 'rgba(255,255,255,0.35)';
			g.lineWidth = 8;
			g.stroke();
		}
	},
	{
		id: 'rock',
		label: 'Rock on',
		draw: (g) => {
			g.save();
			g.translate(128, 128);
			g.rotate(-0.12);
			g.beginPath();
			g.roundRect(-118, -46, 236, 92, 18);
			g.fillStyle = '#1d0e1b';
			g.fill();
			g.lineWidth = 6;
			g.strokeStyle = '#e8b96a';
			g.stroke();
			g.fillStyle = '#f3eadb';
			g.font = '800 40px "Unbounded Variable", sans-serif';
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillText('ROCK ON', 0, 2);
			g.restore();
		}
	},
	{
		id: 'smile',
		label: 'Smile',
		draw: (g) => {
			g.beginPath();
			g.arc(128, 128, 108, 0, Math.PI * 2);
			g.fillStyle = '#ffd23f';
			g.fill();
			g.lineWidth = 6;
			g.strokeStyle = '#1b1b1b';
			g.stroke();
			g.fillStyle = '#1b1b1b';
			g.beginPath();
			g.ellipse(92, 102, 11, 20, 0, 0, Math.PI * 2);
			g.fill();
			g.beginPath();
			g.ellipse(164, 102, 11, 20, 0, 0, Math.PI * 2);
			g.fill();
			g.beginPath();
			g.arc(128, 132, 62, 0.25, Math.PI - 0.25);
			g.lineWidth = 11;
			g.lineCap = 'round';
			g.stroke();
		}
	},
	{
		id: 'badge58',
		label: "'58 badge",
		draw: (g) => {
			g.beginPath();
			g.ellipse(128, 128, 116, 82, 0, 0, Math.PI * 2);
			g.fillStyle = '#e8b96a';
			g.fill();
			g.lineWidth = 5;
			g.strokeStyle = '#3a1c06';
			g.stroke();
			g.beginPath();
			g.ellipse(128, 128, 102, 68, 0, 0, Math.PI * 2);
			g.lineWidth = 2;
			g.stroke();
			g.fillStyle = '#3a1c06';
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.font = '800 64px "Unbounded Variable", sans-serif';
			g.fillText("'58", 128, 120);
			g.font = '700 16px "Instrument Sans Variable", sans-serif';
			g.fillText('SINCE KORINA', 128, 168);
		}
	}
];

const cache = new Map();

/** Sticker artwork with a white die-cut border, transparent around it. */
export function stickerCanvas(id) {
	const hit = cache.get(id);
	if (hit) return hit;
	const def = STICKERS.find((s) => s.id === id) ?? STICKERS[0];
	const art = document.createElement('canvas');
	art.width = art.height = C;
	const ag = art.getContext('2d');
	ag.translate(C * 0.08, C * 0.08);
	ag.scale(0.84, 0.84);
	def.draw(ag);
	// white border: stamp a whitened silhouette around the artwork
	const sil = document.createElement('canvas');
	sil.width = sil.height = C;
	const sg = sil.getContext('2d');
	sg.drawImage(art, 0, 0);
	sg.globalCompositeOperation = 'source-in';
	sg.fillStyle = '#ffffff';
	sg.fillRect(0, 0, C, C);
	const out = document.createElement('canvas');
	out.width = out.height = C;
	const og = out.getContext('2d');
	const R = 9;
	for (let a = 0; a < Math.PI * 2; a += Math.PI / 12)
		og.drawImage(sil, Math.cos(a) * R, Math.sin(a) * R);
	og.drawImage(art, 0, 0);
	cache.set(id, out);
	return out;
}

export const STICKER_PRICE = 15;