import { type Book } from "./parser.js";

export enum SortChoice {
  DateAdded = "user_date_added",
  DateRead = "user_read_at",
}

export const orderShelf = (
  shelf: Book[],
  sort: SortChoice = SortChoice.DateAdded,
  limit: number = 10,
): Book[] => {
  if (limit < 1 || !Number.isInteger(limit) || Number.isNaN(limit)) {
    throw new Error("limit must be a positive integer");
  }

  const orderedShelf = [...shelf];
  if (orderedShelf.length === 0) {
    return shelf;
  }

  orderedShelf.sort((a, b) => {
    if (sort === SortChoice.DateAdded) {
      if (a.user_date_added === b.user_date_added) return 0;
      const bookA = a.user_date_added ?? -Infinity;
      const bookB = b.user_date_added ?? -Infinity;
      return bookB - bookA;
    } else if (sort === SortChoice.DateRead) {
      if (a.user_read_at === b.user_read_at) return 0;
      const bookA = a.user_read_at ?? -Infinity;
      const bookB = b.user_read_at ?? -Infinity;
      return bookB - bookA;
    } else {
      throw new Error("sort method not supported");
    }
  });

  return orderedShelf.slice(0, limit);
};
