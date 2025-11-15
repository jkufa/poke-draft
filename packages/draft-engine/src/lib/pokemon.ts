import z from "zod";

export const Pokemon = z.object({
  id: z.string(),
  name: z.string(),
});
export type Pokemon = z.infer<typeof Pokemon>;