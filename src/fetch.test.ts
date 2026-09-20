import { vi, afterEach, describe, test, expect } from "vitest";
import { fetchShelf } from "./fetch.js";

const mockData = "text";
const timeoutError = new DOMException("Request timed out", "TimeoutError");
const response = new Response("valid response", {
  status: 200,
});

describe("fetchShelf", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("successful retrieval", async () => {
    const signalMatcher: unknown = expect.any(AbortSignal);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => mockData,
      }),
    );

    const data = await fetchShelf("123", "read");

    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      new URL("https://www.goodreads.com/review/list_rss/123?shelf=read"),
      { signal: signalMatcher },
    );
  });

  test("shelf encoding", async () => {
    const signalMatcher: unknown = expect.any(AbortSignal);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => mockData,
      }),
    );

    const data = await fetchShelf("123", "#read");

    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      new URL("https://www.goodreads.com/review/list_rss/123?shelf=%23read"),
      { signal: signalMatcher },
    );
  });

  test("HTTP failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(fetchShelf("123", "read")).rejects.toThrow(
      "HTTP error! Status: 500",
    );
  });

  test("network failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(
      new Error("Network failure"),
    );
    await expect(fetchShelf("123", "read")).rejects.toThrow("Network failure");
  });

  test("body reading failure", async () => {
    vi.spyOn(response, "text").mockRejectedValue(
      new Error("Failed to read body"),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await expect(fetchShelf("123", "read")).rejects.toThrow(
      "Failed to read body",
    );
  });

  test("timeout before response", async () => {
    const abortController = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(abortController.signal);

    const fetchMock = vi.fn<typeof fetch>((_input, init) => {
      const signal = init?.signal;
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(timeoutError));
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const shelfPromise = fetchShelf("123", "read");
    abortController.abort(timeoutError);
    await expect(shelfPromise).rejects.toThrow("Request timed out");
    expect(timeoutSpy).toHaveBeenCalledWith(5000);
  });

  test("timeout during body reading", async () => {
    const abortController = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(abortController.signal);

    let bodyStartedResolve!: () => void;
    const bodyStarted = new Promise<void>((resolve) => {
      bodyStartedResolve = resolve;
    });
    const fetchMock = vi.fn<typeof fetch>((_input, init) => {
      const signal = init?.signal;
      const response = new Response();
      vi.spyOn(response, "text").mockImplementation(
        () =>
          new Promise<string>((_resolve, reject) => {
            bodyStartedResolve();
            signal?.addEventListener("abort", () => {
              reject(timeoutError);
            });
          }),
      );
      return Promise.resolve(response);
    });
    vi.stubGlobal("fetch", fetchMock);

    const shelfPromise = fetchShelf("123", "read");
    const rejectText =
      expect(shelfPromise).rejects.toThrow("Request timed out");
    await bodyStarted;
    abortController.abort(timeoutError);
    await rejectText;
    expect(timeoutSpy).toHaveBeenCalledWith(5000);
  });
});
