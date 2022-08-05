import { FieldType, FieldWidthStyle } from '@core/enums';
import { DropdownOption, FileForUpload } from '@core/interface';

export interface ManInvoiceInputConfig {
  field: string;
  title: string;
  disabled: boolean;
  required: boolean;
  type: FieldType;
  widthStyle: FieldWidthStyle;
  options?: DropdownOption;
};

export interface AddManInvoiceDialogConfig {
  title: string;
  fields: ManInvoiceInputConfig[];
}

export interface AddManInvoiceForm {
  orderId: number | string;
  name: string;
  unitId: number;
  locationId: number;
  departmentId: number;
  value: number;
  date: Date;
  link: string;
  vendorFee: boolean;
  reasonId: number;
  description: string;
}

export interface ManualInvoiceReason {
  id: number;
  reason: string;
  businessUnitId: number;
}
