import { AgencyStatus } from '@shared/enums/status';

export interface IOrganizationAgency {
  id: number;
  name: string;
  type: 'Organization' | 'Agency';
  hasLogo?: boolean;
  lastUpdateTicks?: number;
  status?: AgencyStatus;
}