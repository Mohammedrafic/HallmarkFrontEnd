import { FieldType } from '@core/enums';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { PageOfCollections } from '@shared/models/page.model';

export interface Option {
  text: string;
  value: string | number;
}

export type TierDataSource = OrganizationRegion[] | OrganizationLocation[] | OrganizationDepartment[] | Option[];

export interface TiersInputConfig {
  field: string;
  title: string;
  disabled: boolean;
  required: boolean;
  type: FieldType;
  dataSource?: TierDataSource;
}

export interface TierDialogConfig {
    title: string;
    editTitle: string;
    fields: TiersInputConfig[];
}

export interface TierDetails {
  id: number;
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

export type TiersPage = PageOfCollections<TierDetails>;
