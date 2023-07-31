import { PageOfCollections } from './../../shared/models/page.model';
import { ScheduleApiService } from './../../modules/schedule/services/schedule-api.service';
import { CandidateStatusAndReasonFilterOptionsDto, CommonReportFilterOptions, SearchCandidate, SearchCredential, StaffScheduleReportFilterOptions } from "@admin/analytics/models/common-report.model";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { ConfigurationDto, LogiReportDto } from "@shared/models/analytics.model";
import { Department, DepartmentsPage } from "@shared/models/department.model";
import { LocationsPage } from "@shared/models/location.model";
import { Region, regionsPage } from "@shared/models/region.model";
import { LogiReportService } from "@shared/services/logi-report.service";
import { catchError, filter, Observable, tap } from "rxjs";
import { JobDetailSummaryReportFilterOptions } from "../../admin/analytics/models/jobdetail-summary.model";
import { AssociateAgencyDto } from "../../shared/models/logi-report-file";
import { GetRegionsByOrganizations, GetLocationsByRegions, GetDepartmentsByLocations, GetLogiReportData, ClearLogiReportState, GetCommonReportFilterOptions, GetCommonReportCandidateSearch, GetJobDetailSummaryReportFilterOptions, GetCommonReportCredentialSearch, GetCommonReportCandidateStatusOptions, GetStaffScheduleReportFilterOptions, GetCandidateSearchFromScheduling, GetStaffListReportCandidateSearch, GetOrganizationsByAgency, GetOrganizationsStructureByOrgIds, GetAgencyCommonFilterReportOptions, GetCommonReportAgencyCandidateSearch, GetCredentialTypes} from "./logi-report.action";
import { ScheduleCandidate, ScheduleCandidatesPage } from 'src/app/modules/schedule/interface/schedule.interface';
import { getAllErrors } from '@shared/utils/error.utils';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '../../shared/enums/message-types';
import { DataSourceItem } from '../../core/interface/common.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationStructure } from '../../shared/models/organization.model';
import { OrderManagementModel } from '../../agency/store/order-management.state';
import { AgencyCommonFilterReportOptions } from '../../agency/agency-reports/models/agency-common-report.model';
import { CredentialType } from '@shared/models/credential-type.model';
export interface LogiReportStateModel {

    departments: Department[] | DepartmentsPage;
    regions: Region[] | regionsPage;
    locations: Location[] | LocationsPage;
    logiReportDto:ConfigurationDto[];
    commonReportFilterOptions:CommonReportFilterOptions|null;
    searchCandidates: SearchCandidate[];
    searchCredentials:SearchCredential[];
    jobDetailSummaryReportFilterOptions: JobDetailSummaryReportFilterOptions | null;
    getCommonReportCandidateStatusOptions: CandidateStatusAndReasonFilterOptionsDto[] | [];
    getStaffScheduleReportFilterOptions: StaffScheduleReportFilterOptions | null;
   getEmployeesSearchFromScheduling: ScheduleCandidatesPage | null;
  organizations: DataSourceItem[];
  organizationsStructure: OrganizationStructure[];
  agencyCommonFilterReportOptions: AgencyCommonFilterReportOptions | null;
  credentialTypes:CredentialType[];
}
@State<LogiReportStateModel>({
    name: 'LogiReport',
    defaults: {
        departments: [],
        regions: [],
        locations: [],
        logiReportDto:[],
        commonReportFilterOptions:null,
        searchCandidates: [],
        searchCredentials:[],
        jobDetailSummaryReportFilterOptions: null,
        getCommonReportCandidateStatusOptions :[],
        getStaffScheduleReportFilterOptions: null,
        getEmployeesSearchFromScheduling: null,
        organizations: [],
      organizationsStructure: [],
      agencyCommonFilterReportOptions:null,
      credentialTypes: [],
    },
})
@Injectable()
export class LogiReportState {
    constructor(
        private logiReportService: LogiReportService,
        private scheduleApiService: ScheduleApiService
    ) { }

    @Selector()
    static regions(state: LogiReportStateModel): Region[] | regionsPage { return state.regions; }

    @Selector()
    static locations(state: LogiReportStateModel): Location[] | LocationsPage { return state.locations; }
    
