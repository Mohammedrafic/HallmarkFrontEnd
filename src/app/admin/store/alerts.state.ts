import { OrganizationService } from './../../shared/services/organization.service';
import { LogiReportService } from './../../shared/services/logi-report.service';
import {
  AgencyDto,
  CandidateStatusAndReasonFilterOptionsDto,
  MasterSkillDto,
  StaffScheduleReportFilterOptions,
  workCommitmentDto,
} from './../analytics/models/common-report.model';
import { Injectable } from '@angular/core';
import { UserSubscriptionPage, UserSubscriptionRequest } from '@shared/models/user-subscription.model';
import { Action, Selector, StateContext } from '@ngxs/store';
import {
  AlertTrigger,
  ClearAlertTemplateState,
  DismissAlert,
  DismissAllAlerts,
  GetAlertsTemplatePage,
  GetDocumentDownloadDeatils,
  GetDocumentDownloadDeatilsSucceeded,
  GetDocumentPreviewDeatils,
  GetDocumentPreviewDeatilsSucceeded,
  GetGroupEmailAgencies,
  GetGroupEmailById,
  GetGroupEmailCandidates,
  GetGroupEmailCandidateStatuses,
  GetGroupEmailDepartmentSkills,
  GetGroupEmailEmployees,
  GetGroupEmailInternalUsers,
  GetGroupEmailRoles,
  GetGroupEmailSkills,
  GetGroupEmailWorkCommitments,
  GetGroupMailByBusinessUnitIdPage,
  GetOrganizationById,
  GetStaffScheduleReportFilterOptions,
  GetTemplateByAlertId,
  GetUserSubscriptionPage,
  SaveTemplateByAlertId,
  SendGroupEmail,
  Toaster,
  UpdateTemplateByAlertId,
  UpdateUserSubscription,
} from './alerts.actions';
import { catchError, Observable, tap } from 'rxjs';
import { AlertsService } from '@shared/services/alerts.service';
import { BusinessUnitService } from '@shared/services/business-unit.service';
import {
  AlertsTemplate,
  AlertsTemplatePage,
  AlertTriggerDto,
  DismissAlertDto,
  EditAlertsTemplate,
} from '@shared/models/alerts-template.model';
import {
  DownloadDocumentDetail,
  GroupEmail,
  GroupEmailByBusinessUnitIdPage,
  GroupEmailRequest,
  GroupEmailRole,
} from '@shared/models/group-email.model';
import { GroupEmailService } from '@shared/services/group-email.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '../../shared/enums/message-types';
import { User } from '@shared/models/user.model';
import { DOCUMENT_DOWNLOAD_SUCCESS } from '@shared/constants/messages';
import { Organization } from '@shared/models/organization.model';

interface AlertsStateModel {
  userSubscriptionPage: UserSubscriptionPage | null;
  userSubscriptionSaved: boolean;
  alertsTemplatePage: AlertsTemplatePage | null;
  editAlertsTemplate: EditAlertsTemplate | null;
  saveAlertsTemplate: EditAlertsTemplate | null;
  updateAlertsTemplate: EditAlertsTemplate | null;
  alertTriggerDetails: number[];
  groupEmailByBusinessUnitIdPage: GroupEmailByBusinessUnitIdPage;
  sendGroupEmail: GroupEmail;
  groupEmailData: GroupEmail;
  groupEmailRoleData: GroupEmailRole;
  groupEmailUserData: User;
  groupEmailAgencyData: AgencyDto;
  groupEmailSkillsData: MasterSkillDto;
  groupEmailDeptSkillsData: MasterSkillDto;
  groupEmailCandidateStatusData: CandidateStatusAndReasonFilterOptionsDto;
  groupEmailCandidateData: User;
  groupEmailEmployeeData: User;
  documentPreviewDetail : DownloadDocumentDetail;
  documentDownloadDetail : DownloadDocumentDetail;
  getStaffScheduleReportFilterOptions: StaffScheduleReportFilterOptions | null;
  groupEmailWorkCommitmentData: workCommitmentDto;
  organization: Organization | null;
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
  static SendGroupEmail(state: AlertsStateModel): GroupEmail {
    return state.sendGroupEmail;
  }
  @Selector()
  static GetGroupEmailById(state: AlertsStateModel): GroupEmail {
    return state.groupEmailData;
  }
  @Selector()
  static GetGroupRolesByOrgId(state: AlertsStateModel): GroupEmailRole {
    return state.groupEmailRoleData;
  }
  @Selector()
  static GetGroupEmailInternalUsers(state: AlertsStateModel): User {
    return state.groupEmailUserData;
  }
  @Selector()
  static GetGroupEmailAgencies(state: AlertsStateModel): AgencyDto {
    return state.groupEmailAgencyData;
  }
  @Selector()
  static GetGroupEmailSkills(state: AlertsStateModel): MasterSkillDto {
    return state.groupEmailSkillsData;
  }
  @Selector()
  static GetGroupEmailDeptSkills(state: AlertsStateModel): MasterSkillDto {
    return state.groupEmailDeptSkillsData;
  }
  @Selector()
  static GetGroupEmailCandidateStatuses(state: AlertsStateModel): CandidateStatusAndReasonFilterOptionsDto {
    return state.groupEmailCandidateStatusData;
  }
  @Selector()
  static GetGroupEmailCandidates(state: AlertsStateModel): User {
    return state.groupEmailCandidateData;
  }
  
