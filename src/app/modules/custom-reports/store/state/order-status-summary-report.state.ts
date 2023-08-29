import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, Observable, tap } from "rxjs";
import { ShowToast } from "src/app/store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { GetOrderStatusSummaryReportPage, GetOrderStatusSummaryFiltersByOrganization } from "../actions/order-status-summary-report.actions";
/*import { Department, DepartmentsPage } from "@shared/models/department.model";*/
import { OrderStatusSummaryCustomReport, OrderStatusSummaryReportFilters } from "../model/order-status-summary-report.model";
import { OrderStatusSummaryReportService } from "../../services/order-status-summary-report.services";
/*import { GetLocationsByOrganizationId } from "../../../../organization-management/store/organization-management.actions";*/



interface OrderStatusSummaryCustomReportStateModel {

  reports: OrderStatusSummaryCustomReport[];
  filters: OrderStatusSummaryReportFilters;
}

@State<OrderStatusSummaryCustomReportStateModel>({
  name: 'orderstatussummarycustomreport',
  defaults: {
    reports: [],
    filters: { region: [], location: [], department: [], skills: [], orderStatus: [] },
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
}
