import { ICellRendererParams } from '@ag-grid-community/core';
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';
import { PageOfCollections } from '@shared/models/page.model';
import {
  AssociateOrganizationsAgency,
  AssociateOrganizationsAgencyPage,
  FeeExceptionsInitialData,
  FeeSettings, JobDistributionInitialData,
  PartnershipSettings
} from '@shared/models/associate-organizations.model';

export interface AssociateStateModel {
  associateListPage: AssociateOrganizationsAgencyPage | { items: AssociateOrganizationsAgencyPage['items'] };
  feeSettings: FeeSettings | null;
  feeExceptionsInitialData: FeeExceptionsInitialData | null;
  partnershipSettings: PartnershipSettings | null;
  jobDistributionInitialData: JobDistributionInitialData | null;
  associateAgencyOrg: { id: number, name: string }[];
  tierList: TierList[] | null;
  selectedOrganizationAgency: AssociateOrganizationsAgency | null;
  tiersExceptionByPage: TierExceptionPage | null;
  generalTierList: TierList[] | null;
}

export interface TierExceptionColumn extends ICellRendererParams {
  agency?: boolean;
  edit?: (tier: TierDetails) => TierDetails;
}

export interface TierExceptionFilters {
  pageNumber: number;
  pageSize: number;
}

export interface TierExceptionDetails {
  departmentId: number;
  departmentName: string;
  id: number;
  locationId: number;
  locationName: string;
  organizationTierId: number;
  regionId: number;
  regionName: string;
  tierName: string;
}

export interface TierList {
  departmentId: number;
  departmentName: string;
  hours: number;
  locationId: number;
  locationName: string;
  name: string;
  organizationId: number;
  priority: number;
  regionId: number;
  regionName: string;
}

export type TierExceptionPage = PageOfCollections<TierExceptionDetails>;

export interface Tier {
  associateOrganizationId: number;
  organizationTierId: number | null;
}
