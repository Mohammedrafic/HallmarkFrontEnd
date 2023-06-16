import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

export interface FilteredItem {
  text: any;
  value: any;
  column: string;
  organizationId?: number;
  regionId?: number;
  locationId?: number;
}

export interface FilterColumn {
  type: ControlTypes;
  valueType: ValueType;
  dataSource?: any[];
  valueField?: string;
  valueId?: string;
  checkBoxTitle?: string;
}

export type FilterColumnsModel = Record<string, FilterColumn>;
