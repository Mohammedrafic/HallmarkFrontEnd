import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, Observable, tap } from "rxjs";
import { ShowToast } from "src/app/store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { GetOrderStatusSummaryReportPage, GetOrderStatusSummaryFiltersByOrganization, GetRegionsByOrganizations, GetLocationsByRegions, GetDepartmentsByLocations, GetSkillsByOrganizations } from "../actions/order-status-summary-report.actions";
import { OrderStatusSummaryCustomReport, OrderStatusSummaryReportFilters, Region, Location, Department, Skills, OrderTypeDto } from "../model/order-status-summary-report.model";
import { OrderStatusSummaryReportService } from "../../services/order-status-summary-report.services";

interface OrderStatusSummaryCustomReportStateModel {

  reports: OrderStatusSummaryCustomReport[];
  regions: Region[];
  locations: Location[];
  departments: Department[];
  skills: Skills[];
  orderType: OrderTypeDto[];
}

@State<OrderStatusSummaryCustomReportStateModel>({
  name: 'orderstatussummarycustomreport',
  defaults: {
    reports: [],
    regions: [],
    locations: [],
    departments: [],
    skills: [],
    orderType: []
  },
})
@Injectable()
export class OrderStatusSummaryCustomReportState {


  @Selector()
  static CustomReportPage(state: OrderStatusSummaryCustomReportStateModel): OrderStatusSummaryCustomReport[] | null {
    return state.reports;
  }

  @Selector()
  static regions(state: OrderStatusSummaryCustomReportStateModel): Region[]  { return state.regions; }

  @Selector()
  static locations(state: OrderStatusSummaryCustomReportStateModel): Location[] { return state.locations; }

  @Selector()
  static departments(state: OrderStatusSummaryCustomReportStateModel): Department[] { return state.departments; }

  @Selector()
  static skills(state: OrderStatusSummaryCustomReportStateModel): Skills[] { return state.skills; }

  @Selector()
  static orderType(state: OrderStatusSummaryCustomReportStateModel): OrderTypeDto[] { return state.orderType; }
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
  ): Observable<OrderTypeDto[] | void> {

    return this.orderStatusSummaryReportService
      .getFiltersByOrganizationId()
      .pipe(
        tap((data :any) => {
          if ("items" in data) {
            patchState({ orderType: data.items });
            return data.items;
          } else {
            patchState({ orderType: data });
            return data
          }
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(GetRegionsByOrganizations)
  GetRegionsByOrganizations({ dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>, organizationId: number[]): Observable<Region[] | void> {
    return this.orderStatusSummaryReportService.getRegionsByOrganizationId(organizationId).pipe(tap((payload: any) => {
      if ("items" in payload) {
        patchState({ regions: payload.items });
          return payload.items;
        } else {
        patchState({ regions: payload });
          return payload
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetLocationsByRegions)
  GetLocationsByRegions({ dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>, { regionIds, organizationId }: any): Observable<Location[] | void> {
    return this.orderStatusSummaryReportService.getLocationsByRegionIds(regionIds, organizationId).pipe(tap((payload: any) => {
      if ("items" in payload) {
        patchState({ locations: payload.items });
        return payload.items;
      } else {
        patchState({ locations: payload });
        return payload
      }
    }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetDepartmentsByLocations)
  GetDepartmentsByLocations({ dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>, { locationIds, organizationId } : any): Observable<Department[] | void> {
    return this.orderStatusSummaryReportService.getDepartmentsByLocationIds(locationIds, organizationId).pipe(tap((payload: any) => {
      if ("items" in payload) {
        patchState({ departments: payload.items });
        return payload.items;
      } else {
        patchState({ departments: payload });
        return payload
      }
    }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetSkillsByOrganizations)
  GetSkillsByLocationsOrganizations({ dispatch, patchState }: StateContext<OrderStatusSummaryCustomReportStateModel>): Observable<Skills[] | void> {
    return this.orderStatusSummaryReportService.getSkillsByOrganizationId().pipe(tap((payload: any) => {
      if ("items" in payload) {
        patchState({ skills: payload.items });
        return payload.items;
      } else {
        patchState({ skills: payload });
        return payload
      }
    }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
}
