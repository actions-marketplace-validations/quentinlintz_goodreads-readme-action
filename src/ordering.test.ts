import { describe, expect, test } from "vitest";
import { orderShelf, SortChoice } from "./ordering.js";

const bookOne = {
  title: "Book 1",
  author_name: "Author 1",
  book_id: 1,
  user_rating: 5,
  user_date_added: 100,
  user_read_at: 100,
};
const bookTwo = {
  title: "Book 2",
  author_name: "Author 2",
  book_id: 2,
  user_rating: 3,
  user_date_added: 200,
  user_read_at: 200,
};

describe("orderShelf", () => {
  test("orders by defaults (sort = DateAdded & limit = 10)", () => {
    const orderedShelf = orderShelf([
      { ...bookOne, user_read_at: 300 },
      bookTwo,
      bookOne,
      bookTwo,
      bookOne,
      bookTwo,
      bookOne,
      bookTwo,
      bookOne,
      bookTwo,
      bookOne,
      bookTwo,
      bookOne,
      bookTwo,
    ]);
    expect(orderedShelf.length).toBe(10);
    expect(orderedShelf).toStrictEqual([
      bookTwo,
      bookTwo,
      bookTwo,
      bookTwo,
      bookTwo,
      bookTwo,
      bookTwo,
      { ...bookOne, user_read_at: 300 },
      bookOne,
      bookOne,
    ]);
  });

  test("sorts by user_read_at", () => {
    const orderedShelf = orderShelf(
      [{ ...bookOne, user_date_added: 300 }, bookTwo],
      SortChoice.DateRead,
    );
    expect(orderedShelf.length).toBe(2);
    expect(orderedShelf).toStrictEqual([
      bookTwo,
      { ...bookOne, user_date_added: 300 },
    ]);
  });

  test("sorts by user_date_added", () => {
    const orderedShelf = orderShelf(
      [{ ...bookOne, user_read_at: 300 }, bookTwo],
      SortChoice.DateAdded,
    );
    expect(orderedShelf.length).toBe(2);
    expect(orderedShelf).toStrictEqual([
      bookTwo,
      { ...bookOne, user_read_at: 300 },
    ]);
  });

  test("handles ties for user_date_added", () => {
    const orderedShelf = orderShelf(
      [{ ...bookTwo, title: "Book 3", user_read_at: 50 }, bookOne, bookTwo],
      SortChoice.DateAdded,
    );
    expect(orderedShelf.length).toBe(3);
    expect(orderedShelf).toStrictEqual([
      { ...bookTwo, title: "Book 3", user_read_at: 50 },
      bookTwo,
      bookOne,
    ]);
  });

  test("handles ties for user_read_at", () => {
    const orderedShelf = orderShelf(
      [{ ...bookTwo, title: "Book 3", user_date_added: 50 }, bookOne, bookTwo],
      SortChoice.DateRead,
    );
    expect(orderedShelf.length).toBe(3);
    expect(orderedShelf).toStrictEqual([
      { ...bookTwo, title: "Book 3", user_date_added: 50 },
      bookTwo,
      bookOne,
    ]);
  });

  test("handles empty shelf", () => {
    const orderedShelf = orderShelf([], SortChoice.DateAdded);
    expect(orderedShelf.length).toBe(0);
  });

  test("limits after sorting", () => {
    const orderedShelf = orderShelf(
      [bookOne, bookTwo],
      SortChoice.DateAdded,
      1,
    );
    expect(orderedShelf.length).toBe(1);
    expect(orderedShelf).toStrictEqual([bookTwo]);
  });

  test("preserves the input", () => {
    const originalShelf = [bookOne, bookTwo];
    const orderedShelf = orderShelf(originalShelf);
    expect(orderedShelf.length).toBe(2);
    expect(orderedShelf).toStrictEqual([bookTwo, bookOne]);
    expect(originalShelf).toStrictEqual([bookOne, bookTwo]);
  });

  test("undefined user_date_added sorted last", () => {
    const orderedShelf = orderShelf(
      [
        { ...bookTwo, title: "Book 3", user_date_added: undefined },
        { ...bookTwo, user_date_added: undefined },
        bookTwo,
      ],
      SortChoice.DateAdded,
    );
    expect(orderedShelf.length).toBe(3);
    expect(orderedShelf).toStrictEqual([
      bookTwo,
      { ...bookTwo, title: "Book 3", user_date_added: undefined },
      { ...bookTwo, user_date_added: undefined },
    ]);
  });

  test("undefined user_read_at sorted last", () => {
    const orderedShelf = orderShelf(
      [
        { ...bookTwo, title: "Book 3", user_read_at: undefined },
        { ...bookTwo, user_read_at: undefined },
        bookTwo,
      ],
      SortChoice.DateRead,
    );
    expect(orderedShelf.length).toBe(3);
    expect(orderedShelf).toStrictEqual([
      bookTwo,
      { ...bookTwo, title: "Book 3", user_read_at: undefined },
      { ...bookTwo, user_read_at: undefined },
    ]);
  });

  test("limit out of range", () => {
    expect(() => orderShelf([bookOne], SortChoice.DateAdded, -1)).toThrow(
      "limit must be a positive integer",
    );
  });

  test("limit is a fraction", () => {
    expect(() => orderShelf([bookOne], SortChoice.DateAdded, 1.5)).toThrow(
      "limit must be a positive integer",
    );
  });

  test("limit is NaN", () => {
    expect(() =>
      orderShelf([bookOne], SortChoice.DateAdded, Number.NaN),
    ).toThrow("limit must be a positive integer");
  });

  test("limit is Infinity", () => {
    expect(() => orderShelf([bookOne], SortChoice.DateAdded, Infinity)).toThrow(
      "limit must be a positive integer",
    );
  });
});
