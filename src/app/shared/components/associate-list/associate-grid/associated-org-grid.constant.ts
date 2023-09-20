import { PartnershipStatus } from '@shared/enums/partnership-settings';
import { AgencyPartnershipStatus } from '@shared/enums/status';

export const JOB_DISTRIBUTION_COLUMNS = [
    {
        field: 'region',
        headerText: 'Region',
        textAlign: 'Left',
        width: "160",
        customAttributes: {
          class: 'sub-header'
        }
    },
    {
        field: 'classification',
        headerText: 'Classification',
        textAlign: 'Left',
        width: "160",
        customAttributes: {
          class: 'sub-header'
        }
    },
    {
        field: 'orderType',
        headerText: 'Order Type',
        textAlign: 'Left',
        width: "160",
        customAttributes: {
          class: 'sub-header'
        }
    },
    {
        field: 'skillCategory',
        headerText: 'Skill Category',
        textAlign: 'Left',
        width: "160",
        customAttributes: {
          class: 'sub-header'
        }
    },
];

export const AgencyStatusText = {
  [PartnershipStatus.Active]: 'Active',
  [PartnershipStatus.Suspended]: 'Suspended',
  [PartnershipStatus.Inactive]: 'Inactive',
};
