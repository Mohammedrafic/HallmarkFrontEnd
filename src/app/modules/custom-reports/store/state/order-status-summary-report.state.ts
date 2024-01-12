import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, Observable, tap } from "rxjs";
import { ShowToast } from "src/app/store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { GetOrderStatusSummaryReportPage, GetOrderStatusSummaryFiltersByOrganization, GetRegionsByOrganizations, GetLocationsByRegions, GetDepartmentsByLocations } from "../actions/order-status-summary-report.actions";
import { OrderStatusSummaryCustomReport, OrderStatusSummaryReportFilters, Region, Location, Department } from "../model/order-status-summary-report.model";
import { OrderStatusSummaryReportService } from "../../services/order-status-summary-report.services";

interface OrderStatusSummaryCustomReportStateModel {

  reports: OrderStatusSummaryCustomReport[];
  filters: OrderStatusSummaryReportFilters;
  regions: Region[];
  locations: Location[];
  departments: Department[];
}

@State<OrderStatusSummaryCustomReportStateModel>({
  name: 'orderstatussummarycustomreport',
  defaults: {
    reports: [],
    filters: { skills: [], orderType: [] },
    regions: [],
    locations: [],
    departments: [],
  },
})
@Injectable()
export class OrderStatusSummaryCustomReportState {


  @Selector()
  static CustomReportPage(state: OrderStatusSummaryCustomReportStateModel): OrderStatusSummaryCustomReport[] | null {
    return state.reports;
  }

  @Selector()
  static OrderStatusSummaryFilters(state: OrderStatusSummaryCustomReportStateModel): OrderStatusSummaryReportFilters | null {
    return state.filters;
  }

  @Selector()
  static regions(state: OrderStatusSummaryCustomReportStateModel): Region[]  { return state.regions; }

  @Selector()
  static locations(state: OrderStatusSummaryCustomReportStateModel): Location[] { return state.locations; }

  @Selector()
  static departments(state: OrderStatusSummaryCustomReportStateModel): Department[] { return state.departments; }
  constructor(
    private orderStatusSummaryReportService: OrderStatusSummaryReportService
  ) { }

  @Action(GetOrderStatusSummaryReportPage)
  GetOrderStatusSummaryReportPage(
    { dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>,
    { payload } : any
  ): Observable<OrderStatusSummaryCustomReport[] | void> {

    return this.orderStatusSummaryReportService
      .getOrderStatusSummaryReport(payload)
      .pipe(
        tap((data) => {
          patchState({ reports: data });
          return data;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(GetOrderStatusSummaryFiltersByOrganization)
  GetOrderStatusSummaryFiltersByOrganization(
    { dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>
  ): Observable<OrderStatusSummaryReportFilters | void> {

    return this.orderStatusSummaryReportService
      .getFiltersByOrganizationId()
      .pipe(
        tap((data) => {
          patchState({
            filters: data
          });
          return data;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }
  @Action(GetRegionsByOrganizations)
  GetRegionsByOrganizations({ dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>, organizationId: number[]): Observable<Region[]> {
    return this.orderStatusSummaryReportService.getRegionsByOrganizationId({ organizationId }).pipe(tap((payload: any) => {
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
  GetLocationsByRegions({ dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>, regionIds: string, organizationId: number[]): Observable<Location[]> {
    return this.orderStatusSummaryReportService.getLocationsByRegionIds({ regionIds, organizationId }).pipe(tap((payload: any) => {
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
  GetDepartmentsByLocations({ dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>, locationIds: string, organizationId: number[]): Observable<Department[]> {
    return this.orderStatusSummaryReportService.getDepartmentsByLocationIds({ locationIds, organizationId }).pipe(tap((payload: any) => {
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
