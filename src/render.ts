import type { Book } from "./parser.js";

const escapeMarkdownText = (text: string): string => {
  return text
    .replace(/\r\n?|\n/g, " ")
    .replace(/([\\`*_{}[\]()#+\-.!<>&~|])/g, "\\$1")
    .trim();
};

export const renderShelf = (
  shelf: Book[],
  showRating: boolean = false,
): string => {
  if (shelf.length === 0) {
    return "Shelf is empty\n";
  }

  const lines: string[] = [];
  shelf.forEach((book) => {
    const title = escapeMarkdownText(book.title);
    const authorName = escapeMarkdownText(book.author_name);
    const stars =
      showRating && book.user_rating !== 0
        ? "★".repeat(book.user_rating) + "☆".repeat(5 - book.user_rating)
        : "";
    lines.push(
      `- [${title}](https://www.goodreads.com/book/show/${book.book_id}), ${authorName} ${stars}`.trim(),
    );
  });

  return lines.join("\n") + "\n";
};
