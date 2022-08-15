import { Injectable } from "@angular/core";
import { UserSubscriptionPage } from "@shared/models/user-subscription.model";
import { Action, Selector, StateContext} from '@ngxs/store';
import { GetUserSubscriptionPage } from "./alerts.actions";
import { Observable ,tap} from "rxjs";
import { AlertsService } from "@shared/services/alerts.service";
import { BusinessUnitService } from "@shared/services/business-unit.service";

interface AlertsStateModel {
    userSubscriptionPage: UserSubscriptionPage | null;
}

@Injectable()
export class AlertsState {

  @Selector()
  static UserSubscriptionPage(state: AlertsStateModel): UserSubscriptionPage | null {
    return state.userSubscriptionPage;
  }
  constructor(
    private businessUnitService: BusinessUnitService,
    private alertsService: AlertsService
  ) {}
  
  @Action(GetUserSubscriptionPage)
  GetUserSubscriptionPage(
    { patchState }: StateContext<AlertsStateModel>,
    { businessUnitIds, businessUnitType, pageNumber, pageSize, sortModel, filterModel, filters }: GetUserSubscriptionPage
  ): Observable<UserSubscriptionPage> {
    return this.alertsService.getUserSubscriptionPage(businessUnitType, businessUnitIds, pageNumber, pageSize, sortModel, filterModel, filters).pipe(
      tap((payload) => {
        patchState({ userSubscriptionPage: payload });
        return payload;
      })
    );
  }
}