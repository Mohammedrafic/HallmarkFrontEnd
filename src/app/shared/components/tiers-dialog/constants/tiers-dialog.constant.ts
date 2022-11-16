import { Tiers } from '@shared/enums/tiers.enum';
import { FieldType } from '@core/enums';
import { TierDialogConfig } from '@shared/components/tiers-dialog/interfaces';
import { OrganizationRegion } from '@shared/models/organization.model';

export const TiersDialogConfig = (regions?: OrganizationRegion[]): Record<Tiers, TierDialogConfig> => ({
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
      {
        field: 'regionIds',
        title: 'Region',
        disabled: false,
        required: true,
        type: FieldType.Dropdown,
        dataSource: regions ?? []
      },
      {
        field: 'locationIds',
        title: 'Location',
        disabled: false,
        required: true,
        type: FieldType.Dropdown,
        dataSource: []
      },
      {
        field: 'departmentIds',
        title: 'Department',
        disabled: false,
        required: true,
        type: FieldType.Dropdown,
        dataSource: []
      }
    ]
  },
  //TODO: will implement in next pr
  [Tiers.tierException]: {
    title: '',
    editTitle: '',
    fields: [
      {
        field: '',
        title: '',
        disabled: false,
        required: true,
        type: FieldType.Input,
      },
    ]
  }
});
