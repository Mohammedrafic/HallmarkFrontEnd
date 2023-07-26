import { Pipe, PipeTransform } from '@angular/core';

import { Store } from '@ngxs/store';
import { OrganizationSettingKeys } from '@shared/constants';

import { Configuration } from '@shared/models/organization-settings.model';
import { UserState } from 'src/app/store/user.state';

@Pipe({
  name: 'hasAccess',
})
export class CanManageSettingPipe implements PipeTransform {
  constructor(private readonly store: Store) { }

  transform(
    hasPermission: Record<string, boolean>,
    data: Configuration,
    overridableByOrg: boolean | null,
    disableSettingsKeys?: string[]
  ): boolean {
    const isHallmarkMspUser = this.store.selectSnapshot(UserState.isHallmarkMspUser);
    let overridableBy: boolean;
    if (overridableByOrg !== null) {
      overridableBy = overridableByOrg
        ? !data.overridableByOrganization
        : !data.overridableByRegion && !data.overridableByLocation && !data.overridableByDepartment;
    } else {
      overridableBy = false;
    }

    if (isHallmarkMspUser && disableSettingsKeys) {
      return disableSettingsKeys.includes(data.settingKey);
    } else if (isHallmarkMspUser && !disableSettingsKeys) {
      const departmentSkillRequired = OrganizationSettingKeys[OrganizationSettingKeys.DepartmentSkillRequired];
      const disableSetting = data.settingKey === departmentSkillRequired ? !hasPermission[data.settingKey] : false;
      return disableSetting;
    } else {
      return !hasPermission[data.settingKey] || overridableBy;
    }
  }
}
