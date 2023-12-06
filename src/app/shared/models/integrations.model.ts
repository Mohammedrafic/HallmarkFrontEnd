import { FilteredDataByOrganizationId } from "../../dashboard/models/group-by-organization-filter-data.model";

export class IntegrationFilterDto {
  public organizationFilter: FilteredDataByOrganizationId[];
  public interfaceIds?: string[];
}
