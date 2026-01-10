import type { PageServerLoad, Actions } from './$types.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { userFormSchema } from './schema';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(userFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(userFormSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		return {
			form
		};
	}
};
