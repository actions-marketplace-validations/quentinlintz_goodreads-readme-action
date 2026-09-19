import fs from "fs";
import path from "path";
import { describe, expect, test } from "vitest";
import { parseXml } from "./parser.js";
import { orderShelf, SortChoice } from "./ordering.js";
import { renderShelf } from "./render.js";

const currentlyReadingXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/currently-reading.xml",
);
const singleBookXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/single-book.xml",
);
const readXmlFilePath = path.resolve(process.cwd(), "tests/fixtures/read.xml");
const validEmptyXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/valid-empty.xml",
);

const currentlyReadingMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/currently-reading.expected.md",
);
const singleBookMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/single-book.expected.md",
);
const readMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/read.expected.md",
);
const validEmptyMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/valid-empty.expected.md",
);

const currentlyReadingXmlData = fs.readFileSync(
  currentlyReadingXmlFilePath,
  "utf-8",
);
const singleBookXmlData = fs.readFileSync(singleBookXmlFilePath, "utf-8");
const readXmlData = fs.readFileSync(readXmlFilePath, "utf-8");
const validEmptyXmlData = fs.readFileSync(validEmptyXmlFilePath, "utf-8");

const currentlyReadingRendered = fs.readFileSync(
  currentlyReadingMarkdownFilePath,
  "utf-8",
);
const singleBookRendered = fs.readFileSync(singleBookMarkdownFilePath, "utf-8");
const readRendered = fs.readFileSync(readMarkdownFilePath, "utf-8");
const validEmptyRendered = fs.readFileSync(validEmptyMarkdownFilePath, "utf-8");

const pipeline = (
  xml: string,
  sort: SortChoice = SortChoice.DateAdded,
  limit: number = 10,
  rating: boolean = false,
): string => {
  const shelfData = parseXml(xml);
  const orderedShelf = orderShelf(shelfData, sort, limit);
  return renderShelf(orderedShelf, rating);
};

describe("full pipeline", () => {
  test("currently reading shelf sorted by date added, limit 10, ratings on", () => {
    expect(
      pipeline(currentlyReadingXmlData, SortChoice.DateAdded, 10, true),
    ).toBe(currentlyReadingRendered.replace(/\n$/, ""));
  });

  test("read shelf sorted by date read, limit 6, ratings on", () => {
    expect(pipeline(readXmlData, SortChoice.DateRead, 6, true)).toBe(
      readRendered.replace(/\n$/, ""),
    );
  });

  test("single book shelf sorted by date added, limit 1, ratings off", () => {
    expect(pipeline(singleBookXmlData, SortChoice.DateAdded, 1, false)).toBe(
      singleBookRendered.replace(/\n$/, ""),
    );
  });

  test("valid empty shelf, all defaults", () => {
    expect(pipeline(validEmptyXmlData)).toBe(
      validEmptyRendered.replace(/\n$/, ""),
    );
  });
});
