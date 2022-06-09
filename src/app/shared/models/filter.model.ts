import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";

export class FilteredItem {
  text: string;
  value: any;
  column: string;
}

export class FilterColumn {
  type: ControlTypes;
  valueType: ValueType;
  dataSource?: any[];
  valueField?: string;
  valueId?: number;
  checkBoxTitle?: string;
}
