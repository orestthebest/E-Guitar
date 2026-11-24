<script>
	import { T, useTask, useThrelte } from '@threlte/core';
	import { useCursor, MeshDiscardMaterial, HTML } from '@threlte/extras';
	import { bodyLayout, bakeFinish, flakeNormal, smudgeMap, RECIPES } from './finishes.js';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import * as THREE from 'three';
	import { config, ui } from '../config.svelte.js';
	import { actions, interaction } from '../bus.svelte.js';
	import { playString, OPEN, E_MAJOR, bend } from '../audio.js';
	import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
	import { stickerCanvas } from '../stickers.js';
	import { onDestroy } from 'svelte';

	let { model: modelUrl } = $props();
	const { invalidate, camera: camStore, renderer } = useThrelte();

	// load the Blender export (static/models/FlyingV.glb)
	let model = $state.raw(null);
	new GLTFLoader().load(modelUrl, (g) => (model = g));

	let spin = $state();
	let rotY = 0;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain cache, not UI state
	const morphs = new Map();
	const morphTarget = { Body_58: 0, Body_Sharp: 0, Head_Rounded: 0, Head_Split: 0 };
	const morphNow = { Body_58: 0, Body_Sharp: 0, Head_Rounded: 0, Head_Split: 0 };
	let strings = $state([]);
	let armBone = null;
	let armBox = $state(null);
	let woodTex = null;
	let boardTex = null;
	let tortoise = null;
	let layout = null;
	let flake = null;
	let smudge = null;
	let baked = null;
	let M = {};

	// exploded view: offsets in the root's local frame (+Y = out of the top, -Z = up the neck)
	const EXPLODE = {
		Back_ControlCover: [0, -0.08, 0],
		Fretboard: [0, 0.035, 0],
		Fretboard_Binding: [0, 0.035, 0],
		Inlays_Dots: [0, 0.047, 0],
		Inlays_Blocks: [0, 0.047, 0],
		Inlays_Side: [0, 0.035, 0],
		Frets: [0, 0.06, 0],
		Nut: [0, 0.06, -0.015],
		HeadstockAssembly: [0, 0.03, -0.1],
		Style_67: [0, 0.055, 0],
		Style_58: [0, 0.055, 0],
		Pickups: [0, 0.105, 0],
		Bridge: [0, 0.15, 0],
		Tailpiece_Stopbar: [0, 0.15, 0],
		Tailpiece_VPlate: [0, 0.15, 0],
		Tailpiece_Vibrola: [0, 0.15, 0],
		Strings: [0, 0.22, 0]
	};
	// anchor = part centre (+ a nudge onto the part), label = anchor + side offset (metres, scene frame)
	const LABELS = [
		{ node: 'Body', text: 'Body', at: [-0.12, -0.12], side: [-0.2, -0.08] },
		{ node: 'Style_67', text: 'Pickguard and controls', at: [0.09, -0.06], side: [0.26, 0.03] },
		{ node: 'Pickups', text: 'Two humbuckers', at: [0.03, 0.04], side: [0.24, 0.08] },
		{ node: 'Bridge', text: 'Tune-o-matic bridge', at: [-0.03, 0], side: [-0.24, 0.02] },
		{ node: 'Strings', text: 'Six strings, 10 to 46', at: [-0.01, 0.2], side: [-0.2, 0.06] },
		{ node: 'Fretboard', text: '22-fret board', at: [0.02, 0.05], side: [0.2, 0.04] },
		{
			node: 'HeadstockAssembly',
			text: 'Headstock and Kluson-style tuners',
			at: [0.02, 0],
			side: [0.18, 0.0]
		},
		{ node: 'Back_ControlCover', text: 'Control cover', at: [0.02, -0.03], side: [0.24, -0.16] }
	];
	const explodeParts = [];
	let tags = $state([]);
	const lineMat = new THREE.LineBasicMaterial({
		color: '#e0358f',
		transparent: true,
		opacity: 0,
		depthTest: false
	});
	let explodeNow = 0;
	let explodeVis = $state(0);
	let N = {};

	function makeTortoise() {
		const c = document.createElement('canvas');
		c.width = c.height = 512;
		const g = c.getContext('2d');
		g.fillStyle = '#2a0d05';
		g.fillRect(0, 0, 512, 512);
		for (let i = 0; i < 260; i++) {
			const x = Math.random() * 512,
				y = Math.random() * 512,
				r = 8 + Math.random() * 46;
			const grd = g.createRadialGradient(x, y, 0, x, y, r);
			const hue = 18 + Math.random() * 16;
			grd.addColorStop(0, `hsla(${hue},85%,${30 + Math.random() * 22}%,0.85)`);
			grd.addColorStop(1, `hsla(${hue},80%,10%,0)`);
			g.fillStyle = grd;
			g.beginPath();
			g.ellipse(x, y, r * 1.8, r * 0.7, Math.random() * 0.6 - 0.3, 0, Math.PI * 2);
			g.fill();
		}
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		t.wrapS = t.wrapT = THREE.RepeatWrapping;
		t.flipY = false;
		return t;
	}

	function setup(scene, nodes, materials) {
		N = nodes;
		M = materials;
		woodTex = M.Body_Finish?.map ?? null;
		boardTex = M.Fretboard?.map ?? null;
		tortoise = makeTortoise();
		scene.traverse((o) => {
			const m = o;
			if (m.isMesh) {
				m.frustumCulled = false;
				if (m.morphTargetDictionary) {
					for (const [k, idx] of Object.entries(m.morphTargetDictionary)) {
						if (!morphs.has(k)) morphs.set(k, []);
						morphs.get(k).push({ mesh: m, idx });
					}
				}
			}
		});
		scene.updateMatrixWorld(true);
		const inv = new THREE.Matrix4().copy(scene.matrixWorld).invert();
		// strings: keep rest positions + param along the string (local z)
		const list = [];
		for (let i = 1; i <= 6; i++) {
			const mesh = scene.getObjectByName(`String_${i}`);
			if (!mesh) continue;
			const pos = mesh.geometry.attributes.position;
			const orig = new Float32Array(pos.array);
			let zmin = Infinity,
				zmax = -Infinity;
			for (let k = 0; k < pos.count; k++) {
				const z = orig[k * 3 + 2];
				zmin = Math.min(zmin, z);
				zmax = Math.max(zmax, z);
			}
			const t = new Float32Array(pos.count);
			const a = new THREE.Vector3(),
				b = new THREE.Vector3();
			let na = 0,
				nb = 0;
			for (let k = 0; k < pos.count; k++) {
				const z = orig[k * 3 + 2];
				t[k] = (z - zmin) / (zmax - zmin);
				if (z < zmin + 0.0005) {
					a.add(new THREE.Vector3(orig[k * 3], orig[k * 3 + 1], z));
					na++;
				}
				if (z > zmax - 0.0005) {
					b.add(new THREE.Vector3(orig[k * 3], orig[k * 3 + 1], z));
					nb++;
				}
			}
			a.divideScalar(na).applyMatrix4(mesh.matrixWorld).applyMatrix4(inv);
			b.divideScalar(nb).applyMatrix4(mesh.matrixWorld).applyMatrix4(inv);
			const dir = b.clone().sub(a);
			const len = dir.length();
			const quat = new THREE.Quaternion().setFromUnitVectors(
				new THREE.Vector3(0, 1, 0),
				dir.normalize()
			);
			list.push({
				mesh,
				orig,
				t,
				amp: 0,
				phase: 0,
				freq: OPEN[i - 1],
				hit: { pos: a.clone().lerp(b, 0.5), quat, len }
			});
		}
		strings = list;
		armBone = scene.getObjectByName('VibrolaArm') ?? null;
		const arm = scene.getObjectByName('Vibrola_Arm');
		if (arm) {
			const box = new THREE.Box3().setFromObject(arm);
			box.applyMatrix4(inv);
			armBox = {
				pos: box.getCenter(new THREE.Vector3()),
				size: box.getSize(new THREE.Vector3()).addScalar(0.012)
			};
		}
		// finishes
		const bodyMesh = scene.getObjectByName('Body');
		if (bodyMesh) {
			layout = bodyLayout(bodyMesh.geometry);
			body = bodyMesh;
			bodyMesh.add(stickerGroup);
			bodyMesh.add(previewGroup);
		}
		flake = flakeNormal();
		smudge = smudgeMap();
		// exploded view parts + label anchors (scene frame: +Z = front, +Y = up the neck)
		const root = scene.getObjectByName('FlyingV');
		if (root) {
			for (const ch of root.children) {
				const off = EXPLODE[ch.name];
				if (off)
					explodeParts.push({ o: ch, rest: ch.position.clone(), off: new THREE.Vector3(...off) });
			}
			const t = [];
			for (const l of LABELS) {
				const o = scene.getObjectByName(l.node);
				if (!o) continue;
				const box = new THREE.Box3().setFromObject(o).applyMatrix4(inv);
				const ctr = box.getCenter(new THREE.Vector3());
				const off = EXPLODE[l.node] ?? [0, 0, 0];
				const anchor = ctr.add(new THREE.Vector3(off[0] + l.at[0], -off[2] + l.at[1], off[1]));
				const lab = anchor.clone().add(new THREE.Vector3(l.side[0], l.side[1], 0));
				const line = new THREE.BufferGeometry().setFromPoints([anchor, lab]);
				t.push({ text: l.text, node: l.node, line, pos: lab.toArray(), left: l.side[0] < 0 });
			}
			tags = t;
		}
		applyAll();
		ui.loaded = true;
	}

	$effect(() => {
		const g = model;
		if (!g || ui.loaded) return;
		const nodes = {};
		const materials = {};
		g.scene.traverse((o) => {
			if (o.name) nodes[o.name] = o;
			const mm = o.material;
			if (mm) for (const m of Array.isArray(mm) ? mm : [mm]) materials[m.name] = m;
		});
		setup(g.scene, nodes, materials);
	});

	// ---------------------------------------------------------------- config -> scene
	const show = (name, on) => {
		const o = N[name];
		if (o) o.visible = on;
	};
	const col = (m, hex) => m?.color.set(hex);

	const NECK = {
		cherry: '#7a1222',
		korina: '#f2cf96',
		tobacco: '#4a2008',
		cherryburst: '#6a0b14',
		ocean: '#b8703c',
		honey: '#b8703c'
	};
	let bakeTimer = null;
	function applyFinish() {
		const c = config;
		const recipe =
			c.finish === 'custom'
				? { base: 'solid', solid: c.custom }
				: (RECIPES[c.finish] ?? RECIPES.cherry);
		const relic = c.surface === 'relic';
		const key = `${c.finish}|${c.custom}|${relic}`;
		const metal = { pelham: 0.45, goldtop: 0.7, plum: 0.55, custom: 0.1 }[c.finish] ?? 0;
		const body = M.Body_Finish,
			neck = M.Neck_Finish;
		if (!body || !neck) return;
		const doBake = () => {
			if (!layout) return;
			const wood = woodTex?.image ?? null;
			const r = bakeFinish(layout, wood, recipe, relic);
			baked?.color.dispose();
			baked?.rough?.dispose();
			baked?.coat?.dispose();
			baked = { key, ...r };
			setSurface();
		};
		const setSurface = () => {
			body.color.set('#ffffff');
			body.map = baked?.color ?? null;
			body.metalness = metal;
			body.normalMap = null;
			body.roughnessMap = null;
			body.clearcoatMap = null;
			body.clearcoatRoughnessMap = null;
			body.sheen = 0;
			switch (c.surface) {
				case 'satin':
					body.roughness = 0.42;
					body.clearcoat = 0.3;
					body.clearcoatRoughness = 0.42;
					break;
				case 'matte':
					body.roughness = 0.82;
					body.clearcoat = 0;
					body.sheen = 0.35;
					body.sheenRoughness = 0.75;
					body.sheenColor.set('#ffffff');
					break;
				case 'flake':
					body.normalMap = flake;
					body.normalScale.set(0.6, 0.6);
					body.metalness = Math.max(metal, 0.6);
					body.roughness = 0.34;
					body.clearcoat = 1;
					body.clearcoatRoughness = 0.03;
					break;
				case 'relic':
					body.roughness = 1;
					body.roughnessMap = baked?.rough ?? null;
					body.clearcoat = 0.7;
					body.clearcoatMap = baked?.coat ?? null;
					body.clearcoatRoughness = 0.3;
					break;
				default:
					body.roughness = 0.24;
					body.clearcoat = 1;
					body.clearcoatRoughness = 0.22;
					body.clearcoatRoughnessMap = smudge;
			}
			body.needsUpdate = true;
			// neck: same colour family, stained wood
			const solid = recipe.base === 'solid';
			neck.color.set(solid ? (recipe.solid ?? '#000') : (NECK[c.finish] ?? '#7a1222'));
			neck.map = solid ? null : woodTex;
			neck.metalness = solid ? metal : 0;
			neck.roughness =
				c.surface === 'matte' ? 0.8 : c.surface === 'satin' || c.surface === 'relic' ? 0.45 : 0.26;
			neck.clearcoat =
				c.surface === 'matte' ? 0 : c.surface === 'gloss' || c.surface === 'flake' ? 1 : 0.3;
			neck.clearcoatRoughness = 0.1;
			neck.needsUpdate = true;
		};
		if (baked?.key === key) setSurface();
		else {
			if (bakeTimer) clearTimeout(bakeTimer);
			bakeTimer = setTimeout(doBake, baked ? 60 : 0);
		}
	}

	function applyAll() {
		if (!M.Body_Finish) return;
		const c = config;
		// visibility
		show('Style_67', c.style === '67');
		show('Style_58', c.style === '58');
		show('Tailpiece_Stopbar', c.tail === 'stop');
		show('Tailpiece_VPlate', c.tail === 'v');
		show('Tailpiece_Vibrola', c.tail === 'vib');
		const covered = c.pickups === 'covered';
		show('Pickup_Neck_Cover', covered);
		show('Pickup_Bridge_Cover', covered);
		show('Pickup_Neck_Open', !covered);
		show('Pickup_Bridge_Open', !covered);
		show('Inlays_Dots', c.inlays === 'dots');
		show('Inlays_Blocks', c.inlays === 'blocks');
		show('Fretboard_Binding', c.binding);

		applyFinish();
		// fretboard
		const fb = M.Fretboard;
		if (fb) {
			const b = {
				rosewood: ['#d3c2b6', true, 0.6],
				ebony: ['#4a4442', true, 0.45],
				maple: ['#ebc98f', false, 0.32]
			}[c.board];
			fb.color.set(b[0]);
			fb.map = b[1] ? boardTex : null;
			fb.roughness = b[2];
			fb.needsUpdate = true;
		}
		// hardware
		const hw = {
			nickel: ['#e6e6e3', 0.14, 1],
			gold: ['#f1c47a', 0.18, 1],
			black: ['#2a2a2e', 0.34, 0.85],
			aged: ['#b3ab9b', 0.42, 0.9]
		}[c.hardware];
		if (M.Hardware) {
			M.Hardware.color.set(hw[0]);
			M.Hardware.roughness = hw[1];
			M.Hardware.metalness = hw[2];
		}
		// pickups
		col(M.Bobbin_A, '#0d0d0d');
		col(M.Bobbin_B, c.pickups === 'zebra' ? '#e9dcbf' : '#0d0d0d');
		// pickguard
		const pg = M.Pickguard;
		if (pg) {
			const gmap = {
				white: '#ece9e0',
				black: '#151515',
				cream: '#e9dcc0',
				tortoise: '#ffffff',
				pearl: '#ffffff'
			};
			pg.color.set(gmap[c.guard] ?? '#ece9e0');
			pg.map =
				c.guard === 'tortoise' ? tortoise : c.guard === 'pearl' ? (M.Inlays?.map ?? null) : null;
			pg.clearcoat = c.guard === 'pearl' || c.guard === 'tortoise' ? 0.8 : 0.3;
			pg.roughness = c.guard === 'pearl' ? 0.18 : 0.28;
			pg.needsUpdate = true;
			col(M.Pickguard_Edge, c.guard === 'black' ? '#d9d5cc' : '#141414');
		}
		// glossy black headstock face: keep it black, not mirror-like
		const hf = M.Headstock_Face;
		if (hf) {
			hf.color.set('#020202');
			hf.metalness = 0;
			hf.roughness = 0.5;
			hf.clearcoat = 0.6;
			hf.clearcoatRoughness = 0.08;
			hf.envMapIntensity = 0.12;
			hf.specularIntensity = 0.4;
		}
		// knobs
		const k = M.Knobs;
		if (k) {
			const km = {
				black: ['#0a0a0a', 0, 0.12],
				gold: ['#c8a050', 0.75, 0.22],
				amber: ['#c46a1c', 0, 0.08]
			}[c.knobs];
			k.color.set(km[0]);
			k.metalness = km[1];
			k.roughness = km[2];
		}
		// morph targets (animated)
		morphTarget.Body_58 = c.shoulders;
		morphTarget.Body_Sharp = c.wings;
		morphTarget.Head_Rounded = c.headstock === 'rounded' ? 1 : 0;
		morphTarget.Head_Split = c.headstock === 'split' ? 1 : 0;
		invalidate();
	}

	$effect(() => {
		// track every config field
		JSON.stringify(config);
		applyAll();
	});

	// ---------------------------------------------------------------- strings
	function pluckIdx(i, freq, strength = 1) {
		const s = strings[i];
		if (!s) return;
		s.amp = 0.0016 * strength * (0.7 + i * 0.12);
		s.freq = freq ?? OPEN[i];
		if (ui.sound) playString(i, s.freq);
	}
	actions.pluck = (i) => pluckIdx(i);
	actions.strum = () => {
		for (let k = 5; k >= 0; k--) setTimeout(() => pluckIdx(k, E_MAJOR[k], 0.9), (5 - k) * 32);
	};

	// ---------------------------------------------------------------- vibrato arm drag
	let dragStart = { x: 0, y: 0, swing: 0 };
	let swing = 0,
		dip = 0,
		dipTarget = 0;
	function armDown(e) {
		e.stopPropagation();
		interaction.dragging = true;
		dragStart = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, swing };
		window.addEventListener('pointermove', armMove);
		window.addEventListener('pointerup', armUp, { once: true });
	}
	function armMove(ev) {
		swing = THREE.MathUtils.clamp(dragStart.swing - (ev.clientX - dragStart.x) * 0.008, -0.9, 0.9);
		dipTarget = THREE.MathUtils.clamp((ev.clientY - dragStart.y) * 0.0025, 0, 0.16);
		if (ui.sound) bend(-dipTarget * 12);
	}
	function armUp() {
		window.removeEventListener('pointermove', armMove);
		interaction.dragging = false;
		dipTarget = 0;
		if (ui.sound) bend(0);
	}

	const { onPointerEnter: armEnter, onPointerLeave: armLeave } = useCursor('grab');
	const { onPointerEnter: strEnter, onPointerLeave: strLeave } = useCursor('pointer');

	// ---------------------------------------------------------------- stickers (decals projected on the body)
	let body = null;
	const stickerGroup = new THREE.Group();
	const previewGroup = new THREE.Group();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain cache, not UI state
	const stickerMats = new Map();
	function stickerMat(id, preview = false) {
		const key = id + (preview ? ':p' : '');
		let m = stickerMats.get(key);
		if (!m) {
			const t = new THREE.CanvasTexture(stickerCanvas(id));
			t.colorSpace = THREE.SRGBColorSpace;
			t.anisotropy = 8;
			m = new THREE.MeshPhysicalMaterial({
				map: t,
				transparent: true,
				depthWrite: false,
				polygonOffset: true,
				polygonOffsetFactor: -4,
				roughness: 0.42,
				clearcoat: 0.25,
				clearcoatRoughness: 0.3,
				opacity: preview ? 0.6 : 1
			});
			stickerMats.set(key, m);
		}
		return m;
	}
	/** body with its current morph applied, so decals land on the shape you see */
	function morphedBody() {
		const b = body;
		const geo = b.geometry;
		const base = geo.attributes.position.array;
		const out = new Float32Array(base);
		const targets = geo.morphAttributes.position ?? [];
		const infl = b.morphTargetInfluences ?? [];
		targets.forEach((t, k) => {
			const w = infl[k] ?? 0;
			if (w < 1e-4) return;
			const arr = t.array;
			if (geo.morphTargetsRelative) for (let i = 0; i < out.length; i++) out[i] += arr[i] * w;
			else for (let i = 0; i < out.length; i++) out[i] += (arr[i] - base[i]) * w;
		});
		const g2 = new THREE.BufferGeometry();
		g2.setAttribute('position', new THREE.BufferAttribute(out, 3));
		g2.setAttribute('normal', geo.attributes.normal);
		if (geo.index) g2.setIndex(geo.index);
		const m = new THREE.Mesh(g2);
		b.updateMatrixWorld(true);
		m.matrixWorld.copy(b.matrixWorld);
		return m;
	}
	const dummy = new THREE.Object3D();
	function decal(proxy, st, preview = false) {
		const b = body;
		const p = new THREE.Vector3(...st.p).applyMatrix4(b.matrixWorld);
		const n = new THREE.Vector3(...st.n).transformDirection(b.matrixWorld);
		dummy.position.copy(p);
		dummy.lookAt(p.clone().add(n));
		dummy.rotateZ(st.r);
		const geo = new DecalGeometry(
			proxy,
			p,
			dummy.rotation.clone(),
			new THREE.Vector3(st.s, st.s, 0.025)
		);
		geo.applyMatrix4(b.matrixWorld.clone().invert());
		const mesh = new THREE.Mesh(geo, stickerMat(st.id, preview));
		mesh.renderOrder = 3;
		return mesh;
	}
	function clearGroup(g) {
		for (const c of [...g.children]) {
			c.geometry.dispose();
			g.remove(c);
		}
	}
	function rebuildStickers() {
		if (!body) return;
		clearGroup(stickerGroup);
		if (!config.stickers.length) return;
		const proxy = morphedBody();
		for (const st of config.stickers) stickerGroup.add(decal(proxy, st));
		proxy.geometry.dispose();
	}
	$effect(() => {
		JSON.stringify(config.stickers);
		if (ui.loaded) document.fonts.ready.then(rebuildStickers);
	});

	// click on the body to place the armed sticker; hover shows a ghost preview
	const ray = new THREE.Raycaster();
	const ndc = new THREE.Vector2();
	let downAt = { x: 0, y: 0 };
	let pendingMove = null;
	function hitBody(ev) {
		if (!body) return null;
		const el = renderer.domElement;
		const rect = el.getBoundingClientRect();
		ndc.set(
			((ev.clientX - rect.left) / rect.width) * 2 - 1,
			-((ev.clientY - rect.top) / rect.height) * 2 + 1
		);
		ray.setFromCamera(ndc, camStore.current);
		return ray.intersectObject(body, false)[0] ?? null;
	}
	const toLocal = (h) => ({
		p: body.worldToLocal(h.point.clone()).toArray(),
		n: (h.face?.normal ?? new THREE.Vector3(0, 1, 0)).toArray()
	});
	let tilt = Math.random() - 0.5;
	let downOnCanvas = false;
	function onDown(ev) {
		downAt = { x: ev.clientX, y: ev.clientY };
		downOnCanvas = true;
	}
	// pointerup is listened on window: OrbitControls captures the pointer on its own element
	function onUp(ev) {
		const was = downOnCanvas;
		downOnCanvas = false;
		if (!was || !ui.stickerTool || Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y) > 6)
			return;
		const h = hitBody(ev);
		if (!h) return;
		const { p, n } = toLocal(h);
		config.stickers.push({ id: ui.stickerTool, p, n, r: tilt, s: ui.stickerSize });
		tilt = (Math.random() - 0.5) * 0.9;
		clearGroup(previewGroup);
	}
	function onMove(ev) {
		pendingMove = ev;
	}
	function updatePreview() {
		const ev = pendingMove;
		pendingMove = null;
		if (!ev || !body) return;
		clearGroup(previewGroup);
		if (!ui.stickerTool) return;
		const h = hitBody(ev);
		if (!h) return;
		const proxy = morphedBody();
		previewGroup.add(
			decal(proxy, { id: ui.stickerTool, ...toLocal(h), r: tilt, s: ui.stickerSize }, true)
		);
		proxy.geometry.dispose();
	}
	$effect(() => {
		const el = renderer.domElement;
		el.style.cursor = ui.stickerTool ? 'crosshair' : '';
		if (!ui.stickerTool) clearGroup(previewGroup);
	});
	{
		const el = renderer.domElement;
		el.addEventListener('pointerdown', onDown);
		window.addEventListener('pointerup', onUp);
		el.addEventListener('pointermove', onMove);
		onDestroy(() => {
			el.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointerup', onUp);
			el.removeEventListener('pointermove', onMove);
		});
	}
	let morphSettle = 0;

	// ---------------------------------------------------------------- per frame
	useTask((dt) => {
		// turntable / hero spin, ease back to front when building
		if (spin) {
			if (ui.mode === 'hero' || ui.turntable) rotY += dt * (ui.mode === 'hero' ? 0.32 : 0.22);
			else {
				const goal = Math.round(rotY / (Math.PI * 2)) * Math.PI * 2;
				rotY += (goal - rotY) * Math.min(1, dt * 3);
			}
			spin.rotation.y = rotY;
		}
		// sticker hover preview (throttled to one decal per frame)
		if (pendingMove) updatePreview();
		// morph easing
		for (const k of Object.keys(morphTarget)) {
			const d = morphTarget[k] - morphNow[k];
			if (Math.abs(d) > 1e-4) {
				if (k.startsWith('Body')) morphSettle = 0.2;
				morphNow[k] += d * Math.min(1, dt * 6);
				for (const r of morphs.get(k) ?? [])
					if (r.mesh.morphTargetInfluences) r.mesh.morphTargetInfluences[r.idx] = morphNow[k];
			}
		}
		// re-project stickers once the body shape has settled
		if (morphSettle > 0) {
			morphSettle -= dt;
			if (morphSettle <= 0 && config.stickers.length) rebuildStickers();
		}
		// string vibration (standing wave, first + second partial)
		for (const s of strings) {
			if (s.amp < 1e-6) continue;
			s.amp *= Math.exp(-dt * 1.4);
			s.phase += dt * 38;
			const pos = s.mesh.geometry.attributes.position;
			const arr = pos.array;
			for (let k = 0; k < pos.count; k++) {
				const tt = s.t[k];
				const d =
					s.amp *
					(Math.sin(Math.PI * tt) * Math.sin(s.phase) +
						0.3 * Math.sin(2 * Math.PI * tt) * Math.sin(s.phase * 2.1));
				arr[k * 3] = s.orig[k * 3] + d;
				arr[k * 3 + 1] = s.orig[k * 3 + 1] + d * 0.25;
			}
			if (s.amp < 2e-6) arr.set(s.orig);
			pos.needsUpdate = true;
		}
		// exploded view
		const eg = ui.explode ? 1 : 0;
		if (Math.abs(eg - explodeNow) > 1e-4) {
			explodeNow += (eg - explodeNow) * Math.min(1, dt * 3.5);
			const k = explodeNow * explodeNow * (3 - 2 * explodeNow);
			for (const p of explodeParts) p.o.position.copy(p.rest).addScaledVector(p.off, k);
			explodeVis = Math.max(0, (explodeNow - 0.6) / 0.4);
			lineMat.opacity = explodeVis * 0.9;
		}
		// vibrato arm
		if (armBone) {
			dip += (dipTarget - dip) * Math.min(1, dt * (interaction.dragging ? 14 : 9));
			armBone.rotation.set(-dip, swing, 0);
		}
	});
