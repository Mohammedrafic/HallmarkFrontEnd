import { Injectable } from '@angular/core';

import { Observable, tap } from 'rxjs';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ExportPayload } from '@shared/models/export.model';
import { downloadBlobFile } from '@shared/utils/file.utils';

import {
  TimeSheetsPage,
  TimesheetsModel,
} from '../model/timesheets.model';
import { TimesheetsApiService } from '../../services/timesheets-api.service';
import { Timesheets } from '../actions/timesheets.actions';
import { DialogAction } from '../../enums';
import { DefaultTimesheetState } from './../../constants/timesheet-default-state.constant';
import { TimesheetDetails } from '../actions/timesheet-details.actions';
import { TimesheetDetailsService } from '../../services/timesheet-details.service';
import { CandidateInfo, CandidateTimesheet, TimesheetsFilterState, TimesheetUploadedFile } from '../../interface';
import { DialogActionPayload } from '../../interface';
import { ProfileTimesheetService } from '../../services/profile-timesheet.service';

@State<TimesheetsModel>({
  name: 'timesheets',
  defaults: DefaultTimesheetState,
})
@Injectable()
export class TimesheetsState {
  constructor(
    private timesheetsApiService: TimesheetsApiService,
    private timesheetDetailsService: TimesheetDetailsService,
    private profileTimesheetService: ProfileTimesheetService
  ) {
  }

  @Selector([TimesheetsState])
  static timesheets(state: TimesheetsModel): TimeSheetsPage | null {
    return state.timesheets;
  }

  @Selector([TimesheetsState])
  static timesheetsFilters(state: TimesheetsModel): TimesheetsFilterState {
    return state.timesheetsFilters;
  }

  @Selector([TimesheetsState])
  static isTimesheetOpen(state: TimesheetsModel): DialogActionPayload {
    return { dialogState: state.isTimeSheetOpen, id: state.selectedTimeSheetId };
  }

  @Selector([TimesheetsState])
  static candidateTimesheets(state: TimesheetsModel): CandidateTimesheet[] {
    return state.candidateTimeSheets;
  }

  @Selector([TimesheetsState])
  static candidateInfo(state: TimesheetsModel): CandidateInfo | null {
    return state.candidateInfo;
  }

  @Selector([TimesheetsState])
  static candidateChartData(state: TimesheetsModel): unknown | null {
    return state.candidateChartData;
  }

  @Selector([TimesheetsState])
  static timeSheetAttachments(state: TimesheetsModel): TimesheetUploadedFile[] {
    return state.candidateAttachments.attachments;
  }

  @Selector([TimesheetsState])
  static costCenterOptions(state: TimesheetsModel): unknown {
    return state.costCenterOptions;
  }

  @Selector([TimesheetsState])
  static billRateTypes(state: TimesheetsModel): unknown {
    return state.billRateTypes;
  }

  @Action(Timesheets.GetAll)
  GetTimesheets({ patchState }: StateContext<TimesheetsModel>,
    { payload, isAgency }: Timesheets.GetAll): Observable<TimeSheetsPage> {

      return this.timesheetsApiService.getTimesheets(payload)
      .pipe(
        tap((timesheetsDto) => patchState({
          timesheets: timesheetsDto,
        })),
      );
  }

  @Action(Timesheets.PostProfileTimesheet)
  PostProfileTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { payload }: Timesheets.PostProfileTimesheet
  ): Observable<null> {
    return this.timesheetsApiService.postProfileTimesheets(payload);
  }

  @Action(Timesheets.PatchProfileTimesheet)
  PatchProfileTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { profileId, profileTimesheetId, payload }: Timesheets.PatchProfileTimesheet
  ): Observable<null> {
    return this.timesheetsApiService.patchProfileTimesheets(profileId, profileTimesheetId, payload);
  }

  @Action(Timesheets.DeleteProfileTimesheet)
  DeleteProfileTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { profileId, profileTimesheetId }: Timesheets.DeleteProfileTimesheet
  ): Observable<null> {
    return this.timesheetsApiService.deleteProfileTimesheets(profileId, profileTimesheetId);
  }

  @Action(Timesheets.GetProfileTimesheets)
  GetProfileTimeSheets({ patchState }: StateContext<TimesheetsModel>): Observable<CandidateTimesheet[]> {
    return this.timesheetsApiService.getCandidateTimesheets(1)
  }

  @Action(Timesheets.ToggleProfileDialog)
  ToggleCandidateDialog({ patchState }: StateContext<TimesheetsModel>,
    { action, id }: { action: DialogAction, id: number}): void {
    patchState({
      isTimeSheetOpen: action === DialogAction.Open,
      selectedTimeSheetId: id,
    });
  }

  @Action(Timesheets.OpenProfileTimesheetAddDialog)
  ToggleAddDialog({ patchState }: StateContext<TimesheetsModel>, action: DialogAction): void {
    patchState({
      isAddDialogOpen: action === DialogAction.Open,
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
}
