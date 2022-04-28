export class User {
    id: string;
    businessUnitId: number | null;
    businessUnitType: number;
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