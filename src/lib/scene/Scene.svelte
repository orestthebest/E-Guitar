<script>
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls, ContactShadows, interactivity, Sparkles } from '@threlte/extras';
	import * as THREE from 'three';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
	import Guitar from './Guitar.svelte';
	import StageBeams from './StageBeams.svelte';
	import { ui, VIEWS } from '../config.svelte.js';
	import { actions, interaction } from '../bus.svelte.js';

	let { model } = $props();
	interactivity();
	const { renderer, scene, size } = useThrelte();

	// environment (studio reflections) generated in-browser, no HDRI download
	const pmrem = new THREE.PMREMGenerator(renderer);
	const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environment = envTex;

	let camera = $state();
	let controls = $state();
	const reduce =
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	// ---------------------------------------------------------------- camera fly-to
	const HERO = { pos: new THREE.Vector3(0.0, 0.02, 2.75), target: new THREE.Vector3(0, -0.02, 0) };
	let goalPos = HERO.pos.clone();
	let goalTarget = HERO.target.clone();
	let flying = true;
	let lastKey = '';
	$effect(() => {
		const key = ui.mode === 'hero' ? 'hero' : ui.view;
		if (key === lastKey) return;
		lastKey = key;
		if (key === 'hero') {
			goalPos = HERO.pos.clone();
			goalTarget = HERO.target.clone();
		} else {
			const v = VIEWS[key] ?? VIEWS.full;
			goalPos = new THREE.Vector3(...v.pos);
			goalTarget = new THREE.Vector3(...v.target);
		}
		flying = true;
	});
	$effect(() => {
		if (!controls) return;
		const stop = () => (flying = false);
		controls.addEventListener('start', stop);
		return () => controls?.removeEventListener('start', stop);
	});
	$effect(() => {
		if (controls) controls.enabled = !interaction.dragging && ui.mode === 'build';
	});

	// panel offset: shift the picture so the guitar is centred in the free area
	let offX = 0,
		offY = 0;

	// ---------------------------------------------------------------- stage light animation
	let magenta = $state();
	let cyan = $state();
	let t = 0;
	const stageAmt = { v: 0 };

	useTask((dt) => {
		t += dt;
		if (!camera || !controls) return;
		if (flying) {
			const k = reduce ? 1 : 1 - Math.exp(-dt * 3.2);
			camera.position.lerp(goalPos, k);
			controls.target.lerp(goalTarget, k);
			if (
				camera.position.distanceTo(goalPos) < 0.002 &&
				controls.target.distanceTo(goalTarget) < 0.002
			)
				flying = false;
		}
		controls.update();

		const w = size.current.width,
			h = size.current.height;
		const desk = w > 900;
		const tx = ui.mode === 'build' && desk ? Math.min(420, w * 0.34) / 2 : 0;
		const ty = !desk ? (ui.mode === 'build' ? h * 0.2 : h * 0.1) : 0;
		const zoomGoal = desk ? 1 : ui.mode === 'hero' ? 0.74 : 0.85;
		camera.zoom += (zoomGoal - camera.zoom) * Math.min(1, dt * 4);
		offX += (tx - offX) * Math.min(1, dt * 4);
		offY += (ty - offY) * Math.min(1, dt * 4);
		camera.setViewOffset(w, h, offX, offY, w, h);
		camera.updateProjectionMatrix();

		const target = ui.scene === 'stage' ? 1 : 0;
		stageAmt.v += (target - stageAmt.v) * Math.min(1, dt * 2.5);
		scene.environmentIntensity = THREE.MathUtils.lerp(0.75, 0.1, stageAmt.v);
		if (magenta && cyan) {
			magenta.intensity = 70 * stageAmt.v;
			cyan.intensity = 64 * stageAmt.v;
			magenta.target.position.set(Math.sin(t * 0.5) * 0.25, -0.1, 0);
			cyan.target.position.set(Math.cos(t * 0.43) * 0.25, 0.1, 0);
			magenta.target.updateMatrixWorld();
			cyan.target.updateMatrixWorld();
		}
	});

	// ---------------------------------------------------------------- screenshot
	const shotCam = new THREE.PerspectiveCamera(26, 1, 0.02, 40);
	actions.screenshot = async (full = false) => {
		const r = renderer;
		if (!camera) return null;
		if (full) {
			const sz = r.getSize(new THREE.Vector2());
			shotCam.aspect = sz.x / sz.y;
			const v = VIEWS.full;
			// fit the whole guitar (about 1.15 m tall incl. margin) into the frame
			const dist =
				0.62 /
				Math.tan(THREE.MathUtils.degToRad(shotCam.fov / 2)) /
				Math.min(1, shotCam.aspect * 1.4);
			const dir = new THREE.Vector3(...v.pos).sub(new THREE.Vector3(...v.target)).normalize();
			shotCam.position.copy(new THREE.Vector3(...v.target)).addScaledVector(dir, dist);
			shotCam.lookAt(...v.target);
			shotCam.updateProjectionMatrix();
			r.render(scene, shotCam);
		} else r.render(scene, camera);
		const src = r.domElement;
		const c = document.createElement('canvas');
		c.width = src.width;
		c.height = src.height;
		const g = c.getContext('2d');
		const grd = g.createRadialGradient(
			c.width * 0.5,
			c.height * 0.45,
			0,
			c.width * 0.5,
			c.height * 0.5,
			Math.max(c.width, c.height) * 0.7
		);
		if (ui.scene === 'stage') {
			grd.addColorStop(0, '#2a1027');
			grd.addColorStop(1, '#07030a');
		} else {
			grd.addColorStop(0, '#4a2444');
			grd.addColorStop(1, '#1d0e1b');
		}
		g.fillStyle = grd;
		g.fillRect(0, 0, c.width, c.height);
		g.drawImage(src, 0, 0);
		g.fillStyle = 'rgba(243,234,219,0.75)';
		g.font = `${Math.round(c.height * 0.022)}px "Unbounded Variable", sans-serif`;
		g.fillText('NOVA Flying V', c.height * 0.03, c.height * 0.965);
		return c.toDataURL('image/png');
	};