  @Selector()
  static GetGroupEmailEmployees(state: AlertsStateModel): User {
    return state.groupEmailEmployeeData;
  }

  @Selector()
  static documentDownloadDetail(state: AlertsStateModel): DownloadDocumentDetail | null {
    return state.documentDownloadDetail;
  }

  @Selector()
  static getStaffScheduleReportOptionData(state: AlertsStateModel):
  StaffScheduleReportFilterOptions | null {
    return state.getStaffScheduleReportFilterOptions;
  }

  @Selector()
  static GetGroupEmailWorkCommitments(state: AlertsStateModel): workCommitmentDto {
    return state.groupEmailWorkCommitmentData;
  }

  @Selector()
  static getOrganizationData(state: AlertsStateModel):Organization | null {
    return state.organization;
  }

  constructor(
    private businessUnitService: BusinessUnitService,
    private alertsService: AlertsService,
    private groupEmailService: GroupEmailService,
    private logiReportService: LogiReportService,
    private organizationService: OrganizationService
  ) {}

  @Action(GetUserSubscriptionPage)
  GetUserSubscriptionPage(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { userId, businessUnitType, pageNumber, pageSize, sortModel, filterModel, filters, isIRP }: GetUserSubscriptionPage
  ): Observable<UserSubscriptionPage | void> {
    return this.alertsService
      .getUserSubscriptionPage(businessUnitType, userId, pageNumber, pageSize, sortModel, filterModel, filters, isIRP)
      .pipe(
        tap((payload) => {
          patchState({ userSubscriptionPage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new Toaster());
        })
      );
  }
  @Action(UpdateUserSubscription)
  UpdateUserSubscription(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
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
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { businessUnitType, businessUnitId, pageNumber, pageSize, sortModel, filterModel, filters, isIRP }: GetAlertsTemplatePage
  ): Observable<AlertsTemplatePage | void> {
    return this.alertsService
      .getAlertsTemplatePage(businessUnitType, businessUnitId, pageNumber, pageSize, sortModel, filterModel, filters, isIRP)
      .pipe(
        tap((payload) => {
          patchState({ alertsTemplatePage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new Toaster());
        })
      );
  }

  @Action(GetTemplateByAlertId)
  GetTemplateByAlertId(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { alertId, alertChannel, businessUnitId, businessUnitType, isIRP }: GetTemplateByAlertId
  ): Observable<EditAlertsTemplate | void> {
    return this.alertsService.getTemplateByAlertId(alertId, alertChannel, businessUnitId, businessUnitType, isIRP).pipe(
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
    { dispatch, patchState }: StateContext<AlertsStateModel>,
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
    { dispatch, patchState }: StateContext<AlertsStateModel>,
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
    { dispatch, patchState }: StateContext<AlertsStateModel>,
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
  DismissAlert({ patchState }: StateContext<AlertsStateModel>, { model }: DismissAlert): Observable<any> {
    return this.alertsService.dismissAlert(model);
  }

  @Action(DismissAllAlerts)
  DismissAllAlerts({ patchState }: StateContext<AlertsStateModel>): Observable<any> {
    return this.alertsService.dismissAllAlerts();
  }
  @Action(ClearAlertTemplateState)
  ClearAlertTemplateState({ patchState }: StateContext<AlertsStateModel>): void {
    patchState({ updateAlertsTemplate: null, saveAlertsTemplate: null, sendGroupEmail: undefined });
  }
  @Action(GetGroupMailByBusinessUnitIdPage)
  GetGroupMailByBusinessUnitIdPage(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { businessUnitId, getAll,SeeMyEmailsOnly }: GetGroupMailByBusinessUnitIdPage
  ): Observable<GroupEmailByBusinessUnitIdPage | void> {
    return this.groupEmailService.getGroupMailByBusinessUnitIdPage(businessUnitId, getAll,SeeMyEmailsOnly).pipe(
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
    { dispatch, patchState }: StateContext<AlertsStateModel>,
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
    { dispatch, patchState }: StateContext<AlertsStateModel>,
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

  @Action(GetGroupEmailRoles)
  GetGroupEmailRoles(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { data }: GetGroupEmailRoles
  ): Observable<GroupEmailRole | void> {
    return this.groupEmailService.GetGroupEmailRolesByOrgId(data).pipe(
      tap((payload) => {
        patchState({ groupEmailRoleData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetGroupEmailInternalUsers)
  GetGroupEmailInternalUsers(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { regionIds, locationIds, roles, businessUnitIds, forAgency }: GetGroupEmailInternalUsers
  ): Observable<User | void> {
    return this.groupEmailService.GetGroupEmailUsersByRegionLocation(regionIds, locationIds, roles,businessUnitIds, forAgency).pipe(
      tap((payload) => {
        patchState({ groupEmailUserData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetGroupEmailAgencies)
  GetGroupEmailAgencies(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { businessUnitId }: GetGroupEmailAgencies
  ): Observable<AgencyDto | void> {
    return this.groupEmailService.GetGroupEmailAgenciesByBusinessUnit(businessUnitId).pipe(
      tap((payload) => {
        patchState({ groupEmailAgencyData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetGroupEmailSkills)
  GetGroupEmailSkills(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { businessUnitId, isAgency }: GetGroupEmailSkills
  ): Observable<MasterSkillDto | void> {
    return this.groupEmailService.GetGroupEmailSkillsByBusinessUnit(businessUnitId, isAgency).pipe(
      tap((payload) => {
        patchState({ groupEmailSkillsData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetGroupEmailCandidateStatuses)
  GetGroupEmailCandidateStatuses(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { businessUnitId }: GetGroupEmailCandidateStatuses
  ): Observable<CandidateStatusAndReasonFilterOptionsDto | void> {
    return this.groupEmailService.GetGroupEmailCandidateStatusesByBusinessUnit(businessUnitId).pipe(
      tap((payload) => {
        patchState({ groupEmailCandidateStatusData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetGroupEmailCandidates)
  GetGroupEmailCandidates(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    {
      agencies,
      skills,
      regions,
      locations,
      orderTypes,
      statuses,
      jobID,
      isAgency,
      businessUnitIds,
    }: GetGroupEmailCandidates
  ): Observable<User | void> {
    return this.groupEmailService
      .GetGroupEmailCandidates(agencies, skills, regions, locations, orderTypes, statuses, jobID, isAgency, businessUnitIds)
      .pipe(
        tap((payload) => {
          patchState({ groupEmailCandidateData: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(GetDocumentPreviewDeatils)
  GetDocumentPreviewDeatils({ patchState, dispatch }: StateContext<AlertsStateModel>, { id }: GetDocumentPreviewDeatils): Observable<DownloadDocumentDetail | void> {
    return this.groupEmailService.GetDocumentPreviewDetails(id).pipe(
      tap((payload) => {
        patchState({ documentPreviewDetail: payload });
        dispatch(new GetDocumentPreviewDeatilsSucceeded(payload));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetDocumentDownloadDeatils)
  GetDocumentDownloadDeatils({ patchState, dispatch }: StateContext<AlertsStateModel>, { id }: GetDocumentDownloadDeatils): Observable<DownloadDocumentDetail | void> {
    return this.groupEmailService.GetDocumentDownloadDetails(id).pipe(
      tap((payload) => {
        patchState({ documentDownloadDetail: payload });
        dispatch(new ShowToast(MessageTypes.Success, DOCUMENT_DOWNLOAD_SUCCESS));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetGroupEmailDepartmentSkills)
  GetGroupEmailDepartmentSkills(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    { departmentIds, businessUnitId }: GetGroupEmailDepartmentSkills
  ): Observable<MasterSkillDto | void> {
    return this.groupEmailService.GetGroupEmailDepartmentSkills(departmentIds, businessUnitId).pipe(
      tap((payload) => {
        patchState({ groupEmailDeptSkillsData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetGroupEmailEmployees)
  GetGroupEmailEmployees(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    {
      businessUnitId,
      regions,
      locations,
      departments,
      skills,
      workCommitments,
      orientationComplete      
    }: GetGroupEmailEmployees
  ): Observable<User | void> {
    return this.groupEmailService
      .GetGroupEmailEmployees(businessUnitId, regions, locations, departments, skills, workCommitments, orientationComplete)
      .pipe(
        tap((payload) => {
          patchState({ groupEmailEmployeeData: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(GetStaffScheduleReportFilterOptions)
  GetStaffScheduleReportFilterOptions({ patchState }: StateContext<AlertsStateModel>, { filter }: any): Observable<StaffScheduleReportFilterOptions> {
    return this.logiReportService.getStaffScheduleReportOptions(filter).pipe(tap((payload: any) => {
      patchState({ getStaffScheduleReportFilterOptions: payload });
      return payload
    }));
  }

  @Action(GetGroupEmailWorkCommitments)
  GetGroupEmailWorkCommitments(
    { dispatch, patchState }: StateContext<AlertsStateModel>,
    {
      businessUnitId,
      regions,
      locations,      
      skills      
    }: GetGroupEmailWorkCommitments
  ): Observable<workCommitmentDto | void> {
    return this.groupEmailService
      .GetGroupEmailWorkCommitments(businessUnitId, regions, locations, skills)
      .pipe(
        tap((payload) => {
          patchState({ groupEmailWorkCommitmentData: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }
  @Action(GetOrganizationById)
  GetOrganizationById({ patchState }: StateContext<AlertsStateModel>, { businessUnitId }: 
    GetOrganizationById): Observable<Organization> {
    return this.organizationService.getOrganizationById(businessUnitId).pipe(tap((payload) => {
      patchState({ organization: payload });      
      return payload;
    }));
  }
}
