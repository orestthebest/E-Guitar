<script>
	import Choice from './Choice.svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { STICKERS, stickerCanvas, STICKER_PRICE } from '../stickers.js';
	import {
		config,
		ui,
		total,
		euro,
		FINISHES,
		SURFACES,
		STYLES,
		HEADSTOCKS,
		BOARDS,
		INLAYS,
		TAILPIECES,
		HARDWARE,
		PICKUPS,
		GUARDS,
		KNOBS,
		TAB_VIEW
	} from '../config.svelte.js';

	const TABS = [
		{ id: 'body', label: 'Body' },
		{ id: 'neck', label: 'Neck' },
		{ id: 'hardware', label: 'Hardware' },
		{ id: 'electronics', label: 'Pickups' },
		{ id: 'stickers', label: 'Stickers' }
	];

	const go = (v) => (ui.view = v);

	// animated price
	const price = new Tween(total(config), { duration: 500, easing: cubicOut });
	$effect(() => {
		price.target = total(config);
	});

	// sticker thumbnails (drawn once the display font is ready)
	let thumbs = $state({});
	$effect(() => {
		document.fonts.load('800 40px "Unbounded Variable"').finally(() => {
			const t = {};
			for (const st of STICKERS) t[st.id] = stickerCanvas(st.id).toDataURL();
			thumbs = t;
		});
	});
	const arm = (id) => {
		ui.stickerTool = ui.stickerTool === id ? null : id;
		if (ui.stickerTool) {
			ui.explode = false;
			go('stickers');
		}
	};

	const customShape = $derived(config.shoulders > 0.05 || config.wings > 0.05);
	const pill = 'rounded-full bg-velvet-2 px-3.5 py-2 disabled:cursor-default disabled:opacity-40';
</script>

