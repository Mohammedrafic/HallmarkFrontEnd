import { Pipe, PipeTransform } from '@angular/core';

import { Store } from '@ngxs/store';

import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { UserState } from 'src/app/store/user.state';

@Pipe({
  name: 'hasAccess',
})
export class CanManageSettingPipe implements PipeTransform {
  constructor(private readonly store: Store) { }

  transform(
    hasPermission: Record<string, boolean>,
    data: OrganizationSettingsGet,
    overridableByOrg: boolean,
    disableSettingsKeys?: string[]
  ): boolean {
    const isSystemAdmin = this.store.selectSnapshot(UserState.isHallmarkSystemAdmin);
    const overridableBy = overridableByOrg
      ? !data.overridableByOrganization
      : !data.overridableByRegion && !data.overridableByLocation && !data.overridableByDepartment;
    const disableSettingKey = isSystemAdmin && disableSettingsKeys ? disableSettingsKeys.includes(data.settingKey) : false;
    const hasAccess = isSystemAdmin ? disableSettingKey : !hasPermission[data.settingKey] || overridableBy;

    return hasAccess;
  }
}
