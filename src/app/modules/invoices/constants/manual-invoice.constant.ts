import { FieldType, FieldWidthStyle } from '@core/enums';
import { AddManInvoiceDialogConfig } from '../interfaces';

export const ManualInvoiceDialogConfig: AddManInvoiceDialogConfig = {
  title: 'Add Manual Invoice',
  fields: [
    {
      field: 'orderId',
      title: 'Order ID | Position ID',
      disabled: false,
      required: true,
      type: FieldType.SearchDD,
      widthStyle: FieldWidthStyle.Long,
    },
    {
      field: 'candidateName',
      title: 'Candidate Name',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Short,
    },
    {
      field: 'agency',
      title: 'Agency',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Short,
    },
    {
      field: 'workLocationId',
      title: 'Worked Location',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Short,
    },
    {
      field: 'workDepartmentId',
      title: 'Worked Department',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Short,
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
      field: 'serviceDate',
      title: 'Service Date',
      disabled: false,
      required: true,
      type: FieldType.Date,
      widthStyle: FieldWidthStyle.Short,
    },
    {
      field: 'linkInvoiceId',
      title: 'Linked Invoice',
      disabled: false,
      required: true,
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
      required: true,
      type: FieldType.Dropdown,
      widthStyle: FieldWidthStyle.Long,
    },
    {
      field: 'comment',
      title: 'Comments',
      disabled: false,
      required: false,
      type: FieldType.TextArea,
      widthStyle: FieldWidthStyle.Long,
    }
  ],
};
