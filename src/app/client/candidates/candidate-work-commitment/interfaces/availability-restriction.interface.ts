import { ControlTypes } from "@shared/enums/control-types.enum";

export interface AvailabilityFormFieldConfig<T, O = unknown, D = unknown> {
  type: ControlTypes;
  title: string;
  field: T;
  optionFields?: O;
  disabled?: boolean;
  required?: boolean;
  dataSource?: D;
}
