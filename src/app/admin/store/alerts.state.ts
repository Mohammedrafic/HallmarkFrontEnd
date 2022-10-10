import { Injectable } from "@angular/core";
import { UserSubscriptionPage, UserSubscriptionRequest } from "@shared/models/user-subscription.model";
import { Action, Selector, StateContext} from '@ngxs/store';
import { AlertTrigger, ClearAlertTemplateState, DismissAlert, DismissAllAlerts, GetAlertsTemplatePage, GetTemplateByAlertId, GetUserSubscriptionPage, SaveTemplateByAlertId, UpdateTemplateByAlertId, UpdateUserSubscription } from "./alerts.actions";
import { Observable ,tap} from "rxjs";
import { AlertsService } from "@shared/services/alerts.service";
import { BusinessUnitService } from "@shared/services/business-unit.service";
import { AlertsTemplate, AlertsTemplatePage, AlertTriggerDto, DismissAlertDto, EditAlertsTemplate } from "@shared/models/alerts-template.model";

interface AlertsStateModel {
  userSubscriptionPage: UserSubscriptionPage | null;
  userSubscriptionSaved: boolean;
    alertsTemplatePage:AlertsTemplatePage |null;
    editAlertsTemplate: EditAlertsTemplate | null;
    saveAlertsTemplate: EditAlertsTemplate | null;
    updateAlertsTemplate: EditAlertsTemplate | null;
    alertTriggerDetails:number[];
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
    return state.saveAlertsTemplate;
  }
  @Selector()
  static UpdateTemplateByAlertId(state: AlertsStateModel): EditAlertsTemplate | null {
    return state.updateAlertsTemplate;
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
    { userSubscriptionRequest }: UpdateUserSubscription
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
    { alertId,alertChannel,businessUnitId}: GetTemplateByAlertId
  ): Observable<EditAlertsTemplate> {
    return this.alertsService.getTemplateByAlertId(alertId,alertChannel,businessUnitId).pipe(
      tap((payload) => {
        patchState({ editAlertsTemplate: payload });
        return payload;
      })
    );
  }
  @Action(UpdateTemplateByAlertId)
  UpdateTemplateByAlertId(
    { patchState }: StateContext<AlertsStateModel>,
    { editAlertsTemplateRequest }: UpdateTemplateByAlertId
  ): Observable<EditAlertsTemplate> {
    return this.alertsService.updateTemplateByAlertId(editAlertsTemplateRequest).pipe(
      tap((payload) => {
        patchState({ updateAlertsTemplate: payload });
        return payload;
      })
    );
  }
  @Action(SaveTemplateByAlertId)
  SaveTemplateByAlertId(
    { patchState }: StateContext<AlertsStateModel>,
    { addAlertsTemplateRequest }: SaveTemplateByAlertId
  ): Observable<EditAlertsTemplate> {
    return this.alertsService.saveTemplateByAlertId(addAlertsTemplateRequest).pipe(
      tap((payload) => {
        patchState({ saveAlertsTemplate: payload });
        return payload;
      })
    );
  }
  @Action(AlertTrigger)
  AlertTrigger(
    { patchState }: StateContext<AlertsStateModel>,
    { alertTriggerDto }: AlertTrigger
  ): Observable<number[]> {
    return this.alertsService.alertTrigger(alertTriggerDto).pipe(
      tap((payload) => {
        patchState({ alertTriggerDetails: payload });
        return payload;
      })
    );
  }

  @Action(DismissAlert)
  DismissAlert(    
    { patchState }: StateContext<AlertsStateModel>,
    { model }: DismissAlert
  ): Observable<any> {
    return this.alertsService.dismissAlert(model);
  }

  @Action(DismissAllAlerts)
  DismissAllAlerts(
    { patchState }: StateContext<AlertsStateModel>
  ): Observable<any> {
    return this.alertsService.dismissAllAlerts();
  }
  @Action(ClearAlertTemplateState)
  ClearAlertTemplateState(
    { patchState }: StateContext<AlertsStateModel>
  ):void{
    patchState({ updateAlertsTemplate: null,saveAlertsTemplate:null });
  }
}
