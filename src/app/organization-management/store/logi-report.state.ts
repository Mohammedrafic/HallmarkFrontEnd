import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Department, DepartmentsPage } from "@shared/models/department.model";
import { LocationsPage } from "@shared/models/location.model";
import { Region, regionsPage } from "@shared/models/region.model";
import { LogiReportService } from "@shared/services/logi-report.service";
import { filter, Observable, tap } from "rxjs";
import { GetRegionsByOrganizations, GetLocationsByRegions, GetDepartmentsByLocations } from "./logi-report.action";

export interface LogiReportStateModel {

    departments: Department[] | DepartmentsPage;
    regions: Region[] | regionsPage;
    locations: Location[] | LocationsPage;
}
@State<LogiReportStateModel>({
    name: 'LogiReport',
    defaults: {

        departments: [],
        regions: [],
        locations: [],

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
}


