import { FieldType, FieldWidthStyle } from '@core/enums';
import { ManInvoiceOptionsKeys } from '../enums';
import { AddManInvoiceDialogConfig } from '../interfaces';

export const ManualInvoiceDialogConfig = (isAgency: boolean): AddManInvoiceDialogConfig => ({
  title: 'Add Manual Invoice',
  editTitle: 'Edit Manual Invoice',
  fields: [
    {
      field: 'orderId',
      title: 'Order ID | Position ID',
      disabled: false,
      required: true,
      type: FieldType.Input,
      widthStyle: FieldWidthStyle.Long,
    },
    ...!isAgency ? [{
      field: 'unitId',
      title: 'Agency',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Short,
      optionsStateKey: ManInvoiceOptionsKeys.Agencies,
      options: [],
    }] : [],
    {
      field: 'nameId',
      title: 'Candidate Name',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
      widthStyle: isAgency ? FieldWidthStyle.Long : FieldWidthStyle.Short,
      optionsStateKey: ManInvoiceOptionsKeys.Candidates,
      options: [],
    },
    {
      field: 'locationId',
      title: 'Worked Location',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Short,
      optionsStateKey: ManInvoiceOptionsKeys.Locations,
      options: [],
    },
    {
      field: 'departmentId',
      title: 'Worked Department',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Short,
      optionsStateKey: ManInvoiceOptionsKeys.Departments,
      options: [],
    },
    {
      field: 'value',
      title: 'Amount',
      disabled: false,
      required: true,
      type: FieldType.Input,
      widthStyle: FieldWidthStyle.Short,
    },
    {
      field: 'date',
      title: 'Service Date',
      disabled: false,
      required: true,
      type: FieldType.Date,
      widthStyle: FieldWidthStyle.Short,
    },
    {
      field: 'link',
      title: 'Linked Invoice',
      disabled: false,
      required: false,
      type: FieldType.Input,
      widthStyle: FieldWidthStyle.Short,
    },

    {
      field: 'vendorFee',
      title: 'Vendor Fee Applicable',
      disabled: false,
      required: true,
      type: FieldType.Toggle,
      widthStyle: FieldWidthStyle.Long,
    },
    {
      field: 'reasonId',
      title: 'Reason Code',
      disabled: false,
      required: false,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Long,
      optionsStateKey: ManInvoiceOptionsKeys.Reasons,
      options: [],
    },
    {
      field: 'description',
      title: 'Comments',
      disabled: false,
      required: false,
      type: FieldType.TextArea,
      widthStyle: FieldWidthStyle.Long,
    }
  ],
});
