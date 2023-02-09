import { BusinessUnitType } from '../enums/business-unit-type';

export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessUnitId: number | null;
  businessUnitType: BusinessUnitType;
  businessUnitName: string;
  agencyStatus?: number;
  isChatEnabled?: boolean;
  isDeleted?: boolean;
}

export class UsersPage {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: User[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
}

export type UsersAssignedToRole = {
  userNames: Partial<User>[];
  hasUsersOutsideVisibility: boolean;
};

export type UsersFilters = {
  firstName?: string;
  lastName?: string;
  roleIds?: number[];
  status?: boolean;
};

export type FilteredUser = {
  fullName: string;
  email: string;
  userId: string;
}
