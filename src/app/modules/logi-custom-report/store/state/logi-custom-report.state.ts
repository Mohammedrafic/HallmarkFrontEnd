import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, Observable, tap } from "rxjs";
import { MessageTypes } from "../../../../shared/enums/message-types";
import { ShowToast } from "../../../../store/app.actions";
import { LogiCustomReportService } from "../../services/logi-custom-report.service";
import { GetCustomReportPage, SaveCustomReport } from "../actions/logi-custom-report.actions";
import { AddLogiCustomReportRequest, LogiCustomReport, LogiCustomReportPage } from "../model/logi-custom-report.model";


interface LogiCustomReportStateModel {
 
  logiCustomReportPage: LogiCustomReportPage | null;
  logiCustomReport: LogiCustomReport | null;

}

@State<LogiCustomReportStateModel>({
  name: 'logicustomreport',
  defaults: {
    logiCustomReportPage: null, logiCustomReport: null
  },
})
@Injectable()
export class LogiCustomReportState {

  @Selector()
  static CustomReportGridData(state: LogiCustomReportStateModel): LogiCustomReport[] {
    return state.logiCustomReportPage?.items || [];
  }
  @Selector()
  static  CustomReportPage(state: LogiCustomReportStateModel): LogiCustomReportPage | null {
    return state.logiCustomReportPage;
  }
  @Selector()
  static SaveCustomReport(state: LogiCustomReportStateModel): LogiCustomReport | null {
    return state.logiCustomReport;
  }
  constructor(
    private logiCustomReportService: LogiCustomReportService
  ) { }

  @Action(GetCustomReportPage)
  GetCustomReportPage(
    { dispatch, patchState }: StateContext<LogiCustomReportStateModel>,
    { organizationId, pageNumber, pageSize }: GetCustomReportPage
  ): Observable<LogiCustomReportPage | void> {
   
    return this.logiCustomReportService
      .getCustomReportPage(organizationId, pageNumber, pageSize)
      .pipe(
        tap((payload) => {
          patchState({ logiCustomReportPage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(SaveCustomReport)
  SaveCustomReport(
    { dispatch, patchState }: StateContext<LogiCustomReportStateModel>,
    { addLogiCustomReportRequest }: SaveCustomReport
  ): Observable<LogiCustomReport | void> {
    return this.logiCustomReportService.createCustomReport(addLogiCustomReportRequest).pipe(
      tap((payload) => {
        patchState({ logiCustomReport: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
}
