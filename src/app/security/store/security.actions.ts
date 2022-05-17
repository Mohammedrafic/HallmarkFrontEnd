import { BusinessUnitType } from '@shared/enums/business-unit-type';

export class GetBusinessByUnitType {
  static readonly type = '[security] Get Business By Unit Type';
  constructor(public type: BusinessUnitType) {}
}

export class GetRolesPage {
  static readonly type = '[security] Get Roles Page';
  constructor(
    public businessUnitType: BusinessUnitType,
    public businessUnitId: number,
    public pageNumber: number,
    public pageSize: number
  ) {}
}
