import { FieldType } from '@core/enums';
import { CredentialListConfig } from '@shared/components/credentials-list/interfaces';

export const SystemConfig: CredentialListConfig[] = [
  {
    title: 'Select System',
    required: true,
    class: 'system-wrapper',
    fields: [
      {
        field: 'includeInIRP',
        title: 'IRP',
        disabled: false,
        required: false,
        type: FieldType.CheckBox,
      },
      {
        field: 'includeInVMS',
        title: 'VMS',
        disabled: false,
        required: false,
        type: FieldType.CheckBox,
      },
    ]
  }
];

export const CredentialConfig: CredentialListConfig[] = [
  {
    title: '',
    required: false,
    class: 'credential-wrapper',
    fields: [
      {
        field: 'credentialTypeId',
        title: 'Credential Type',
        disabled: false,
        required: true,
        type: FieldType.Dropdown,
        dataSource: []
      },
      {
        field: 'name',
        title: 'Credential Description',
        disabled: false,
        required: true,
        type: FieldType.Input,
      },
      {
        field: 'expireDateApplicable',
        title: 'Expiry Date Applicable',
        disabled: false,
        required: false,
        type: FieldType.CheckBox
      },
      {
        field: 'comment',
        title: 'Comment',
        disabled: false,
        required: false,
        show: true,
        type: FieldType.TextArea,
      },
      {
        field: 'irpComment',
        title: 'IRP Comment',
        disabled: false,
        required: false,
        show: false,
        type: FieldType.TextArea,
      }
    ]
  }
];