</script>

{#if model}
	<T.Group bind:ref={spin}>
		<T is={model.scene} />
		{#each ui.explode ? [] : strings as s, i (i)}
			<T.Mesh
				position={s.hit.pos.toArray()}
				quaternion={s.hit.quat.toArray()}
				onpointerdown={(e) => {
					e.stopPropagation();
					pluckIdx(i);
				}}
				onpointerenter={() => {
					interaction.hoverString = i;
					strEnter();
				}}
				onpointerleave={() => {
					interaction.hoverString = -1;
					strLeave();
				}}
			>
				<T.CylinderGeometry args={[0.0032, 0.0032, s.hit.len * 0.97, 6]} />
				<MeshDiscardMaterial />
			</T.Mesh>
		{/each}
		{#if explodeVis > 0.02}
			{#each tags as t (t.text)}
				{#if !(t.node === 'Style_67' && config.style === '58')}
					<T.Line geometry={t.line} material={lineMat} renderOrder={20} />
					<HTML position={t.pos} pointerEvents="none" zIndexRange={[8, 0]}>
						<span
							class="inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-bone/20 bg-case/80 py-1 pr-2.5 pl-2 text-[12.5px] font-semibold whitespace-nowrap text-bone {t.left
								? '-translate-x-full'
								: ''}"
							style="opacity:{explodeVis}"
						>
							<i class="size-[7px] rounded-full bg-plush"></i>{t.text}
						</span>
					</HTML>
				{/if}
			{/each}
		{/if}
		{#if armBox && config.tail === 'vib' && !ui.explode}
			<T.Mesh
				position={armBox.pos.toArray()}
				onpointerdown={armDown}
				onpointerenter={() => {
					interaction.hoverArm = true;
					armEnter();
				}}
				onpointerleave={() => {
					interaction.hoverArm = false;
					armLeave();
				}}
			>
				<T.BoxGeometry args={armBox.size.toArray()} />
				<MeshDiscardMaterial />
			</T.Mesh>
		{/if}
	</T.Group>
{/if}