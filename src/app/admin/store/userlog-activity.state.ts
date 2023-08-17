import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { userActivity, useractivitlogreportPage } from "@shared/models/userlog-activity.model";
import { catchError, Observable, tap } from "rxjs";
import { GetuserlogReportPage } from "./userlog-activity.actions";
import { LogiCustomReportPage } from "src/app/modules/logi-custom-report/store/model/logi-custom-report.model";
import { LogiCustomReportService } from "src/app/modules/logi-custom-report/services/logi-custom-report.service";
import { ShowToast } from "src/app/store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";



interface useractivitylogreportStateModel {
 
    useractivitlogreportPage: useractivitlogreportPage | null;
  logiCustomReport: userActivity | null;

}

@State<useractivitylogreportStateModel>({
  name: 'useractivitylogreport',
  defaults: {
    useractivitlogreportPage: null, logiCustomReport: null
  },
})
@Injectable()
export class useractivityReportState {


  @Selector()
  static  CustomReportPage(state: useractivitylogreportStateModel): useractivitlogreportPage | null {
    return state.useractivitlogreportPage;
  }

  constructor(
    private logiCustomReportService: LogiCustomReportService
  ) { }

  @Action(GetuserlogReportPage)
  GetuserlogReportPage(
    { dispatch, patchState }: StateContext<useractivitylogreportStateModel>,
    { payload }: GetuserlogReportPage
  ): Observable<useractivitlogreportPage | void> {
   
    return this.logiCustomReportService
      .userLogreport(payload)
      .pipe(
        tap((payload) => {
          patchState({ useractivitlogreportPage: payload });
          return payload
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

}
