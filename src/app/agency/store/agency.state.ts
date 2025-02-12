import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { catchError, Observable, of, tap } from 'rxjs';
import { AGENCY_ADDED, AGENCY_CONVERTED_TO_MSP, AGENCY_CONVERTED_TO_MSP_FAIL, RECORD_MODIFIED } from 'src/app/shared/constants/messages';
import { MessageTypes } from 'src/app/shared/enums/message-types';

import { Agency, AgencyAuditHistory, AgencyFilteringOptions, AgencyPage, AgencyRegionSkills } from 'src/app/shared/models/agency.model';
import { OrganizationPage } from 'src/app/shared/models/organization.model';
import { OrganizationService } from 'src/app/shared/services/organization.service';
import { ShowToast } from 'src/app/store/app.actions';
import { AgencyService } from '../services/agency.service';
import {
  SaveAgency,
  SaveAgencySucceeded,
  GetAgencyById,
  GetAgencyByIdSucceeded,
  GetAgencyByPage,
  GetAgencyLogo,
  GetAgencyLogoSucceeded,
  UploadAgencyLogo,
  ClearAgencyEditStore,
  GetBusinessUnitList,
  RemoveAgencyLogo,
  ExportAgencyList,
  GetAgencyFilteringOptions,
  GetAgencyRegionsSkills,
  ConvertAgencyToMSP,
  GetAgencyAuditHistory,
  GetAgencyAuditHistoryDetailSucceeded,
  ConvertAgencyToMSPSucceeded,
} from './agency.actions';
import { AdminStateModel } from '@admin/store/admin.state';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { UserMspsChanged, UserOrganizationsAgenciesChanged } from 'src/app/store/user.actions';
import { getAllErrors } from '@shared/utils/error.utils';
import { HttpErrorResponse } from '@angular/common/http';

export interface AgencyStateModel {
  isAgencyLoading: boolean;
  agency: Agency | null;
  isOrganizationLoading: boolean;
  organizations: OrganizationPage | null;
  agencyPage: AgencyPage | null;
  businessUnits: BusinessUnit[];
  agencyFilteringOptions: AgencyFilteringOptions | null;
  regionsSkills: AgencyRegionSkills | null;
  agencyId: number | null;
  netSuiteId: number | null;
  name: string;
  AgencyAuditHistory: AgencyAuditHistory[];
}

@State<AgencyStateModel>({
  name: 'agency',
  defaults: {
    agency: null,
    agencyPage: null,
    isAgencyLoading: false,
    isOrganizationLoading: false,
    organizations: null,
    businessUnits: [],
    agencyFilteringOptions: null,
    regionsSkills: null,
    agencyId: null,
    netSuiteId: null,
    name: "",
    AgencyAuditHistory: []
  },
})
@Injectable()
export class AgencyState {
  @Selector()
  static isAgencyCreated(state: AgencyStateModel): boolean {
    return !!state.agency?.agencyDetails.id;
  }

  @Selector()
  static agencyName(state: AgencyStateModel): string | undefined {
    return state.agency?.agencyDetails.name;
  }

  @Selector()
  static businessUnits(state: AgencyStateModel): BusinessUnit[] {
    return state.businessUnits;
  }

  @Selector()
  static agencies(state: AgencyStateModel): AgencyPage | null {
    return state.agencyPage;
  }

  @Selector()
  static agency(state: AgencyStateModel): Agency | null {
    return state.agency;
  }

  @Selector()
  static agencyFilteringOptions(state: AgencyStateModel): AgencyFilteringOptions | null {
    return state.agencyFilteringOptions;
  }

  @Selector()
  static getRegionsSkills(state: AgencyStateModel): AgencyRegionSkills | null {
    return state.regionsSkills;
  }

  @Selector()
  static getAgencyAuditHistoryDetails(state: AgencyStateModel): AgencyAuditHistory[] {
    return state.AgencyAuditHistory;
  }

  constructor(private agencyService: AgencyService, private organizationService: OrganizationService) {}

