import { FilteredDataByOrganizationId } from "../../dashboard/models/group-by-organization-filter-data.model";

export class IntegrationFilterDto {
  public organizationFilter: FilteredDataByOrganizationId[];
  public interfaceIds?: string[];
}

export class IntegraionFailFilterDto{
  public organizationFilter: FilteredDataByOrganizationId[];
}

export class ScheduledIntegrationsFilterDto {
  public organizationFilter: FilteredDataByOrganizationId[];
}
