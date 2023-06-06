import { InjectionToken } from '@angular/core';

import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { TierConfig } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';

export const TIER_DIALOG_TYPE = new InjectionToken('TIER_DIALOG_TYPE');
export const OPTION_FIELDS: FieldSettingsModel = { text: 'masterWorkCommitmentName', value: 'masterWorkCommitmentId' };
export const Tier_Config: TierConfig = {
  regions: [],
  locations: [],
  departments: [],
};
export enum FieldNames {
  regionIds = 'regionIds',
  locationIds = 'locationIds',
  departmentIds = 'departmentIds',
}

export type FiledNamesSettings = { [K in FieldNames]: boolean; }