export const replaceSection = (
  readme: string,
  marker: string,
  content: string,
): string => {
  if (marker.trim().length === 0) {
    throw new Error("marker must not be empty");
  }

  const startMarker = `<!-- ${marker}:START -->`;
  const endMarker = `<!-- ${marker}:END -->`;

  if (
    !(readme.split(startMarker).length === 2) ||
    !(readme.split(endMarker).length === 2)
  ) {
    throw new Error("marker must exist only once in README");
  }

  if (readme.indexOf(startMarker) >= readme.indexOf(endMarker)) {
    throw new Error("start marker must appear before end marker");
  }

  const newReadme =
    readme.split(startMarker)[0] +
    `${startMarker}\n${content}\n${endMarker}` +
    readme.split(endMarker)[1];

  return newReadme;
};
