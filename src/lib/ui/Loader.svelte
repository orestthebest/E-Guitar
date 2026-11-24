<script>
	import { useProgress } from '@threlte/extras';
	import { fade } from 'svelte/transition';
	import { ui } from '../config.svelte.js';

	const { progress } = useProgress();
	const pct = $derived(Math.round(($progress ?? 0) * 100));
	const V = 'M60 134 L8 8 L36 8 L60 70 L84 8 L112 8 Z';
</script>

{#if !ui.loaded}
	<div
		class="fixed inset-0 z-50 grid place-content-center justify-items-center gap-2.5 bg-studio"
		out:fade={{ duration: 600 }}
		role="status"
		aria-live="polite"
	>
		<!-- the V outline draws itself as the model loads (pathLength normalised to 100) -->
		<svg viewBox="0 0 120 140" class="w-[110px] overflow-visible" aria-hidden="true">
			<path
				d={V}
				pathLength="100"
				class="fill-none stroke-bone/12 stroke-3"
				stroke-linejoin="round"
			/>
			<path
				d={V}
				pathLength="100"
				class="fill-none stroke-plush stroke-3 drop-shadow-[0_0_6px_rgb(224_53_143/0.6)] transition-[stroke-dashoffset] duration-300"
				stroke-linejoin="round"
				stroke-dasharray="100"
				style="stroke-dashoffset:{100 - pct}"
			/>
		</svg>
		<p class="mt-2.5 font-display text-4xl font-semibold tabular-nums">
			{pct}<span class="ml-0.5 text-base text-dust">%</span>
		</p>
		<p class="text-dust">Loading your Flying V</p>
	</div>
{/if}