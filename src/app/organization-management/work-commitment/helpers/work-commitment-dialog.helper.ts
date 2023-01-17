import { Option } from '../interfaces';

export const setDataSourceValue = <T extends { field: string; dataSource?: any }, U>(
  config: T[],
  key: string,
  sourceValue: U[]
): void => {
  config.find((configField: T) => configField.field === key)!.dataSource = sourceValue;
};

export const mapperSelectedItems = <T, U>(source: U[], key: string): T[] => {
  return source
    .flatMap((sourceItem: any) => sourceItem[key].map((item: T) => item))
    .filter((item) => item.includeInIRP);
};

//TODO remove any
export const mapDataSource = (items: any, nameField: string, idField: string): Option[] => {
  return items.map((item: any) => ({
    name: item[nameField],
    id: item[idField],
  }));
};
