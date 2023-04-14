export const sortBy = <T>(array: T[]) => [...array].sort((a: T, b: T) => {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return 0;
});
