import { Injectable } from "@angular/core";
import { UserSubscriptionPage, UserSubscriptionRequest } from "@shared/models/user-subscription.model";
import { Action, Selector, StateContext} from '@ngxs/store';
import { AlertTrigger, ClearAlertTemplateState, DismissAlert, DismissAllAlerts, GetAlertsTemplatePage, GetGroupEmailById, GetGroupMailByBusinessUnitIdPage, GetTemplateByAlertId, GetUserSubscriptionPage, SaveTemplateByAlertId, SendGroupEmail, UpdateTemplateByAlertId, UpdateUserSubscription } from "./alerts.actions";
import { catchError, Observable ,tap} from "rxjs";
import { AlertsService } from "@shared/services/alerts.service";
import { BusinessUnitService } from "@shared/services/business-unit.service";
import { AlertsTemplate, AlertsTemplatePage, AlertTriggerDto, DismissAlertDto, EditAlertsTemplate } from "@shared/models/alerts-template.model";
import { GroupEmail, GroupEmailByBusinessUnitIdPage, GroupEmailRequest } from "@shared/models/group-email.model";
import { GroupEmailService } from "@shared/services/group-email.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ShowToast } from "../../store/app.actions";
import { MessageTypes } from "../../shared/enums/message-types";

interface AlertsStateModel {
  userSubscriptionPage: UserSubscriptionPage | null;
  userSubscriptionSaved: boolean;
    alertsTemplatePage:AlertsTemplatePage |null;
    editAlertsTemplate: EditAlertsTemplate | null;
    saveAlertsTemplate: EditAlertsTemplate | null;
    updateAlertsTemplate: EditAlertsTemplate | null;
    alertTriggerDetails:number[];
    groupEmailByBusinessUnitIdPage: GroupEmailByBusinessUnitIdPage ;
    sendGroupEmail:GroupEmail;
    groupEmailData:GroupEmail;
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
  @Selector()
  static GroupEmailByBusinessUnitIdPage(state: AlertsStateModel): GroupEmailByBusinessUnitIdPage {
    return state.groupEmailByBusinessUnitIdPage;
  }
  @Selector()
  static SendGroupEmail(state:AlertsStateModel):GroupEmail{
    return state.sendGroupEmail;
  }
  @Selector()
  static GetGroupEmailById(state:AlertsStateModel):GroupEmail{
    return state.groupEmailData;
  }

 
  constructor(
    private businessUnitService: BusinessUnitService,
    private alertsService: AlertsService,
    private groupEmailService: GroupEmailService
  ) {}
  
  
  @Action(GetUserSubscriptionPage)
  GetUserSubscriptionPage(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { userId, businessUnitType, pageNumber, pageSize, sortModel, filterModel, filters }: GetUserSubscriptionPage
  ): Observable<UserSubscriptionPage | void> {
    return this.alertsService.getUserSubscriptionPage(businessUnitType, userId, pageNumber, pageSize, sortModel, filterModel, filters).pipe(
      tap((payload) => {
        patchState({ userSubscriptionPage: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
  @Action(UpdateUserSubscription)
  UpdateUserSubscription(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { userSubscriptionRequest }: UpdateUserSubscription
  ): Observable<void> {
    return this.alertsService.updateUserSubscription(userSubscriptionRequest).pipe(
      tap((payload) => {
        patchState({ userSubscriptionSaved: true });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
   
  }
  
  @Action(GetAlertsTemplatePage)
  GetAlertsTemplatePage(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { businessUnitType,businessUnitId,pageNumber, pageSize, sortModel, filterModel, filters }: GetAlertsTemplatePage
  ): Observable<AlertsTemplatePage | void> {
    return this.alertsService.getAlertsTemplatePage(businessUnitType,businessUnitId,pageNumber, pageSize, sortModel, filterModel, filters).pipe(
      tap((payload) => {
        patchState({ alertsTemplatePage: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetTemplateByAlertId)
  GetTemplateByAlertId(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { alertId, alertChannel, businessUnitId }: GetTemplateByAlertId
  ): Observable<EditAlertsTemplate | void> {
    return this.alertsService.getTemplateByAlertId(alertId,alertChannel,businessUnitId).pipe(
      tap((payload) => {
        patchState({ editAlertsTemplate: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
  @Action(UpdateTemplateByAlertId)
  UpdateTemplateByAlertId(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { editAlertsTemplateRequest }: UpdateTemplateByAlertId
  ): Observable<EditAlertsTemplate | void> {
    return this.alertsService.updateTemplateByAlertId(editAlertsTemplateRequest).pipe(
      tap((payload) => {
        patchState({ updateAlertsTemplate: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
  @Action(SaveTemplateByAlertId)
  SaveTemplateByAlertId(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { addAlertsTemplateRequest }: SaveTemplateByAlertId
  ): Observable<EditAlertsTemplate | void> {
    return this.alertsService.saveTemplateByAlertId(addAlertsTemplateRequest).pipe(
      tap((payload) => {
        patchState({ saveAlertsTemplate: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
  @Action(AlertTrigger)
  AlertTrigger(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { alertTriggerDto }: AlertTrigger
  ): Observable<number[] | void> {
    return this.alertsService.alertTrigger(alertTriggerDto).pipe(
      tap((payload) => {
        patchState({ alertTriggerDetails: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
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
    patchState({ updateAlertsTemplate: null,saveAlertsTemplate:null,sendGroupEmail:undefined });
  }
  @Action(GetGroupMailByBusinessUnitIdPage)
  GetGroupMailByBusinessUnitIdPage(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { businessUnitId,getAll}: GetGroupMailByBusinessUnitIdPage
  ): Observable<GroupEmailByBusinessUnitIdPage | void> {
    return this.groupEmailService.getGroupMailByBusinessUnitIdPage(businessUnitId,getAll).pipe(
      tap((payload) => {
        patchState({ groupEmailByBusinessUnitIdPage: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
  @Action(SendGroupEmail)
  SendGroupEmail(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { sendGroupEmailRequest }: SendGroupEmail
  ): Observable<GroupEmail | void> {
    return this.groupEmailService.SendGroupEmail(sendGroupEmailRequest).pipe(
      tap((payload) => {
        patchState({ sendGroupEmail: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
  @Action(GetGroupEmailById)
  GetGroupEmailById(
    { dispatch,patchState }: StateContext<AlertsStateModel>,
    { id }: GetGroupEmailById
  ): Observable<GroupEmail | void> {
    return this.groupEmailService.GetGroupEmailById(id).pipe(
      tap((payload) => {
        patchState({ groupEmailData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
}
