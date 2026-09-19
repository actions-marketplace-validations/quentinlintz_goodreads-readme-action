import { describe, expect, test } from "vitest";
import { replaceSection } from "./readme.js";
import { renderShelf } from "./render.js";

const marker = "GOODREADS";
const readme = `
## About me

Example about section

<!-- GOODREADS:START -->
Something is here already
<!-- GOODREADS:END -->

<!-- READ:START -->
Read section
<!-- READ:END -->

## Section
`;

describe("replaceSection", () => {
  test("replaces in markdown", () => {
    const content = "New content";
    const expected = readme.replace("Something is here already", content);
    const replaced = replaceSection(readme, marker, content);
    expect(replaced).toBe(expected);
  });

  test("repeated replacement", () => {
    const content = "Replaced";
    const replaced = replaceSection(readme, marker, content);
    const replacedAgain = replaceSection(replaced, marker, content);
    expect(replacedAgain).toBe(replaced);
  });

  test("empty shelf", () => {
    const expected = readme.replace(
      "Something is here already",
      "Shelf is empty",
    );
    const replaced = replaceSection(readme, marker, renderShelf([]));
    expect(replaced).toBe(expected);
  });

  test("marker empty", () => {
    expect(() => replaceSection(readme, "", "")).toThrow(
      "marker must not be empty",
    );
  });

  test("marker not found", () => {
    expect(() => replaceSection(readme, "Something", "")).toThrow(
      "marker must exist only once in README",
    );
  });

  test("marker missing start", () => {
    const missingStartReadme = readme.replace("<!-- GOODREADS:START -->", "");
    expect(() => replaceSection(missingStartReadme, marker, "")).toThrow(
      "marker must exist only once in README",
    );
  });

  test("marker missing end", () => {
    const missingEndReadme = readme.replace("<!-- GOODREADS:END -->", "");
    expect(() => replaceSection(missingEndReadme, marker, "")).toThrow(
      "marker must exist only once in README",
    );
  });

  test("marker out of order", () => {
    const outOfOrderReadme = `
<!-- GOODREADS:END -->
Something is here already
<!-- GOODREADS:START -->
`;
    expect(() => replaceSection(outOfOrderReadme, marker, "")).toThrow(
      "start marker must appear before end marker",
    );
  });

  test("marker start duplicated", () => {
    const outOfOrderReadme = `
<!-- GOODREADS:START -->
<!-- GOODREADS:START -->
Something is here already
<!-- GOODREADS:END -->
`;
    expect(() => replaceSection(outOfOrderReadme, marker, "")).toThrow(
      "marker must exist only once in README",
    );
  });

  test("marker end duplicated", () => {
    const outOfOrderReadme = `
<!-- GOODREADS:START -->
Something is here already
<!-- GOODREADS:END -->
<!-- GOODREADS:END -->
`;
    expect(() => replaceSection(outOfOrderReadme, marker, "")).toThrow(
      "marker must exist only once in README",
    );
  });
});
