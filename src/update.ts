import fs from "fs";
import path from "path";
import { fetchShelf } from "./fetch.js";
import { parseInputs, type ParseInputsParams } from "./inputs.js";
import { orderShelf } from "./ordering.js";
import { parseXml } from "./parser.js";
import { replaceSection } from "./readme.js";
import { renderShelf } from "./render.js";

export type UpdateReadmeOutput = {
  hasChanged: boolean;
  bookCount: number;
};

export const updateReadme = async (
  params: ParseInputsParams,
): Promise<UpdateReadmeOutput> => {
  const actionConfig = parseInputs(params);
  const { goodreadsId, shelf, readmePath, marker, sort, ratings, limit } =
    actionConfig;

  const readmeFilePath = path.resolve(process.cwd(), readmePath);
  const readmeData = fs.readFileSync(readmeFilePath, "utf-8");
  const fetched = await fetchShelf(goodreadsId, shelf);
  const parsed = parseXml(fetched);
  const ordered = orderShelf(parsed, sort, limit);
  const rendered = renderShelf(ordered, ratings);
  const replaced = replaceSection(readmeData, marker, rendered);

  if (replaced === readmeData) {
    return {
      hasChanged: false,
      bookCount: ordered.length,
    };
  }

  fs.writeFileSync(readmeFilePath, replaced);

  return {
    hasChanged: true,
    bookCount: ordered.length,
  };
};
