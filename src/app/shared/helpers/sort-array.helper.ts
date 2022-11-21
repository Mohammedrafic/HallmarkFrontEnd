export const sortBy = <T>(array: T[]) => [...array].sort((a: T, b: T) => {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  return 0;
});
