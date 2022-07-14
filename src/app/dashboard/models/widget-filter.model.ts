import { ControlTypes } from "@shared/enums/control-types.enum";
import { OrganizationRegion } from "@shared/models/organization.model";
import { ValueType } from "@syncfusion/ej2-angular-grids";

export interface IFilterColumnsDataModel {
  regionIds: FilterColumn;
  locationIds: FilterColumn;
  departmentsIds: FilterColumn;
  skillIds: FilterColumn;
}

export interface FilterColumn {
  type: ControlTypes;
  valueType: ValueType;
  dataSource: OrganizationRegion[] | any[];
  valueField: string;
  valueId: string;
}

export interface WidgetFilter {
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
  skillIds?: number[];
}