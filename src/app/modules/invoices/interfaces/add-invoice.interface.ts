import { FieldType, FieldWidthStyle } from '@core/enums';
import { DropdownOption, FileForUpload } from '@core/interface';
import { ManInvoiceOptionsKeys } from '../enums';

export interface ManInvoiceInputConfig {
  field: string;
  title: string;
  disabled: boolean;
  required: boolean;
  type: FieldType;
  widthStyle: FieldWidthStyle;
  optionsStateKey?: ManInvoiceOptionsKeys;
  options?: DropdownOption[];
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

export interface ManualInvoiceMeta {
  jobId: number;
  orderId: number;
  positionId: number;
  formattedOrderId: string;
  candidateId: number;
  candidateFirstName: string;
  candidateMiddleName: string;
  candidateLastName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  agencyId: number;
  agencyName: string;
  organizationId: number;
  organizationName: string;
}

export interface ManualInvoiceInputOptions {
  [ManInvoiceOptionsKeys.Locations]: DropdownOption[];
  [ManInvoiceOptionsKeys.Departments]: DropdownOption[];
  [ManInvoiceOptionsKeys.Candidates]: DropdownOption[];
  [ManInvoiceOptionsKeys.Agencies]: DropdownOption[];
  [ManInvoiceOptionsKeys.Reasons]: DropdownOption[];
  [ManInvoiceOptionsKeys.Organizations]: DropdownOption[];
}
