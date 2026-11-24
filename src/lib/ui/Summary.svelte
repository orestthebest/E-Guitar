<script>
	import { fade, fly } from 'svelte/transition';
	import {
		config,
		ui,
		lineItems,
		total,
		euro,
		BASE_PRICE,
		encode,
		toast
	} from '../config.svelte.js';
	import { actions } from '../bus.svelte.js';

	const items = $derived(lineItems(config));
	let img = $state(null);
	$effect(() => {
		if (ui.summary) actions.screenshot(true).then((d) => (img = d));
	});

	async function copy() {
		const url = `${location.origin}${location.pathname}#b=${encode(config)}`;
		history.replaceState(null, '', url);
		try {
			await navigator.clipboard.writeText(url);
			toast('Link copied');
		} catch {
			toast('Link is in the address bar');
		}
	}
	function save() {
		const a = document.createElement('a');
		a.href = img;
		a.download = 'nova-flying-v.png';
		a.click();
	}
	const onkey = (e) => e.key === 'Escape' && (ui.summary = false);
	const ghost = 'rounded-full border border-bone/25 px-4 py-3';
</script>

<svelte:window onkeydown={onkey} />

{#if ui.summary}
	<div
		class="fixed inset-0 z-30 bg-[#0a0309]/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={() => (ui.summary = false)}
		role="presentation"
	></div>
	<div
		class="fixed inset-[5vh_5vw] z-[31] grid grid-cols-[1fr_minmax(340px,460px)] overflow-hidden rounded-[26px] border border-bone/12 bg-velvet max-[900px]:inset-[2vh_2vw] max-[900px]:grid-cols-1 max-[900px]:grid-rows-[32vh_1fr]"
		role="dialog"
		aria-modal="true"
		aria-labelledby="sum-title"
		transition:fly={{ y: 30, duration: 300 }}
	>
		<div class="grid place-items-center overflow-hidden bg-studio">
			{#if img}<img
					src={img}
					alt="Your configured Flying V"
					class="size-full object-contain"
				/>{/if}
		</div>

		<div class="flex flex-col overflow-y-auto px-8 pt-8 pb-6">
			<h2 id="sum-title" class="font-display text-3xl leading-tight font-bold">Your Flying V</h2>
			<p class="mt-1.5 mb-6 text-dust">Build sheet, ready to share or hand to the luthier.</p>

			<dl>
				{#each [{ group: 'Base guitar', label: 'Flying V, mahogany, two humbuckers', price: BASE_PRICE, base: true }, ...items] as it (it.group)}
					<div class="grid grid-cols-[7.5rem_1fr] border-b border-bone/12 py-2">
						<dt class="text-dust">{it.group}</dt>
						<dd class="flex justify-between gap-4">
							<span>{it.label}</span>
							<b class="font-medium whitespace-nowrap text-korina tabular-nums">
								{it.base ? euro(it.price) : it.price ? '+' + euro(it.price) : 'included'}
							</b>
						</dd>
					</div>
				{/each}
			</dl>

			<div class="my-5 flex items-baseline justify-between">
				<span>Total</span>
				<strong class="font-display text-3xl text-korina">{euro(total(config))}</strong>
			</div>

			<div class="mt-auto flex flex-wrap gap-2">
				<button class={ghost} onclick={() => (ui.summary = false)}>Keep building</button>
				<button class={ghost} onclick={copy}>Copy share link</button>
				{#if img}
					<button class="rounded-full bg-plush px-5 py-3 font-bold text-white" onclick={save}>
						Save picture
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}