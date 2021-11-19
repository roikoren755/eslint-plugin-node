export const stripImportPathParams = (path: string): string => {
  const i = path.indexOf('!');

  return i === -1 ? path : path.slice(0, i);
};