    @Selector()
    static departments(state: LogiReportStateModel): Department[] | DepartmentsPage { return state.departments; }
    @Selector()
    static logiReportData(state: LogiReportStateModel): ConfigurationDto[]  { return state.logiReportDto; }

    @Selector()
    static commonReportFilterData(state: LogiReportStateModel): CommonReportFilterOptions|null  { return state.commonReportFilterOptions; }
    
    @Selector()
    static commonReportCandidateSearch(state: LogiReportStateModel): SearchCandidate[]  { return state.searchCandidates; }

    @Selector()
    static commonReportCredentialSearch(state: LogiReportStateModel): SearchCredential[]  { return state.searchCredentials; }

    @Selector()
    static jobDetailSummaryReportFilterData(state: LogiReportStateModel): JobDetailSummaryReportFilterOptions | null { return state.jobDetailSummaryReportFilterOptions; }

    @Selector()
    static getCommonReportCandidateStatusData(state: LogiReportStateModel): CandidateStatusAndReasonFilterOptionsDto[] | null { return state.getCommonReportCandidateStatusOptions; }

    @Selector()
    static getStaffScheduleReportOptionData(state: LogiReportStateModel):
    StaffScheduleReportFilterOptions | null {
        return state.getStaffScheduleReportFilterOptions;
    }

    @Selector()
    static getEmployeesSearchFromScheduling(state: LogiReportStateModel): ScheduleCandidatesPage | null {
        return state.getEmployeesSearchFromScheduling;
  }
  @Selector()
  static getOrganizationsByAgency(state: LogiReportStateModel): DataSourceItem[] | null {
    return state.organizations;
  }
  @Selector()
  static getOrganizationsStructure(state: LogiReportStateModel): OrganizationStructure[] | null {
    return state.organizationsStructure;
  }
  @Selector()
  static agencycommonReportFilterData(state: LogiReportStateModel): AgencyCommonFilterReportOptions | null { return state.agencyCommonFilterReportOptions; }

  @Selector()
  static credentialTypes(state: LogiReportStateModel): CredentialType[] {
    return state.credentialTypes;
  }

