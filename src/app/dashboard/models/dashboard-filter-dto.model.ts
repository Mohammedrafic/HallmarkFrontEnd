import { Skill } from "@shared/models/skill.model";
import { FilteredDataByOrganizationId } from "./group-by-organization-filter-data.model";

export interface DashboartFilterDto {
  organizationFilter : FilteredDataByOrganizationId[];
  skillIds?: Skill[],
  type?:string
}
