import { Injectable } from "@angular/core";
import { UserSubscriptionPage } from "@shared/models/user-subscription.model";
import { Action, Selector, StateContext} from '@ngxs/store';
import { GetAlertsTemplatePage, GetUserSubscriptionPage } from "./alerts.actions";
import { Observable ,tap} from "rxjs";
import { AlertsService } from "@shared/services/alerts.service";
import { BusinessUnitService } from "@shared/services/business-unit.service";
import { AlertsTemplatePage } from "@shared/models/alerts-template.model";

interface AlertsStateModel {
    userSubscriptionPage: UserSubscriptionPage | null;
    alertsTemplatePage:AlertsTemplatePage |null;
}

@Injectable()
export class AlertsState {

  @Selector()
  static UserSubscriptionPage(state: AlertsStateModel): UserSubscriptionPage | null {
    return state.userSubscriptionPage;
  }
  @Selector()
  static AlertsTemplatePage(state: AlertsStateModel): AlertsTemplatePage | null {
    return state.alertsTemplatePage;
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
  @Action(GetAlertsTemplatePage)
  GetAlertsTemplatePage(
    { patchState }: StateContext<AlertsStateModel>,
    {  pageNumber, pageSize, sortModel, filterModel, filters }: GetAlertsTemplatePage
  ): Observable<AlertsTemplatePage> {
    return this.alertsService.getAlertsTemplatePage(pageNumber, pageSize, sortModel, filterModel, filters).pipe(
      tap((payload) => {
        patchState({ alertsTemplatePage: payload });
        return payload;
      })
    );
  }
}