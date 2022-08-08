export const findItemById = <T>(arr: T[], id: number): T | undefined => {
  return arr.find((el: any) => el.id === id);
}
