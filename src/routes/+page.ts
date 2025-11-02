import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	return {
		draftlist: await fetch(`/api/v1/catch-em-all`).then(res => res.json())
	};
};