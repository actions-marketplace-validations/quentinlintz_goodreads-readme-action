import fs, { copyFileSync, mkdtempSync, readFileSync, rmSync } from "fs";
import path, { join } from "path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { updateReadme } from "./update.js";
import { tmpdir } from "os";
import { ZodError } from "zod";

const currentlyReadingXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/currently-reading.xml",
);
const validEmptyXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/valid-empty.xml",
);
const malformedXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/malformed.xml",
);
const currentlyReadingXmlData = fs.readFileSync(
  currentlyReadingXmlFilePath,
  "utf-8",
);
const validEmptyXmlData = fs.readFileSync(validEmptyXmlFilePath, "utf-8");
const malformedXmlData = fs.readFileSync(malformedXmlFilePath, "utf-8");

const fixtureFile = join(process.cwd(), "tests/fixtures/README.md");
let tempDir: string;
let tempFile: string;

describe("updateReadme", () => {
  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "my-test-"));
    tempFile = join(tempDir, "readme.md");
    copyFileSync(fixtureFile, tempFile);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(tempDir, {
      recursive: true,
      force: true,
    });
  });

  test("changed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(currentlyReadingXmlData, {
        status: 200,
      }),
    );

    const { hasChanged, bookCount } = await updateReadme({
      goodreadsId: "123",
      readmePath: tempFile,
    });

    expect(hasChanged).toBe(true);
    expect(bookCount).toBe(2);

    expect(readFileSync(tempFile, "utf-8")).toBe(
      readFileSync(
        join(process.cwd(), "tests/fixtures/README.expected.md"),
        "utf-8",
      ),
    );
  });

  test("unchanged", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(currentlyReadingXmlData, {
        status: 200,
      }),
    );

    const { hasChanged, bookCount } = await updateReadme({
      goodreadsId: "123",
      readmePath: tempFile,
    });

    const writeSpy = vi.spyOn(fs, "writeFileSync");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(currentlyReadingXmlData, {
        status: 200,
      }),
    );

    const { hasChanged: hasChangedAgain, bookCount: bookCountAgain } =
      await updateReadme({
        goodreadsId: "123",
        readmePath: tempFile,
      });

    expect(hasChanged).toBe(true);
    expect(hasChangedAgain).toBe(false);
    expect(bookCount).toBe(2);
    expect(bookCountAgain).toBe(2);
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test("empty shelf", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(validEmptyXmlData, {
        status: 200,
      }),
    );

    const { hasChanged, bookCount } = await updateReadme({
      goodreadsId: "123",
      readmePath: tempFile,
    });

    expect(hasChanged).toBe(true);
    expect(bookCount).toBe(0);
    const tempFileData = readFileSync(tempFile, "utf-8");
    expect(tempFileData).toContain("Shelf is empty");
    expect(tempFileData).not.toContain(`
- [The Sea, the Sea](https://www.goodreads.com/book/show/9843479), Iris Murdoch`);
  });

  test("limit 1", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(currentlyReadingXmlData, {
        status: 200,
      }),
    );

    const { hasChanged, bookCount } = await updateReadme({
      goodreadsId: "123",
      readmePath: tempFile,
      limit: "1",
    });

    expect(hasChanged).toBe(true);
    expect(bookCount).toBe(1);
    const tempFileData = readFileSync(tempFile, "utf-8");
    expect(tempFileData).toContain(`
- [Designing Data\\-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems](https://www.goodreads.com/book/show/248156714), Martin Kleppmann`);
    expect(tempFileData).not.toContain(`
- [The Sea, the Sea](https://www.goodreads.com/book/show/9843479), Iris Murdoch`);
  });

  test("fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(currentlyReadingXmlData, {
        status: 500,
      }),
    );

    const writeSpy = vi.spyOn(fs, "writeFileSync");
    await expect(
      updateReadme({
        goodreadsId: "123",
        readmePath: tempFile,
      }),
    ).rejects.toThrow("HTTP error! Status: 500");
    expect(readFileSync(tempFile, "utf-8")).toEqual(
      readFileSync(join(process.cwd(), "tests/fixtures/README.md"), "utf-8"),
    );
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test("write failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(currentlyReadingXmlData, {
        status: 200,
      }),
    );
    vi.spyOn(fs, "writeFileSync").mockImplementation(() => {
      throw new Error("Failed to write");
    });

    await expect(
      updateReadme({
        goodreadsId: "123",
        readmePath: tempFile,
      }),
    ).rejects.toThrow("Failed to write");
    expect(readFileSync(tempFile, "utf-8")).toEqual(
      readFileSync(join(process.cwd(), "tests/fixtures/README.md"), "utf-8"),
    );
  });

  test("invalid xml", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(malformedXmlData, {
        status: 200,
      }),
    );

    const writeSpy = vi.spyOn(fs, "writeFileSync");
    await expect(
      updateReadme({
        goodreadsId: "123",
        readmePath: tempFile,
      }),
    ).rejects.toThrow("Expected closing tag");
    expect(readFileSync(tempFile, "utf-8")).toEqual(
      readFileSync(join(process.cwd(), "tests/fixtures/README.md"), "utf-8"),
    );
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test("missing README", async () => {
    const writeSpy = vi.spyOn(fs, "writeFileSync");
    await expect(
      updateReadme({
        goodreadsId: "123",
        readmePath: `${tempDir}/missing.md`,
      }),
    ).rejects.toThrow(/ENOENT: no such file or directory/);
    expect(readFileSync(tempFile, "utf-8")).toEqual(
      readFileSync(join(process.cwd(), "tests/fixtures/README.md"), "utf-8"),
    );
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test("missing marker", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(currentlyReadingXmlData, {
        status: 200,
      }),
    );
    const writeSpy = vi.spyOn(fs, "writeFileSync");
    await expect(
      updateReadme({
        goodreadsId: "123",
        readmePath: tempFile,
        marker: "***",
      }),
    ).rejects.toThrow("marker must exist only once in README");
    expect(readFileSync(tempFile, "utf-8")).toEqual(
      readFileSync(join(process.cwd(), "tests/fixtures/README.md"), "utf-8"),
    );
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test("invalid input", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(currentlyReadingXmlData, {
        status: 200,
      }),
    );
    const writeSpy = vi.spyOn(fs, "writeFileSync");
    try {
      await updateReadme({
        goodreadsId: "123abc",
        readmePath: tempFile,
      });
      expect.fail(`inputs should have rejected goodreadsId "123abc"`);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["goodreadsId"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
    expect(readFileSync(tempFile, "utf-8")).toEqual(
      readFileSync(join(process.cwd(), "tests/fixtures/README.md"), "utf-8"),
    );
    expect(writeSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