    @Action(GetRegionsByOrganizations)
    GetRegionsByOrganizations({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<Region[]> {
        return this.logiReportService.getRegionsByOrganizationId(filter).pipe(tap((payload: any) => {
            if ("items" in payload) {
                patchState({ regions: payload.items });
                return payload.items;
            } else {
                patchState({ regions: payload });
                return payload
            }
        }));
    }
    @Action(GetLocationsByRegions)
    GetLocationsByRegions({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<Location[]> {
        return this.logiReportService.getLocationsByOrganizationId(filter).pipe(tap((payload: any) => {
            if ("items" in payload) {
                patchState({ locations: payload.items });
                return payload.items;
            } else {
                patchState({ locations: payload });
                return payload
            }
        }));
    }
    @Action(GetDepartmentsByLocations)
    GetDepartmentsByLocations({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<Department[]> {
        return this.logiReportService.getDepartmentsByOrganizationId(filter).pipe(tap((payload: any) => {
            if ("items" in payload) {
                patchState({ departments: payload.items });
                return payload.items;
            } else {
                patchState({ departments: payload });
                return payload
            }
        }));
    }
    @Action(GetLogiReportData)
    GetLogiReporData({ patchState }: StateContext<LogiReportStateModel>): Observable<ConfigurationDto[]> {
        return this.logiReportService.getLogiReportData().pipe(tap((payload: any) => {         
                patchState({ 
                    logiReportDto:payload==null?[]: payload,
                });
                return payload==null?[]:payload;           
    }));
    }
    @Action(ClearLogiReportState)
    ClearLogiReportState(
      { patchState }: StateContext<LogiReportStateModel>
    ):void{
      patchState({ regions: [],locations:[],departments:[] });
    }
    
    @Action(GetCommonReportFilterOptions)
    GetCommonReportFilterOptions({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<CommonReportFilterOptions> {
        return this.logiReportService.getCommonReportFilterOptions(filter).pipe(tap((payload: any) => {           
                patchState({ commonReportFilterOptions: payload });
                return payload
           
        }));
    }
    @Action(GetCommonReportCandidateSearch)
    GetCommonReportCandidateSearch({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<SearchCandidate[]> {
        return this.logiReportService.getCommonCandidateSearch(filter).pipe(tap((payload: any) => {           
                patchState({ searchCandidates: payload });
                return payload
           
        }));
  }

  @Action(GetCommonReportAgencyCandidateSearch)
  GetCommonReportAgencyCandidateSearch({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<SearchCandidate[]> {
    return this.logiReportService.getCommonAgencyCandidateSearch(filter).pipe(tap((payload: any) => {
      patchState({ searchCandidates: payload });
      return payload

    }));
  }

  @Action(GetJobDetailSummaryReportFilterOptions)
  GetJobDetailSummaryReportFilterOptions({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<JobDetailSummaryReportFilterOptions> {
    return this.logiReportService.getCommonReportFilterOptions(filter).pipe(tap((payload: any) => {
      patchState({ jobDetailSummaryReportFilterOptions: payload });
      return payload

    }));
  }
  @Action(GetCommonReportCredentialSearch)
  GetCommonReportCredentialSearch({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<SearchCandidate[]> {
        return this.logiReportService.getCommonCredentialSearch(filter).pipe(tap((payload: any) => {           
                patchState({ searchCredentials: payload });
                return payload
           
        }));
  }


  @Action(GetCommonReportCandidateStatusOptions)
  GetCommonReportCandidateStatusOptions({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<CandidateStatusAndReasonFilterOptionsDto[]> {
    return this.logiReportService.getCommonReportCandidateStatusOptions(filter).pipe(tap((payload: any) => {
      patchState({ getCommonReportCandidateStatusOptions: payload });
      return payload
    }));
  }

  @Action(GetStaffScheduleReportFilterOptions)
  GetStaffScheduleReportFilterOptions({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<StaffScheduleReportFilterOptions> {
    return this.logiReportService.getStaffScheduleReportOptions(filter).pipe(tap((payload: any) => {
      patchState({ getStaffScheduleReportFilterOptions: payload });
      return payload
    }));
  }

  @Action(GetCandidateSearchFromScheduling)
  GetCandidateSearchFromScheduling({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<ScheduleCandidatesPage> {
    return this.scheduleApiService.getScheduleEmployees(filter).pipe(tap((payload: any) => {      
      patchState({ getEmployeesSearchFromScheduling: payload });
      return payload
    }));
  }

  @Action(GetStaffListReportCandidateSearch)
  GetStaffListReportCandidateSearch({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<SearchCandidate[]> {
    return this.logiReportService.getStaffListCandidateSearch(filter).pipe(tap((payload: any) => {           
        patchState({ searchCandidates: payload });
        return payload           
    }));
  }
  @Action(GetOrganizationsByAgency)
  GetOrganizationsByAgency(
    { patchState, dispatch }: StateContext<LogiReportStateModel>,
  ): Observable<DataSourceItem[] | void> {
    return this.logiReportService.getOrganizations()
      .pipe(
        tap((res) => {
          patchState({
            organizations: res,
          });
        }),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }
  @Action(GetOrganizationsStructureByOrgIds)
  GetOrganizationsStructureByOrgIds(
    { patchState }: StateContext<LogiReportStateModel>,
    { organizationIds }: any
  ): Observable<OrganizationStructure[]> {
    return this.logiReportService
      .getOrganizationsStructure(organizationIds)
      .pipe(tap((payload) => patchState({ organizationsStructure: payload }))
      );
  }
  @Action(GetAgencyCommonFilterReportOptions)
  GetAgencyCommonFilterReportOptions({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<AgencyCommonFilterReportOptions> {
    return this.logiReportService.getAgencyCommonReportFilterOptions(filter).pipe(tap((payload: any) => {
      patchState({ agencyCommonFilterReportOptions: payload });
      return payload

    }));
  }

  @Action(GetCredentialTypes)
  GetCredentialTypes(
    { patchState }: StateContext<LogiReportStateModel>,
    {}: GetCredentialTypes
  ): Observable<CredentialType[]> {
    return this.logiReportService.getCredentialTypes().pipe(
      tap((payload) => {
        patchState({ credentialTypes: payload });
        return payload;
      })
    );
  }
}

