import { Injectable } from '@angular/core';

import { Observable, of, tap, throttleTime } from 'rxjs';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ExportPayload } from '@shared/models/export.model';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { TimesheetsModel, TimeSheetsPage, } from '../model/timesheets.model';
import { TimesheetsApiService } from '../../services/timesheets-api.service';
import { Timesheets } from '../actions/timesheets.actions';
import { DialogAction, TimesheetsTableColumns } from '../../enums';
import { DefaultFiltersState, DefaultTimesheetState } from '../../constants';
import { TimesheetDetails } from '../actions/timesheet-details.actions';
import { TimesheetDetailsService } from '../../services/timesheet-details.service';
import {
  CandidateHoursAndMilesData,
  CandidateInfo,
  DialogActionPayload,
  FilterColumns,
  FilterDataSource,
  TabCountConfig,
  TimesheetAttachments,
  TimesheetRecordsDto,
  TimesheetsFilterState,
  TimesheetUploadedFile
} from '../../interface';
import { ProfileTimesheetService } from '../../services/profile-timesheet.service';
import { patch } from '@ngxs/store/operators';

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
  static tabCounts(state: TimesheetsModel): TabCountConfig | null {
    return state.tabCounts;
  }

  @Selector([TimesheetsState])
  static tmesheetRecords(state: TimesheetsModel): TimesheetRecordsDto {
    return state.timeSheetRecords;
  }

  @Selector([TimesheetsState])
  static candidateInfo(state: TimesheetsModel): CandidateInfo | null {
    return state.candidateInfo;
  }

  @Selector([TimesheetsState])
  static candidateHoursAndMilesData(state: TimesheetsModel): CandidateHoursAndMilesData | null {
    return state.candidateHoursAndMilesData;
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

  @Selector([TimesheetsState])
  static timesheetsFiltersColumns(state: TimesheetsModel): FilterColumns {
    return state.timesheetsFiltersColumns;
  }

  @Action(Timesheets.GetAll)
  GetTimesheets(
    { patchState, getState }: StateContext<TimesheetsModel>,
  ): Observable<TimeSheetsPage> {
    const filters = getState().timesheetsFilters;

    return this.timesheetsApiService.getTimesheets(filters)
      .pipe(
        tap((res) => {
          patchState({
            timesheets: res,
          });
        }));
  }

  @Action(Timesheets.UpdateFiltersState)
  UpdateFiltersState(
    { setState }: StateContext<TimesheetsModel>,
    { payload }: Timesheets.UpdateFiltersState,
  ): Observable<null> {
    return of(null).pipe(
      throttleTime(100),
      tap(() => setState(patch({
        timesheetsFilters: payload ? patch(payload) : DefaultFiltersState,
      })))
    );
  }

  @Action(Timesheets.GetTabsCounts)
  GetTabsCounts({ patchState }: StateContext<TimesheetsModel>): Observable<TabCountConfig> {
    return this.timesheetsApiService.getTabsCounts()
      .pipe(
        tap((res) => patchState({
          tabCounts: res,
        }))
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

  @Action(Timesheets.ToggleCandidateDialog)
  ToggleCandidateDialog({ patchState }: StateContext<TimesheetsModel>,
    { action, id }: { action: DialogAction, id: number}): void {
    patchState({
      isTimeSheetOpen: action === DialogAction.Open,
      selectedTimeSheetId: id,
    });
  }

  @Action(Timesheets.ToggleTimesheetAddDialog)
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

  @Action(TimesheetDetails.GetTimesheetRecords)
  GetTimesheetRecords({ patchState }: StateContext<TimesheetsModel>, id: number): Observable<TimesheetRecordsDto> {
    return this.timesheetsApiService.getTimesheetRecords(id)
    .pipe(
      tap((res) => {
        patchState({
          timeSheetRecords: res,
        });
      })
    )
  }

  @Action(TimesheetDetails.GetCandidateInfo)
  GetCandidateInfo({ patchState }: StateContext<TimesheetsModel>, id: number): Observable<CandidateInfo> {
    return this.timesheetsApiService.getCandidateInfo(id)
    .pipe(
      tap((res) => {
        patchState({
          candidateInfo: res,
        });
      })
    )
  }

  @Action(TimesheetDetails.GetCandidateChartData)
  GetCandidateChartData({ patchState }: StateContext<TimesheetsModel>, id: number): Observable<CandidateHoursAndMilesData> {
    return this.timesheetsApiService.getCandidateHoursAndMilesData(id)
    .pipe(
      tap((res) => {
        patchState({
          candidateHoursAndMilesData: res,
        });
      })
    )
  }

  @Action(TimesheetDetails.GetCandidateAttachments)
  GetCandidateAttachments({ patchState }: StateContext<TimesheetsModel>, id: number): Observable<TimesheetAttachments> {
    return this.timesheetsApiService.getCandidateAttachments(id)
    .pipe(
      tap((res) => {
        patchState({
          candidateAttachments: res,
        });
      })
    )
  }

  @Action(Timesheets.SetFiltersDataSource)
  SetFiltersDataSource(
    { setState }: StateContext<TimesheetsModel>,
    { payload }: Timesheets.SetFiltersDataSource
  ): Observable<FilterDataSource> {
    return this.timesheetsApiService.setDataSources(payload)
      .pipe(
        tap((res: FilterDataSource) => {
          Object.keys(res).forEach((key: string) => {
            setState(patch({
              timesheetsFiltersColumns: patch({
                [key]: patch({
                  dataSource: res[key as TimesheetsTableColumns],
                })
              })
            }))
          });
        })
      );
  }
}
