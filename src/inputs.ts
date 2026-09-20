import z from "zod";
import { SortChoice } from "./ordering.js";

const blankToUndefined = (val: unknown) => {
  if (typeof val === "string") {
    return val.trim() === "" ? undefined : val;
  }
  return val;
};

const actionConfigSchema = z.object({
  goodreadsId: z.string().regex(/^\d+$/, "Must contain only numbers"),
  shelf: z.preprocess(
    blankToUndefined,
    z.string().default("currently-reading"),
  ),
  readmePath: z.preprocess(blankToUndefined, z.string().default("README.md")),
  marker: z.preprocess(blankToUndefined, z.string().default("GOODREADS-LIST")),
  sort: z.preprocess(
    blankToUndefined,
    z
      .enum(["date-added", "date-read"])
      .transform((v) =>
        v === "date-added" ? SortChoice.DateAdded : SortChoice.DateRead,
      )
      .default(SortChoice.DateAdded),
  ),
  ratings: z.preprocess(
    blankToUndefined,
    z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .default(false),
  ),
  limit: z.preprocess(
    blankToUndefined,
    z
      .string()
      .regex(/^\d+$/, "Must contain only numbers")
      .transform(Number)
      .pipe(z.number().int().positive())
      .default(10),
  ),
});
type ActionConfig = z.infer<typeof actionConfigSchema>;

type ParseInputsParams = {
  goodreadsId: string;
  shelf?: string;
  readmePath?: string;
  marker?: string;
  sort?: string;
  ratings?: string;
  limit?: string;
};

export const parseInputs = (params: ParseInputsParams): ActionConfig =>
  actionConfigSchema.parse(params);
