import { FieldType, InputAttrType } from '@core/enums';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ExportColumn } from '@shared/models/export.model';
import { LocationsSourceKeys, LocationsTrackKey } from './locations.enum';
import { LocationDialogConfig, LocationFilterConfig } from './locations.interface';

export const LocationInitFilters: LocationFilterConfig = {
  externalIds: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  invoiceIds: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  names: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  addresses1: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  cities: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  states: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  zipCodes: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
  contactPeople: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
};

export const LocationExportColumns : ExportColumn[] = [
  { text: 'Ext Location ID', column: 'ExternalId' },
  { text: 'Invoice Location ID', column: 'InvoiceId' },
  { text: 'Location Name', column: 'Name' },
  { text: 'Business Line', column: 'BusinessLine' },
  { text: 'Address 1', column: 'Address1' },
  { text: 'Address 2', column: 'Address2' },
  { text: 'City', column: 'City' },
  { text: 'State', column: 'State' },
  { text: 'Zip', column: 'Zip' },
  { text: 'Contact Person', column: 'ContactPerson' }
];

export const MESSAGE_REGIONS_NOT_SELECTED = 'Region was not selected';

export const LocationsDialogConfig: LocationDialogConfig = {
  baseForm: [
    {
      field: 'externalId',
      title: 'Location Id',
      fieldType: FieldType.Input,
      gridAreaName: 'exteranlArea',
      required: false,
      maxLen: 50,
    },
    {
      field: 'isIrp',
      title: 'Include in IRP',
      fieldType: FieldType.Toggle,
      gridAreaName: 'irpArea',
      required: false,
    },
    {
      field: 'invoiceId',
      title: 'Invoice Location ID',
      fieldType: FieldType.Input,
      gridAreaName: 'invoiceArea',
      required: false,
      maxLen: 50,
    },
    {
      field: 'name',
      title: 'Location Name',
      fieldType: FieldType.Input,
      gridAreaName: 'nameArea',
      required: true,
      maxLen: 50,
    },
    {
      field: 'businessLineId',
      title: 'Business Line',
      fieldType: FieldType.Dropdown,
      sourceKey: LocationsSourceKeys.BusinessLineData,
      gridAreaName: 'businessLineArea',
      required: false,
    },
    // {
    //   field: 'locationType',
    //   title: 'Location Type',
    //   fieldType: FieldType.Dropdown,
    //   sourceKey: LocationsSourceKeys.LocationTypes,
    //   gridAreaName: 'locationTypeArea',
    //   required: false,
    // },
    {
      field: 'timeZone',
      title: 'Time Zone',
      fieldType: FieldType.Dropdown,
      sourceKey: LocationsSourceKeys.TimeZoneIds,
      gridAreaName: 'timeZoneArea',
      required: false,
    },
    {
      field: 'address1',
      title: 'Address 1',
      fieldType: FieldType.Input,
      gridAreaName: 'address1Area',
      required: true,
      maxLen: 100,
    },
    {
      field: 'address2',
      title: 'Address 2',
      fieldType: FieldType.Input,
      gridAreaName: 'address2Area',
      required: false,
      maxLen: 50,
    },
    {
      field: 'state',
      title: 'State',
      fieldType: FieldType.Dropdown,
      sourceKey: LocationsSourceKeys.States,
      gridAreaName: 'stateArea',
      required: true,
    },
    {
      field: 'city',
      title: 'City',
      fieldType: FieldType.Input,
      gridAreaName: 'cityArea',
      required: true,
    },
    {
      field: 'zip',
      title: 'Zipcode',
      fieldType: FieldType.Input,
      gridAreaName: 'zipArea',
      required: true,
      maxLen: 6,
      pattern: '[0-9]*'
    },
  ],
  subForms: [
    {
      formTitle: 'Contacts',
      trackKey: LocationsTrackKey.Contacts,
      containerClass: 'contacts-form',
      controls: [
        {
          field: 'contactPerson',
          title: 'Contact Person',
          fieldType: FieldType.Input,
          required: false,
          gridAreaName: 'personArea',
          maxLen: 50,
        },
        {
          field: 'contactEmail',
          title: 'Contact Person Email',
          fieldType: FieldType.Input,
          required: false,
          gridAreaName: 'emailArea',
          inputType: InputAttrType.Mail,
        },
        {
          field: 'phoneNumber',
          title: 'Phone Number',
          required: false,
          gridAreaName: 'phoneArea',
          fieldType: FieldType.Input,
          pattern: '^[0-9]*$',
          maxLen: 10,
          inputType: InputAttrType.Tel,
        },
        {
          field: 'phoneType',
          title: 'Phone Type',
          required: false,
          gridAreaName: 'phoneTypeArea',
          fieldType: FieldType.Dropdown,
          sourceKey: LocationsSourceKeys.PhoneType,
        },
        {
          field: 'ext',
          title: 'Ext',
          required: false,
          gridAreaName: 'extArea',
          fieldType: FieldType.Input,
        },
        {
          field: 'glNumber',
          title: 'GL Number',
          required: false,
          gridAreaName: 'glArea',
          maxLen: 50,
          fieldType: FieldType.Input,
        },
        {
          field: 'inactiveDate',
          title: 'Inactive Date',
          required: false,
          gridAreaName: 'inactivateArea',
          fieldType: FieldType.Date,
        }
      ],
    },
  ],
};
