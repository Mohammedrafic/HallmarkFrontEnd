import { FieldType, FieldWidthStyle } from '@core/enums';
import { DropdownOption } from '@core/interface';

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
