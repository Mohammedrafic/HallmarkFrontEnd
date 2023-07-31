import { FieldType, FieldWidthStyle } from '@core/enums';
import { DropdownOption } from '@core/interface';
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
}

export interface AddManInvoiceDialogConfig {
  title: string;
  editTitle: string;
  fields: ManInvoiceInputConfig[];
}

export interface AddManInvoiceForm {
  orderId: string;
  nameId: number;
  unitId: number;
  locationId: number;
  departmentId: number;
  value: string;
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
  agencyFeeApplicable?: boolean;
}

export interface ManualInvoiceMeta {
  jobId: number;
  orderId: number;
  orderPublicId: number;
  positionId: number;
  formattedOrderId: string;
  formattedOrderIdFull: string;
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
}

export interface ManualInvoicePostDto {
  organizationId: number;
  jobId: number;
  amount: number;
  serviceDate: string;
  linkedInvoiceId: string;
  vendorFeeApplicable: boolean;
  manualInvoiceReasonId: number;
  comment: string;
  departmentId: number;
}

export interface ManualInvoicePutDto extends ManualInvoicePostDto {
  timesheetId: number;
}
