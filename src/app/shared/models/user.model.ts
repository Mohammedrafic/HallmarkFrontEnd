import { BusinessUnitType } from '../enums/business-unit-type';

export class User {
  id: string;
  businessUnitId: number | null;
  businessUnitType: BusinessUnitType;
  businessUnitName: string;
}


export class UsersPage {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: User[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
}
