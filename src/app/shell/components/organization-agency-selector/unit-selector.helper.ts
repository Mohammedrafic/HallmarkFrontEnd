import { UserAgencyOrganizationBusinessUnit } from '@shared/models/user-agency-organization.model';
import { IOrganizationAgency } from './unit-selector.interface';

export class UnitSelectorHelper {
  static createOrganizations(orgData: UserAgencyOrganizationBusinessUnit[]): IOrganizationAgency[] {
    return orgData.map((org: UserAgencyOrganizationBusinessUnit) => {
      const { id, name, hasLogo, lastUpdateTicks } = org;
      const organization: IOrganizationAgency = { id, name, type: 'Organization', hasLogo, lastUpdateTicks };

      return organization;
    });
  }

  static createAgencies(agencyData: UserAgencyOrganizationBusinessUnit[]) {
    return agencyData.map((agencyData: UserAgencyOrganizationBusinessUnit) => {
      const { id, name, hasLogo, lastUpdateTicks, status } = agencyData;
      const agency: IOrganizationAgency = { id, name, type: 'Agency', hasLogo, lastUpdateTicks, status };

      return agency;
    });
  }
}