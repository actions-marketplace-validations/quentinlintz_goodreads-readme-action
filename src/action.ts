import * as core from "@actions/core";
import { updateReadme } from "./update.js";

export const run = async () => {
  try {
    const goodreadsId = core.getInput("goodreads-user-id", { required: true });
    const shelf = core.getInput("shelf");
    const readmePath = core.getInput("readme-path");
    const marker = core.getInput("section");
    const sort = core.getInput("sort");
    const ratings = core.getInput("show-rating");
    const limit = core.getInput("max-books");

    const { hasChanged, bookCount } = await updateReadme({
      goodreadsId,
      shelf,
      readmePath,
      marker,
      sort,
      ratings,
      limit,
    });

    core.setOutput("changed", hasChanged);
    core.setOutput("book-count", bookCount);
    const updateMessage = hasChanged
      ? "README updated"
      : "README already up to date";
    const booksRenderedMessage =
      bookCount === 0 ? "the shelf is empty" : `${bookCount} book(s) rendered`;
    await core.summary
      .addHeading("Goodreads README update")
      .addRaw(`${updateMessage}: ${booksRenderedMessage}.`, true)
      .write();
  } catch (err: unknown) {
    if (err instanceof Error) {
      core.setFailed(`Action failed with error ${err.message}`);
    } else {
      core.setFailed(`Action failed with error ${String(err)}`);
    }
  }
};
