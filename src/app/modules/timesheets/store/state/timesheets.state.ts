import { Injectable } from '@angular/core';

import { Observable, tap } from 'rxjs';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import {
  TimeSheetsPage,
  ProfileTimeSheetDetail,
  TimesheetsModel,
} from '../model/timesheets.model';
import { TimesheetsApiService } from '../../services/timesheets-api.service';
import { Timesheets } from '../actions/timesheets.actions';
import { DialogAction, ProfileTimeSheetActionType } from '../../enums';
import { DEFAULT_TIMESHEETS_STATE } from '../../constants';
import { TimesheetDetails } from "../actions/timesheet-details.actions";
import { ExportPayload } from "@shared/models/export.model";
import { TimesheetDetailsService } from "../../services/timesheet-details.service";
import { downloadBlobFile } from "@shared/utils/file.utils";
import { Invoice, ProfileUploadedFile } from "../../interface";
import { DialogActionPayload } from '../../interface';

@State<TimesheetsModel>({
  name: 'timesheets',
  defaults: DEFAULT_TIMESHEETS_STATE
})
@Injectable()
export class TimesheetsState {
  constructor(
    private timesheetsService: TimesheetsApiService,
    private timesheetDetailsService: TimesheetDetailsService,
  ) {
  }

  @Selector([TimesheetsState])
  static timesheets(state: TimesheetsModel): TimeSheetsPage | null {
    return state.timesheets;
  }

  @Selector([TimesheetsState])
  static profileTimesheets(state: TimesheetsModel): ProfileTimeSheetDetail[] {
    return state.profileTimesheets;
  }

  @Selector([TimesheetsState])
  static isProfileOpen(state: TimesheetsModel): DialogActionPayload {
    return { dialogState: state.profileOpen, rowId: state.selectedTimeSheetId };
  }

  @Selector([TimesheetsState])
  static timeSheetEditDialogOpen(state: TimesheetsModel): ProfileTimeSheetActionType | null {
    return state.editDialogType;
  }

  @Selector([TimesheetsState])
  static timeSheetDetailsUploads(state: TimesheetsModel): ProfileUploadedFile[] | null {
    return state?.timesheetDetails?.uploads ?? null;
  }

  @Selector([TimesheetsState])
  static timesheetDetailsInvoices(state: TimesheetsModel): Invoice[] | null {
    return state?.timesheetDetails?.invoices ?? null;
  }

  @Action(Timesheets.GetAll)
  GetTimesheets({ patchState }: StateContext<TimesheetsModel>, { payload }: Timesheets.GetAll): Observable<TimeSheetsPage> {
    return this.timesheetsService.getTimesheets(payload).pipe(tap((res) => patchState({
      timesheets: res,
    })));
  }

  @Action(Timesheets.PostProfileTimesheet)
  PostProfileTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { payload }: Timesheets.PostProfileTimesheet
  ): Observable<null> {
    return this.timesheetsService.postProfileTimesheets(payload);
  }

  @Action(Timesheets.GetProfileTimesheets)
  GetProfileTimeSheets({ patchState }: StateContext<TimesheetsModel>): Observable<ProfileTimeSheetDetail[]> {
    return this.timesheetsService.getProfileTimesheets()
    .pipe(
      tap((data) => {
        patchState({
          profileTimesheets: data,
        });
      }),
    );
  }

  @Action(Timesheets.ToggleProfileDialog)
  ToggleProfile({ patchState }: StateContext<TimesheetsModel>,
    { action, id }: { action: DialogAction, id: number}): void {
    patchState({
      profileOpen: action === DialogAction.Open,
      selectedTimeSheetId: id,
    });
  }

  @Action(Timesheets.OpenProfileTimesheetAddDialog)
  OpenTimesheetAddDialog({ patchState }: StateContext<TimesheetsModel>, type: ProfileTimeSheetActionType): void {
    patchState({
      editDialogType: type,
    });
  }

  @Action(Timesheets.CloseProfileTimesheetAddDialog)
  CloseTimeSheetEditDialog({ patchState }: StateContext<TimesheetsModel>): void {
    patchState({
      editDialogType: null,
    });
  }

  @Action(TimesheetDetails.Export)
  ExportTimesheetDetails({}: StateContext<TimesheetsModel>, payload: ExportPayload): Observable<Blob> {
    return this.timesheetDetailsService.exportDetails(payload)
      .pipe(
        tap((file: Blob) => {
          downloadBlobFile(file, 'empty.csv');
        })
      );
  }

  @Action(TimesheetDetails.AddFile)
  AddFile({ patchState, getState }: StateContext<TimesheetsModel>, { payload }: TimesheetDetails.AddFile): Observable<ProfileUploadedFile> {
    const { timesheetDetails } = getState();

    return this.timesheetDetailsService.uploadFile(payload)
      .pipe(
        tap((file: ProfileUploadedFile) => patchState({
          timesheetDetails: {
            ...timesheetDetails,
            uploads: [...timesheetDetails?.uploads ?? [], file],
          }
        }))
      );
  }

  @Action(TimesheetDetails.RemoveFile)
  RemoveFile({ patchState, getState }: StateContext<TimesheetsModel>, { payload }: TimesheetDetails.RemoveFile): Observable<boolean> {
    const { timesheetDetails } = getState();

    return this.timesheetDetailsService.deleteFile(payload)
      .pipe(
        tap((fileUploaded: boolean) => patchState({
          timesheetDetails: {
            ...timesheetDetails,
            uploads: (timesheetDetails?.uploads || []).filter((file: ProfileUploadedFile) => file.name !== payload.name),
          }
        }))
      );
  }
}
