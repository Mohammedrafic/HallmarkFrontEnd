import { ControlTypes } from "@shared/enums/control-types.enum";
import { OrganizationLocation, OrganizationRegion } from "@shared/models/organization.model";
import { Skill } from "@shared/models/skill.model";
import { Organisation } from "@shared/models/visibility-settings.model";
import { ValueType } from "@syncfusion/ej2-angular-grids";

export interface IFilterColumnsDataModel {
  organizationIds?: FilterColumn;
  regionIds: FilterColumn;
  locationIds: FilterColumn;
  departmentsIds: FilterColumn;
  skillIds: FilterColumn;
}

export interface FilterColumn {
  type: ControlTypes;
  valueType: ValueType;
  dataSource: OrganizationRegion[] | OrganizationLocation[] | Skill[] | Organisation[];
  valueField: string;
  valueId: string;
}