</script>

<T.PerspectiveCamera
	makeDefault
	bind:ref={camera}
	fov={28}
	near={0.02}
	far={40}
	position={HERO.pos.toArray()}
>
	<OrbitControls
		bind:ref={controls}
		enableDamping
		dampingFactor={0.08}
		minDistance={0.22}
		maxDistance={3.6}
		enablePan
		panSpeed={0.6}
		rotateSpeed={0.7}
		zoomSpeed={0.8}
		target={HERO.target.toArray()}
	/>
</T.PerspectiveCamera>

<!-- studio light rig (fades out on stage via intensity) -->
<T.DirectionalLight
	position={[-1.6, 2.2, 2.4]}
	intensity={ui.scene === 'studio' ? 1.5 : 0.08}
	color="#fff4e6"
/>
<T.DirectionalLight
	position={[1.8, 0.6, -2.0]}
	intensity={ui.scene === 'studio' ? 1.2 : 0.3}
	color="#ffd6f0"
/>
<T.AmbientLight intensity={ui.scene === 'studio' ? 0.15 : 0.02} />

<!-- stage rig -->
<T.SpotLight
	bind:ref={magenta}
	position={[-1.6, 1.6, -0.9]}
	angle={0.42}
	penumbra={0.7}
	decay={1.2}
	distance={8}
	color="#ff2d95"
	intensity={0}
/>
<T.SpotLight
	bind:ref={cyan}
	position={[1.7, 1.2, -0.8]}
	angle={0.42}
	penumbra={0.7}
	decay={1.2}
	distance={8}
	color="#2bc4ff"
	intensity={0}
/>
<T.SpotLight
	position={[0.3, 2.6, 2.2]}
	angle={0.3}
	penumbra={0.9}
	decay={1.0}
	distance={8}
	color="#ffe9cf"
	intensity={ui.scene === 'stage' ? 9 : 0}
/>

{#if ui.scene === 'stage'}
	<StageBeams />
	<Sparkles
		count={160}
		size={2.2}
		scale={[2.2, 1.8, 1.4]}
		speed={0.15}
		opacity={0.5}
		color="#ffd1ea"
	/>
{/if}

<Guitar {model} />

<ContactShadows
	position.y={-0.64}
	scale={2.2}
	blur={2.6}
	opacity={ui.scene === 'studio' ? 0.55 : 0.8}
	far={1.2}
	resolution={512}
	color="#12040f"
/>