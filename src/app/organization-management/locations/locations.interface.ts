import { FieldType, InputAttrType } from '@core/enums';
import { DropdownOption } from '@core/interface';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { LocationsSourceKeys, LocationsTrackKey } from './locations.enum';

export interface LocationFilterItem<T> {
  type: ControlTypes;
  valueType: ValueType;
  dataSource: T[];
}

export interface LocationFilterConfig {
  externalIds: LocationFilterItem<string>;
  invoiceIds: LocationFilterItem<string>;
  names: LocationFilterItem<string>;
  addresses1: LocationFilterItem<string>;
  cities: LocationFilterItem<string>;
  states: LocationFilterItem<string>;
  zipCodes: LocationFilterItem<string>;
  contactPeople: LocationFilterItem<string>;
  includeInIRP: LocationFilterItem<DropdownOption>;
}

export interface LocationsForm {
  invoiceId: string;
  externalId: string;
  name: string;
  businessLineId: string;
  address1: string;
  address2: string;
  zip: string;
  city: string;
  state: string;
  glNumber:string;
  ext: string;
  contactEmail: string;
  contactPerson: string;
  inactiveDate: string;
  phoneNumber: string;
  phoneType: string;
  timeZone: string;
  locationType: string;
  organizationId: number;
}

export interface LocationsFormConfig {
  field: string;
  title: string;
  fieldType: FieldType;
  sourceKey?: LocationsSourceKeys;
  gridAreaName: string;
  required: boolean;
  maxLen?: number;
  pattern?: string;
  inputType?: InputAttrType;
  visible: boolean;
}

export interface LocationsSubFormConfig {
  formTitle: string;
  trackKey: LocationsTrackKey;
  containerClass: string;
  controls: LocationsFormConfig[];
}


export interface LocationDialogConfig {
  baseForm: LocationsFormConfig[],
  subForms?: LocationsSubFormConfig[],
}

export interface LocationsFormSource {
  [LocationsSourceKeys.BusinessLineData]: DropdownOption[],
  [LocationsSourceKeys.LocationTypes]: DropdownOption[],
  [LocationsSourceKeys.TimeZoneIds]: DropdownOption[],
  [LocationsSourceKeys.States]: string[],
  [LocationsSourceKeys.PhoneType]: string[],
}
