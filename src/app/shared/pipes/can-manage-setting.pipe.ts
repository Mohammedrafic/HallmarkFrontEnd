import { Pipe, PipeTransform } from '@angular/core';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { User } from '@shared/models/user.model';

@Pipe({
  name: 'canManageSetting',
})
export class CanManageSettingPipe implements PipeTransform {
  transform(settingPermission: Record<string, boolean>, data: OrganizationSettingsGet, overridableByOrg: boolean): boolean {
    const storedUser = localStorage.getItem('User') || '';
    const user = JSON.parse(storedUser) as User;
    const hasAccess = [BusinessUnitType.Hallmark, BusinessUnitType.MSP].includes(user.businessUnitType);
    const overridableBy = overridableByOrg
      ? !data.overridableByOrganization
      : !data.overridableByRegion && !data.overridableByLocation && !data.overridableByDepartment;

    return hasAccess ? false : !(!!settingPermission[data.settingKey] && !hasAccess) || overridableBy;
  }
}
