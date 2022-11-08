import { FinancialTimeSheetReportFilterOptions, SearchCandidate } from "@admin/analytics/models/financial-timesheet.model";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { ConfigurationDto, LogiReportDto } from "@shared/models/analytics.model";
import { Department, DepartmentsPage } from "@shared/models/department.model";
import { LocationsPage } from "@shared/models/location.model";
import { Region, regionsPage } from "@shared/models/region.model";
import { LogiReportService } from "@shared/services/logi-report.service";
import { filter, Observable, tap } from "rxjs";
import { GetRegionsByOrganizations, GetLocationsByRegions, GetDepartmentsByLocations, GetLogiReportData, ClearLogiReportState, GetFinancialTimeSheetReportFilterOptions, GetFinancialTimeSheetCandidateSearch } from "./logi-report.action";

export interface LogiReportStateModel {

    departments: Department[] | DepartmentsPage;
    regions: Region[] | regionsPage;
    locations: Location[] | LocationsPage;
    logiReportDto:ConfigurationDto[];
    financialTimeSheetFilterOptions:FinancialTimeSheetReportFilterOptions|null;
    searchCandidates:SearchCandidate[];

}
@State<LogiReportStateModel>({
    name: 'LogiReport',
    defaults: {

        departments: [],
        regions: [],
        locations: [],
        logiReportDto:[],
        financialTimeSheetFilterOptions:null,
        searchCandidates:[]
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
    static financialTimeSheetFilterData(state: LogiReportStateModel): FinancialTimeSheetReportFilterOptions|null  { return state.financialTimeSheetFilterOptions; }
    
    @Selector()
    static financialTimeSheetCandidateSearch(state: LogiReportStateModel): SearchCandidate[]  { return state.searchCandidates; }

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
    
    @Action(GetFinancialTimeSheetReportFilterOptions)
    GetFinancialTimeSheetReportFilterOptions({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<FinancialTimeSheetReportFilterOptions> {
        return this.logiReportService.getFinancialTimeSheetReportFilterOptions(filter).pipe(tap((payload: any) => {           
                patchState({ financialTimeSheetFilterOptions: payload });
                return payload
           
        }));
    }
    @Action(GetFinancialTimeSheetCandidateSearch)
    GetFinancialTimeSheetCandidateSearch({ patchState }: StateContext<LogiReportStateModel>, { filter }: any): Observable<FinancialTimeSheetReportFilterOptions> {
        return this.logiReportService.getFinancialTimeSheetCandidateSearch(filter).pipe(tap((payload: any) => {           
                patchState({ searchCandidates: payload });
                return payload
           
        }));
    }
}


