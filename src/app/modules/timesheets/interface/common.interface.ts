import { FieldType } from "../enums";

export interface DropdownOption {
  text: string;
  value: string | number;
}

export interface DialogConfigField {
  title: string;
  field: string;
  type: FieldType;
  disabled: boolean;
  required: boolean;
  options?: DropdownOption[];
  valueType?: string;
}

export interface DialogConfig {
  title: string;
  fields: DialogConfigField[][];
}
