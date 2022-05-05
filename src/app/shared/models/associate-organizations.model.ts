import { PageOfCollections } from "./page.model";

export type AssociateOrganizations = {
  id?: number;
  organizationId?: number;
  organizationName: string;
  baseFee: number;
  exeptionFee: string;
  region: string;
  classification: string;
  orderType: string;
  skillCategory: string;
};

export type AssociateOrganizationsPage = PageOfCollections<AssociateOrganizations>
