import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { UserSubscriptionFilters } from "@shared/models/user-subscription.model";

export class GetUserSubscriptionPage {
    static readonly type = '[security] Get User Subscription Page';
    constructor(
      public businessUnitType: BusinessUnitType,
      public businessUnitIds: number[],
      public pageNumber: number,
      public pageSize: number,
      public sortModel: any,
      public filterModel: any,
      public filters: UserSubscriptionFilters
    ) {}
  }