{#snippet slider(label, min, max, step, left, right, bind_get, bind_set)}
	<label class="mb-2.5 grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-0.5">
		<span>{label}</span>
		<input
			type="range"
			{min}
			{max}
			{step}
			bind:value={bind_get, bind_set}
			onpointerdown={() => go('full')}
		/>
		<small class="col-start-2 -mt-1 flex justify-between text-xs text-dust">
			<span>{left}</span><span>{right}</span>
		</small>
	</label>
{/snippet}

<aside
	class="fixed top-[76px] right-4 bottom-4 z-10 grid w-[min(420px,34vw)] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[22px] glass max-[900px]:top-auto max-[900px]:right-2 max-[900px]:bottom-2 max-[900px]:left-2 max-[900px]:h-[46vh] max-[900px]:w-auto"
	aria-label="Build options"
>
	<div class="grid grid-cols-5 gap-1 border-b border-bone/12 p-1.5" role="tablist">
		{#each TABS as t (t.id)}
			<button
				role="tab"
				aria-selected={ui.tab === t.id}
				class={[
					'rounded-[14px] px-0.5 py-2.5 text-sm font-semibold',
					ui.tab === t.id ? 'bg-velvet-2 text-bone' : 'text-dust'
				]}
				onclick={() => {
					ui.tab = t.id;
					if (t.id !== 'stickers') ui.stickerTool = null;
					go(TAB_VIEW[t.id]);
				}}
			>
				{t.label}
			</button>
		{/each}
	</div>

	<div class="[scrollbar-width:thin] overflow-y-auto px-5 pt-4 pb-1.5">
		{#if ui.tab === 'body'}
			<Choice
				title="Finish"
				options={FINISHES}
				bind:value={config.finish}
				swatches
				onpick={() => go('full')}
			/>
			{#if config.finish === 'custom'}
				<label class="-mt-1.5 mb-4 flex items-center gap-3">
					<input
						type="color"
						class="h-8 w-[42px] cursor-pointer border-0 bg-transparent p-0"
						bind:value={config.custom}
					/>
					<span>Pick any colour</span>
					<code class="text-dust">{config.custom}</code>
				</label>
			{/if}
			<Choice title="Surface" options={SURFACES} bind:value={config.surface} />
			<Choice
				title="Layout"
				options={STYLES}
				bind:value={config.style}
				onpick={() => go('controls')}
			/>
			<fieldset class="pb-4">
				<legend class="flex w-full justify-between pb-2 font-semibold">
					<span>Body shape</span>
					<span class="font-normal text-dust">
						{customShape ? 'Custom +' + euro(250) : "Classic '67"}
					</span>
				</legend>
				{@render slider(
					'Shoulders',
					0,
					1,
					0.01,
					"'67",
					"'58",
					() => config.shoulders,
					(v) => (config.shoulders = v)
				)}
				{@render slider(
					'Wings',
					0,
					1,
					0.01,
					'Classic',
					'Sharp',
					() => config.wings,
					(v) => (config.wings = v)
				)}
			</fieldset>
			<Choice title="Pickguard" options={GUARDS} bind:value={config.guard} swatches />
		{:else if ui.tab === 'neck'}
			<Choice
				title="Headstock"
				options={HEADSTOCKS}
				bind:value={config.headstock}
				onpick={() => go('headstock')}
			/>
			<Choice
				title="Fretboard"
				options={BOARDS}
				bind:value={config.board}
				swatches
				onpick={() => go('neck')}
			/>
			<Choice
				title="Inlays"
				options={INLAYS}
				bind:value={config.inlays}
				onpick={() => go('neck')}
			/>
			<fieldset class="pb-4">
				<legend class="flex w-full justify-between pb-2 font-semibold">
					<span>Binding</span>
					<span class="font-normal text-dust">
						{config.binding ? 'Cream binding +' + euro(120) : 'None'}
					</span>
				</legend>
				<button
					class="group inline-flex items-center gap-2.5"
					role="switch"
					aria-checked={config.binding}
					onclick={() => {
						config.binding = !config.binding;
						go('neck');
					}}
				>
					<i
						class={[
							'relative h-6 w-10 rounded-full transition-colors after:absolute after:top-[3px] after:left-[3px] after:size-[18px] after:rounded-full after:bg-bone after:transition-transform',
							config.binding ? 'bg-plush after:translate-x-4' : 'bg-velvet-2'
						]}
					></i>
					{config.binding ? 'On' : 'Off'}
				</button>
			</fieldset>
		{:else if ui.tab === 'hardware'}
			<Choice
				title="Hardware"
				options={HARDWARE}
				bind:value={config.hardware}
				swatches
				onpick={() => go('bridge')}
			/>
			<Choice
				title="Tailpiece"
				options={TAILPIECES}
				bind:value={config.tail}
				onpick={() => go('bridge')}
			/>
			<Choice
				title="Knobs"
				options={KNOBS}
				bind:value={config.knobs}
				swatches
				onpick={() => go('controls')}
			/>
		{:else if ui.tab === 'electronics'}
			<Choice
				title="Pickups"
				options={PICKUPS}
				bind:value={config.pickups}
				onpick={() => go('pickups')}
			/>
			<p class="text-dust">
				Two humbuckers, two volumes, one tone and a three-way switch, as on the original.
			</p>
		{:else}
			<fieldset class="pb-4">
				<legend class="flex w-full justify-between pb-2 font-semibold">
					<span>Stickers</span>
					<span class="font-normal text-dust">
						{config.stickers.length
							? `${config.stickers.length} placed +${euro(config.stickers.length * STICKER_PRICE)}`
							: `${euro(STICKER_PRICE)} each`}
					</span>
				</legend>
				<div class="grid grid-cols-5 gap-1.5">
					{#each STICKERS as st (st.id)}
						<button
							class={[
								'grid aspect-square place-items-center rounded-[14px] border-2 p-1.5 transition-transform hover:scale-105 hover:-rotate-4',
								ui.stickerTool === st.id
									? 'border-plush bg-plush/15'
									: 'border-transparent bg-velvet-2'
							]}
							aria-pressed={ui.stickerTool === st.id}
							title={st.label}
							onclick={() => arm(st.id)}
						>
							{#if thumbs[st.id]}
								<img
									src={thumbs[st.id]}
									alt={st.label}
									class="size-full object-contain drop-shadow-[0_2px_3px_rgb(0_0_0/0.4)]"
								/>
							{/if}
						</button>
					{/each}
				</div>
				<p class="mt-3 text-sm text-dust">
					{#if ui.stickerTool}Click anywhere on the body to stick it. Each one lands with a slightly
						different tilt.
					{:else}Pick a sticker, then click on the body to place it. You can rotate the guitar to
						reach the back.{/if}
				</p>
			</fieldset>
			{@render slider(
				'Size',
				0.035,
				0.13,
				0.005,
				'Small',
				'Large',
				() => ui.stickerSize,
				(v) => (ui.stickerSize = v)
			)}
			<div class="mt-1.5 flex flex-wrap gap-1.5">
				{#if ui.stickerTool}
					<button class="{pill} bg-plush! text-white" onclick={() => (ui.stickerTool = null)}>
						Done placing
					</button>
				{/if}
				<button
					class={pill}
					disabled={!config.stickers.length}
					onclick={() => config.stickers.pop()}
				>
					Undo last
				</button>
				<button
					class={pill}
					disabled={!config.stickers.length}
					onclick={() => (config.stickers = [])}
				>
					Remove all
				</button>
			</div>
		{/if}
	</div>

	<footer
		class="flex items-center justify-between gap-4 border-t border-bone/12 bg-case/50 px-5 py-4"
	>
		<div class="grid">
			<span class="text-sm text-dust">Your build</span>
			<strong
				class="font-display text-2xl font-semibold text-korina tabular-nums max-[900px]:text-xl"
			>
				{euro(Math.round(price.current))}
			</strong>
		</div>
		<button
			class="rounded-full bg-plush px-5 py-3 font-bold text-white hover:brightness-110"
			onclick={() => (ui.summary = true)}
		>
			Review build
		</button>
	</footer>
</aside>