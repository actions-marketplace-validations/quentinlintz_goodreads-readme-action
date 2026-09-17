import fs from "fs";
import path from "path";
import { describe, expect, test } from "vitest";
import { parseXml } from "./parser.js";
import { ZodError } from "zod";

const filePath = path.resolve(process.cwd(), "tests/fixtures/single-book.xml");
const singleBookXmlData = fs.readFileSync(filePath, "utf-8");

describe("parseXml", () => {
  test("parses a single-book shelf", () => {
    const book = parseXml(singleBookXmlData);
    expect(book.title).toBe(
      "Our Oriental Heritage (The Story of Civilization, #1)*",
    );
    expect(book.author_name).toBe("Will Durant");
    expect(book.book_id).toBe(49871725);
    expect(book.user_rating).toBe(3);
    expect(book.user_date_added).toBe("Thu, 20 Aug 2026 05:28:51 -0700");
    expect(book.user_read_at).toBe("Fri, 25 Jul 2025 00:00:00 +0000");
  });

  test("missing title", () => {
    const titleRemoved = singleBookXmlData.replace(
      "<title><![CDATA[Our Oriental Heritage (The Story of Civilization, #1)*]]></title>",
      "",
    );
    try {
      parseXml(titleRemoved);
      expect.fail("parsing should have rejected the missing title");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["rss", "channel", "item", "title"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("mismatched title tags", () => {
    const titleMismatch = singleBookXmlData.replace("</title>", "</wrong>");
    expect(() => parseXml(titleMismatch)).toThrow(
      "Expected closing tag 'title' (opened in line 4, col 9) instead of closing tag 'wrong'.",
    );
  });
});
