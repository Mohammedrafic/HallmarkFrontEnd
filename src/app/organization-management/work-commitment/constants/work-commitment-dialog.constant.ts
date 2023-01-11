import { FieldType } from '@core/enums';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { CommitmentDialogConfig } from '../interfaces';

export const CommitmentsDialogConfig = (): CommitmentDialogConfig => ({
  title: 'Add Commitment',
  editTitle: 'Edit Commitment',
  fields: [
    {
      field: 'masterWorkCommitmentId',
      title: 'Name',
      disabled: false,
      required: true,
      type: FieldType.Dropdown,
    },
    {
      field: 'regions',
      title: 'Region',
      disabled: false,
      required: true,
      type: FieldType.MultiSelectDropdown,
      dataSource: [],
    },
    {
      field: 'locations',
      title: 'Location',
      disabled: false,
      required: true,
      type: FieldType.MultiSelectDropdown,
      dataSource: [],
    },
    {
      field: 'skills',
      title: 'Skill',
      disabled: false,
      required: true,
      type: FieldType.MultiSelectDropdown,
      dataSource: [],
    },
    {
      field: 'availabilityRequirement',
      title: 'Availability Requirement (h)',
      disabled: false,
      required: false,
      type: FieldType.Number,
    },
    {
      field: 'schedulePeriod',
      title: 'Schedule Period (weeks)',
      disabled: false,
      required: false,
      type: FieldType.Number,
    },
    {
      field: 'minimumWorkExperience',
      title: 'Min. work experience',
      disabled: false,
      required: false,
      type: FieldType.Number,
    },
    {
      field: 'criticalOrder',
      title: 'Min.Critical Order',
      disabled: false,
      required: false,
      type: FieldType.Number,
    },
    {
      field: 'holiday',
      title: 'Holiday',
      disabled: false,
      required: false,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'jobCode',
      title: 'Job Code',
      disabled: false,
      required: true,
      type: FieldType.Input,
      maxLength: 20,
    },

    {
      field: 'comments',
      title: 'Comment',
      disabled: false,
      required: false,
      type: FieldType.Input,
      maxLength: 200,
    },
  ],
});

export const OPTION_FIELDS: FieldSettingsModel = { text: 'name', value: 'id' };
