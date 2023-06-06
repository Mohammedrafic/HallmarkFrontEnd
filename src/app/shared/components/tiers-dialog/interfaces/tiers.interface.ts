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
  showAllToggle?: boolean;
  customFiltering?: boolean;
  radiobuttons? : RadioButtonGroup[];
}

export interface RadioButtonGroup {
  title: string;
  value : string;
}

export interface TierDialogConfig {
    title: string;
    editTitle: string;
    fields: TiersInputConfig[];
}

export enum Skillvalue {
  All = "1",
  Primary = "2",
  Secondary = "3"
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
  organizationTierId: number;
  WorkCommitmentIds : any;
  workCommitments: any;
  skills:any;
}

export type TiersPage = PageOfCollections<TierDetails>;
