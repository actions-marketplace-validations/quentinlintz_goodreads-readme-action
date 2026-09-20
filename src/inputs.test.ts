import { describe, expect, test } from "vitest";
import { parseInputs } from "./inputs.js";
import { ZodError } from "zod";
import { SortChoice } from "./ordering.js";

const goodreadsId = "123";
const defaultActionConfig = {
  goodreadsId,
  limit: 10,
  marker: "GOODREADS-LIST",
  ratings: false,
  readmePath: "README.md",
  shelf: "currently-reading",
  sort: "user_date_added",
};

describe("parseInputs", () => {
  test("defaults", () => {
    expect(
      parseInputs({
        goodreadsId,
      }),
    ).toStrictEqual(defaultActionConfig);
  });

  test("overrides", () => {
    expect(
      parseInputs({
        goodreadsId,
        limit: "5",
        marker: "GOOD",
        ratings: "true",
        readmePath: "README2.md",
        shelf: "read",
        sort: "date-read",
      }),
    ).toStrictEqual({
      goodreadsId,
      limit: 5,
      marker: "GOOD",
      ratings: true,
      readmePath: "README2.md",
      shelf: "read",
      sort: SortChoice.DateRead,
    });
  });

  test("empty optionals", () => {
    expect(
      parseInputs({
        goodreadsId,
        limit: "",
        marker: "",
        ratings: "",
        readmePath: "",
        shelf: "",
        sort: "",
      }),
    ).toStrictEqual(defaultActionConfig);
  });

  test("whitespace optionals", () => {
    expect(
      parseInputs({
        goodreadsId,
        limit: " ",
        marker: " ",
        ratings: " ",
        readmePath: " ",
        shelf: " ",
        sort: " ",
      }),
    ).toStrictEqual(defaultActionConfig);
  });

  test.each(["", " ", "abc", "1.5"])(
    "rejects invalid goodreadsId: %s",
    (goodreadsId) => {
      try {
        parseInputs({
          goodreadsId,
        });

        expect.fail(`inputs should have rejected goodreadsId "${goodreadsId}"`);
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
    },
  );

  test("limit 5", () => {
    expect(
      parseInputs({
        goodreadsId,
        limit: "5",
      }),
    ).toStrictEqual({ ...defaultActionConfig, limit: 5 });
  });

  test.each(["0", "-1", "abc", "1.5", "Infinity", "NaN", "1e2"])(
    "rejects invalid limit: %s",
    (limit) => {
      try {
        parseInputs({
          goodreadsId,
          limit,
        });

        expect.fail(`inputs should have rejected limit "${limit}"`);
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          expect(error.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                path: ["limit"],
              }),
            ]),
          );
        } else {
          throw error;
        }
      }
    },
  );

  test("sort date-read", () => {
    expect(
      parseInputs({
        goodreadsId,
        sort: "date-read",
      }),
    ).toStrictEqual({ ...defaultActionConfig, sort: "user_read_at" });
  });

  test("sort date-added", () => {
    expect(
      parseInputs({
        goodreadsId,
        sort: "date-added",
      }),
    ).toStrictEqual({ ...defaultActionConfig, sort: "user_date_added" });
  });

  test("sort not supported", () => {
    try {
      parseInputs({
        goodreadsId,
        sort: "date-unknown",
      });
      expect.fail("inputs should have rejected the unsupported sort method");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["sort"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("ratings true", () => {
    expect(
      parseInputs({
        goodreadsId,
        ratings: "true",
      }),
    ).toStrictEqual({ ...defaultActionConfig, ratings: true });
  });

  test("ratings false", () => {
    expect(
      parseInputs({
        goodreadsId,
        ratings: "false",
      }),
    ).toStrictEqual({ ...defaultActionConfig, ratings: false });
  });

  test("ratings not boolean", () => {
    try {
      parseInputs({
        goodreadsId,
        ratings: "test",
      });
      expect.fail("inputs should have rejected the non-boolean ratings");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["ratings"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });
});
