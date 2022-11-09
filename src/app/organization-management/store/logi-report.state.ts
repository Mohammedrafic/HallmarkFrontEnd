import { CommonReportFilterOptions, SearchCandidate } from "@admin/analytics/models/common-report.model";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { ConfigurationDto, LogiReportDto } from "@shared/models/analytics.model";
import { Department, DepartmentsPage } from "@shared/models/department.model";
import { LocationsPage } from "@shared/models/location.model";
import { Region, regionsPage } from "@shared/models/region.model";
import { LogiReportService } from "@shared/services/logi-report.service";
import { filter, Observable, tap } from "rxjs";
import { JobDetailSummaryReportFilterOptions } from "../../admin/analytics/models/jobdetail-summary.model";
import { GetRegionsByOrganizations, GetLocationsByRegions, GetDepartmentsByLocations, GetLogiReportData, ClearLogiReportState, GetCommonReportFilterOptions, GetCommonReportCandidateSearch, GetJobDetailSummaryReportFilterOptions } from "./logi-report.action";

export interface LogiReportStateModel {

    departments: Department[] | DepartmentsPage;
    regions: Region[] | regionsPage;
    locations: Location[] | LocationsPage;
    logiReportDto:ConfigurationDto[];
    commonReportFilterOptions:CommonReportFilterOptions|null;
    searchCandidates: SearchCandidate[];
    jobDetailSummaryReportFilterOptions: JobDetailSummaryReportFilterOptions | null;

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
        jobDetailSummaryReportFilterOptions:null
    },
})
@Injectable()
export class LogiReportState {
    constructor(
        private logiReportService: LogiReportService
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
    static jobDetailSummaryReportFilterData(state: LogiReportStateModel): JobDetailSummaryReportFilterOptions | null { return state.jobDetailSummaryReportFilterOptions; }

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

  @Action(GetJobDetailSummaryReportFilterOptions)
  GetJobDetailSummaryReportFilterOptions({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<JobDetailSummaryReportFilterOptions> {
    return this.logiReportService.getCommonReportFilterOptions(filter).pipe(tap((payload: any) => {
      patchState({ jobDetailSummaryReportFilterOptions: payload });
      return payload

    }));
  }
}


