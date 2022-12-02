import { Pipe, PipeTransform } from '@angular/core';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { User } from '@shared/models/user.model';

@Pipe({
  name: 'hasAccess',
})
export class CanManageSettingPipe implements PipeTransform {
  transform(hasPermission: Record<string, boolean>, data: OrganizationSettingsGet, overridableByOrg: boolean, disableSettingsKeys?: string[]): boolean {
    const user = JSON.parse(localStorage.getItem('User') || '') as User;
    const isAdmin = [BusinessUnitType.Hallmark, BusinessUnitType.MSP].includes(user.businessUnitType);
    const overridableBy = overridableByOrg
      ? !data.overridableByOrganization
      : !data.overridableByRegion && !data.overridableByLocation && !data.overridableByDepartment;
    const disableSettingKey = isAdmin && disableSettingsKeys ? disableSettingsKeys.includes(data.settingKey) : false;

    return isAdmin ? disableSettingKey : !hasPermission[data.settingKey] || overridableBy;
  }
}
