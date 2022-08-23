import { Injectable } from "@angular/core";
import { UserSubscriptionPage } from "@shared/models/user-subscription.model";
import { Action, Selector, StateContext} from '@ngxs/store';
import { GetAlertsTemplatePage, GetTemplateByAlertId, GetUserSubscriptionPage, SaveTemplateByAlertId } from "./alerts.actions";
import { Observable ,tap} from "rxjs";
import { AlertsService } from "@shared/services/alerts.service";
import { BusinessUnitService } from "@shared/services/business-unit.service";
import { AlertsTemplate, AlertsTemplatePage, EditAlertsTemplate } from "@shared/models/alerts-template.model";

interface AlertsStateModel {
    userSubscriptionPage: UserSubscriptionPage | null;
    //alertsTemplatePage:AlertsTemplatePage |null;
    alertsTemplates:AlertsTemplate[]| null;
    editAlertsTemplate:EditAlertsTemplate|null;
}

@Injectable()
export class AlertsState {

  @Selector()
  static UserSubscriptionPage(state: AlertsStateModel): UserSubscriptionPage | null {
    return state.userSubscriptionPage;
  }
  @Selector()
  static AlertsTemplatePage(state: AlertsStateModel): AlertsTemplate[] | null {
    //return state.alertsTemplatePage;
    return state.alertsTemplates;
  }
  @Selector()
  static TemplateByAlertId(state: AlertsStateModel): EditAlertsTemplate | null {
    //return state.alertsTemplatePage;
    return state.editAlertsTemplate;
  }
  @Selector()
  static SaveTemplateByAlertId(state: AlertsStateModel): EditAlertsTemplate | null {
    //return state.alertsTemplatePage;
    return state.editAlertsTemplate;
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
    { bussinessUnitType,pageNumber, pageSize, sortModel, filterModel, filters }: GetAlertsTemplatePage
  ): Observable<AlertsTemplate[]> {
    return this.alertsService.getAlertsTemplatePage(bussinessUnitType,pageNumber, pageSize, sortModel, filterModel, filters).pipe(
      tap((payload) => {
        patchState({ alertsTemplates: payload });
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