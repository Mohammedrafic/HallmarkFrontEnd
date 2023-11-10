import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { PageOfCollections } from "./page.model";
import { Permissions } from "./permission.model";

export type Role = {
  id?: number;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  businessUnitType: BusinessUnitType;
  businessUnitId: number;
  businessUnitName: string;
  permissions: Permissions;
  isSelfRole:boolean;
};

export type RoleDTO = Omit<Role, 'isDefault' | 'businessUnitName'>;

export type RolesPage = PageOfCollections<Role>;

export type RolesFilters = {
  permissionsIds?: number[];
};
