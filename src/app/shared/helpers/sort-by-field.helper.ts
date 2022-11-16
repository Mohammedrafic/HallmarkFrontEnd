export const sortByField = (list: any[], field: string) => {
  return [...list].sort((a, b) => a[field].localeCompare(b[field]));
};
