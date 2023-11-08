import { UserAgencyOrganizationBusinessUnit } from '@shared/models/user-agency-organization.model';
import { UserMspBusinessUnit } from '../../../shared/models/user-msp.model';
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

  static createMsps(mspData: UserMspBusinessUnit[]) {
    return mspData.map((mspData: UserMspBusinessUnit) => {
      const { id, name, hasLogo, lastUpdateTicks } = mspData;
      const msp: IOrganizationAgency = { id, name, type: 'MSP', hasLogo, lastUpdateTicks };

      return msp;
    });
  }
}
