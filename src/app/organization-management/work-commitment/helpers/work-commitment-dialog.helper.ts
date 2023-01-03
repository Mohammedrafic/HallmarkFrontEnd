export const setDataSourceValue = <T extends { field: string; dataSource?: any }, U>(
  config: T[],
  key: string,
  sourceValue: U[]
): void => {
  config.find((configField: T) => configField.field === key)!.dataSource = sourceValue;
};

export const mapperSelectedItems = <T, U>(source: U[], key: string): T[] => {
  return source.flatMap((sourceItem: any) => sourceItem[key].map((item: T) => item));
};
