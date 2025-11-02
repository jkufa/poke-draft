<script lang="ts">
	const BASE_SPRITE_URL = '/pokemon-sprites/pokemon';
	const SHOWDOWN_SPRITE_URL = '/other/showdown';

	const URLS = {
		primary: (id: number) => getImageUrl(`${BASE_SPRITE_URL}${SHOWDOWN_SPRITE_URL}/${id}.gif`),
		fallback: (id: number) => getImageUrl(`${BASE_SPRITE_URL}/${id}.png`)
	} as const;

	function getImageUrl(url: string) {
		return new URL(url, import.meta.url).href;
	}

	interface Props {
		name?: string;
		id?: number;
	}
	let { name, id = 0 }: Props = $props();

	let useFallback = $state(false);
	const url = $derived(useFallback ? URLS.fallback(id) : URLS.primary(id));

	function handleError() {
		useFallback = true;
	}
</script>

<img
	class="render-pixelated h-full w-full object-cover"
	src={url}
	alt={name}
	onerror={handleError}
/>

<style>
	.render-pixelated {
		image-rendering: pixelated;
	}
</style>
