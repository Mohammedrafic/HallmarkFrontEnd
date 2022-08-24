import { Injectable } from "@angular/core";
import { UserSubscriptionPage, UserSubscriptionRequest } from "@shared/models/user-subscription.model";
import { Action, Selector, StateContext} from '@ngxs/store';
import { GetAlertsTemplatePage, GetTemplateByAlertId, GetUserSubscriptionPage, SaveTemplateByAlertId, UpdateUserSubscription } from "./alerts.actions";
import { Observable ,tap} from "rxjs";
import { AlertsService } from "@shared/services/alerts.service";
import { BusinessUnitService } from "@shared/services/business-unit.service";
import { AlertsTemplate, AlertsTemplatePage, EditAlertsTemplate } from "@shared/models/alerts-template.model";

interface AlertsStateModel {
    userSubscriptionPage: UserSubscriptionPage | null;
    userSubscriptionSaved:boolean|false;
    alertsTemplatePage:AlertsTemplatePage |null;
    editAlertsTemplate:EditAlertsTemplate|null;
}

@Injectable()
export class AlertsState {

  @Selector()
  static UserSubscriptionPage(state: AlertsStateModel): UserSubscriptionPage | null {
    return state.userSubscriptionPage;
  }
  @Selector()
  static UpdateUserSubscription(state: AlertsStateModel): boolean | null {
    return state.userSubscriptionSaved;
  }
  @Selector()
  static AlertsTemplatePage(state: AlertsStateModel): AlertsTemplatePage | null {
    return state.alertsTemplatePage;
    
  }
  @Selector()
  static TemplateByAlertId(state: AlertsStateModel): EditAlertsTemplate | null {
    return state.editAlertsTemplate;
  }
  @Selector()
  static SaveTemplateByAlertId(state: AlertsStateModel): EditAlertsTemplate | null {
    return state.editAlertsTemplate;
  }
  constructor(
    private businessUnitService: BusinessUnitService,
    private alertsService: AlertsService
  ) {}
  
  @Action(GetUserSubscriptionPage)
  GetUserSubscriptionPage(
    { patchState }: StateContext<AlertsStateModel>,
    { userId, businessUnitType, pageNumber, pageSize, sortModel, filterModel, filters }: GetUserSubscriptionPage
  ): Observable<UserSubscriptionPage> {
    return this.alertsService.getUserSubscriptionPage(businessUnitType, userId, pageNumber, pageSize, sortModel, filterModel, filters).pipe(
      tap((payload) => {
        patchState({ userSubscriptionPage: payload });
        return payload;
      })
    );
  }
  @Action(UpdateUserSubscription)
  UpdateUserSubscription(
    { patchState }: StateContext<AlertsStateModel>,
    { userSubscriptionRequest}: UpdateUserSubscription
  ): Observable<void> {
    return this.alertsService.updateUserSubscription(userSubscriptionRequest).pipe(
      tap((payload) => {
        patchState({ userSubscriptionSaved: true });
        return payload;
      })
    );
  }
  
  @Action(GetAlertsTemplatePage)
  GetAlertsTemplatePage(
    { patchState }: StateContext<AlertsStateModel>,
    { businessUnitType,businessUnitId,pageNumber, pageSize, sortModel, filterModel, filters }: GetAlertsTemplatePage
  ): Observable<AlertsTemplatePage> {
    return this.alertsService.getAlertsTemplatePage(businessUnitType,businessUnitId,pageNumber, pageSize, sortModel, filterModel, filters).pipe(
      tap((payload) => {
        patchState({ alertsTemplatePage: payload });
        return payload;
      })
    );
  }

  @Action(GetTemplateByAlertId)
  GetTemplateByAlertId(
    { patchState }: StateContext<AlertsStateModel>,
    { alertId,alertChannelId}: GetTemplateByAlertId
  ): Observable<EditAlertsTemplate> {
    return this.alertsService.getTemplateByAlertId(alertId,alertChannelId).pipe(
      tap((payload) => {
        patchState({ editAlertsTemplate: payload });
        return payload;
      })
    );
  }
  @Action(SaveTemplateByAlertId)
  SaveTemplateByAlertId(
    { patchState }: StateContext<AlertsStateModel>,
    { editAlertsTemplateRequest}: SaveTemplateByAlertId
  ): Observable<EditAlertsTemplate> {
    return this.alertsService.saveTemplateByAlertId(editAlertsTemplateRequest).pipe(
      tap((payload) => {
        patchState({ editAlertsTemplate: payload });
        return payload;
      })
    );
  }
}