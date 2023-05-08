import { Pipe, PipeTransform } from '@angular/core';

import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';

@Pipe({
  name: 'settingCheckboxValue',
})
export class CheckboxValuePipe implements PipeTransform {

  transform(setting: OrganizationSettingsGet): string {
    if (setting.value === null) {
      return 'No';
    }

    if (JSON.parse(setting.value).isEnabled) {
      return 'Yes';
    }

    return 'No';
  }
}
