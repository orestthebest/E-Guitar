<script>
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';

	// soft volumetric-looking light cones for the stage scene
	const mat = (hex) =>
		new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			uniforms: { uColor: { value: new THREE.Color(hex) }, uTime: { value: 0 } },
			vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
				void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
			fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
				void main(){ float along = pow(vUv.y, 1.6); float edge = pow(abs(dot(vN, vV)), 1.4);
				float flick = 0.9 + 0.1*sin(uTime*1.7 + vUv.y*6.0);
				gl_FragColor = vec4(uColor * along * edge * 0.32 * flick, 1.0); }`
		});
	const beams = [
		{ from: new THREE.Vector3(-1.6, 1.6, -0.9), m: mat('#ff2d95') },
		{ from: new THREE.Vector3(1.7, 1.2, -0.8), m: mat('#2bc4ff') }
	];
	const geo = new THREE.CylinderGeometry(0.03, 0.75, 3.4, 48, 1, true);
	geo.translate(0, -1.7, 0); // apex at origin, opening along -Y
	const groups = $state([]);
	let t = 0;
	useTask((dt) => {
		t += dt;
		beams.forEach((b, i) => {
			b.m.uniforms.uTime.value = t;
			const g = groups[i];
			if (!g) return;
			const target = new THREE.Vector3(Math.sin(t * (0.5 - i * 0.07)) * 0.25, i ? 0.1 : -0.1, 0);
			g.position.copy(b.from);
			const dir = target.sub(b.from).normalize();
			g.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
		});
	});
</script>

{#each beams as b, i (i)}
	<T.Group bind:ref={groups[i]}>
		<T.Mesh geometry={geo} material={b.m} renderOrder={5} />
	</T.Group>
{/each}