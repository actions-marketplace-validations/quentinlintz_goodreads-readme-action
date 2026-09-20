export const fetchShelf = async (
  accountId: string,
  shelf: string,
): Promise<string> => {
  const url = new URL(`https://www.goodreads.com/review/list_rss/${accountId}`);
  url.searchParams.set("shelf", shelf);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: string = await response.text();
  return data;
};
