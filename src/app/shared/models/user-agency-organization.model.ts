import { AgencyStatus } from '@shared/enums/status';

export class UserAgencyOrganizationBusinessUnit {
  id: number;
  name: string;
  hasLogo?: boolean;
  lastUpdateTicks?: number;
  status: AgencyStatus;
}

export class UserAgencyOrganization {
  businessUnits: UserAgencyOrganizationBusinessUnit[];
  lastSelectedAgencyId: number;
}

export class LasSelectedOrganizationAgency {
  lastSelectedOrganizationId: number | null;
  lastSelectedAgencyId: number | null;
  lastSelectedMspId?: number | null;
}
