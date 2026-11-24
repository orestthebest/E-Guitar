<script>
	import { ui, VIEWS, config, encode, toast } from '../config.svelte.js';
	import { actions } from '../bus.svelte.js';

	async function share() {
		const url = `${location.origin}${location.pathname}#b=${encode(config)}`;
		history.replaceState(null, '', url);
		try {
			await navigator.clipboard.writeText(url);
			toast('Link copied. Anyone with it sees this exact build.');
		} catch {
			toast('Link is in the address bar, copy it from there.');
		}
	}

	function toggleExplode() {
		ui.explode = !ui.explode;
		ui.view = ui.explode ? 'explode' : 'full';
	}

	async function shot() {
		const data = await actions.screenshot();
		if (!data) return;
		const a = document.createElement('a');
		a.href = data;
		a.download = `nova-flying-v-${Date.now()}.png`;
		a.click();
		toast('Screenshot saved');
	}

	const icon = 'glass grid size-10 place-items-center rounded-full';
	const svg =
		'size-5 fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]';
</script>

<header class="fixed top-4 right-4 left-4 z-[12] flex h-12 items-center gap-4">
	<button
		class="flex items-center gap-2 font-display font-bold tracking-wide"
		onclick={() => (ui.mode = 'hero')}
		aria-label="Back to start"
	>
		<svg viewBox="0 0 32 32" class="w-[22px] fill-plush" aria-hidden="true">
			<path d="M16 30 L3 3 L11 3 L16 16 L21 3 L29 3 Z" />
		</svg>
		<span>NOVA</span>
	</button>

	<nav
		class="mx-auto flex max-w-[calc(100vw-min(420px,34vw)-420px)] [scrollbar-width:none] gap-0.5 overflow-x-auto rounded-full glass p-1 max-[900px]:fixed max-[900px]:top-[72px] max-[900px]:right-2 max-[900px]:left-2 max-[900px]:m-0 max-[900px]:max-w-none"
		aria-label="Camera views"
	>
		{#each Object.entries(VIEWS).filter(([id]) => id !== 'explode') as [id, v] (id)}
			<button
				class={[
					'rounded-full px-3.5 py-2 whitespace-nowrap',
					ui.view === id ? 'bg-bone font-semibold text-case' : 'text-dust'
				]}
				onclick={() => {
					ui.view = id;
					ui.explode = false;
				}}
			>
				{v.label}
			</button>
		{/each}
	</nav>

	<div class="ml-auto flex items-center gap-1.5">
		<div
			class="flex rounded-full glass p-[3px] max-[900px]:hidden"
			role="radiogroup"
			aria-label="Scene"
		>
			{#each [['studio', 'Studio'], ['stage', 'Stage']] as [id, label] (id)}
				<button
					role="radio"
					aria-checked={ui.scene === id}
					class={[
						'rounded-full px-3 py-1.5',
						ui.scene === id ? 'bg-velvet-2 text-bone' : 'text-dust'
					]}
					onclick={() => (ui.scene = id)}
				>
					{label}
				</button>
			{/each}
		</div>

		<button
			class={[
				'flex h-10 items-center gap-2 rounded-full border px-3.5 max-[1250px]:w-10 max-[1250px]:justify-center max-[1250px]:px-0',
				ui.explode ? 'border-transparent bg-plush text-white' : 'glass text-dust'
			]}
			aria-pressed={ui.explode}
			title="Exploded view (X)"
			onclick={toggleExplode}
		>
			<svg
				viewBox="0 0 24 24"
				class="size-[18px] fill-none stroke-current stroke-[1.7] [stroke-linecap:round]"
			>
				<path
					d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"
				/>
				<rect x="9.5" y="9.5" width="5" height="5" rx="1" />
			</svg>
			<span class="max-[1250px]:hidden">Exploded view</span>
		</button>

		<button
			class={[icon, ui.turntable ? 'border-plush/60! text-bone' : 'text-dust']}
			aria-pressed={ui.turntable}
			title="Turntable"
			onclick={() => (ui.turntable = !ui.turntable)}
		>
			<svg viewBox="0 0 24 24" class={svg}><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4" /></svg>
		</button>
		<button
			class={[icon, ui.sound ? 'border-plush/60! text-bone' : 'text-dust']}
			aria-pressed={ui.sound}
			title={ui.sound ? 'Sound on' : 'Sound off'}
			onclick={() => (ui.sound = !ui.sound)}
		>
			<svg viewBox="0 0 24 24" class={svg}>
				<path d="M4 9h4l5-4v14l-5-4H4z" />
				{#if ui.sound}<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />{:else}<path
						d="M16 9l5 6M21 9l-5 6"
					/>{/if}
			</svg>
		</button>
		<button class="{icon} text-dust" title="Copy share link" onclick={share}>
			<svg viewBox="0 0 24 24" class={svg}>
				<path
					d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"
				/>
			</svg>
		</button>
		<button class="{icon} text-dust" title="Save screenshot" onclick={shot}>
			<svg viewBox="0 0 24 24" class={svg}>
				<path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
			</svg>
		</button>
	</div>
</header>