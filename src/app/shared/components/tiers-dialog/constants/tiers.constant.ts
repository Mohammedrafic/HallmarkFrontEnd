import { InjectionToken } from '@angular/core';

import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

export const TIER_DIALOG_TYPE = new InjectionToken('TIER_DIALOG_TYPE');
export const OPTION_FIELDS: FieldSettingsModel = { text: 'name', value: 'id' };
