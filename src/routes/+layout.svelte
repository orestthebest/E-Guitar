<script>
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>NOVA Flying V builder</title>
	<meta
		name="description"
		content="Build your own Flying V in 3D: finish, hardware, pickups, body shape and headstock."
	/>
</svelte:head>

{@render children()}