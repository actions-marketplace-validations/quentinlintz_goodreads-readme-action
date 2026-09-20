import { beforeEach, describe, expect, test, vi } from "vitest";
import * as core from "@actions/core";
import { run } from "./action.js";
import { updateReadme, type UpdateReadmeOutput } from "./update.js";

const { summaryMock } = vi.hoisted(() => {
  const summary = {
    addHeading: vi.fn(),
    addRaw: vi.fn(),
    addEOL: vi.fn(),
    write: vi.fn(),
  };

  summary.addHeading.mockReturnValue(summary);
  summary.addRaw.mockReturnValue(summary);
  summary.addEOL.mockReturnValue(summary);
  summary.write.mockResolvedValue(summary);

  return {
    summaryMock: summary,
  };
});

vi.mock("@actions/core", () => ({
  getInput: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  summary: summaryMock,
}));
vi.mock("./update.js", () => ({
  updateReadme: vi.fn(),
}));

const inputs: Record<string, string> = {
  "goodreads-user-id": "123",
  shelf: "read",
  "readme-path": "README.md",
  section: "GOODREADS-LIST",
  sort: "date-read",
  "show-rating": "true",
  "max-books": "10",
};

describe("run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(summaryMock.write).mockResolvedValue(summaryMock);
    vi.mocked(core.getInput).mockImplementation(
      (name: string) => inputs[name] ?? "",
    );
    vi.mocked(updateReadme).mockResolvedValue({
      hasChanged: false,
      bookCount: 0,
    });
  });

  test("input mappings", async () => {
    vi.mocked(updateReadme).mockResolvedValue({
      hasChanged: true,
      bookCount: 5,
    });

    await run();

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.getInput).toHaveBeenCalledWith("goodreads-user-id", {
      required: true,
    });
    expect(core.getInput).toHaveBeenCalledWith("shelf");
    expect(core.getInput).toHaveBeenCalledWith("readme-path");
    expect(core.getInput).toHaveBeenCalledWith("section");
    expect(core.getInput).toHaveBeenCalledWith("sort");
    expect(core.getInput).toHaveBeenCalledWith("show-rating");
    expect(core.getInput).toHaveBeenCalledWith("max-books");
    expect(updateReadme).toHaveBeenCalledExactlyOnceWith({
      goodreadsId: inputs["goodreads-user-id"],
      shelf: inputs["shelf"],
      readmePath: inputs["readme-path"],
      marker: inputs["section"],
      sort: inputs["sort"],
      ratings: inputs["show-rating"],
      limit: inputs["max-books"],
    });
  });

  test("changed output and summary", async () => {
    vi.mocked(updateReadme).mockResolvedValue({
      hasChanged: true,
      bookCount: 5,
    });

    await run();

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith("changed", true);
    expect(core.setOutput).toHaveBeenCalledWith("book-count", 5);
    expect(summaryMock.addHeading).toHaveBeenCalledWith(
      "Goodreads README update",
    );
    expect(summaryMock.addRaw).toHaveBeenCalledWith(
      "README updated: 5 book(s) rendered.",
      true,
    );
    expect(summaryMock.write).toHaveBeenCalledOnce();
  });

  test("unchanged output and summary", async () => {
    vi.mocked(updateReadme).mockResolvedValue({
      hasChanged: false,
      bookCount: 5,
    });

    await run();

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith("changed", false);
    expect(core.setOutput).toHaveBeenCalledWith("book-count", 5);
    expect(summaryMock.addHeading).toHaveBeenCalledWith(
      "Goodreads README update",
    );
    expect(summaryMock.addRaw).toHaveBeenCalledWith(
      "README already up to date: 5 book(s) rendered.",
      true,
    );
    expect(summaryMock.write).toHaveBeenCalledOnce();
  });

  test("zero output and summary", async () => {
    vi.mocked(updateReadme).mockResolvedValue({
      hasChanged: true,
      bookCount: 0,
    });

    await run();

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith("changed", true);
    expect(core.setOutput).toHaveBeenCalledWith("book-count", 0);
    expect(summaryMock.addHeading).toHaveBeenCalledWith(
      "Goodreads README update",
    );
    expect(summaryMock.addRaw).toHaveBeenCalledWith(
      "README updated: the shelf is empty.",
      true,
    );
    expect(summaryMock.write).toHaveBeenCalledOnce();
  });

  test("input error", async () => {
    vi.mocked(core.getInput).mockImplementation(() => {
      throw new Error("Input error");
    });

    await run();

    expect(updateReadme).not.toHaveBeenCalled();
    expect(core.setFailed).toHaveBeenCalledWith(
      "Action failed with error Input error",
    );
    expect(core.setOutput).not.toHaveBeenCalled();
    expect(summaryMock.addHeading).not.toHaveBeenCalled();
    expect(summaryMock.addRaw).not.toHaveBeenCalled();
    expect(summaryMock.write).not.toHaveBeenCalled();
  });

  test("update error", async () => {
    vi.mocked(updateReadme).mockRejectedValue(new Error("thrown error"));

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Action failed with error thrown error",
    );
    expect(core.setOutput).not.toHaveBeenCalled();
    expect(summaryMock.addHeading).not.toHaveBeenCalled();
    expect(summaryMock.addRaw).not.toHaveBeenCalled();
    expect(summaryMock.write).not.toHaveBeenCalled();
  });

  test("update non-error", async () => {
    vi.mocked(updateReadme).mockRejectedValue("service unavailable");

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Action failed with error service unavailable",
    );
    expect(core.setOutput).not.toHaveBeenCalled();
    expect(summaryMock.addHeading).not.toHaveBeenCalled();
    expect(summaryMock.addRaw).not.toHaveBeenCalled();
    expect(summaryMock.write).not.toHaveBeenCalled();
  });

  test("write sequencing", async () => {
    let resolveWrite!: (value: typeof summaryMock) => void;
    const writePromise = new Promise<typeof summaryMock>((resolve) => {
      resolveWrite = resolve;
    });

    summaryMock.write.mockReturnValue(writePromise);
    let runFinished = false;
    const runPromise = run().then(() => {
      runFinished = true;
    });

    await vi.waitFor(() => {
      expect(summaryMock.write).toHaveBeenCalled();
    });

    expect(runFinished).toBe(false);
    resolveWrite(summaryMock);
    await runPromise;
    expect(runFinished).toBe(true);
  });

  test("updateReadme sequencing", async () => {
    let resolveUpdate!: (value: UpdateReadmeOutput) => void;
    const updatePromise = new Promise<UpdateReadmeOutput>((resolve) => {
      resolveUpdate = resolve;
    });
    vi.mocked(updateReadme).mockReturnValue(updatePromise);

    let runFinished = false;
    const runPromise = run().then(() => {
      runFinished = true;
    });
    await vi.waitFor(() => {
      expect(updateReadme).toHaveBeenCalled();
    });

    expect(runFinished).toBe(false);
    expect(core.setOutput).not.toHaveBeenCalled();
    expect(summaryMock.addHeading).not.toHaveBeenCalled();
    expect(summaryMock.addRaw).not.toHaveBeenCalled();
    expect(summaryMock.write).not.toHaveBeenCalled();
    resolveUpdate({
      hasChanged: true,
      bookCount: 10,
    });
    await runPromise;
    expect(runFinished).toBe(true);
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith("changed", true);
    expect(core.setOutput).toHaveBeenCalledWith("book-count", 10);
    expect(summaryMock.addHeading).toHaveBeenCalledWith(
      "Goodreads README update",
    );
    expect(summaryMock.addRaw).toHaveBeenCalledWith(
      "README updated: 10 book(s) rendered.",
      true,
    );
    expect(summaryMock.write).toHaveBeenCalledOnce();
  });
});
