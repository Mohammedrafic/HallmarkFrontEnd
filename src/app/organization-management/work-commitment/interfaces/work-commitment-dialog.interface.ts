import { FieldType } from '@core/enums';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { PageOfCollections } from '@shared/models/page.model';
import { ListOfSkills } from '@shared/models/skill.model';

export interface Option {
  name: string;
  id: string | number;
}

export interface WorkCommitmentForm {
  masterWorkCommitmentId: number;
  regions: OrganizationRegion[] | string[];
  locations: OrganizationLocation[] | number[];
  skillIds: (ListOfSkills | null | string | number)[];
  minimumWorkExperience: number | null;
  availabilityRequirement: number | null;
  schedulePeriod: number | null;
  criticalOrder: number | null;
  holiday: number | null;
  startDate: string | null;
  endDate: string | null;
  jobCode: string;
  comments: string | null;
  workCommitmentId: number | null;
}

export interface WorkCommitmentDTO {
  masterWorkCommitmentId: number;
  skillIds: number[] | null[];
  minimumWorkExperience: number;
  availabilityRequirement: number;
  schedulePeriod: number;
  criticalOrder: number;
  holiday: number;
  startDate: string | null;
  endDate: string | null;
  jobCode: string;
  comments: string;
  regions: RegionsDTO[];
  workCommitmentId?: number | null;
}

export type CommitmentDataSource = OrganizationRegion[] | OrganizationLocation[] | OrganizationDepartment[] | Option[];

export interface CommitmentsInputConfig {
  field: string;
  title: string;
  required: boolean;
  type: FieldType;
  disableOnEdit: boolean;
  disabled?: boolean;
  dataSource?: CommitmentDataSource;
  maxLength?: number;
  decimals?: number;
}

export interface CommitmentDialogConfig {
  title: string;
  editTitle: string;
  fields: CommitmentsInputConfig[];
}

export interface MasterCommitmentNames {
  name: string;
  id: number;
}

export type MasterWorkCommitments = PageOfCollections<MasterCommitmentNames>;

export interface Holiday {
  id: number;
  masterHolidayId: number;
  holidayName: string;
  startDateTime: string;
  endDateTime: string;
  regionId: number | null;
  locationId: number | null;
  regions?: any[];
  locations?: number[];
  locationName?: string;
  regionName?: string;
  organizationId?: number;
  toOverwrite?: boolean;
  foreignKey?: string;
  isOrganizationHoliday: boolean;
}

export type HolidaysPage = PageOfCollections<Holiday>;

export interface RegionsDTO {
  id: number;
  locations: number[];
}
