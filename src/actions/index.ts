import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import {
	addNameEntry,
	deleteNameEntry,
	getStoredNames,
	setNameEntryDisabled,
} from "@/pocket";

const keySchema = z.string().trim().min(1, "Name key is required");

function toActionError(error: unknown): ActionError {
	return new ActionError({
		code: "BAD_REQUEST",
		message: error instanceof Error ? error.message : "Unable to update names",
	});
}

export const server = {
	listNames: defineAction({
		handler: async () => getStoredNames(),
	}),
	addName: defineAction({
		input: z.object({
			key: keySchema,
			value: z.string().trim().min(1, "Name value is required"),
		}),
		handler: async (input) => {
			try {
				return await addNameEntry(input);
			} catch (error) {
				throw toActionError(error);
			}
		},
	}),
	deleteName: defineAction({
		input: z.object({
			key: keySchema,
		}),
		handler: async ({ key }) => deleteNameEntry(key),
	}),
	setNameDisabled: defineAction({
		input: z.object({
			key: keySchema,
			disabled: z.boolean(),
		}),
		handler: async (input) => setNameEntryDisabled(input),
	}),
};