  @Action(SaveAgency)
  SaveAgency(
    { patchState, dispatch }: StateContext<AgencyStateModel>,
    { payload }: SaveAgency
  ): Observable<Agency | Observable<void>> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.saveAgency(payload).pipe(
      tap((agency) => {
        patchState({ isAgencyLoading: false, agency });
        dispatch([new SaveAgencySucceeded(agency), new UserOrganizationsAgenciesChanged()]);
        if (payload.agencyDetails.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, AGENCY_ADDED));
        }
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return of(dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))));
      })
    );
  }

  @Action(GetAgencyByPage)
  GetAgencyByPage(
    { patchState }: StateContext<AgencyStateModel>,
    { pageNumber, pageSize, orderBy, filters }: GetAgencyByPage
  ): Observable<AgencyPage> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.getAgencies(pageNumber, pageSize, orderBy, filters).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false, agencyPage: payload });
        return payload;
      })
    );
  }

  @Action(GetAgencyById)
  GetAgencyById(
    { patchState, dispatch }: StateContext<AgencyStateModel>,
    { payload }: GetAgencyById
  ): Observable<Agency> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.getAgencyById(payload).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false, agency: payload });
        dispatch(new GetAgencyByIdSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(UploadAgencyLogo)
  UploadOrganizationLogo(
    { patchState }: StateContext<AgencyStateModel>,
    { file, businessUnitId }: UploadAgencyLogo
  ): Observable<any> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.saveAgencyLogo(file, businessUnitId).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false });
        return payload;
      })
    );
  }

  @Action(GetAgencyLogo)
  GetOrganizationLogo({ dispatch }: StateContext<AgencyStateModel>, { payload }: GetAgencyLogo): Observable<any> {
    return this.agencyService.getAgencyLogo(payload).pipe(
      tap((payload) => {
        dispatch(new GetAgencyLogoSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(RemoveAgencyLogo)
  RemoveAgencyLogo({ dispatch }: StateContext<AgencyStateModel>, { payload }: RemoveAgencyLogo): Observable<any> {
    return this.agencyService.removeAgencyLogo(payload).pipe(
      tap((payload) => payload),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Logo cannot be deleted'))))
    );
  }

  @Action(ClearAgencyEditStore)
  ClearAgencyEditStore({ patchState }: StateContext<AgencyStateModel>): void {
    patchState({
      agency: null,
      organizations: null,
    });
  }

  @Action(GetBusinessUnitList)
  GetBusinessUnitList(
    { patchState }: StateContext<AgencyStateModel>,
    {}: GetBusinessUnitList
  ): Observable<BusinessUnit[]> {
    return this.organizationService.getBusinessUnit().pipe(
      tap((payload) => {
        patchState({ businessUnits: payload });
        return payload;
      })
    );
  }

  @Action(ExportAgencyList)
  ExportAgencyList({}: StateContext<AdminStateModel>, { payload }: ExportAgencyList): Observable<Blob> {
    return this.agencyService.export(payload).pipe(
      tap((file: Blob) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(GetAgencyFilteringOptions)
  GetAgencyFilteringOptions({ patchState }: StateContext<AgencyStateModel>): Observable<AgencyFilteringOptions> {
    return this.agencyService.getAgencyFilteringOptions().pipe(
      tap((data) => {
        patchState({ agencyFilteringOptions: data });
      })
    );
  }

  @Action(GetAgencyRegionsSkills)
  GetAgencyRegionsSkills({ patchState }: StateContext<AgencyStateModel>): Observable<GetAgencyRegionsSkills> {
    return this.agencyService.getAgencyRegionSkills().pipe(
      tap((regionsSkills: AgencyRegionSkills) => {
        patchState({ regionsSkills });
      })
    );
  }

  @Action(ConvertAgencyToMSP)
  ConvertAgencyToMSP(
    { dispatch }: StateContext<AgencyStateModel>,
    { agencyId, netSuiteId, name }: ConvertAgencyToMSP
  ): Observable<boolean | void> {
    return this.agencyService.convertAgencyToMSP(agencyId, netSuiteId, name)
      .pipe(
        tap((res) => {
          if (res) {
            dispatch([new ShowToast(MessageTypes.Success, AGENCY_CONVERTED_TO_MSP), new UserMspsChanged()]);
            dispatch(new ConvertAgencyToMSPSucceeded(agencyId, netSuiteId, name));
          } else {
            dispatch(new ShowToast(MessageTypes.Warning, AGENCY_CONVERTED_TO_MSP_FAIL));
          }
        }),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }

  @Action(GetAgencyAuditHistory)
  GetAgencyAuditHistory({ patchState, dispatch }
    : StateContext<AgencyStateModel>,
    { payload }: GetAgencyAuditHistory)
    : Observable<AgencyAuditHistory[] | void> {
    return this.agencyService.getAgencyAuditHistory(payload).pipe(
      tap((payloads) => {
        patchState({ AgencyAuditHistory: payloads });
        dispatch(new GetAgencyAuditHistoryDetailSucceeded());
        return payloads;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }
}
