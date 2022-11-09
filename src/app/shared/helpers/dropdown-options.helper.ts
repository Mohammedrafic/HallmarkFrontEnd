export const adaptToNameEntity = (arr: string[]): { name: string }[] => {
  return arr.map((item: string) => ({ name: item }));
};
