import { BusinessUnitType } from "../shared/enums/business-unit-type";
import { User } from "../shared/models/user.model";

export class SetCurrentUser {
  static readonly type = '[user] Set Current User';
  constructor(public payload: User) { }
}

export class GetUserMenuConfig {
  static readonly type = '[user] Get Users Menu Configuration';
  constructor(public payload: BusinessUnitType) { }
}
