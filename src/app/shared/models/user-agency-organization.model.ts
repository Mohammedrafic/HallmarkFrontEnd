export class UserAgencyOrganizationBusinessUnit {
  id: number;
  name: string;
  hasLogo?: boolean;
  lastUpdateTicks?: number;
}

export class UserAgencyOrganization {
  businessUnits: UserAgencyOrganizationBusinessUnit[];
  lastSelectedAgencyId: number;
}

export class LasSelectedOrganizationAgency {
  lastSelectedOrganizationId: number | null;
  lastSelectedAgencyId: number | null;
}
