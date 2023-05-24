import { Tiers } from '@shared/enums/tiers.enum';
import { FieldType } from '@core/enums';
import { TierDialogConfig } from '@shared/components/tiers-dialog/interfaces';
import { OrganizationRegion } from '@shared/models/organization.model';
import { FieldNames } from './tiers.constant';

export const TiersDialogConfig = (regions?: OrganizationRegion[], workcommitmentIds? : any): Record<Tiers, TierDialogConfig> => ({
  [Tiers.tierSettings]: {
    title: 'Add Tier',
    editTitle: 'Edit Tier',
    fields: [
      {
        field: 'name',
        title: 'Tier Name',
        disabled: false,
        required: true,
        type: FieldType.Input,
      },
      {
        field: 'hours',
        title: 'Number of Hours',
        disabled: false,
        required: true,
        type: FieldType.Number,
      },
      // {
      //   field: FieldNames.regionIds,
      //   title: 'Region',
      //   disabled: false,
      //   required: true,
      //   type: FieldType.MultiSelectDropdown,
      //   dataSource: regions ?? [],
      //   showAllToggle: true,
      // },
      // {
      //   field: FieldNames.locationIds,
      //   title: 'Location',
      //   disabled: false,
      //   required: true,
      //   type: FieldType.MultiSelectDropdown,
      //   dataSource: [],
      //   showAllToggle: true,
      // },
      // {
      //   field: FieldNames.departmentIds,
      //   title: 'Department',
      //   disabled: false,
      //   required: true,
      //   type: FieldType.MultiSelectDropdown,
      //   dataSource: [],
      //   showAllToggle: true,
      //   customFiltering: true,
      // },
      {
        field: 'workcommitmentId',
        title: 'WorkCommitment',
        disabled: false,
        required: false,
        type: FieldType.MultiSelectDropdown,
        dataSource: workcommitmentIds ?? [],
        customFiltering: true
      },
      {
        field: 'skillId',
        title: 'Skills',
        disabled: false,
        required: true,
        type: FieldType.RadioButton,
        dataSource: [],
        customFiltering: true,
        radiobuttons : [
          {
            title : "All",
            value : true
          },
          {
            title : "Primary",
            value : false
          },
          {
            title : "Secondary",
            value : false
          },
        ]
      },
    ]
  },
  [Tiers.tierException]: {
    title: 'Add Tier Exception',
    editTitle: 'Edit Tier Exception',
    fields: [
      {
        field: FieldNames.regionIds,
        title: 'Region',
        disabled: false,
        required: false,
        type: FieldType.MultiSelectDropdown,
        dataSource: regions ?? [],
        showAllToggle: true,
      },
      {
        field: FieldNames.locationIds,
        title: 'Location',
        disabled: false,
        required: false,
        type: FieldType.MultiSelectDropdown,
        dataSource: [],
        showAllToggle: true,
      },
      {
        field: FieldNames.departmentIds,
        title: 'Department',
        disabled: false,
        required: false,
        type: FieldType.MultiSelectDropdown,
        dataSource: [],
        showAllToggle: true,
      },
      {
        field: 'organizationTierId',
        title: 'Tier name',
        disabled: false,
        required: false,
        type: FieldType.Dropdown,
        dataSource: []
      }
    ]
  }
});
