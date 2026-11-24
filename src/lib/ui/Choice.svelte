<script>
	import { euro } from '../config.svelte.js';

	/** One option group: pill buttons, or round swatches when `swatches` is set. */
	let { title, options, value = $bindable(), swatches = false, onpick } = $props();
	const current = $derived(options.find((o) => o.id === value));
</script>

<fieldset class="min-w-0 pb-4">
	<legend class="flex w-full justify-between gap-4 pb-2 font-semibold">
		<span>{title}</span>
		<span class="text-right font-normal text-dust">
			{current?.label}{#if current?.price}<em class="text-korina not-italic">
					+{euro(current.price)}
				</em>{/if}
		</span>
	</legend>

	<div class="flex flex-wrap gap-1.5">
		{#each options as o (o.id)}
			{@const on = o.id === value}
			<button
				type="button"
				aria-pressed={on}
				title={o.note ? `${o.label}: ${o.note}` : o.label}
				onclick={() => {
					value = o.id;
					onpick?.(o.id);
				}}
				class={swatches
					? ['rounded-full border-2 p-[3px]', on ? 'border-plush' : 'border-transparent']
					: [
							'rounded-full border px-3 py-2 transition-colors',
							on
								? 'border-transparent bg-plush text-white'
								: 'border-transparent bg-velvet-2 hover:border-bone/25'
						]}
			>
				{#if swatches}
					<i
						class="block size-[30px] rounded-full bg-cover shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18),inset_-6px_-8px_12px_rgb(0_0_0/0.35)]"
						style="background:{o.swatch ??
							'conic-gradient(#e0358f, #e8b96a, #6fd3a5, #5f8fb0, #8a4fd0, #e0358f)'}"
					></i>
					<span class="sr-only">{o.label}</span>
				{:else}
					{o.label}
				{/if}
			</button>
		{/each}
	</div>

	{#if current?.note && !swatches}
		<p class="mt-2 text-sm text-dust">{current.note}</p>
	{/if}
</fieldset>